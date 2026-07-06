import { useRef, useState } from "react";
import {
  IconCheck,
  IconDownload,
  IconUpload,
  IconTrash,
  IconChevronRight,
  IconUser,
  IconLogout,
  IconLoader2,
} from "@tabler/icons-react";
import { Button, Card, Section, Switch } from "../components/ui";
import { useTheme } from "../theme/useTheme";
import { useAuth } from "../lib/useAuth";
import { supabase } from "../lib/supabase";
import { db, clearLocalData } from "../data/db";
import * as repository from "../data/repository";

function ProfilePage() {
  return (
    <div>
      {/* ─── 헤더 ─────────────────────────────────────── */}
      <header className="mb-6 pt-4">
        <h1 className="font-heading text-xl font-medium text-text tracking-tight">
          나
        </h1>
        <p className="text-xs text-text-muted mt-1 tracking-wide">환경 설정</p>
      </header>

      {/* ─── 계정 섹션 ─────────────────────────────────── */}
      <AccountSection />

      {/* ─── 테마 섹션 ─────────────────────────────────── */}
      <ThemeSection />

      {/* ─── 폰트 섹션 ─────────────────────────────────── */}
      <FontSection />

      {/* ─── 데이터 관리 섹션 ───────────────────────────── */}
      <DataSection />

      {/* ─── 앱 정보 ───────────────────────────────────── */}
      <AppInfoSection />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   계정 섹션
   ═══════════════════════════════════════════════════════════ */

function AccountSection() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    if (!confirm("로그아웃하시겠습니까?")) return;
    signOut();
  };

  const avatarUrl = user?.user_metadata?.avatar_url;
  const name =
    user?.user_metadata?.full_name || user?.user_metadata?.name || null;
  const email = user?.email;

  return (
    <Section title="계정" className="mb-6">
      <Card padding="md">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name || email || "프로필"}
              className="w-12 h-12 rounded-full object-cover shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-surface-alt flex items-center justify-center text-text-muted shrink-0">
              <IconUser size={24} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {name && (
              <p className="text-sm font-medium text-text truncate">{name}</p>
            )}
            <p className="text-xs text-text-muted truncate">{email}</p>
          </div>
        </div>
        <Button
          variant="secondary"
          onClick={handleSignOut}
          fullWidth
          size="sm"
          leftIcon={<IconLogout size={16} />}
          className="mt-3"
        >
          로그아웃
        </Button>
      </Card>
    </Section>
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
   폰트 섹션
   ═══════════════════════════════════════════════════════════ */

function FontSection() {
  const { font, fontKey, setFont, allFonts } = useTheme();

  return (
    <Section title="폰트" className="mb-6">
      <div className="grid grid-cols-2 gap-2">
        {allFonts.map((f) => (
          <FontCard
            key={f.key}
            font={f}
            selected={f.key === fontKey}
            onClick={() => setFont(f.key)}
          />
        ))}
      </div>
    </Section>
  );
}

function FontCard({ font, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "p-3 rounded-xl border-2 text-left transition-colors bg-surface",
        selected ? "border-accent" : "border-border hover:border-border-strong",
      ].join(" ")}
    >
      {/* 실제 폰트로 렌더된 프리뷰 */}
      <div className="mb-2 min-h-[3.5rem]">
        <p
          style={{ fontFamily: font.heading }}
          className="text-lg text-text leading-tight"
        >
          강릉 여행
        </p>
        <p
          style={{ fontFamily: font.body }}
          className="text-xs text-text-muted mt-1"
        >
          Trip · 소중한 기억
        </p>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text">{font.label}</span>
        {selected && <IconCheck size={16} className="text-accent" />}
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════
   데이터 관리 섹션
   ═══════════════════════════════════════════════════════════ */

function DataSection() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    if (!user) return;
    setBusy(true);
    try {
      // 로컬 캐시(Dexie)에서 현재 사용자 데이터 조회
      const trips = await db.trips.where("ownerId").equals(user.id).toArray();
      const tripIds = trips.map((t) => t.id);
      const activities =
        tripIds.length > 0
          ? await db.activities.where("tripId").anyOf(tripIds).toArray()
          : [];
      const dayNotes =
        tripIds.length > 0
          ? await db.day_notes.where("tripId").anyOf(tripIds).toArray()
          : [];

      const data = {
        version: 2,
        exportedAt: new Date().toISOString(),
        trips,
        activities,
        dayNotes,
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
    } catch (err) {
      console.error("내보내기 실패:", err);
      alert("내보내기 중 오류가 발생했습니다");
    } finally {
      setBusy(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      setBusy(true);
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data.trips)) {
          alert("올바른 백업 파일이 아닙니다");
          return;
        }
        const ok = confirm(
          `${data.trips.length}개의 여행을 가져옵니다.\n기존 데이터는 유지되고 새 데이터가 추가됩니다. 계속하시겠습니까?`,
        );
        if (!ok) return;

        // Trip 새로 생성. 원본 id → 새 UUID 매핑
        const idMap = {};
        for (const trip of data.trips) {
          const created = await repository.createTrip(trip, user.id);
          idMap[trip.id] = created.id;
        }

        // Activity 마이그레이션 (tripId 매핑)
        if (Array.isArray(data.activities)) {
          for (const act of data.activities) {
            const newTripId = idMap[act.tripId];
            if (newTripId) {
              await repository.createActivity(newTripId, act);
            }
          }
        }

        // DayNote 마이그레이션
        if (Array.isArray(data.dayNotes)) {
          for (const note of data.dayNotes) {
            const newTripId = idMap[note.tripId];
            if (newTripId && note.date) {
              await repository.upsertDayNote(newTripId, note.date, note);
            }
          }
        }

        alert("가져오기가 완료되었습니다");
      } catch (err) {
        console.error("가져오기 실패:", err);
        alert("파일을 읽을 수 없거나 형식이 잘못됐습니다");
      } finally {
        setBusy(false);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleReset = async () => {
    if (
      !confirm(
        "서버와 로컬의 모든 여행 데이터가 삭제됩니다.\n계속하시겠습니까?",
      )
    )
      return;
    if (!confirm("정말 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다."))
      return;

    setBusy(true);
    try {
      // 서버 데이터 삭제 (RLS 로 본인 소유만 삭제됨)
      // trips 삭제 시 CASCADE 로 activities, day_notes 자동 삭제
      const { data: trips, error: fetchErr } = await supabase
        .from("trips")
        .select("id");
      if (fetchErr) throw fetchErr;

      if (trips && trips.length > 0) {
        const { error: delErr } = await supabase
          .from("trips")
          .delete()
          .in(
            "id",
            trips.map((t) => t.id),
          );
        if (delErr) throw delErr;
      }

      // 로컬 캐시 완전 삭제 (sync_queue 포함)
      await clearLocalData();

      alert("초기화되었습니다");
    } catch (err) {
      console.error("초기화 실패:", err);
      alert("초기화 중 오류가 발생했습니다: " + err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Section title="데이터 관리" className="mb-6">
      <Card padding="none" className="overflow-hidden">
        <DataMenuItem
          icon={busy ? IconLoader2 : IconDownload}
          iconSpin={busy}
          label="내보내기"
          description="여행 데이터를 JSON 파일로 저장"
          onClick={handleExport}
          disabled={busy}
        />
        <div className="border-t border-border" />
        <DataMenuItem
          icon={IconUpload}
          label="가져오기"
          description="JSON 파일에서 여행 데이터 복원"
          onClick={handleImportClick}
          disabled={busy}
        />
        <div className="border-t border-border" />
        <DataMenuItem
          icon={IconTrash}
          label="초기화"
          description="서버 · 로컬의 모든 여행 데이터 삭제"
          onClick={handleReset}
          destructive
          disabled={busy}
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
  iconSpin = false,
  label,
  description,
  onClick,
  destructive,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-3 p-4 text-left hover:bg-surface-alt transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Icon
        size={20}
        className={[
          destructive ? "text-danger" : "text-text-muted",
          iconSpin ? "animate-spin" : "",
        ]
          .filter(Boolean)
          .join(" ")}
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
