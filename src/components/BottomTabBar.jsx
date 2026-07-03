import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  IconHome,
  IconStar,
  IconChartBar,
  IconUser,
  IconPlus,
} from "@tabler/icons-react";

function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const handleFabClick = () => {
    navigate("/");
    // 나중에 폼 자동 포커스 추가 가능
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-bg border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-2xl mx-auto flex justify-around items-center relative h-14 px-4">
        <TabLink to="/" icon={IconHome} label="홈" active={isActive("/")} />
        <TabLink
          to="/favorites"
          icon={IconStar}
          label="즐겨찾기"
          active={isActive("/favorites")}
        />

        {/* FAB (중앙) */}
        <button
          type="button"
          onClick={handleFabClick}
          aria-label="새 여행 추가"
          className="w-12 h-12 -mt-4 rounded-full flex items-center justify-center bg-accent text-accent-fg shadow-lg hover:opacity-90 active:opacity-80 transition-opacity"
        >
          <IconPlus size={22} />
        </button>

        <TabLink
          to="/stats"
          icon={IconChartBar}
          label="통계"
          active={isActive("/stats")}
        />
        <TabLink
          to="/profile"
          icon={IconUser}
          label="나"
          active={isActive("/profile")}
        />
      </div>
    </nav>
  );
}

/**
 * 개별 탭 링크. 4개 탭이 동일 구조라 서브컴포넌트로 추출.
 * 아이콘은 currentColor 상속 (Tabler 기본 동작).
 */
function TabLink({ to, icon: Icon, label, active }) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center gap-1 transition-colors ${
        active ? "text-text" : "text-text-subtle"
      }`}
    >
      <Icon size={22} />
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}

export default BottomTabBar;
