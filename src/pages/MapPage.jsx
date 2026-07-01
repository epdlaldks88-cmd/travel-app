import { IconMap2 } from "@tabler/icons-react";

function MapPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <IconMap2 size={40} color="#A8B4C4" />
      <h2
        className="mt-3 font-medium"
        style={{ color: "#1E2A38", fontSize: "16px" }}
      >
        지도
      </h2>
      <p className="mt-1" style={{ color: "#7A8CA0", fontSize: "12px" }}>
        준비 중입니다
      </p>
    </div>
  );
}

export default MapPage;
