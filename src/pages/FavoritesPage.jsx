import { IconStar } from "@tabler/icons-react";

function FavoritesPage() {
  return (
    <div>
      <header className="mb-6 pt-4">
        <h1 className="text-xl font-medium text-text tracking-tight">
          즐겨찾기
        </h1>
        <p className="text-xs text-text-muted mt-1 tracking-wide">
          다시 가고 싶은 곳
        </p>
      </header>

      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <IconStar size={40} className="text-text-subtle" />
        <p className="text-sm text-text-muted mt-3">
          아직 즐겨찾기한 곳이 없습니다
        </p>
        <p className="text-xs text-text-subtle mt-1 text-center">
          방문한 식당·장소를 즐겨찾기로 저장하면
          <br />
          여기서 다시 볼 수 있어요
        </p>
      </div>
    </div>
  );
}

export default FavoritesPage;
