import { db } from "./db";

/**
 * Repository — 데이터 접근 계층.
 *
 * 모든 write 는:
 *   1. UUID 생성 (create 시)
 *   2. Dexie 즉시 업데이트 (낙관적 UI)
 *   3. sync_queue 에 등록 (서버 전송 대기)
 *
 * SyncWorker 가 큐를 감시해서 온라인일 때 flush.
 * 사용자 코드는 서버 왕복 대기 안 함.
 */

/* ─── Helpers ─────────────────────────────────────────────── */

// 자식 카테고리 (부모 5개와 다름: 렌트카/숙소 제외, 카페/쇼핑 추가)
export const SUB_ACTIVITY_TYPES = ["관광", "식당", "카페", "쇼핑", "기타"];

function now() {
  return new Date().toISOString();
}

function newId() {
  return crypto.randomUUID();
}

async function enqueue(table, operation, entityId, payload) {
  await db.sync_queue.add({
    table,
    operation,
    entityId,
    payload,
    createdAt: now(),
    retries: 0,
  });
}

/* ─── Trips ───────────────────────────────────────────────── */

export async function createTrip(data, ownerId) {
  const timestamp = now();
  const entity = {
    id: newId(),
    ownerId,
    title: data.title,
    startDate: data.startDate || null,
    endDate: data.endDate || null,
    companions: data.companions || "",
    countryType: data.countryType || "domestic",
    countryName: data.countryName || "",
    regionMajor: data.regionMajor || "",
    regionMinor: data.regionMinor || "",
    categories: data.categories || [],
    memo: "",
    rating: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await db.trips.add(entity);
  await enqueue("trips", "insert", entity.id, entity);
  return entity;
}

export async function updateTrip(id, patch) {
  const timestamp = now();
  const merged = { ...patch, updatedAt: timestamp };
  await db.trips.update(id, merged);
  const entity = await db.trips.get(id);
  if (entity) {
    await enqueue("trips", "update", id, entity);
  }
  return entity;
}

export async function deleteTrip(id) {
  await db.transaction(
    "rw",
    db.trips,
    db.activities,
    db.day_notes,
    db.sync_queue,
    async () => {
      await db.trips.delete(id);
      // 로컬 캐시에서 자식들도 정리 (서버는 CASCADE 로 자동)
      await db.activities.where("tripId").equals(id).delete();
      await db.day_notes.where("tripId").equals(id).delete();
    },
  );
  await enqueue("trips", "delete", id, null);
}

/* ─── Activities ──────────────────────────────────────────── */

export async function createActivity(tripId, data) {
  const timestamp = now();
  const entity = {
    id: newId(),
    tripId,
    type: data.type,
    date: data.date || null,
    time: data.time || null,
    cost: data.cost || 0,
    memo: data.memo || "",
    rating: data.rating ?? null,
    // 장소 (공통)
    name: data.name || "",
    location: data.location || "",
    // 이동 정보 (공통, 이 장소에 오기까지)
    origin: data.origin || "",
    transport: data.transport || "",
    durationHours: data.durationHours || 0,
    durationMinutes: data.durationMinutes || 0,
    distanceKm: data.distanceKm ?? null,
    // 식사 전용
    mealType: data.mealType || "",
    cuisines: data.cuisines || [],
    foodTypes: data.foodTypes || [],
    foodDetails: data.foodDetails || "",
    // 숙소 전용
    nights: data.nights ?? null,
    checkoutTime: data.checkoutTime || null,
    // 렌트카 전용
    days: data.days ?? null,
    returnTime: data.returnTime || null,
    carModel: data.carModel || "",
    // Step 2 확장
    isFavorite: data.isFavorite ?? false,
    revisit: data.revisit || null,
    // Step 3 확장 (GPS)
    gpsLat: data.gpsLat ?? null,
    gpsLng: data.gpsLng ?? null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await db.activities.add(entity);
  await enqueue("activities", "insert", entity.id, entity);
  return entity;
}

export async function createSubActivity(parentId, data) {
  const parent = await db.activities.get(parentId);
  if (!parent) throw new Error("부모 일정을 찾을 수 없습니다");
  if (parent.parentActivityId) {
    throw new Error("2단계까지만 지원됩니다");
  }
  if (!SUB_ACTIVITY_TYPES.includes(data.type)) {
    throw new Error(`허용되지 않은 카테고리: ${data.type}`);
  }

  const timestamp = now();
  const entity = {
    id: newId(),
    tripId: parent.tripId,
    parentActivityId: parentId,
    date: parent.date || null, // 부모 날짜 상속
    type: data.type,
    time: data.time || null,
    cost: data.cost || 0,
    memo: data.memo || "",
    rating: data.rating ?? null,
    // 장소 (이름만)
    name: data.name || "",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await db.activities.add(entity);
  await enqueue("activities", "insert", entity.id, entity);
  return entity;
}

export async function updateActivity(id, patch) {
  const timestamp = now();
  const merged = { ...patch, updatedAt: timestamp };
  await db.activities.update(id, merged);
  const entity = await db.activities.get(id);
  if (entity) {
    await enqueue("activities", "update", id, entity);
  }
  return entity;
}

export async function deleteActivity(id) {
  await db.activities.delete(id);
  await enqueue("activities", "delete", id, null);
}

/* ─── Day Notes ───────────────────────────────────────────── */

/**
 * date 기준으로 upsert. 같은 (tripId, date) 있으면 update, 없으면 insert.
 */
export async function upsertDayNote(tripId, date, patch) {
  const existing = await db.day_notes
    .where(["tripId", "date"])
    .equals([tripId, date])
    .first();

  const timestamp = now();

  if (existing) {
    const merged = { ...patch, updatedAt: timestamp };
    await db.day_notes.update(existing.id, merged);
    const entity = await db.day_notes.get(existing.id);
    await enqueue("day_notes", "update", existing.id, entity);
    return entity;
  } else {
    const entity = {
      id: newId(),
      tripId,
      date,
      wakeTime: patch.wakeTime || null,
      sleepTime: patch.sleepTime || null,
      weather: patch.weather || "",
      mood: patch.mood ?? null,
      highlight: patch.highlight || "",
      journal: patch.journal || "",
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await db.day_notes.add(entity);
    await enqueue("day_notes", "insert", entity.id, entity);
    return entity;
  }
}

export async function deleteDayNote(id) {
  await db.day_notes.delete(id);
  await enqueue("day_notes", "delete", id, null);
}
