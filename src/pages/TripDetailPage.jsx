import { useEffect, useState, useMemo } from "react";
import {
  useParams,
  useNavigate,
  Link,
  useSearchParams,
} from "react-router-dom";
import {
  IconArrowLeft,
  IconCameraPlus,
  IconPlus,
  IconLoader2,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";
import ActivityForm from "../components/ActivityForm";
import ActivityItem from "../components/ActivityItem";
import AccommodationForm from "../components/AccommodationForm";
import AccommodationItem from "../components/AccommodationItem";
import DayNoteCard from "../components/DayNoteCard";
import { Button, Card, Rating, Textarea } from "../components/ui";
import {
  useTrip,
  useActivities,
  useAccommodations,
  useDayNotes,
  useUpdateTrip,
  useCreateActivity,
  useUpdateActivity,
  useDeleteActivity,
  useCreateSubActivity,
  useCreateAccommodation,
  useUpdateAccommodation,
  useDeleteAccommodation,
  useUpsertDayNote,
} from "../data/hooks";
import { calcTripTotal } from "../data/calc";
import { useToast } from "../components/Toast";
import { IconSparkles } from "@tabler/icons-react";
import PromptGeneratorModal from "../components/PromptGeneratorModal";

function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const trip = useTrip(id);
  const activities = useActivities(id);
  const accommodations = useAccommodations(id);
  const dayNotes = useDayNotes(id);

  const updateTrip = useUpdateTrip();
  const createActivity = useCreateActivity();
  const updateActivity = useUpdateActivity();
  const deleteActivity = useDeleteActivity();
  const createSubActivity = useCreateSubActivity();

  const createAccommodation = useCreateAccommodation();
  const updateAccommodation = useUpdateAccommodation();
  const deleteAccommodation = useDeleteAccommodation();

  const upsertDayNote = useUpsertDayNote();

  const [memo, setMemo] = useState("");
  const [rating, setRating] = useState(0);
  const [saving, setSaving] = useState(false);

  // 편집 · 자식 추가 상태 (액티비티)
  const [editingId, setEditingId] = useState(null);
  const [subFormParentId, setSubFormParentId] = useState(null);

  // 편집 상태 (숙소)
  const [editingAccId, setEditingAccId] = useState(null);
  const [showAccForm, setShowAccForm] = useState(false);

  // 정렬 상태
  const [sortOrder, setSortOrder] = useState("asc");

  // ⭐ URL 쿼리로 폼 표시 제어 (FAB, 헤더 "추가" 버튼 공통)
  const [searchParams, setSearchParams] = useSearchParams();
  const showActivityForm = searchParams.get("new") === "1";

  const [showPromptModal, setShowPromptModal] = useState(false);

  const toast = useToast();

  useEffect(() => {
    if (trip) {
      setMemo(trip.memo || "");
      setRating(trip.rating || 0);
    }
  }, [trip?.id]);

  // ⭐ 새 액티비티 폼 열릴 때 상단 스크롤
  useEffect(() => {
    if (showActivityForm) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [showActivityForm]);

  const sortedActivities = useMemo(() => {
    if (sortOrder === "asc") return activities;
    return [...activities].reverse();
  }, [activities, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // 여행 일수 리스트 (startDate ~ endDate)
  const tripDays = useMemo(() => {
    if (!trip?.startDate || !trip?.endDate) return [];
    const days = [];
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const oneDay = 24 * 60 * 60 * 1000;
    for (let d = start; d <= end; d = new Date(d.getTime() + oneDay)) {
      days.push(d.toISOString().slice(0, 10));
    }
    return days;
  }, [trip?.startDate, trip?.endDate]);

  // 날짜별 노트 매핑
  const noteByDate = useMemo(() => {
    const map = new Map();
    for (const note of dayNotes || []) {
      map.set(note.date, note);
    }
    return map;
  }, [dayNotes]);

  /* ─── 액티비티 핸들러 ─────────────────────────── */

  const handleSubmitForm = async (payload, editingActivity) => {
    try {
      if (editingActivity) {
        await updateActivity(editingActivity.id, payload);
        setEditingId(null);
        toast.success("일정이 저장되었습니다");
      } else if (subFormParentId) {
        await createSubActivity(subFormParentId, payload);
        setSubFormParentId(null);
        toast.success("세부 일정이 추가되었습니다");
      } else {
        await createActivity(id, payload);
        setSearchParams({});
        toast.success("일정이 추가되었습니다");
      }
    } catch (err) {
      console.error(err);
      toast.error("저장 실패: " + (err.message || "알 수 없는 오류"));
    }
  };

  const handleStartEdit = (activity) => {
    setSubFormParentId(null);
    setSearchParams({});
    setEditingId(activity.id);
  };

  const handleStartAddSub = (parentId) => {
    setEditingId(null);
    setSearchParams({});
    setSubFormParentId(parentId);
  };

  const handleCancelForm = () => {
    setEditingId(null);
    setSubFormParentId(null);
  };

  const handleStartAddActivity = () => {
    setEditingId(null);
    setSubFormParentId(null);
    setSearchParams({ new: "1" });
  };

  const handleCancelAddActivity = () => {
    setSearchParams({});
  };

  const handleDeleteActivity = async (activityId) => {
    if (!confirm("이 일정을 삭제하시겠습니까?")) return;
    try {
      await deleteActivity(activityId);
      if (editingId === activityId) setEditingId(null);
      if (subFormParentId === activityId) setSubFormParentId(null);
      toast.success("일정이 삭제되었습니다");
    } catch (err) {
      toast.error("삭제 실패: " + err.message);
    }
  };

  /* ─── 숙소 핸들러 ─────────────────────────── */

  const handleStartAddAccommodation = () => {
    setEditingAccId(null);
    setShowAccForm(true);
  };

  const handleCancelAccommodationForm = () => {
    setShowAccForm(false);
    setEditingAccId(null);
  };

  const handleStartEditAccommodation = (acc) => {
    setShowAccForm(false);
    setEditingAccId(acc.id);
  };

  const handleSubmitAccommodationForm = async (payload, editingAcc) => {
    try {
      if (editingAcc) {
        await updateAccommodation(editingAcc.id, payload);
        setEditingAccId(null);
        toast.success("숙소가 저장되었습니다");
      } else {
        await createAccommodation(id, payload);
        setShowAccForm(false);
        toast.success("숙소가 추가되었습니다");
      }
    } catch (err) {
      toast.error("저장 실패: " + err.message);
    }
  };

  const handleDeleteAccommodation = async (accId) => {
    if (!confirm("이 숙소를 삭제하시겠습니까?")) return;
    try {
      await deleteAccommodation(accId);
      if (editingAccId === accId) setEditingAccId(null);
      toast.success("숙소가 삭제되었습니다");
    } catch (err) {
      toast.error("삭제 실패: " + err.message);
    }
  };

  /* ─── DayNote 핸들러 ─────────────────────────── */

  const handleSaveDayNote = async (date, patch) => {
    try {
      await upsertDayNote(id, date, patch);
      toast.success("노트가 저장되었습니다");
    } catch (err) {
      toast.error("저장 실패: " + err.message);
    }
  };

  /* ─── Trip 저장 ─────────────────────────── */

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateTrip(id, { memo, rating });
      toast.success("저장되었습니다");
    } catch (err) {
      toast.error("저장 실패: " + err.message);
    } finally {
      setSaving(false);
    }
  };

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

  const totalCost = calcTripTotal(activities);
  const accommodationsList = accommodations || [];

  const formatFull = (dateStr) => {
    if (!dateStr) return "";
    return dateStr.replaceAll("-", ".");
  };

  const filledNoteCount = tripDays.filter((d) => noteByDate.has(d)).length;

  return (
    <div className="-mt-4 -mx-4">
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
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowPromptModal(true)}
              aria-label="AI 커버 프롬프트"
              title="AI 커버 이미지 프롬프트 생성"
              className="p-1.5 rounded-full bg-black/15 text-white hover:bg-black/25 transition-colors"
            >
              <IconSparkles size={18} />
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

      <div className="p-4">
        {/* ═══════════════ 숙소 섹션 ═══════════════ */}
        <section className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-heading text-sm font-medium text-text">
              숙소 ({accommodationsList.length})
            </h2>
            {!showAccForm && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleStartAddAccommodation}
                leftIcon={<IconPlus size={14} />}
              >
                추가
              </Button>
            )}
          </div>

          {showAccForm && (
            <AccommodationForm
              tripStartDate={trip.startDate}
              tripEndDate={trip.endDate}
              onSubmit={(payload) =>
                handleSubmitAccommodationForm(payload, null)
              }
              onCancel={handleCancelAccommodationForm}
            />
          )}

          {accommodationsList.length === 0 && !showAccForm && (
            <Card padding="lg" className="text-center text-text-subtle text-sm">
              등록된 숙소가 없습니다
            </Card>
          )}

          {accommodationsList.map((acc) => (
            <AccommodationItem
              key={acc.id}
              accommodation={acc}
              editingId={editingAccId}
              tripStartDate={trip.startDate}
              tripEndDate={trip.endDate}
              onStartEdit={handleStartEditAccommodation}
              onSubmitForm={handleSubmitAccommodationForm}
              onCancelForm={handleCancelAccommodationForm}
              onDelete={handleDeleteAccommodation}
            />
          ))}
        </section>

        {/* ═══════════════ 일정 섹션 ═══════════════ */}
        <section className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-heading text-sm font-medium text-text">
              일정 ({activities.length})
            </h2>
            <div className="flex items-center gap-2">
              {activities.length > 1 && (
                <button
                  type="button"
                  onClick={toggleSortOrder}
                  aria-label={
                    sortOrder === "asc" ? "내림차순 정렬" : "오름차순 정렬"
                  }
                  title={
                    sortOrder === "asc"
                      ? "시간순 (오래된 것 위)"
                      : "역순 (최신 위)"
                  }
                  className="p-1.5 rounded-full text-text-muted hover:text-text hover:bg-surface-alt transition-colors"
                >
                  {sortOrder === "asc" ? (
                    <IconSortAscending size={16} />
                  ) : (
                    <IconSortDescending size={16} />
                  )}
                </button>
              )}
              {!showActivityForm && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleStartAddActivity}
                  leftIcon={<IconPlus size={14} />}
                >
                  추가
                </Button>
              )}
            </div>
          </div>

          {showActivityForm && (
            <ActivityForm
              tripId={id}
              tripStartDate={trip.startDate}
              tripEndDate={trip.endDate}
              previousActivity={
                activities.length > 0 ? activities[activities.length - 1] : null
              }
              previousActivityName={
                activities.length > 0
                  ? activities[activities.length - 1].name
                  : null
              }
              onSubmit={(payload) => handleSubmitForm(payload, null)}
              onCancel={handleCancelAddActivity}
            />
          )}

          {activities.length === 0 && !showActivityForm && (
            <Card padding="lg" className="text-center text-text-subtle text-sm">
              아직 일정이 없습니다
            </Card>
          )}

          {sortedActivities.map((activity) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              editingId={editingId}
              subFormParentId={subFormParentId}
              onStartEdit={handleStartEdit}
              onDelete={handleDeleteActivity}
              onStartAddSub={handleStartAddSub}
              onSubmitForm={handleSubmitForm}
              onCancelForm={handleCancelForm}
              tripId={id}
              tripStartDate={trip.startDate}
              tripEndDate={trip.endDate}
              previousActivityName={null}
            />
          ))}
        </section>

        {/* ═══════════════ 일별 노트 섹션 (v2 신규) ═══════════════ */}
        {tripDays.length > 0 && (
          <section className="mb-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-heading text-sm font-medium text-text">
                일별 노트 ({filledNoteCount}/{tripDays.length})
              </h2>
            </div>

            {tripDays.map((date, idx) => (
              <DayNoteCard
                key={date}
                date={date}
                dayLabel={`${idx + 1}일차`}
                note={noteByDate.get(date)}
                onSave={(patch) => handleSaveDayNote(date, patch)}
              />
            ))}
          </section>
        )}

        <Card padding="md" className="mb-4">
          <h2 className="font-heading text-sm font-medium text-text mb-3">
            전체 평점
          </h2>
          <Rating value={rating} onChange={setRating} size="lg" />
        </Card>

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

      {showPromptModal && (
        <PromptGeneratorModal
          trip={trip}
          activities={activities}
          onClose={() => setShowPromptModal(false)}
        />
      )}
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
