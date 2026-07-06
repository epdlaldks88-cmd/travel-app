import { Navigate } from "react-router-dom";
import { IconBrandGoogle, IconLoader2 } from "@tabler/icons-react";
import { Button } from "../components/ui";
import { useAuth } from "../lib/useAuth";

/**
 * LoginPage
 *
 * 미로그인 사용자에게 표시되는 진입 화면.
 * 이미 로그인된 상태이면 홈으로 리다이렉트.
 */
export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <IconLoader2 size={32} className="animate-spin text-text-muted" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-heading text-3xl font-medium text-text mb-2 tracking-tight">
          여행
        </h1>
        <p className="text-sm text-text-muted mb-12">나만의 여행 기록</p>

        <Button
          variant="secondary"
          onClick={signInWithGoogle}
          fullWidth
          size="lg"
          leftIcon={<IconBrandGoogle size={20} />}
        >
          구글로 시작하기
        </Button>

        <p className="text-xs text-text-subtle mt-6">
          로그인하면 여행 데이터가 안전하게 저장돼요
        </p>
      </div>
    </div>
  );
}
