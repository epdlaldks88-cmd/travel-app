/**
 * 통계 계산 유틸.
 * StatsPage에서 useMemo로 실시간 계산.
 */

/* ─── 카테고리 분류 ─── */

/**
 * 액티비티 → 지출 카테고리 매핑.
 * 부모/자식 무관, 자신의 type으로 분류.
 */
export function categorizeExpense(activity) {
  const t = activity.type;
  if (t === "숙소") return "숙소";
  if (t === "렌트카") return "이동";
  if (t === "식당" || t === "카페") return "식비";
  if (t === "관광지" || t === "관광") return "관광";
  if (t === "쇼핑") return "쇼핑";
  return "기타";
}

export const EXPENSE_CATEGORIES = [
  "숙소",
  "이동",
  "식비",
  "관광",
  "쇼핑",
  "기타",
];

export const EXPENSE_CATEGORY_COLORS = {
  숙소: "bg-blue-500/70",
  이동: "bg-purple-500/70",
  식비: "bg-orange-500/70",
  관광: "bg-green-500/70",
  쇼핑: "bg-pink-500/70",
  기타: "bg-gray-500/70",
};

/* ─── 전체 누적 통계 ─── */

/**
 * 전체 누적 통계.
 * @param {Array} trips - 여행 목록
 * @param {Array} activities - 모든 액티비티 (flat, 자식 포함)
 * @param {Array} accommodations - 모든 숙소
 */
export function calcOverallStats(trips, activities, accommodations) {
  const tripCount = trips.length;

  // 총 여행 일수
  let totalDays = 0;
  for (const trip of trips) {
    if (trip.startDate && trip.endDate) {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      const days = Math.round((end - start) / (24 * 60 * 60 * 1000)) + 1;
      totalDays += days;
    }
  }

  // 총 지출 (액티비티 + 숙소)
  let totalCost = 0;
  for (const a of activities) {
    totalCost += a.cost || 0;
  }
  for (const acc of accommodations) {
    totalCost += acc.totalCost || 0;
  }

  // 총 이동 거리 (부모 액티비티만, 자식은 이동 필드 없음)
  let totalDistance = 0;
  for (const a of activities) {
    if (!a.parentActivityId && a.distanceKm) {
      totalDistance += Number(a.distanceKm) || 0;
    }
  }

  return {
    tripCount,
    totalDays,
    totalCost,
    totalDistance: Math.round(totalDistance * 10) / 10,
  };
}

/* ─── 여행별 지출 요약 ─── */

/**
 * 여행별 지출 카테고리 요약.
 * @returns [{ trip, total, breakdown: { 숙소, 이동, 식비, ... } }]
 */
export function calcTripExpenses(trips, activities, accommodations) {
  const activitiesByTrip = new Map();
  for (const a of activities) {
    const arr = activitiesByTrip.get(a.tripId) ?? [];
    arr.push(a);
    activitiesByTrip.set(a.tripId, arr);
  }

  const accByTrip = new Map();
  for (const acc of accommodations) {
    const arr = accByTrip.get(acc.tripId) ?? [];
    arr.push(acc);
    accByTrip.set(acc.tripId, arr);
  }

  const result = [];
  for (const trip of trips) {
    const acts = activitiesByTrip.get(trip.id) ?? [];
    const accs = accByTrip.get(trip.id) ?? [];

    const breakdown = {
      숙소: 0,
      이동: 0,
      식비: 0,
      관광: 0,
      쇼핑: 0,
      기타: 0,
    };

    for (const a of acts) {
      const cat = categorizeExpense(a);
      breakdown[cat] += a.cost || 0;
    }

    // 숙박비는 trip_accommodations에서 별도로 추가
    for (const acc of accs) {
      breakdown["숙소"] += acc.totalCost || 0;
    }

    const total = Object.values(breakdown).reduce((s, v) => s + v, 0);

    result.push({
      trip,
      total,
      breakdown,
    });
  }

  // 최신 여행 (startDate 기준 내림차순)
  return result.sort((a, b) => {
    const sa = a.trip.startDate || "";
    const sb = b.trip.startDate || "";
    return sb.localeCompare(sa);
  });
}

/* ─── 음식 분류 통계 ─── */

/**
 * 식당/카페 액티비티에서 cuisines/foodTypes 집계.
 * @returns { cuisines: [{name, count}], foodTypes: [{name, count}] }
 */
export function calcFoodStats(activities) {
  const cuisineCount = new Map();
  const foodTypeCount = new Map();

  for (const a of activities) {
    if (a.type !== "식당" && a.type !== "카페") continue;

    for (const c of a.cuisines ?? []) {
      cuisineCount.set(c, (cuisineCount.get(c) ?? 0) + 1);
    }
    for (const f of a.foodTypes ?? []) {
      foodTypeCount.set(f, (foodTypeCount.get(f) ?? 0) + 1);
    }
  }

  const toSorted = (map) =>
    Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

  return {
    cuisines: toSorted(cuisineCount),
    foodTypes: toSorted(foodTypeCount),
  };
}

/* ─── 지역별 여행 횟수 ─── */

/**
 * regionMajor 기준 그룹핑.
 * @returns [{ region, count, totalCost, totalDays }]
 */
export function calcRegionStats(trips, activities, accommodations) {
  const activitiesByTrip = new Map();
  for (const a of activities) {
    const arr = activitiesByTrip.get(a.tripId) ?? [];
    arr.push(a);
    activitiesByTrip.set(a.tripId, arr);
  }
  const accByTrip = new Map();
  for (const acc of accommodations) {
    const arr = accByTrip.get(acc.tripId) ?? [];
    arr.push(acc);
    accByTrip.set(acc.tripId, arr);
  }

  const regionMap = new Map();
  for (const trip of trips) {
    const region = trip.regionMajor || "미지정";

    const acts = activitiesByTrip.get(trip.id) ?? [];
    const accs = accByTrip.get(trip.id) ?? [];
    const cost =
      acts.reduce((s, a) => s + (a.cost || 0), 0) +
      accs.reduce((s, acc) => s + (acc.totalCost || 0), 0);

    let days = 0;
    if (trip.startDate && trip.endDate) {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      days = Math.round((end - start) / (24 * 60 * 60 * 1000)) + 1;
    }

    const cur = regionMap.get(region) ?? {
      region,
      count: 0,
      totalCost: 0,
      totalDays: 0,
    };
    cur.count += 1;
    cur.totalCost += cost;
    cur.totalDays += days;
    regionMap.set(region, cur);
  }

  return Array.from(regionMap.values()).sort((a, b) => b.count - a.count);
}

/* ─── 연도 관련 ─── */

/**
 * 여행 데이터에서 존재하는 연도 목록 추출.
 * @returns [2024, 2025, 2026] (최신순)
 */
export function extractYears(trips) {
  const years = new Set();
  for (const trip of trips) {
    if (!trip.startDate) continue;
    const year = new Date(trip.startDate).getFullYear();
    if (!isNaN(year)) years.add(year);
  }
  return Array.from(years).sort((a, b) => b - a);
}

/**
 * 여행 목록을 특정 연도로 필터.
 * year=null이면 전체 반환.
 */
export function filterByYear(trips, year) {
  if (year == null) return trips;
  return trips.filter((trip) => {
    if (!trip.startDate) return false;
    return new Date(trip.startDate).getFullYear() === year;
  });
}

/**
 * 연도별 요약 계산.
 * "전체" 탭에서 연도 비교용.
 * @returns [{ year, tripCount, totalDays, totalCost, totalDistance }]
 */
export function calcYearlyStats(trips, activities, accommodations) {
  const activitiesByTrip = new Map();
  for (const a of activities) {
    const arr = activitiesByTrip.get(a.tripId) ?? [];
    arr.push(a);
    activitiesByTrip.set(a.tripId, arr);
  }
  const accByTrip = new Map();
  for (const acc of accommodations) {
    const arr = accByTrip.get(acc.tripId) ?? [];
    arr.push(acc);
    accByTrip.set(acc.tripId, arr);
  }

  const yearMap = new Map();

  for (const trip of trips) {
    if (!trip.startDate) continue;
    const year = new Date(trip.startDate).getFullYear();
    if (isNaN(year)) continue;

    const acts = activitiesByTrip.get(trip.id) ?? [];
    const accs = accByTrip.get(trip.id) ?? [];

    const cost =
      acts.reduce((s, a) => s + (a.cost || 0), 0) +
      accs.reduce((s, acc) => s + (acc.totalCost || 0), 0);

    let days = 0;
    if (trip.endDate) {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      days = Math.round((end - start) / (24 * 60 * 60 * 1000)) + 1;
    }

    let distance = 0;
    for (const a of acts) {
      if (!a.parentActivityId && a.distanceKm) {
        distance += Number(a.distanceKm) || 0;
      }
    }

    const cur = yearMap.get(year) ?? {
      year,
      tripCount: 0,
      totalDays: 0,
      totalCost: 0,
      totalDistance: 0,
    };
    cur.tripCount += 1;
    cur.totalDays += days;
    cur.totalCost += cost;
    cur.totalDistance += distance;
    yearMap.set(year, cur);
  }

  return Array.from(yearMap.values())
    .map((y) => ({
      ...y,
      totalDistance: Math.round(y.totalDistance * 10) / 10,
    }))
    .sort((a, b) => b.year - a.year);
}
