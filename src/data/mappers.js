/**
 * Supabase (snake_case) ↔ 클라이언트 (camelCase) 변환.
 *
 * 필드 개수가 많아 일일이 매핑하기보다 generic 변환기 사용.
 * 특수 케이스(배열/객체 중첩)는 지금 스키마엔 없으므로 shallow 변환으로 충분.
 */

function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function camelToSnake(str) {
  return str.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
}

/**
 * Supabase row → 클라이언트 엔티티 (camelCase)
 */
export function fromSupabase(row) {
  if (!row) return row;
  const result = {};
  for (const [key, value] of Object.entries(row)) {
    result[snakeToCamel(key)] = value;
  }
  return result;
}

/**
 * 클라이언트 엔티티 → Supabase row (snake_case)
 */
export function toSupabase(entity) {
  if (!entity) return entity;
  const result = {};
  for (const [key, value] of Object.entries(entity)) {
    result[camelToSnake(key)] = value;
  }
  return result;
}
