import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  IconRoute,
  IconCurrencyWon,
  IconCalendar,
  IconWorld,
} from "@tabler/icons-react";
import { Card } from "../components/ui";
import { db } from "../data/db";
import { useAuth } from "../lib/useAuth";
import {
  calcOverallStats,
  calcTripExpenses,
  calcFoodStats,
  calcRegionStats,
  calcYearlyStats,
  extractYears,
  filterByYear,
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_COLORS,
} from "../data/stats";

function StatsPage() {
  const { user } = useAuth();

  // ⭐ 연도 필터 상태 (null = 전체)
  const [selectedYear, setSelectedYear] = useState(null);

  const trips = useLiveQuery(
    async () => {
      if (!user) return [];
      return db.trips.where("ownerId").equals(user.id).toArray();
    },
    [user?.id],
    [],
  );

  const activities = useLiveQuery(
    async () => {
      if (!user) return [];
      const t = await db.trips.where("ownerId").equals(user.id).toArray();
      const tripIds = t.map((tr) => tr.id);
      if (tripIds.length === 0) return [];
      return db.activities.where("tripId").anyOf(tripIds).toArray();
    },
    [user?.id],
    [],
  );

  const accommodations = useLiveQuery(
    async () => {
      if (!user) return [];
      const t = await db.trips.where("ownerId").equals(user.id).toArray();
      const tripIds = t.map((tr) => tr.id);
      if (tripIds.length === 0) return [];
      return db.accommodations.where("tripId").anyOf(tripIds).toArray();
    },
    [user?.id],
    [],
  );

  // 연도 목록
  const years = useMemo(() => extractYears(trips), [trips]);

  // 연도 필터 적용 (전체 데이터 유지, 필터된 것만 별도)
  const filteredTrips = useMemo(
    () => filterByYear(trips, selectedYear),
    [trips, selectedYear],
  );

  // filteredTrips에 속한 activity/accommodation만
  const filteredTripIds = useMemo(
    () => new Set(filteredTrips.map((t) => t.id)),
    [filteredTrips],
  );

  const filteredActivities = useMemo(
    () => activities.filter((a) => filteredTripIds.has(a.tripId)),
    [activities, filteredTripIds],
  );

  const filteredAccommodations = useMemo(
    () => accommodations.filter((acc) => filteredTripIds.has(acc.tripId)),
    [accommodations, filteredTripIds],
  );

  // 통계 계산 (필터된 데이터로)
  const overall = useMemo(
    () =>
      calcOverallStats(
        filteredTrips,
        filteredActivities,
        filteredAccommodations,
      ),
    [filteredTrips, filteredActivities, filteredAccommodations],
  );

  const tripExpenses = useMemo(
    () =>
      calcTripExpenses(
        filteredTrips,
        filteredActivities,
        filteredAccommodations,
      ),
    [filteredTrips, filteredActivities, filteredAccommodations],
  );

  const foodStats = useMemo(
    () => calcFoodStats(filteredActivities),
    [filteredActivities],
  );

  const regionStats = useMemo(
    () =>
      calcRegionStats(
        filteredTrips,
        filteredActivities,
        filteredAccommodations,
      ),
    [filteredTrips, filteredActivities, filteredAccommodations],
  );

  // 연도별 요약 (전체 데이터 기준, "전체" 탭에서만 표시)
  const yearlyStats = useMemo(
    () => calcYearlyStats(trips, activities, accommodations),
    [trips, activities, accommodations],
  );

  const isEmpty = trips.length === 0;
  const isYearlyView = selectedYear === null;

  const headerSubtitle = isYearlyView
    ? "여행 축적 기록"
    : `${selectedYear}년 여행 기록`;

  return (
    <div>
      <header className="mb-6 pt-4">
        <h1 className="font-heading text-xl font-medium text-text tracking-tight">
          통계
        </h1>
        <p className="text-xs text-text-muted mt-1 tracking-wide">
          {headerSubtitle}
        </p>
      </header>

      {isEmpty ? (
        <Card padding="lg" className="text-center text-text-subtle text-sm">
          아직 여행 데이터가 없습니다
        </Card>
      ) : (
        <>
          {/* 연도 탭 */}
          {years.length > 0 && (
            <YearTabs
              years={years}
              selected={selectedYear}
              onSelect={setSelectedYear}
            />
          )}

          {/* 전체 요약 4카드 */}
          <OverallSummary overall={overall} />

          {/* 연도별 요약 (전체 탭에서만) */}
          {isYearlyView && yearlyStats.length > 1 && (
            <Section title="연도별">
              <div className="space-y-2">
                {yearlyStats.map((y) => (
                  <YearlyRow
                    key={y.year}
                    data={y}
                    onClick={() => setSelectedYear(y.year)}
                  />
                ))}
              </div>
            </Section>
          )}

          {/* 여행별 지출 */}
          {tripExpenses.length > 0 && (
            <Section title="여행별 지출">
              <div className="space-y-2">
                {tripExpenses.map(({ trip, total, breakdown }) => (
                  <TripExpenseCard
                    key={trip.id}
                    trip={trip}
                    total={total}
                    breakdown={breakdown}
                  />
                ))}
              </div>
            </Section>
          )}

          {/* 음식 분류 */}
          {(foodStats.cuisines.length > 0 ||
            foodStats.foodTypes.length > 0) && (
            <Section title="음식">
              {foodStats.cuisines.length > 0 && (
                <BarStats
                  label="음식 분류"
                  items={foodStats.cuisines}
                  unit="회"
                />
              )}
              {foodStats.foodTypes.length > 0 && (
                <BarStats
                  label="음식 종류"
                  items={foodStats.foodTypes}
                  unit="회"
                />
              )}
            </Section>
          )}

          {/* 지역별 */}
          {regionStats.length > 0 && (
            <Section title="지역">
              <div className="space-y-1.5">
                {regionStats.map((r) => (
                  <RegionRow key={r.region} data={r} />
                ))}
              </div>
            </Section>
          )}

          {/* 필터 결과 비어있을 때 */}
          {!isYearlyView && filteredTrips.length === 0 && (
            <Card padding="lg" className="text-center text-text-subtle text-sm">
              {selectedYear}년 여행 기록이 없습니다
            </Card>
          )}
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   연도 탭
   ═══════════════════════════════════════════════════════════ */

function YearTabs({ years, selected, onSelect }) {
  return (
    <div className="mb-4 overflow-x-auto -mx-4 px-4">
      <div className="flex gap-2 pb-1">
        <YearTab
          label="전체"
          active={selected === null}
          onClick={() => onSelect(null)}
        />
        {years.map((y) => (
          <YearTab
            key={y}
            label={`${y}`}
            active={selected === y}
            onClick={() => onSelect(y)}
          />
        ))}
      </div>
    </div>
  );
}

function YearTab({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        active
          ? "bg-accent text-white"
          : "bg-surface-alt text-text-muted hover:text-text"
      }`}
    >
      {label}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════
   전체 요약 (4개 카드)
   ═══════════════════════════════════════════════════════════ */

function OverallSummary({ overall }) {
  return (
    <div className="grid grid-cols-2 gap-2 mb-6">
      <SummaryCard
        icon={IconWorld}
        label="여행"
        value={`${overall.tripCount}회`}
      />
      <SummaryCard
        icon={IconCalendar}
        label="총 일수"
        value={`${overall.totalDays}일`}
      />
      <SummaryCard
        icon={IconCurrencyWon}
        label="총 지출"
        value={
          overall.totalCost > 0
            ? `${(overall.totalCost / 10000).toFixed(0)}만원`
            : "0원"
        }
      />
      <SummaryCard
        icon={IconRoute}
        label="총 이동"
        value={`${overall.totalDistance}km`}
      />
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <Card padding="md">
      <div className="flex items-center gap-2 mb-1 text-text-muted">
        <Icon size={14} />
        <span className="text-[10px] tracking-wide">{label}</span>
      </div>
      <p className="text-lg font-medium text-text">{value}</p>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════
   Section 헬퍼
   ═══════════════════════════════════════════════════════════ */

function Section({ title, children }) {
  return (
    <section className="mb-6">
      <h2 className="font-heading text-sm font-medium text-text mb-3">
        {title}
      </h2>
      {children}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   연도별 요약 행 (전체 탭에서만)
   ═══════════════════════════════════════════════════════════ */

function YearlyRow({ data, onClick }) {
  return (
    <Card padding="md">
      <button type="button" onClick={onClick} className="w-full text-left">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-text">{data.year}년</p>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent">
            {data.tripCount}회
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-text-muted">
          <span>{data.totalDays}일</span>
          <span>·</span>
          <span className="tabular-nums">
            {data.totalCost > 0
              ? `${(data.totalCost / 10000).toFixed(0)}만원`
              : "0원"}
          </span>
          {data.totalDistance > 0 && (
            <>
              <span>·</span>
              <span className="tabular-nums">{data.totalDistance}km</span>
            </>
          )}
        </div>
      </button>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════
   여행별 지출 카드
   ═══════════════════════════════════════════════════════════ */

function TripExpenseCard({ trip, total, breakdown }) {
  const formatDate = (str) => (str ? str.replaceAll("-", ".").slice(5) : "");
  const dateRange =
    trip.startDate && trip.endDate
      ? `${formatDate(trip.startDate)} – ${formatDate(trip.endDate)}`
      : formatDate(trip.startDate);

  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text truncate">{trip.title}</p>
          {dateRange && (
            <p className="text-[10px] text-text-muted mt-0.5">{dateRange}</p>
          )}
        </div>
        <p className="text-sm font-medium text-text tabular-nums shrink-0 ml-2">
          {total > 0 ? `${total.toLocaleString()}원` : "0원"}
        </p>
      </div>

      {total > 0 && (
        <>
          <div className="flex h-2 rounded-full overflow-hidden bg-surface-alt mb-2">
            {EXPENSE_CATEGORIES.map((cat) => {
              const amount = breakdown[cat] || 0;
              if (amount === 0) return null;
              const pct = (amount / total) * 100;
              return (
                <div
                  key={cat}
                  className={EXPENSE_CATEGORY_COLORS[cat]}
                  style={{ width: `${pct}%` }}
                  title={`${cat} ${amount.toLocaleString()}원`}
                />
              );
            })}
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {EXPENSE_CATEGORIES.map((cat) => {
              const amount = breakdown[cat] || 0;
              if (amount === 0) return null;
              return (
                <div
                  key={cat}
                  className="flex items-center gap-1.5 text-[10px] text-text-muted"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${EXPENSE_CATEGORY_COLORS[cat]}`}
                  />
                  <span>{cat}</span>
                  <span className="tabular-nums">
                    {amount.toLocaleString()}원
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════
   막대 통계 (음식 분류/종류)
   ═══════════════════════════════════════════════════════════ */

function BarStats({ label, items, unit = "" }) {
  const max = Math.max(...items.map((i) => i.count));
  return (
    <div className="mb-4 last:mb-0">
      <p className="text-[10px] text-text-subtle mb-2 tracking-wide">{label}</p>
      <Card padding="md">
        <div className="space-y-1.5">
          {items.slice(0, 8).map((item) => {
            const pct = (item.count / max) * 100;
            return (
              <div key={item.name} className="flex items-center gap-2">
                <span className="text-xs text-text w-16 shrink-0 truncate">
                  {item.name}
                </span>
                <div className="flex-1 h-2 rounded-full bg-surface-alt overflow-hidden">
                  <div
                    className="h-full bg-accent/70 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] text-text-muted tabular-nums w-10 text-right shrink-0">
                  {item.count}
                  {unit}
                </span>
              </div>
            );
          })}
          {items.length > 8 && (
            <p className="text-[10px] text-text-subtle text-center pt-1">
              +{items.length - 8}개 더
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   지역 행
   ═══════════════════════════════════════════════════════════ */

function RegionRow({ data }) {
  return (
    <Card padding="md">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-text">{data.region}</p>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent">
              {data.count}회
            </span>
          </div>
          <p className="text-[10px] text-text-muted mt-0.5">
            {data.totalDays}일 · {data.totalCost.toLocaleString()}원
          </p>
        </div>
      </div>
    </Card>
  );
}

export default StatsPage;
