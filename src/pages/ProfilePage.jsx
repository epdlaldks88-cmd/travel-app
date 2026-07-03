import { IconUser } from "@tabler/icons-react";

function ProfilePage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <IconUser size={40} className="text-text-subtle" />
      <h2 className="text-base font-medium text-text mt-3">나</h2>
      <p className="text-xs text-text-muted mt-1">준비 중입니다</p>
    </div>
  );
}

export default ProfilePage;
