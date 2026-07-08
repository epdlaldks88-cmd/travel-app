/**
 * 카카오 모빌리티 자동차 길찾기 프록시 호출.
 *
 * @param {object} params
 * @param {number} params.originLat
 * @param {number} params.originLng
 * @param {number} params.destLat
 * @param {number} params.destLng
 * @param {"RECOMMEND"|"TIME"|"DISTANCE"} [params.priority]
 * @returns {Promise<{ durationSec, distanceMeters, tollFare, taxiFare }>}
 */
export async function getDirections({
  originLat,
  originLng,
  destLat,
  destLng,
  priority = "RECOMMEND",
}) {
  const response = await fetch("/api/route", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      originLat,
      originLng,
      destLat,
      destLng,
      priority,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }

  return data;
}

/**
 * 이동 수단에 따른 priority 결정.
 * 자동차 계열만 RECOMMEND/TIME 반환. 대중교통·도보는 null.
 */
export function getPriorityForTransport(transport) {
  if (transport === "자차" || transport === "렌트카") return "RECOMMEND";
  if (transport === "택시") return "TIME";
  return null;
}

/**
 * 초 → { hours, minutes } 변환.
 * ActivityForm의 durationHours/durationMinutes 필드용.
 */
export function secondsToHM(sec) {
  const totalMinutes = Math.round(sec / 60);
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  };
}

/**
 * 미터 → 킬로미터 (소수 1자리).
 */
export function metersToKm(m) {
  return Math.round(m / 100) / 10;
}
