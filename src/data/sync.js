import { supabase } from "../lib/supabase";
import { db } from "./db";
import { fromSupabase, toSupabase } from "./mappers";

/**
 * SyncWorker — Dexie ↔ Supabase 동기화.
 *
 * v2 확장: accommodations, profile (home_*) 동기화 추가.
 *
 * 재설계 (P0):
 *   1. start(): pending 큐 있으면 flush 먼저, 그 후 pull
 *   2. pull(): pending 있으면 스킵, clear 대신 bulkPut (병합)
 *   3. flush(): batch insert (같은 table+operation 그룹핑),
 *      개별 실패해도 성공한 것은 큐에서 삭제 (break 없음)
 *   4. EventEmitter로 isFlushing 상태 노출
 *   5. lastError 필드에 실패 사유 저장
 */

const FLUSH_INTERVAL_MS = 30_000;
const MAX_RETRIES = 5;

class SyncEventEmitter {
  constructor() {
    this.listeners = new Set();
  }
  subscribe(cb) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }
  emit(state) {
    this.listeners.forEach((cb) => {
      try {
        cb(state);
      } catch (err) {
        console.error("[sync] listener error:", err);
      }
    });
  }
}

class SyncWorker {
  constructor() {
    this.userId = null;
    this.flushTimer = null;
    this._isFlushing = false;
    this.onlineHandler = null;
    this.emitter = new SyncEventEmitter();
  }

  get isFlushing() {
    return this._isFlushing;
  }
  set isFlushing(v) {
    this._isFlushing = v;
    this.emitter.emit({ isFlushing: v });
  }

  subscribe(cb) {
    return this.emitter.subscribe(cb);
  }

  /**
   * 로그인 후 호출.
   * ⭐ pending 있으면 flush 먼저, 그 후 pull.
   */
  async start(userId) {
    if (this.userId === userId && this.flushTimer) return;
    this.userId = userId;

    this.onlineHandler = () => this.flush();
    window.addEventListener("online", this.onlineHandler);

    // ⭐ pending 큐 우선 처리
    const pendingCount = await db.sync_queue.count();
    if (pendingCount > 0) {
      console.log(`[sync] pending ${pendingCount}개 발견. flush 먼저 실행.`);
      await this.flush();
    }

    // 큐가 비었을 때만 pull (pull 내부에서도 재확인)
    await this.pull();

    this.flushTimer = setInterval(() => this.flush(), FLUSH_INTERVAL_MS);
  }

  stop() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    if (this.onlineHandler) {
      window.removeEventListener("online", this.onlineHandler);
      this.onlineHandler = null;
    }
    this.userId = null;
  }

  /**
   * 서버 → Dexie (병합).
   *
   * ⭐ pending 있으면 스킵 (덮어쓰기 방지).
   * ⭐ clear 대신 bulkPut (서버에만 있는 것 추가, 로컬 것 유지).
   * ⚠️ 서버에서 삭제된 항목은 로컬에 남음 (다기기 삭제 sync 미지원, tombstone 도입 시 해결).
   */
  async pull() {
    if (!navigator.onLine) return;
    if (!this.userId) return;

    // ⭐ pending 있으면 pull 스킵
    const pendingCount = await db.sync_queue.count();
    if (pendingCount > 0) {
      console.log(`[sync] pending ${pendingCount}개 있음. pull 스킵.`);
      return;
    }

    try {
      // 프로필 (유저당 1개)
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", this.userId)
        .maybeSingle();
      if (profileErr) throw profileErr;

      const { data: trips, error: tripsErr } = await supabase
        .from("trips")
        .select("*");
      if (tripsErr) throw tripsErr;

      const tripEntities = (trips || []).map(fromSupabase);
      const tripIds = tripEntities.map((t) => t.id);

      const { data: activities, error: actErr } =
        tripIds.length > 0
          ? await supabase.from("activities").select("*").in("trip_id", tripIds)
          : { data: [], error: null };
      if (actErr) throw actErr;

      const { data: dayNotes, error: notesErr } =
        tripIds.length > 0
          ? await supabase.from("day_notes").select("*").in("trip_id", tripIds)
          : { data: [], error: null };
      if (notesErr) throw notesErr;

      // 숙소 (신규)
      const { data: accommodations, error: accErr } =
        tripIds.length > 0
          ? await supabase
              .from("trip_accommodations")
              .select("*")
              .in("trip_id", tripIds)
          : { data: [], error: null };
      if (accErr) throw accErr;

      const activityEntities = (activities || []).map(fromSupabase);
      const dayNoteEntities = (dayNotes || []).map(fromSupabase);
      const accommodationEntities = (accommodations || []).map(fromSupabase);
      const profileEntity = profile ? fromSupabase(profile) : null;

      await db.transaction(
        "rw",
        db.trips,
        db.activities,
        db.day_notes,
        db.accommodations,
        db.profile,
        db.meta,
        async () => {
          // ⭐ clear 대신 bulkPut (upsert)
          await db.trips.bulkPut(tripEntities);
          await db.activities.bulkPut(activityEntities);
          await db.day_notes.bulkPut(dayNoteEntities);
          await db.accommodations.bulkPut(accommodationEntities);
          if (profileEntity) {
            await db.profile.put(profileEntity);
          }
          await db.meta.put({
            key: "lastPullAt",
            value: new Date().toISOString(),
          });
        },
      );
    } catch (err) {
      console.error("[sync] pull 실패:", err);
    }
  }

  /**
   * sync_queue → Supabase.
   *
   * ⭐ 같은 (table, operation)끼리 그룹핑해서 insert는 batch로 전송.
   * ⭐ 개별 실패해도 break 안 함, 성공한 것은 즉시 큐에서 삭제.
   */
  async flush() {
    if (this._isFlushing) return;
    if (!navigator.onLine) return;
    if (!this.userId) return;

    this.isFlushing = true;
    try {
      const items = await db.sync_queue.orderBy("id").toArray();
      if (items.length === 0) return;

      // 그룹핑
      const groups = new Map();
      for (const item of items) {
        const key = `${item.table}:${item.operation}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(item);
      }

      for (const [key, groupItems] of groups) {
        const [table, operation] = key.split(":");

        if (operation === "insert") {
          await this.flushInsertBatch(table, groupItems);
        } else {
          // update/delete는 개별
          await this.flushIndividual(groupItems);
        }
      }

      await db.meta.put({
        key: "lastFlushAt",
        value: new Date().toISOString(),
      });
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Batch insert. 성공 시 그룹 전체 삭제, 실패 시 개별 fallback.
   */
  async flushInsertBatch(table, groupItems) {
    const payloads = groupItems.map((i) => toSupabase(i.payload));

    try {
      const { error } = await supabase.from(table).insert(payloads);
      if (error) throw error;

      // 배치 성공: 큐에서 일괄 삭제
      await db.sync_queue.bulkDelete(groupItems.map((i) => i.id));
    } catch (batchErr) {
      console.warn(
        `[sync] batch insert 실패 (${table}, ${groupItems.length}개). 개별 재시도.`,
        batchErr,
      );
      // 개별 fallback
      await this.flushIndividual(groupItems);
    }
  }

  /**
   * 개별 처리. 성공 → 삭제, 실패 → retries++/lastError.
   * break 없음.
   */
  async flushIndividual(items) {
    for (const item of items) {
      try {
        await this.executeSync(item);
        await db.sync_queue.delete(item.id);
      } catch (err) {
        const retries = (item.retries || 0) + 1;
        const errMsg = String(err?.message || err);
        console.error(
          `[sync] 개별 실패 (retries=${retries}):`,
          item.table,
          item.operation,
          item.entityId,
          errMsg,
        );

        await db.sync_queue.update(item.id, {
          retries,
          lastError: errMsg,
        });

        if (retries >= MAX_RETRIES) {
          console.error(
            `[sync] 최대 재시도 초과. 항목 큐에 유지:`,
            item.table,
            item.operation,
            item.entityId,
          );
        }
      }
    }
  }

  async executeSync(item) {
    const table = supabase.from(item.table);
    if (item.operation === "insert") {
      const { error } = await table.insert(toSupabase(item.payload));
      if (error) throw error;
    } else if (item.operation === "update") {
      const { error } = await table
        .update(toSupabase(item.payload))
        .eq("id", item.entityId);
      if (error) throw error;
    } else if (item.operation === "delete") {
      const { error } = await table.delete().eq("id", item.entityId);
      if (error) throw error;
    }
  }
}

/** 앱 전역 싱글톤 */
export const syncWorker = new SyncWorker();

/**
 * 수동 flush 트리거 (write 후 즉시 서버 반영 시도).
 */
export function triggerFlush() {
  syncWorker.flush();
}
