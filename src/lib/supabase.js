import { createClient } from "@supabase/supabase-js";

/**
 * Supabase 클라이언트 (싱글톤).
 *
 * 환경 변수:
 *   VITE_SUPABASE_URL              - Project URL
 *   VITE_SUPABASE_PUBLISHABLE_KEY  - Publishable API key (안전하게 브라우저 노출 가능)
 *
 * .env.local 에서 로드. RLS 로 인해 인증 안 된 요청은 자동 차단됨.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Supabase 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인하세요:\n" +
      "  VITE_SUPABASE_URL\n" +
      "  VITE_SUPABASE_PUBLISHABLE_KEY",
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true, // 로그인 유지 (localStorage)
    autoRefreshToken: true, // 토큰 자동 갱신
    detectSessionInUrl: true, // OAuth 리다이렉트 URL 자동 감지
  },
});
