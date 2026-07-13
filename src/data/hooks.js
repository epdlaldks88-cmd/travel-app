import { useCallback, useEffect, useState, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db";
import * as repository from "./repository";
import {
  addActivityPhoto,
  deleteActivityPhoto,
  updateActivityPhotoOrder,
  listActivityPhotos,
} from "./repository";
import { getSignedUrl, getSignedUrls } from "../lib/photoStorage";
import { useAuth } from "../lib/useAuth";
import { triggerFlush, syncWorker } from "./sync";

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

/** 여행의 숙소 목록 (v2 신규) */
export function useAccommodations(tripId) {
  const list = useLiveQuery(
    async () => {
      if (!tripId) return [];
      return await db.accommodations.where("tripId").equals(tripId).toArray();
    },
    [tripId],
    [],
  );
  return list;
}

/** 단일 숙소 (v2 신규) */
export function useAccommodation(id) {
  return useLiveQuery(() => (id ? db.accommodations.get(id) : undefined), [id]);
}

/** 현재 유저 프로필 (v2 신규) */
export function useProfile() {
  const { user } = useAuth();
  return useLiveQuery(
    () => (user?.id ? db.profile.get(user.id) : undefined),
    [user?.id],
  );
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

export function useCreateSubActivity() {
  return useCallback(async (parentId, data) => {
    const entity = await repository.createSubActivity(parentId, data);
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

/* ─── Accommodation mutations (v2 신규) ─── */

export function useCreateAccommodation() {
  const { user } = useAuth();
  return useCallback(
    async (tripId, data) => {
      if (!user) throw new Error("로그인이 필요합니다");
      const entity = await repository.createAccommodation(
        tripId,
        user.id,
        data,
      );
      triggerFlush();
      return entity;
    },
    [user],
  );
}

export function useUpdateAccommodation() {
  return useCallback(async (id, patch) => {
    const entity = await repository.updateAccommodation(id, patch);
    triggerFlush();
    return entity;
  }, []);
}

export function useDeleteAccommodation() {
  return useCallback(async (id) => {
    await repository.deleteAccommodation(id);
    triggerFlush();
  }, []);
}

/* ─── Profile mutation (v2 신규) ─── */

export function useUpdateProfile() {
  const { user } = useAuth();
  return useCallback(
    async (patch) => {
      if (!user) throw new Error("로그인이 필요합니다");
      const entity = await repository.updateProfile(user.id, patch);
      triggerFlush();
      return entity;
    },
    [user],
  );
}

/* ═══════════════════════════════════════════════════════════
   Sync Status
   ═══════════════════════════════════════════════════════════ */

/**
 * 대기 중인 sync 항목 수 + 온라인 여부 + flush 진행 상태.
 * SyncStatusBar 등에서 사용.
 */
export function useSyncStatus() {
  const pending = useLiveQuery(() => db.sync_queue.count(), [], 0);
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const [isFlushing, setIsFlushing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // syncWorker의 flush 상태 구독
    const unsubscribe = syncWorker.subscribe(({ isFlushing }) => {
      setIsFlushing(isFlushing);
    });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      unsubscribe();
    };
  }, []);

  return { pending, online, isFlushing };
}

/**
 * 액티비티 사진 목록 (Dexie live).
 */
export function useActivityPhotos(activityId) {
  return useLiveQuery(
    () => (activityId ? listActivityPhotos(activityId) : []),
    [activityId],
    [],
  );
}

/**
 * 사진 메타 리스트를 받아 signed URL 매핑을 캐시.
 * { [storagePath]: url } 반환.
 * 만료 5분 전에 자동 재발급.
 */
const urlCache = new Map(); // path -> { url, expiresAt }
const URL_TTL_MS = 3600 * 1000; // 1시간
const RENEW_BEFORE_MS = 5 * 60 * 1000; // 만료 5분 전

/**
 * 사진 메타 리스트를 받아 signed URL 매핑을 캐시.
 * { [storagePath]: url } 반환.
 * 만료 5분 전에 자동 재발급.
 *
 * 최적화:
 *   - photos 배열 참조 대신 storagePath 문자열을 dependency로 사용
 *     (Dexie useLiveQuery는 매번 새 배열 반환 → 참조 비교로는 계속 재실행)
 *   - 캐시 히트만 있으면 setUrlMap 호출 스킵 (불필요한 리렌더 방지)
 */
export function usePhotoUrls(photos) {
  const [urlMap, setUrlMap] = useState({});

  // ⭐ 안정적인 dependency: photos 배열 대신 storagePath 문자열
  const pathsKey = photos?.map((p) => p.storagePath).join("|") ?? "";

  useEffect(() => {
    if (!photos || photos.length === 0) {
      setUrlMap((prev) => (Object.keys(prev).length === 0 ? prev : {}));
      return;
    }

    let cancelled = false;
    const nowMs = Date.now();

    // 캐시에서 아직 유효한 것 걸러내기
    const validCached = {};
    const needsFetch = [];
    for (const photo of photos) {
      const cached = urlCache.get(photo.storagePath);
      if (cached && cached.expiresAt - nowMs > RENEW_BEFORE_MS) {
        validCached[photo.storagePath] = cached.url;
      } else {
        needsFetch.push(photo.storagePath);
      }
    }

    // 새로 발급할 게 없으면 캐시만 반영
    if (needsFetch.length === 0) {
      // 이미 같은 상태면 스킵 (리렌더 방지)
      setUrlMap((prev) => {
        const sameSize =
          Object.keys(prev).length === Object.keys(validCached).length;
        if (sameSize) {
          const sameKeys = Object.keys(validCached).every(
            (k) => prev[k] === validCached[k],
          );
          if (sameKeys) return prev;
        }
        return validCached;
      });
      return;
    }

    // 새 것만 발급
    getSignedUrls(needsFetch)
      .then((fresh) => {
        if (cancelled) return;
        const expiresAt = Date.now() + URL_TTL_MS;
        for (const [path, url] of Object.entries(fresh)) {
          if (url) urlCache.set(path, { url, expiresAt });
        }
        setUrlMap({ ...validCached, ...fresh });
      })
      .catch((err) => {
        console.error("[photo] signed URL 발급 실패:", err);
        if (!cancelled) setUrlMap(validCached);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathsKey]);

  return urlMap;
}

/**
 * 사진 추가 (리사이즈 + 업로드 + 메타 저장).
 * File 하나씩 처리. 여러 장이면 반복 호출.
 */
export function useAddActivityPhoto() {
  const { user } = useAuth();
  return useCallback(
    async (activityId, file, sortOrder = 0) => {
      if (!user) throw new Error("로그인이 필요합니다");
      const entity = await addActivityPhoto(
        activityId,
        user.id,
        file,
        sortOrder,
      );
      triggerFlush();
      return entity;
    },
    [user],
  );
}

export function useDeleteActivityPhoto() {
  return useCallback(async (id) => {
    await deleteActivityPhoto(id);
    triggerFlush();
  }, []);
}

export function useUpdateActivityPhotoOrder() {
  return useCallback(async (id, sortOrder) => {
    const entity = await updateActivityPhotoOrder(id, sortOrder);
    triggerFlush();
    return entity;
  }, []);
}

/**
 * 사용자의 모든 즐겨찾기 액티비티 (모든 여행 통합).
 * 부모 + 자식 모두 포함. isFavorite=true인 것만.
 */
export function useFavoriteActivities() {
  const { user } = useAuth();
  return useLiveQuery(
    async () => {
      if (!user) return [];

      // 사용자의 모든 여행
      const trips = await db.trips.where("ownerId").equals(user.id).toArray();
      const tripMap = new Map(trips.map((t) => [t.id, t]));
      const tripIds = trips.map((t) => t.id);

      if (tripIds.length === 0) return [];

      // 사용자의 모든 액티비티 중 favorite=true
      const activities = await db.activities
        .where("tripId")
        .anyOf(tripIds)
        .toArray();

      // isFavorite 필터 + trip 정보 붙임
      return activities
        .filter((a) => a.isFavorite)
        .map((a) => ({
          ...a,
          trip: tripMap.get(a.tripId),
        }));
    },
    [user?.id],
    [],
  );
}

/**
 * 여행 커버 이미지 signed URL 조회.
 * coverStoragePath가 있으면 서명된 URL 반환, 없으면 null.
 *
 * TTL 캐시로 재발급 최소화.
 */
const coverUrlCache = new Map(); // path -> { url, expiresAt }
const COVER_URL_TTL_MS = 3600 * 1000;
const COVER_RENEW_BEFORE_MS = 5 * 60 * 1000;

export function useCoverUrl(coverStoragePath) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!coverStoragePath) {
      setUrl(null);
      return;
    }

    let cancelled = false;
    const now = Date.now();

    // 캐시 확인
    const cached = coverUrlCache.get(coverStoragePath);
    if (cached && cached.expiresAt - now > COVER_RENEW_BEFORE_MS) {
      setUrl(cached.url);
      return;
    }

    // 재발급
    getSignedUrl(coverStoragePath, 3600)
      .then((signedUrl) => {
        if (cancelled) return;
        coverUrlCache.set(coverStoragePath, {
          url: signedUrl,
          expiresAt: Date.now() + COVER_URL_TTL_MS,
        });
        setUrl(signedUrl);
      })
      .catch((err) => {
        console.error("[cover] signed URL 발급 실패:", err);
        if (!cancelled) setUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [coverStoragePath]);

  return url;
}

/**
 * 여행 커버 업로드/제거 훅.
 */
export function useUpdateTripCover() {
  const { user } = useAuth();
  return useCallback(
    async (tripId, file) => {
      if (!user) throw new Error("로그인이 필요합니다");
      const entity = await repository.updateTripCover(tripId, user.id, file);
      triggerFlush();
      return entity;
    },
    [user],
  );
}

export function useDeleteTripCover() {
  return useCallback(async (tripId) => {
    const entity = await repository.deleteTripCover(tripId);
    triggerFlush();
    return entity;
  }, []);
}
