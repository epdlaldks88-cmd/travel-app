/**
 * Kakao Maps SDK 로더.
 *
 * SDK를 lazy load 방식으로 로드해서 앱 초기 로딩 시간을 늘리지 않음.
 * 모달 열 때 처음 한 번만 로드하고, 이후엔 캐시된 Promise 재사용.
 */

let sdkPromise = null;

export function loadKakaoMaps() {
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    // 이미 로드된 경우
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      resolve(window.kakao);
      return;
    }

    const appKey = import.meta.env.VITE_KAKAO_APP_KEY;
    if (!appKey) {
      reject(new Error("VITE_KAKAO_APP_KEY가 설정되지 않았습니다"));
      return;
    }

    // 스크립트 태그가 이미 있는 경우
    const existing = document.querySelector('script[data-kakao-sdk="true"]');
    if (existing) {
      existing.addEventListener("load", () => {
        window.kakao.maps.load(() => resolve(window.kakao));
      });
      existing.addEventListener("error", (e) =>
        reject(new Error("Kakao SDK 로드 실패")),
      );
      return;
    }

    // 스크립트 태그 동적 생성
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services&autoload=false`;
    script.async = true;
    script.dataset.kakaoSdk = "true";

    script.onload = () => {
      window.kakao.maps.load(() => resolve(window.kakao));
    };
    script.onerror = () => {
      sdkPromise = null; // 실패 시 재시도 가능하도록 캐시 리셋
      reject(new Error("Kakao SDK 로드 실패"));
    };

    document.head.appendChild(script);
  });

  return sdkPromise;
}

/**
 * 키워드로 장소 검색.
 * @param {string} keyword - 검색어
 * @param {Object} options - { page, size, x, y, radius } (선택)
 * @returns {Promise<Array>} 검색 결과 배열
 *
 * 결과 형식 (Kakao Places API):
 *   [{
 *     id, place_name, address_name, road_address_name,
 *     x (경도, 문자열), y (위도, 문자열),
 *     category_name, phone, place_url, distance
 *   }, ...]
 */
export async function searchPlacesByKeyword(keyword, options = {}) {
  const kakao = await loadKakaoMaps();

  return new Promise((resolve, reject) => {
    const places = new kakao.maps.services.Places();

    places.keywordSearch(
      keyword,
      (data, status) => {
        if (status === kakao.maps.services.Status.OK) {
          resolve(data);
        } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
          resolve([]);
        } else {
          reject(new Error(`장소 검색 실패: ${status}`));
        }
      },
      options,
    );
  });
}
