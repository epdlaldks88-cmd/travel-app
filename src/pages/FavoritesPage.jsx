import { IconStar } from "@tabler/icons-react";

function FavoritesPage() {
  return (
    <div>
      {/* 헤더 */}
      <header className="mb-6 pt-4">
        <h1
          className="text-xl font-medium"
          style={{ color: "#1E2A38", letterSpacing: "-0.3px" }}
        >
          즐겨찾기
        </h1>
        <p
          className="text-xs mt-1"
          style={{ color: "#7A8CA0", letterSpacing: "0.5px" }}
        >
          다시 가고 싶은 곳
        </p>
      </header>

      {/* 빈 상태 */}
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <IconStar size={40} color="#A8B4C4" />
        <p className="mt-3" style={{ color: "#7A8CA0", fontSize: "13px" }}>
          아직 즐겨찾기한 곳이 없습니다
        </p>
        <p
          className="mt-1 text-center"
          style={{ color: "#A8B4C4", fontSize: "11px" }}
        >
          방문한 식당·장소를 즐겨찾기로 저장하면
          <br />
          여기서 다시 볼 수 있어요
        </p>
      </div>
    </div>
  );
}

export default FavoritesPage;
