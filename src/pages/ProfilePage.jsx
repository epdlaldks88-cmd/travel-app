import { useRef } from "react";
import {
  IconCheck,
  IconDownload,
  IconUpload,
  IconTrash,
  IconChevronRight,
} from "@tabler/icons-react";
import { Card, Section, Switch } from "../components/ui";
import { useTheme } from "../theme/useTheme";

function ProfilePage() {
  return (
    <div>
      {/* ─── 헤더 ─────────────────────────────────────── */}
      <header className="mb-6 pt-4">
        <h1 className="text-xl font-medium text-text tracking-tight">나</h1>
        <p className="text-xs text-text-muted mt-1 tracking-wide">환경 설정</p>
      </header>

      {/* ─── 테마 섹션 ─────────────────────────────────── */}
      <ThemeSection />

      {/* ─── 데이터 관리 섹션 ───────────────────────────── */}
      <DataSection />

      {/* ─── 앱 정보 ───────────────────────────────────── */}
      <AppInfoSection />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   테마 섹션
   ═══════════════════════════════════════════════════════════ */

function ThemeSection() {
  const {
    theme,
    themeKey,
    autoDetect,
    setTheme,
    setAutoDetect,
    lightThemes,
    darkThemes,
  } = useTheme();

  return (
    <Section title="테마" className="mb-6">
      {/* 자동 감지 토글 */}
      <Card padding="md" className="mb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-text">시스템 자동 감지</p>
            <p className="text-xs text-text-muted mt-0.5">
              기기 설정에 따라 라이트/다크 자동 전환
            </p>
          </div>
          <Switch
            checked={autoDetect}
            onChange={setAutoDetect}
            aria-label="시스템 자동 감지"
          />
        </div>
        {autoDetect && (
          <p className="text-xs text-text-subtle mt-3 pt-3 border-t border-border">
            현재 시스템 모드에 따라{" "}
            <span className="text-text font-medium">{theme.label}</span> 테마가
            적용되어 있습니다
          </p>
        )}
      </Card>

      {/* 라이트 그룹 */}
      <ThemeGroup
        label="라이트"
        themes={lightThemes}
        selectedKey={themeKey}
        onSelect={setTheme}
      />

      {/* 다크 그룹 */}
      <ThemeGroup
        label="다크"
        themes={darkThemes}
        selectedKey={themeKey}
        onSelect={setTheme}
      />
    </Section>
  );
}

function ThemeGroup({ label, themes, selectedKey, onSelect }) {
  return (
    <div className="mb-4 last:mb-0">
      <h3 className="text-[11px] font-medium text-text-muted mb-2 mt-3 tracking-wider uppercase">
        {label}
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {themes.map((t) => (
          <ThemeCard
            key={t.key}
            theme={t}
            selected={t.key === selectedKey}
            onClick={() => onSelect(t.key)}
          />
        ))}
      </div>
    </div>
  );
}

function ThemeCard({ theme, selected, onClick }) {
  const { colors } = theme;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "p-3 rounded-xl border-2 text-left transition-colors bg-surface",
        selected ? "border-accent" : "border-border hover:border-border-strong",
      ].join(" ")}
    >
      {/* 팔레트 원 4개 (accent, bg, surface, text) - 살짝 겹침 */}
      <div className="flex items-center mb-2">
        <PaletteCircle color={colors.accent} />
        <PaletteCircle color={colors.bg} className="-ml-1.5" />
        <PaletteCircle color={colors.surface} className="-ml-1.5" />
        <PaletteCircle color={colors.text} className="-ml-1.5" />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text">{theme.label}</span>
        {selected && <IconCheck size={16} className="text-accent" />}
      </div>
    </button>
  );
}

function PaletteCircle({ color, className = "" }) {
  return (
    <span
      className={[
        "inline-block w-6 h-6 rounded-full ring-2 ring-surface",
        className,
      ].join(" ")}
      style={{ background: color }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   데이터 관리 섹션
   ═══════════════════════════════════════════════════════════ */

function DataSection() {
  const fileInputRef = useRef(null);

  const handleExport = () => {
    const trips = JSON.parse(localStorage.getItem("trips") || "[]");
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      trips,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `travel-app-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data.trips)) {
          alert("올바른 백업 파일이 아닙니다");
          return;
        }
        const ok = confirm(
          `${data.trips.length}개의 여행을 가져옵니다.\n기존 데이터는 대체됩니다. 계속하시겠습니까?`,
        );
        if (!ok) return;

        localStorage.setItem("trips", JSON.stringify(data.trips));
        alert("가져오기가 완료되었습니다. 페이지를 새로고침합니다.");
        window.location.reload();
      } catch {
        alert("파일을 읽을 수 없습니다");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // 같은 파일 다시 선택 가능하도록
  };

  const handleReset = () => {
    if (!confirm("모든 여행 데이터가 삭제됩니다. 계속하시겠습니까?")) return;
    if (!confirm("정말 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다."))
      return;
    localStorage.removeItem("trips");
    alert("초기화되었습니다. 페이지를 새로고침합니다.");
    window.location.reload();
  };

  return (
    <Section title="데이터 관리" className="mb-6">
      <Card padding="none" className="overflow-hidden">
        <DataMenuItem
          icon={IconDownload}
          label="내보내기"
          description="여행 데이터를 JSON 파일로 저장"
          onClick={handleExport}
        />
        <div className="border-t border-border" />
        <DataMenuItem
          icon={IconUpload}
          label="가져오기"
          description="JSON 파일에서 여행 데이터 복원"
          onClick={handleImportClick}
        />
        <div className="border-t border-border" />
        <DataMenuItem
          icon={IconTrash}
          label="초기화"
          description="모든 여행 데이터 삭제"
          onClick={handleReset}
          destructive
        />
      </Card>

      {/* 숨겨진 파일 입력 (가져오기용) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleFileChange}
        className="hidden"
      />
    </Section>
  );
}

function DataMenuItem({
  icon: Icon,
  label,
  description,
  onClick,
  destructive,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 p-4 text-left hover:bg-surface-alt transition-colors"
    >
      <Icon
        size={20}
        className={destructive ? "text-danger" : "text-text-muted"}
      />
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${
            destructive ? "text-danger" : "text-text"
          }`}
        >
          {label}
        </p>
        <p className="text-xs text-text-muted mt-0.5">{description}</p>
      </div>
      <IconChevronRight size={16} className="text-text-subtle shrink-0" />
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════
   앱 정보 섹션
   ═══════════════════════════════════════════════════════════ */

function AppInfoSection() {
  return (
    <Section title="정보" className="mb-6">
      <Card padding="md">
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">앱 버전</span>
          <span className="text-text tabular-nums">1.0.0</span>
        </div>
      </Card>
    </Section>
  );
}

export default ProfilePage;
