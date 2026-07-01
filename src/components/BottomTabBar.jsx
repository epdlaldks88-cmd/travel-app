import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  IconHome,
  IconMap2,
  IconChartBar,
  IconUser,
  IconPlus,
} from "@tabler/icons-react";

function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  // 상세 페이지에서는 탭바 숨김 (선택 사항, 시안엔 없음)
  // 지금은 항상 표시로 진행

  // 활성 탭 판정
  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  // 활성 색 · 비활성 색
  const activeColor = "#1E2A38";
  const inactiveColor = "#A8B4C4";

  // FAB 클릭: 홈으로 이동하고 폼에 포커스
  // (지금은 그냥 홈으로 이동)
  const handleFabClick = () => {
    navigate("/");
    // 나중에 폼에 자동 포커스 추가 가능
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0"
      style={{
        background: "#FAF9F5",
        borderTop: "0.5px solid #E8E4D8",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div
        className="max-w-2xl mx-auto flex justify-around items-center relative"
        style={{ height: "56px", padding: "0 16px" }}
      >
        {/* 홈 */}
        <Link to="/" className="flex flex-col items-center gap-1">
          <IconHome
            size={22}
            color={isActive("/") ? activeColor : inactiveColor}
          />
          <span
            className="font-medium"
            style={{
              fontSize: "10px",
              color: isActive("/") ? activeColor : inactiveColor,
            }}
          >
            홈
          </span>
        </Link>

        {/* 지도 */}
        <Link to="/map" className="flex flex-col items-center gap-1">
          <IconMap2
            size={22}
            color={isActive("/map") ? activeColor : inactiveColor}
          />
          <span
            className="font-medium"
            style={{
              fontSize: "10px",
              color: isActive("/map") ? activeColor : inactiveColor,
            }}
          >
            지도
          </span>
        </Link>

        {/* FAB (중앙) */}
        <button
          onClick={handleFabClick}
          className="rounded-full flex items-center justify-center"
          style={{
            width: "48px",
            height: "48px",
            background: "#1E2A38",
            color: "#FFFFFF",
            marginTop: "-16px",
            boxShadow: "0 4px 12px rgba(30,42,56,0.2)",
          }}
          title="새 여행 추가"
        >
          <IconPlus size={22} />
        </button>

        {/* 통계 */}
        <Link to="/stats" className="flex flex-col items-center gap-1">
          <IconChartBar
            size={22}
            color={isActive("/stats") ? activeColor : inactiveColor}
          />
          <span
            className="font-medium"
            style={{
              fontSize: "10px",
              color: isActive("/stats") ? activeColor : inactiveColor,
            }}
          >
            통계
          </span>
        </Link>

        {/* 나 */}
        <Link to="/profile" className="flex flex-col items-center gap-1">
          <IconUser
            size={22}
            color={isActive("/profile") ? activeColor : inactiveColor}
          />
          <span
            className="font-medium"
            style={{
              fontSize: "10px",
              color: isActive("/profile") ? activeColor : inactiveColor,
            }}
          >
            나
          </span>
        </Link>
      </div>
    </nav>
  );
}

export default BottomTabBar;
