import { useEffect } from "react";
import { useToast } from "../components/Toast";

/**
 * 안드로이드 뒤로가기로 앱 종료.
 *
 * 동작:
 *   1. 마운트 시 history state 하나 push (뒤로가기 catch용)
 *   2. popstate 이벤트에서 뒤로가기 감지
 *   3. 첫 뒤로가기: 토스트 "한 번 더 누르면 종료됩니다" (2초)
 *   4. 2초 내 재입력: window.close() 시도
 *
 * 홈 화면(라우트 "/") 진입 시에만 사용.
 */
export function useBackButtonExit() {
  const toast = useToast();

  useEffect(() => {
    // 앱 진입 시점 history state 하나 push
    // 뒤로가기 눌러도 이 state로 돌아옴 (앱 안에 머묾)
    const state = { appExit: true };
    window.history.pushState(state, "");

    let readyToExit = false;
    let timerId = null;

    const handlePopState = () => {
      if (readyToExit) {
        // 2초 내 두 번째 뒤로가기 → 종료
        window.close();
        // window.close() 실패 시 fallback: 아무것도 안 함
        // (PWA 밖 브라우저에선 실패할 수 있음)
        return;
      }

      // 첫 번째 뒤로가기: 다시 앞으로 push해서 앱 안에 머물게
      window.history.pushState(state, "");
      readyToExit = true;
      toast.info("한 번 더 누르면 종료됩니다", 2000);

      // 2초 후 리셋
      if (timerId) clearTimeout(timerId);
      timerId = setTimeout(() => {
        readyToExit = false;
      }, 2000);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (timerId) clearTimeout(timerId);
    };
  }, [toast]);
}
