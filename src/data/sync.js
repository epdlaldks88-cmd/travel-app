import { supabase } from '../lib/supabase';
import { db } from './db';
import { fromSupabase, toSupabase } from './mappers';

/**
 * SyncWorker — Dexie ↔ Supabase 동기화.
 *
 * 동작:
 *   1. 앱 시작 시 pull() → 서버에서 로컬로 최신 데이터 로드
 *   2. 정기적으로 flush() → 큐 항목을 서버로 push
 *   3. 온라인 이벤트 감지 시 flush()
 *   4. write 발생 시 즉시 flush 시도
 *
 * 재시도:
 *   실패한 큐 항목은 retries 증가. 5회 초과 시 콘솔 경고만 하고 큐에 남김
 *   (수동 개입 필요할 수 있음).
 */

const FLUSH_INTERVAL_MS = 30_000;
const MAX_RETRIES = 5;

class SyncWorker {
  constructor() {
    this.userId = null;
    this.flushTimer = null;
    this.isFlushing = false;
    this.onlineHandler = null;
  }

  /**
   * 로그인 후 호출. userId 세팅 + 초기 pull + 워커 시작.
   */
  async start(userId) {
    if (this.userId === userId && this.flushTimer) return;
    this.userId = userId;

    // 온라인 이벤트 리스너
    this.onlineHandler = () => this.flush();
    window.addEventListener('online', this.onlineHandler);

    // 초기 pull
    await this.pull();

    // 즉시 flush (오프라인이었으면 대기 중이던 큐 밀어냄)
    this.flush();

    // 주기적 flush
    this.flushTimer = setInterval(() => this.flush(), FLUSH_INTERVAL_MS);
  }

  /**
   * 로그아웃 시 호출.
   */
  stop() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    if (this.onlineHandler) {
      window.removeEventListener('online', this.onlineHandler);
      this.onlineHandler = null;
    }
    this.userId = null;
  }

  /**
   * 서버 → Dexie (전체 로드).
   *
   * 첫 앱 시작이나 다기기 동기화 시 호출. 서버 데이터가 원본.
   * RLS 로 인해 현재 사용자 소유 데이터만 조회됨.
   */
  async pull() {
    if (!navigator.onLine) return;
    if (!this.userId) return;

    try {
      // trips
      const { data: trips, error: tripsErr } = await supabase
        .from('trips')
        .select('*');
      if (tripsErr) throw tripsErr;

      const tripEntities = (trips || []).map(fromSupabase);
      const tripIds = tripEntities.map((t) => t.id);

      // activities (해당 trips 소속만)
      const { data: activities, error: actErr } =
        tripIds.length > 0
          ? await supabase.from('activities').select('*').in('trip_id', tripIds)
          : { data: [], error: null };
      if (actErr) throw actErr;

      // day_notes
      const { data: dayNotes, error: notesErr } =
        tripIds.length > 0
          ? await supabase.from('day_notes').select('*').in('trip_id', tripIds)
          : { data: [], error: null };
      if (notesErr) throw notesErr;

      const activityEntities = (activities || []).map(fromSupabase);
      const dayNoteEntities = (dayNotes || []).map(fromSupabase);

      await db.transaction(
        'rw',
        db.trips,
        db.activities,
        db.day_notes,
        db.meta,
        async () => {
          // 서버 데이터로 로컬 대체. 로컬 전용 변경 (큐에 있는 것) 은 flush 시 반영됨.
          await db.trips.clear();
          await db.trips.bulkAdd(tripEntities);
          await db.activities.clear();
          await db.activities.bulkAdd(activityEntities);
          await db.day_notes.clear();
          await db.day_notes.bulkAdd(dayNoteEntities);
          await db.meta.put({ key: 'lastPullAt', value: new Date().toISOString() });
        }
      );
    } catch (err) {
      console.error('[sync] pull 실패:', err);
    }
  }

  /**
   * sync_queue → Supabase (대기 중 변경 반영).
   */
  async flush() {
    if (this.isFlushing) return;
    if (!navigator.onLine) return;
    if (!this.userId) return;

    this.isFlushing = true;
    try {
      const items = await db.sync_queue.orderBy('id').toArray();
      for (const item of items) {
        try {
          await this.executeSync(item);
          await db.sync_queue.delete(item.id);
        } catch (err) {
          console.error('[sync] flush 실패:', item, err);
          const retries = (item.retries || 0) + 1;
          if (retries >= MAX_RETRIES) {
            console.error(
              '[sync] 최대 재시도 초과. 항목 유지:',
              item.table,
              item.operation,
              item.entityId
            );
          }
          await db.sync_queue.update(item.id, { retries });
          // 하나 실패하면 이어지는 항목 중단 (순서 유지)
          break;
        }
      }
      await db.meta.put({ key: 'lastFlushAt', value: new Date().toISOString() });
    } finally {
      this.isFlushing = false;
    }
  }

  async executeSync(item) {
    const table = supabase.from(item.table);
    if (item.operation === 'insert') {
      const { error } = await table.insert(toSupabase(item.payload));
      if (error) throw error;
    } else if (item.operation === 'update') {
      const { error } = await table
        .update(toSupabase(item.payload))
        .eq('id', item.entityId);
      if (error) throw error;
    } else if (item.operation === 'delete') {
      const { error } = await table.delete().eq('id', item.entityId);
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
