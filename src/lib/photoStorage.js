import { supabase } from "./supabase";

const BUCKET = "travel-photos";

/**
 * Storage 경로 규칙: {userId}/activities/{activityId}/{photoId}.jpg
 */
export function buildActivityPhotoPath(userId, activityId, photoId) {
  return `${userId}/activities/${activityId}/${photoId}.jpg`;
}

/**
 * 리사이즈된 Blob을 Storage에 업로드.
 */
export async function uploadPhoto(path, blob) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, {
      contentType: "image/jpeg",
      cacheControl: "3600",
      upsert: false,
    });
  if (error) throw error;
  return data;
}

/**
 * Storage에서 삭제.
 */
export async function deletePhoto(path) {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}

/**
 * Signed URL 발급 (1시간 유효).
 */
export async function getSignedUrl(path, expiresIn = 3600) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}

/**
 * 여러 경로에 대해 signed URL 일괄 발급.
 * 실패한 경로는 null로 반환.
 */
export async function getSignedUrls(paths, expiresIn = 3600) {
  if (paths.length === 0) return {};
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(paths, expiresIn);
  if (error) throw error;

  const map = {};
  for (const item of data) {
    map[item.path] = item.error ? null : item.signedUrl;
  }
  return map;
}

/**
 * 여행 커버 이미지 경로 규칙: {userId}/covers/{tripId}.jpg
 */
export function buildTripCoverPath(userId, tripId) {
  return `${userId}/covers/${tripId}.jpg`;
}
