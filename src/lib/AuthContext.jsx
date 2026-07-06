import { createContext, useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";

/**
 * AuthContext
 *
 * 제공 값:
 *   user     - Supabase User 객체 또는 null
 *   session  - Supabase Session 객체 또는 null
 *   loading  - 초기 세션 확인 중 (true 면 로딩 화면 표시)
 *   signInWithGoogle() - 구글 OAuth 로그인
 *   signOut()          - 로그아웃
 *
 * 세션은 supabase-js 가 localStorage 에 자동 저장 & 갱신.
 * onAuthStateChange 로 로그인/로그아웃/토큰 갱신 이벤트 감지.
 */

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setLoading(false);
    });

    // 인증 상태 변경 구독 (로그인, 로그아웃, 토큰 갱신)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setSession(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) {
      console.error("Google 로그인 실패:", error);
      alert("로그인에 실패했습니다: " + error.message);
    }
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("로그아웃 실패:", error);
      alert("로그아웃에 실패했습니다: " + error.message);
    }
  }, []);

  const value = {
    user: session?.user ?? null,
    session,
    loading,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
