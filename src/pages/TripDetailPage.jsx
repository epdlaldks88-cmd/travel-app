import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  IconArrowLeft,
  IconCameraPlus,
  IconPlus,
  IconLoader2,
} from "@tabler/icons-react";
import ActivityForm from "../components/ActivityForm";
import ActivityItem from "../components/ActivityItem";
import { Button, Card, Rating, Textarea } from "../components/ui";
import {
  useTrip,
  useActivities,
  useUpdateTrip,
  useCreateActivity,
  useDeleteActivity,
} from "../data/hooks";

function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const trip = useTrip(id);
  const activities = useActivities(id);

  const updateTrip = useUpdateTrip();
  const createActivity = useCreateActivity();
  const deleteActivity = useDeleteActivity();

  const [memo, setMemo] = useState("");
  const [rating, setRating] = useState(0);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // trip 로드/변경 시 memo, rating 로컬 상태 동기화
  useEffect(() => {
    if (trip) {
      setMemo(trip.memo || "");
      setRating(trip.rating || 0);
    }
  }, [trip?.id]);

  // ─── 핸들러 ──────────────────────────────────────────────
  const handleAddActivity = async (data) => {
    await createActivity(id, data);
    setShowActivityForm(false);
  };

  const handleDeleteActivity = async (activityId) => {
    if (!confirm("이 일정을 삭제하시겠습니까?")) return;
    await deleteActivity(activityId);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateTrip(id, { memo, rating });
      alert("저장되었습니다");
    } finally {
      setSaving(false);
    }
  };

  // ─── 로딩 · 미존재 ───────────────────────────────────────
  // useLiveQuery 초기값 undefined = 로딩 중
  if (trip === undefined) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <IconLoader2 size={24} className="animate-spin text-text-muted" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted mb-4">여행을 찾을 수 없습니다</p>
        <Link
          to="/"
          className="text-sm text-text-muted hover:text-text transition-colors"
        >
          ← 목록으로
        </Link>
      </div>
    );
  }

  const totalCost = activities.reduce((sum, a) => sum + (a.cost || 0), 0);

  const formatFull = (dateStr) => {
    if (!dateStr) return "";
    return dateStr.replaceAll("-", ".");
  };

  return (
    // 페이지 상위에 적용된 p-4 를 무효화하여 히어로가 전폭 커버
    <div className="-mt-4 -mx-4">
      {/* ─── 히어로 커버 (테마별 그라데이션) ─────────────── */}
      <div className="relative h-[180px] px-4 py-3 bg-gradient-to-br from-hero-from to-hero-to">
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => navigate("/")}
            aria-label="뒤로 가기"
            className="p-1.5 rounded-full bg-black/15 text-white hover:bg-black/25 transition-colors"
          >
            <IconArrowLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="사진 추가 (준비 중)"
            title="사진 추가 (준비 중)"
            className="p-1.5 rounded-full bg-black/15 text-white hover:bg-black/25 transition-colors"
          >
            <IconCameraPlus size={18} />
          </button>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="font-heading text-xl font-medium text-white tracking-tight">
            {trip.title}
          </h1>
          <p className="text-xs text-white/85 mt-1">
            {trip.startDate && trip.endDate && (
              <>
                {formatFull(trip.startDate)} –{" "}
                {formatFull(trip.endDate).slice(5)}
              </>
            )}
            {trip.companions && ` · ${trip.companions}`}
          </p>
        </div>
      </div>

      {/* ─── 통계 로우 ──────────────────────────────────── */}
      <div className="flex justify-between px-4 py-3 bg-bg border-b border-border">
        <StatCell label="일정" value={activities.length} />
        <StatCell
          label="지출"
          value={totalCost > 0 ? `${totalCost.toLocaleString()}원` : "0원"}
        />
        <StatCell
          label="평점"
          value={rating > 0 ? `◆${rating.toFixed(1)}` : "–"}
          highlight={rating > 0}
        />
      </div>

      {/* ─── 본문 ────────────────────────────────────────── */}
      <div className="p-4">
        {/* 일정 섹션 */}
        <section className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-heading text-sm font-medium text-text">
              일정 ({activities.length})
            </h2>
            {!showActivityForm && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowActivityForm(true)}
                leftIcon={<IconPlus size={14} />}
              >
                추가
              </Button>
            )}
          </div>

          {showActivityForm && (
            <ActivityForm
              tripStartDate={trip.startDate}
              tripEndDate={trip.endDate}
              previousActivityName={
                activities.length > 0
                  ? activities[activities.length - 1].name
                  : null
              }
              onAdd={handleAddActivity}
              onCancel={() => setShowActivityForm(false)}
            />
          )}

          {activities.length === 0 && !showActivityForm && (
            <Card padding="lg" className="text-center text-text-subtle text-sm">
              아직 일정이 없습니다
            </Card>
          )}

          {activities.map((activity) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              onDelete={handleDeleteActivity}
            />
          ))}
        </section>

        {/* 전체 평점 */}
        <Card padding="md" className="mb-4">
          <h2 className="font-heading text-sm font-medium text-text mb-3">
            전체 평점
          </h2>
          <Rating value={rating} onChange={setRating} size="lg" />
        </Card>

        {/* 한줄 회고 */}
        <Card padding="md" className="mb-4">
          <h2 className="font-heading text-sm font-medium text-text mb-3">
            한줄 회고
          </h2>
          <Textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="이 여행은 어땠나요?"
            rows={4}
            className="resize-none"
          />
        </Card>

        {/* 저장 버튼 */}
        <Button
          variant="primary"
          onClick={handleSave}
          fullWidth
          size="lg"
          loading={saving}
        >
          평점 · 메모 저장하기
        </Button>
      </div>
    </div>
  );
}

function StatCell({ label, value, highlight }) {
  return (
    <div className="text-center flex-1">
      <div
        className={`text-lg font-medium ${
          highlight ? "text-accent" : "text-text"
        }`}
      >
        {value}
      </div>
      <div className="mt-0.5 text-[10px] text-text-muted tracking-wide">
        {label}
      </div>
    </div>
  );
}

export default TripDetailPage;
