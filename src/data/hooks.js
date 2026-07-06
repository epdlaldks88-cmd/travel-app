import { useCallback, useEffect, useState, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db";
import * as repository from "./repository";
import { triggerFlush } from "./sync";
import { useAuth } from "../lib/useAuth";

/* ═══════════════════════════════════════════════════════════
   Query Hooks (Dexie useLiveQuery 기반, 자동 재렌더)
   ═══════════════════════════════════════════════════════════ */

/** 현재 사용자의 여행 목록 (최신순) */
export function useTrips() {
  const { user } = useAuth();
  const trips = useLiveQuery(
    async () => {
      if (!user) return [];
      // startDate 인덱스로 정렬, 최신순 (null 은 뒤로)
      const all = await db.trips.where("ownerId").equals(user.id).toArray();
      return all.sort((a, b) => {
        if (!a.startDate && !b.startDate) return 0;
        if (!a.startDate) return 1;
        if (!b.startDate) return -1;
        return b.startDate.localeCompare(a.startDate);
      });
    },
    [user?.id],
    [],
  );
  return trips;
}

/** 단일 여행 */
export function useTrip(id) {
  return useLiveQuery(() => (id ? db.trips.get(id) : undefined), [id]);
}

/** 여행의 activity 목록 (날짜 · 시간 순) */
export function useActivities(tripId) {
  const rows = useLiveQuery(
    () =>
      tripId ? db.activities.where("tripId").equals(tripId).toArray() : [],
    [tripId],
    [],
  );

  return useMemo(() => {
    if (!rows?.length) return [];

    // 부모/자식 분리
    const parents = [];
    const childrenByParent = new Map();

    for (const row of rows) {
      if (row.parentActivityId) {
        const arr = childrenByParent.get(row.parentActivityId) ?? [];
        arr.push(row);
        childrenByParent.set(row.parentActivityId, arr);
      } else {
        parents.push(row);
      }
    }

    // 시간순 정렬 유틸
    const byTime = (a, b) => (a.time || "").localeCompare(b.time || "");

    // 부모: 날짜 → 시간순, 각 부모에 children 부착 (자식은 시간순)
    return parents
      .map((parent) => ({
        ...parent,
        children: (childrenByParent.get(parent.id) ?? []).sort(byTime),
      }))
      .sort((a, b) => {
        const d = (a.date || "").localeCompare(b.date || "");
        return d !== 0 ? d : byTime(a, b);
      });
  }, [rows]);
}

/** 여행의 dayNotes 목록 */
export function useDayNotes(tripId) {
  const notes = useLiveQuery(
    async () => {
      if (!tripId) return [];
      return await db.day_notes.where("tripId").equals(tripId).toArray();
    },
    [tripId],
    [],
  );
  return notes;
}

/* ═══════════════════════════════════════════════════════════
   Mutation Hooks
   ═══════════════════════════════════════════════════════════ */

export function useCreateTrip() {
  const { user } = useAuth();
  return useCallback(
    async (data) => {
      if (!user) throw new Error("로그인이 필요합니다");
      const entity = await repository.createTrip(data, user.id);
      triggerFlush();
      return entity;
    },
    [user],
  );
}

export function useUpdateTrip() {
  return useCallback(async (id, patch) => {
    const entity = await repository.updateTrip(id, patch);
    triggerFlush();
    return entity;
  }, []);
}

export function useDeleteTrip() {
  return useCallback(async (id) => {
    await repository.deleteTrip(id);
    triggerFlush();
  }, []);
}

export function useCreateActivity() {
  return useCallback(async (tripId, data) => {
    const entity = await repository.createActivity(tripId, data);
    triggerFlush();
    return entity;
  }, []);
}

export function useUpdateActivity() {
  return useCallback(async (id, patch) => {
    const entity = await repository.updateActivity(id, patch);
    triggerFlush();
    return entity;
  }, []);
}

export function useDeleteActivity() {
  return useCallback(async (id) => {
    await repository.deleteActivity(id);
    triggerFlush();
  }, []);
}

export function useUpsertDayNote() {
  return useCallback(async (tripId, date, patch) => {
    const entity = await repository.upsertDayNote(tripId, date, patch);
    triggerFlush();
    return entity;
  }, []);
}

/* ═══════════════════════════════════════════════════════════
   Sync Status
   ═══════════════════════════════════════════════════════════ */

/**
 * 대기 중인 sync 항목 수 + 온라인 여부.
 * SyncStatusBar 등에서 사용.
 */
export function useSyncStatus() {
  const pending = useLiveQuery(() => db.sync_queue.count(), [], 0);
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { pending, online };
}
