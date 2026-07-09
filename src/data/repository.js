// 파일 최상단
import { db } from "./db";
import { resizeImage } from "../lib/imageResize";
import {
  buildActivityPhotoPath,
  uploadPhoto,
  deletePhoto as storageDeletePhoto,
} from "../lib/photoStorage";

/* ─── Helpers ─────────────────────────────────────────────── */

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

/**
 * Postgres에서 빈 문자열을 허용하지 않는 컬럼들.
 * 이런 필드는 "" → null 로 정규화.
 *
 * - time / date 계열: Postgres time/date 타입은 "" 안 받음
 * - 숫자 계열: Postgres numeric/integer 타입도 "" 안 받음
 */
const NULLABLE_TIME_FIELDS = [
  "date",
  "time",
  "checkoutTime",
  "returnTime",
  "startDate",
  "endDate",
  "wakeTime",
  "sleepTime",
  "checkInDate",
  "checkInTime",
  "checkOutDate",
  "checkOutTime",
];

const NULLABLE_NUMBER_FIELDS = [
  "rating",
  "distanceKm",
  "nights",
  "days",
  "mood",
  "gpsLat",
  "gpsLng",
  "totalCost",
  "homeGpsLat",
  "homeGpsLng",
  "originGpsLat",
  "originGpsLng",
];

/**
 * 서버 전송용 payload 정규화.
 * - time/date 필드의 "" → null
 * - 숫자 필드의 "" → null
 * - undefined → 제외 (patch에서 명시 안 한 필드는 서버에 보내지 않음)
 */
function normalizeForSync(payload) {
  const result = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;

    if (NULLABLE_TIME_FIELDS.includes(key) && value === "") {
      result[key] = null;
    } else if (NULLABLE_NUMBER_FIELDS.includes(key) && value === "") {
      result[key] = null;
    } else {
      result[key] = value;
    }
  }
  return result;
}

/* ─── Trips ───────────────────────────────────────────────── */

export async function createTrip(data, ownerId) {
  const timestamp = now();
  const entity = normalizeForSync({
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
  });

  await db.trips.add(entity);
  await enqueue("trips", "insert", entity.id, entity);
  return entity;
}

export async function updateTrip(id, patch) {
  const timestamp = now();
  const normalized = normalizeForSync({ ...patch, updatedAt: timestamp });
  await db.trips.update(id, normalized);
  const entity = await db.trips.get(id);
  if (entity) {
    // 로컬에서 다시 읽은 entity도 정규화 (혹시 이전에 저장된 잘못된 값 방어)
    await enqueue("trips", "update", id, normalizeForSync(entity));
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
      await db.activities.where("tripId").equals(id).delete();
      await db.day_notes.where("tripId").equals(id).delete();
    },
  );
  await enqueue("trips", "delete", id, null);
}

/* ─── Activities ──────────────────────────────────────────── */

export async function createActivity(tripId, data) {
  const timestamp = now();
  const entity = normalizeForSync({
    id: newId(),
    tripId,
    type: data.type,
    date: data.date || null,
    time: data.time || null,
    cost: data.cost || 0,
    memo: data.memo || "",
    rating: data.rating ?? null,
    // 장소
    name: data.name || "",
    location: data.location || "",
    // 이동 정보
    origin: data.origin || "",
    transport: data.transport || "",
    durationHours: data.durationHours || 0,
    durationMinutes: data.durationMinutes || 0,
    distanceKm: data.distanceKm ?? null,
    // 식사
    mealType: data.mealType || "",
    cuisines: data.cuisines || [],
    foodTypes: data.foodTypes || [],
    foodDetails: data.foodDetails || "",
    // 숙소
    nights: data.nights ?? null,
    checkoutTime: data.checkoutTime || null,
    // 렌트카
    days: data.days ?? null,
    returnTime: data.returnTime || null,
    carModel: data.carModel || "",
    // Step 2
    isFavorite: data.isFavorite ?? false,
    revisit: data.revisit || null,
    // Step 3 (GPS)
    gpsLat: data.gpsLat ?? null,
    gpsLng: data.gpsLng ?? null,
    createdAt: timestamp,
    updatedAt: timestamp,
    // 길찾기
    origin: data.origin || "",
    originGpsLat: data.originGpsLat ?? null,
    originGpsLng: data.originGpsLng ?? null,
    transport: data.transport || "",
  });

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
  const entity = normalizeForSync({
    id: newId(),
    tripId: parent.tripId,
    parentActivityId: parentId,
    date: parent.date || null,
    type: data.type,
    time: data.time || null,
    cost: data.cost || 0,
    memo: data.memo || "",
    rating: data.rating ?? null,
    name: data.name || "",
    location: data.location || "",
    gpsLat: data.gpsLat ?? null,
    gpsLng: data.gpsLng ?? null,
    // 식당 정보 (type === "식당"일 때만 채워짐)
    mealType: data.mealType || "",
    cuisines: data.cuisines || [],
    foodTypes: data.foodTypes || [],
    foodDetails: data.foodDetails || "",
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  await db.activities.add(entity);
  await enqueue("activities", "insert", entity.id, entity);
  return entity;
}

export async function updateActivity(id, patch) {
  const timestamp = now();
  const normalized = normalizeForSync({ ...patch, updatedAt: timestamp });
  await db.activities.update(id, normalized);
  const entity = await db.activities.get(id);
  if (entity) {
    await enqueue("activities", "update", id, normalizeForSync(entity));
  }
  return entity;
}

export async function deleteActivity(id) {
  await db.activities.delete(id);
  await enqueue("activities", "delete", id, null);
}

/* ─── Day Notes ───────────────────────────────────────────── */

export async function upsertDayNote(tripId, date, patch) {
  const existing = await db.day_notes
    .where(["tripId", "date"])
    .equals([tripId, date])
    .first();

  const timestamp = now();

  if (existing) {
    const normalized = normalizeForSync({ ...patch, updatedAt: timestamp });
    await db.day_notes.update(existing.id, normalized);
    const entity = await db.day_notes.get(existing.id);
    await enqueue("day_notes", "update", existing.id, normalizeForSync(entity));
    return entity;
  } else {
    const entity = normalizeForSync({
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
    });
    await db.day_notes.add(entity);
    await enqueue("day_notes", "insert", entity.id, entity);
    return entity;
  }
}

export async function deleteDayNote(id) {
  await db.day_notes.delete(id);
  await enqueue("day_notes", "delete", id, null);
}

// ═══════════════════════════════════════════════════════════
// Accommodation (v2 신규)
// ═══════════════════════════════════════════════════════════

/**
 * 여행별 숙소 목록 (Dexie에서만 조회 — sync는 백그라운드).
 */
export async function listAccommodations(tripId) {
  return db.accommodations.where("tripId").equals(tripId).toArray();
}

/**
 * 신규 숙소 생성.
 * @param {string} tripId
 * @param {string} ownerId
 * @param {object} data
 */
export async function createAccommodation(tripId, ownerId, data) {
  const timestamp = now();
  const entity = normalizeForSync({
    id: newId(),
    tripId,
    ownerId,
    name: data.name,
    location: data.location || "",
    gpsLat: data.gpsLat ?? null,
    gpsLng: data.gpsLng ?? null,
    checkInDate: data.checkInDate || null,
    checkInTime: data.checkInTime || null,
    checkOutDate: data.checkOutDate || null,
    checkOutTime: data.checkOutTime || null,
    nights: data.nights ?? 1,
    totalCost: data.totalCost || 0,
    rating: data.rating ?? null,
    memo: data.memo || "",
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  await db.accommodations.add(entity);
  await enqueue("trip_accommodations", "insert", entity.id, entity);
  return entity;
}

export async function updateAccommodation(id, patch) {
  const timestamp = now();
  const normalized = normalizeForSync({ ...patch, updatedAt: timestamp });
  await db.accommodations.update(id, normalized);
  const entity = await db.accommodations.get(id);
  if (entity) {
    await enqueue(
      "trip_accommodations",
      "update",
      id,
      normalizeForSync(entity),
    );
  }
  return entity;
}

export async function deleteAccommodation(id) {
  await db.transaction("rw", db.accommodations, db.activities, async () => {
    // 이 숙소를 참조하는 activities.accommodationId를 null로 (로컬 캐시 즉시 반영)
    // 서버는 ON DELETE SET NULL로 자동 처리
    const referencing = await db.activities
      .where("accommodationId")
      .equals(id)
      .toArray();
    for (const act of referencing) {
      await db.activities.put({ ...act, accommodationId: null });
    }

    await db.accommodations.delete(id);
  });
  await enqueue("trip_accommodations", "delete", id, null);
}

// ═══════════════════════════════════════════════════════════
// Profile (v2 신규)
// ═══════════════════════════════════════════════════════════

/**
 * 유저 프로필 조회 (Dexie).
 */
export async function getProfile(userId) {
  return db.profile.get(userId);
}

/**
 * 프로필 upsert.
 * 서버엔 auth trigger로 row가 자동 생성되므로 update만 필요.
 */
export async function updateProfile(userId, patch) {
  const timestamp = now();
  const existing = (await db.profile.get(userId)) ?? { id: userId };
  const updated = normalizeForSync({
    ...existing,
    ...patch,
    id: userId,
    updatedAt: timestamp,
  });

  await db.profile.put(updated);
  await enqueue("profiles", "update", userId, updated);
  return updated;
}

// ═══════════════════════════════════════════════════════════
// Activity Photos (v3 신규)
// ═══════════════════════════════════════════════════════════

/**
 * 액티비티의 사진 목록 (정렬 순서 기준).
 */
export async function listActivityPhotos(activityId) {
  const rows = await db.activity_photos
    .where("activityId")
    .equals(activityId)
    .toArray();
  return rows.sort(
    (a, b) =>
      (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
      (a.createdAt || "").localeCompare(b.createdAt || ""),
  );
}

/**
 * 사진 추가 흐름:
 *   1. 로컬에서 리사이즈 (긴 변 3840px, JPEG 90%)
 *   2. Supabase Storage 업로드
 *   3. 메타 정보를 activity_photos 테이블에 저장
 *   4. 실패 시: Storage 롤백 (업로드된 파일 삭제)
 *
 * @param {string} activityId
 * @param {string} ownerId
 * @param {File} file
 * @param {number} sortOrder
 */
export async function addActivityPhoto(
  activityId,
  ownerId,
  file,
  sortOrder = 0,
) {
  // 1. 리사이즈
  const resized = await resizeImage(file);

  // 2. 업로드 준비
  const photoId = newId();
  const storagePath = buildActivityPhotoPath(ownerId, activityId, photoId);

  // 3. Storage 업로드
  await uploadPhoto(storagePath, resized.blob);

  // 4. 메타 저장 (Dexie + sync_queue)
  const timestamp = now();
  const entity = normalizeForSync({
    id: photoId,
    activityId,
    ownerId,
    storagePath,
    width: resized.width,
    height: resized.height,
    sizeBytes: resized.sizeBytes,
    takenAt: resized.takenAt,
    sortOrder,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  try {
    await db.activity_photos.add(entity);
    await enqueue("activity_photos", "insert", entity.id, entity);
  } catch (err) {
    // 로컬 저장 실패 시 Storage 롤백
    try {
      await storageDeletePhoto(storagePath);
    } catch (_) {}
    throw err;
  }

  return entity;
}

/**
 * 사진 삭제:
 *   1. Storage에서 파일 삭제
 *   2. 로컬 + sync_queue 등록
 */
export async function deleteActivityPhoto(id) {
  const entity = await db.activity_photos.get(id);
  if (!entity) return;

  // Storage 파일 삭제 (실패해도 진행: 로컬/서버 메타는 지움)
  try {
    await storageDeletePhoto(entity.storagePath);
  } catch (err) {
    console.warn("[photo] Storage 삭제 실패, 메타는 계속 진행:", err);
  }

  await db.activity_photos.delete(id);
  await enqueue("activity_photos", "delete", id, null);
}

/**
 * 사진 순서 변경 (드래그앤드롭 등에서 호출).
 */
export async function updateActivityPhotoOrder(id, sortOrder) {
  const timestamp = now();
  await db.activity_photos.update(id, {
    sortOrder,
    updatedAt: timestamp,
  });
  const entity = await db.activity_photos.get(id);
  if (entity) {
    await enqueue("activity_photos", "update", id, normalizeForSync(entity));
  }
  return entity;
}
