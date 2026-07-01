import { IconUser } from "@tabler/icons-react";

function ProfilePage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <IconUser size={40} color="#A8B4C4" />
      <h2
        className="mt-3 font-medium"
        style={{ color: "#1E2A38", fontSize: "16px" }}
      >
        나
      </h2>
      <p className="mt-1" style={{ color: "#7A8CA0", fontSize: "12px" }}>
        준비 중입니다
      </p>
    </div>
  );
}

export default ProfilePage;
