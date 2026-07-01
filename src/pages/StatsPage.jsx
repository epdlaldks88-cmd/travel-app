import { IconChartBar } from "@tabler/icons-react";

function StatsPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <IconChartBar size={40} color="#A8B4C4" />
      <h2
        className="mt-3 font-medium"
        style={{ color: "#1E2A38", fontSize: "16px" }}
      >
        통계
      </h2>
      <p className="mt-1" style={{ color: "#7A8CA0", fontSize: "12px" }}>
        준비 중입니다
      </p>
    </div>
  );
}

export default StatsPage;
