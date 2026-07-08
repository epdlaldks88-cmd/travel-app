/**
 * 카카오 모빌리티 자동차 길찾기 프록시.
 *
 * 인증된 사용자 요청만 처리, REST API 키는 서버 환경변수로 보호.
 *
 * 입력 (POST body 또는 GET query):
 *   originLat, originLng, destLat, destLng: 좌표
 *   priority: RECOMMEND | TIME | DISTANCE (선택, 기본 RECOMMEND)
 *
 * 출력:
 *   { durationSec, distanceMeters, tollFare, taxiFare }
 */

const KAKAO_ENDPOINT = "https://apis-navi.kakaomobility.com/v1/directions";

// Vercel Edge 대신 Node runtime 사용 (fetch 전역 사용 가능)
export const config = {
  runtime: "nodejs",
};

export default async function handler(req, res) {
  // CORS (같은 도메인이라 필요없지만 안전마진)
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "POST만 지원합니다" });
    return;
  }

  const apiKey = process.env.KAKAO_REST_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "서버 설정 오류: API 키 없음" });
    return;
  }

  const {
    originLat,
    originLng,
    destLat,
    destLng,
    priority = "RECOMMEND",
  } = req.body || {};

  if (
    typeof originLat !== "number" ||
    typeof originLng !== "number" ||
    typeof destLat !== "number" ||
    typeof destLng !== "number"
  ) {
    res.status(400).json({ error: "좌표가 유효하지 않습니다" });
    return;
  }

  if (!["RECOMMEND", "TIME", "DISTANCE"].includes(priority)) {
    res.status(400).json({ error: "priority 값이 올바르지 않습니다" });
    return;
  }

  // 카카오 형식: 경도,위도
  const params = new URLSearchParams({
    origin: `${originLng},${originLat}`,
    destination: `${destLng},${destLat}`,
    priority,
    summary: "true",
    car_fuel: "GASOLINE",
    car_hipass: "false",
    alternatives: "false",
    road_details: "false",
  });

  try {
    const response = await fetch(`${KAKAO_ENDPOINT}?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `KakaoAK ${apiKey}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("[kakao] API 오류:", response.status, text);
      res.status(response.status).json({
        error: `카카오 API 오류 (${response.status})`,
      });
      return;
    }

    const data = await response.json();
    const route = data.routes?.[0];

    if (!route || route.result_code !== 0) {
      res.status(404).json({
        error: route?.result_msg || "경로를 찾을 수 없습니다",
      });
      return;
    }

    const summary = route.summary || {};
    res.status(200).json({
      durationSec: summary.duration ?? 0,
      distanceMeters: summary.distance ?? 0,
      tollFare: summary.fare?.toll ?? 0,
      taxiFare: summary.fare?.taxi ?? 0,
    });
  } catch (err) {
    console.error("[kakao] 요청 실패:", err);
    res.status(500).json({ error: "서버 오류" });
  }
}
