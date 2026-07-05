/**
 * 폰트 프리셋 정의 (총 5개)
 *
 * 구조:
 *   key         - 내부 식별자 (localStorage, 코드 참조)
 *   label       - 사용자에게 보여지는 한글 이름 (마이페이지 UI)
 *   description - 프리셋 설명 (UI 서브 텍스트)
 *   heading     - 제목용 fontFamily 값
 *   body        - 본문용 fontFamily 값
 *
 * CSS 변수 매핑:
 *   heading → --font-heading (Tailwind 유틸: font-heading)
 *   body    → --font-body    (Tailwind 유틸: font-body, html/body 기본값)
 *
 * 실제 폰트 파일은 index.html 의 <link> 태그로 미리 로드됨.
 */

const SYSTEM_FALLBACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";

export const fonts = {
  editorial: {
    key: "editorial",
    label: "에디토리얼",
    description: "감성 명조 + 부드러운 산세리프",
    heading: `'Maru Buri', 'Gowun Batang', serif`,
    body: `'Gowun Dodum', ${SYSTEM_FALLBACK}`,
  },

  soft: {
    key: "soft",
    label: "부드러움",
    description: "통일된 다정한 산세리프",
    heading: `'Gowun Dodum', ${SYSTEM_FALLBACK}`,
    body: `'Gowun Dodum', ${SYSTEM_FALLBACK}`,
  },

  modern: {
    key: "modern",
    label: "모던",
    description: "깔끔한 모던 산세리프",
    heading: `'Wanted Sans Variable', 'Wanted Sans', ${SYSTEM_FALLBACK}`,
    body: `'Wanted Sans Variable', 'Wanted Sans', ${SYSTEM_FALLBACK}`,
  },

  classic: {
    key: "classic",
    label: "감성 명조",
    description: "클래식 명조 통일",
    heading: `'Gowun Batang', serif`,
    body: `'Gowun Batang', serif`,
  },

  handwriting: {
    key: "handwriting",
    label: "손글씨",
    description: "실제 손글씨 제목 (개성적)",
    heading: `'Ownglyph_meetme-Rg', 'Gowun Dodum', cursive`,
    body: `'Gowun Dodum', ${SYSTEM_FALLBACK}`,
  },
};

/** 전체 폰트 프리셋 배열 */
export const allFonts = Object.values(fonts);

/** 기본 폰트 key */
export const defaultFont = "editorial";

/**
 * key 로 폰트 조회. 없으면 기본 프리셋 반환.
 */
export function getFont(key) {
  return fonts[key] || fonts[defaultFont];
}
