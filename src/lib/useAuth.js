import { useContext } from "react";
import { AuthContext } from "./AuthContext";

/**
 * useAuth
 *
 * AuthProvider 내부에서 인증 상태와 조작 API 사용.
 *
 * @returns {{
 *   user: object | null,
 *   session: object | null,
 *   loading: boolean,
 *   signInWithGoogle: () => Promise<void>,
 *   signOut: () => Promise<void>,
 * }}
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth 는 <AuthProvider> 내부에서만 사용할 수 있습니다.");
  }
  return ctx;
}
