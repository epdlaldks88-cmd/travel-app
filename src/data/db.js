import Dexie from "dexie";

/**
 * Dexie DB 스키마 (travel-app)
 *
 * Stores:
 *   trips              - 여행 (오프라인 캐시)
 *   activities         - 일정 (오프라인 캐시)
 *   day_notes          - 일별 감상 (오프라인 캐시)
 *   accommodations     - 여행별 숙소 정보 (v2 신규)
 *   profile            - 유저 프로필 캐시 (v2 신규, id=userId)
 *   sync_queue         - 서버로 전송 대기 중인 변경 (오프라인 큐)
 *   meta               - 앱 메타 (마지막 sync 시각 등)
 *
 * 인덱스 규칙:
 *   Dexie 는 boolean 값을 인덱스로 못 씀 (is_favorite 등은 in-memory 필터).
 *   [tripId+date] 는 복합 인덱스 (day_notes 조회용).
 *
 * 데이터 형식은 camelCase (Supabase snake_case ↔ mappers.js 로 변환).
 */

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

    // ⭐ v2: 숙소 + 프로필 스토어 추가, activities에 accommodationId 인덱스
    this.version(2).stores({
      trips: "id, ownerId, startDate, updatedAt",
      activities: "id, tripId, date, accommodationId, updatedAt",
      day_notes: "id, tripId, [tripId+date], updatedAt",
      accommodations: "id, tripId, ownerId, updatedAt",
      profile: "id",
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
    db.sync_queue,
    db.meta,
    async () => {
      await db.trips.clear();
      await db.activities.clear();
      await db.day_notes.clear();
      await db.accommodations.clear();
      await db.profile.clear();
      await db.sync_queue.clear();
      await db.meta.clear();
    },
  );
}
