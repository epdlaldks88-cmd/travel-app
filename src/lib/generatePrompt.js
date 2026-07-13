/**
 * 여행 데이터 → Gemini/ChatGPT용 한국어 인포그래픽 프롬프트.
 *
 * 사용법:
 *   const prompt = buildPrompt({ trip, activities, profile });
 */

/* ─── 헬퍼 ─── */

function formatDate(str) {
  if (!str) return "";
  return str.replaceAll("-", ".");
}

function formatDateRange(start, end) {
  if (!start) return "";
  const s = formatDate(start);
  if (!end || end === start) return s;
  return `${s} ~ ${formatDate(end).slice(5)}`;
}

function calcNights(start, end) {
  if (!start || !end) return 0;
  const d1 = new Date(start);
  const d2 = new Date(end);
  const days = Math.round((d2 - d1) / (24 * 60 * 60 * 1000));
  return days;
}

function formatDuration(h, m) {
  const hh = Number(h) || 0;
  const mm = Number(m) || 0;
  if (hh === 0 && mm === 0) return "";
  if (hh > 0 && mm > 0) return `${hh}시간 ${mm}분`;
  if (hh > 0) return `${hh}시간`;
  return `${mm}분`;
}

/**
 * 날짜별 그룹핑. 각 그룹에 부모+자식 함께 시간순 정렬.
 */
function groupByDate(activities) {
  const byParentId = new Map();
  const parents = [];

  for (const a of activities) {
    if (a.parentActivityId) {
      const arr = byParentId.get(a.parentActivityId) ?? [];
      arr.push(a);
      byParentId.set(a.parentActivityId, arr);
    } else {
      parents.push(a);
    }
  }

  // 날짜 그룹
  const groups = new Map();
  for (const parent of parents) {
    const date = parent.date || "미지정";
    const arr = groups.get(date) ?? [];
    const children = (byParentId.get(parent.id) ?? []).sort((a, b) =>
      (a.time || "").localeCompare(b.time || ""),
    );
    arr.push({ parent, children });
    groups.set(date, arr);
  }

  // 각 날짜 내 부모 시간순 정렬
  for (const [date, list] of groups) {
    list.sort((a, b) =>
      (a.parent.time || "").localeCompare(b.parent.time || ""),
    );
  }

  // 날짜 자체도 정렬
  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
}

/* ─── 활동 문장 조립 ─── */

/**
 * 부모 액티비티 한 줄 문장.
 * 이동 정보 있으면 "출발지 → 목적지 (거리, 시간)" 포함.
 */
function formatParentLine(activity) {
  const parts = [];

  if (activity.time) parts.push(`${activity.time}:`);

  // 이동 정보
  const hasMove =
    activity.origin ||
    activity.transport ||
    activity.distanceKm ||
    activity.durationHours ||
    activity.durationMinutes;

  if (hasMove && activity.origin) {
    parts.push(`${activity.origin} →`);
  }

  // 카테고리 + 이름
  const typeLabel = activity.type;
  parts.push(`${activity.name}${typeLabel ? ` (${typeLabel})` : ""}`);

  // 이동 상세
  const moveDetails = [];
  if (activity.distanceKm) moveDetails.push(`${activity.distanceKm}km`);
  const dur = formatDuration(activity.durationHours, activity.durationMinutes);
  if (dur) moveDetails.push(dur);
  if (activity.transport) moveDetails.push(activity.transport);
  if (moveDetails.length > 0) {
    parts.push(`(${moveDetails.join(", ")})`);
  }

  // 식당 상세
  if (activity.type === "식당") {
    const foodParts = [];
    if (activity.mealType) foodParts.push(activity.mealType);
    if (activity.foodDetails) foodParts.push(activity.foodDetails);
    else if (activity.cuisines?.length)
      foodParts.push(activity.cuisines.join("/"));
    if (foodParts.length > 0) {
      parts.push(`- ${foodParts.join(" · ")}`);
    }
  }

  // 렌트카 차종
  if (activity.type === "렌트카" && activity.carModel) {
    parts.push(`- ${activity.carModel}`);
  }

  // 숙소 박수
  if (activity.type === "숙소" && activity.nights) {
    parts.push(`- ${activity.nights}박`);
  }

  // 메모
  if (activity.memo) {
    parts.push(`- ${activity.memo}`);
  }

  return parts.join(" ");
}

/**
 * 자식 액티비티 한 줄 문장.
 */
function formatChildLine(child) {
  const parts = [];
  if (child.time) parts.push(`${child.time}:`);
  parts.push(child.name);

  if (child.type === "식당") {
    const foodParts = [];
    if (child.mealType) foodParts.push(child.mealType);
    if (child.foodDetails) foodParts.push(child.foodDetails);
    else if (child.cuisines?.length) foodParts.push(child.cuisines.join("/"));
    if (foodParts.length > 0) {
      parts.push(`(${foodParts.join(" · ")})`);
    }
  } else if (child.type) {
    parts.push(`(${child.type})`);
  }

  if (child.memo) parts.push(`- ${child.memo}`);

  return parts.join(" ");
}

/* ─── 메인 조립 ─── */

/**
 * @param {object} params
 * @param {object} params.trip - 여행
 * @param {Array} params.activities - 부모+자식 모든 액티비티 flat
 * @param {object} params.profile - 프로필 (우리집 정보용)
 */
export function buildPrompt({ trip, activities, profile }) {
  const lines = [];

  // ─── 도입 ───
  lines.push(
    `여행 타임라인에 따른 이동경로와 여행에 대한 정보들을 담은 한 장 요약 인포그래픽을 만들어줘.`,
  );
  lines.push("");

  // ─── 우리집 컨텍스트 ───
  if (profile?.homeAddress) {
    lines.push(`집은 ${profile.homeAddress}야.`);
    lines.push("");
  }

  // ─── 여행 정보 ───
  const nights = calcNights(trip.startDate, trip.endDate);
  const nightLabel = nights > 0 ? `${nights}박 ${nights + 1}일` : "";

  const region =
    [trip.regionMajor, trip.regionMinor].filter(Boolean).join(" ") || "";

  const titleLine = `[제목] ${trip.title}`;
  lines.push(titleLine);

  const infoParts = [];
  if (trip.startDate)
    infoParts.push(formatDateRange(trip.startDate, trip.endDate));
  if (region) infoParts.push(region);
  if (nightLabel) infoParts.push(nightLabel);
  if (infoParts.length > 0) {
    lines.push(`[기간/지역] ${infoParts.join(" · ")}`);
  }

  if (trip.companions) {
    lines.push(`[구성원] ${trip.companions}`);
  }

  lines.push("");

  // ─── 일자별 타임라인 ───
  const grouped = groupByDate(activities);

  for (const [date, items] of grouped) {
    if (date === "미지정") continue;

    const startDate = trip.startDate ? new Date(trip.startDate) : null;
    const currentDate = new Date(date);
    const dayIndex =
      startDate && !isNaN(currentDate)
        ? Math.round((currentDate - startDate) / (24 * 60 * 60 * 1000)) + 1
        : null;

    const dayHeader = dayIndex
      ? `[${dayIndex}일차 - ${formatDate(date)}]`
      : `[${formatDate(date)}]`;
    lines.push(dayHeader);

    for (const { parent, children } of items) {
      lines.push(`- ${formatParentLine(parent)}`);
      for (const child of children) {
        lines.push(`  · ${formatChildLine(child)}`);
      }
    }

    lines.push("");
  }

  // ─── 마무리 지시 ───
  lines.push("위 정보를 바탕으로 가로형 한 장 인포그래픽으로 만들어줘.");
  lines.push(
    "한국 지도에 이동 경로와 여행지 핀을 표시하고, 날짜별로 타임라인을 그리고, 각 활동에 어울리는 아이콘(식사, 관광, 이동수단, 숙소 등)을 넣어줘.",
  );
  lines.push(
    "한국어 텍스트가 정확히 표기되도록 하고, 여행 감성이 느껴지는 부드러운 스타일로 만들어줘.",
  );

  return lines.join("\n");
}
