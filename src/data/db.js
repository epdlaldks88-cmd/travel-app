import Dexie from "dexie";

class TravelDB extends Dexie {
  constructor() {
    super("travel-app");

    this.version(1).stores({
      trips: "id, ownerId, startDate, updatedAt",
      activities: "id, tripId, date, updatedAt",
      day_notes: "id, tripId, [tripId+date], updatedAt",
      sync_queue: "++id, table, entityId, createdAt",
      meta: "key",
    });

    this.version(2).stores({
      trips: "id, ownerId, startDate, updatedAt",
      activities: "id, tripId, date, accommodationId, updatedAt",
      day_notes: "id, tripId, [tripId+date], updatedAt",
      accommodations: "id, tripId, ownerId, updatedAt",
      profile: "id",
      sync_queue: "++id, table, entityId, createdAt",
      meta: "key",
    });

    this.version(3).stores({
      trips: "id, ownerId, startDate, updatedAt",
      activities: "id, tripId, date, accommodationId, updatedAt",
      day_notes: "id, tripId, [tripId+date], updatedAt",
      accommodations: "id, tripId, ownerId, updatedAt",
      profile: "id",
      activity_photos: "id, activityId, ownerId, sortOrder, updatedAt",
      sync_queue: "++id, table, entityId, createdAt",
      meta: "key",
    });

    // ⭐ v4: origin GPS 필드 (스토어 구조는 그대로, 필드만 추가되므로 실제로는 마이그레이션만)
    // Dexie는 인덱싱된 필드만 스키마에 정의. origin_gps는 인덱스 불필요라 v4는 사실상 no-op.
    // 그래도 명시적으로 v4를 만들어두면 나중에 인덱스 추가 시 편함.
    this.version(4).stores({
      trips: "id, ownerId, startDate, updatedAt",
      activities: "id, tripId, date, accommodationId, updatedAt",
      day_notes: "id, tripId, [tripId+date], updatedAt",
      accommodations: "id, tripId, ownerId, updatedAt",
      profile: "id",
      activity_photos: "id, activityId, ownerId, sortOrder, updatedAt",
      sync_queue: "++id, table, entityId, createdAt",
      meta: "key",
    });
  }
}

export const db = new TravelDB();

/**
 * 로그아웃 등에서 로컬 캐시 완전 삭제.
 */
export async function clearLocalData() {
  await db.transaction(
    "rw",
    db.trips,
    db.activities,
    db.day_notes,
    db.accommodations,
    db.profile,
    db.activity_photos,
    db.sync_queue,
    db.meta,
    async () => {
      await db.trips.clear();
      await db.activities.clear();
      await db.day_notes.clear();
      await db.accommodations.clear();
      await db.profile.clear();
      await db.activity_photos.clear();
      await db.sync_queue.clear();
      await db.meta.clear();
    },
  );
}
