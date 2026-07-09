import { useMemo, useState } from "react";
import {
  IconMapPin,
  IconToolsKitchen2,
  IconCoffee,
  IconShoppingBag,
  IconBookmark,
  IconSearch,
  IconStar,
  IconX,
  IconChevronDown,
  IconChevronUp,
  IconMap,
  IconExternalLink,
} from "@tabler/icons-react";
import { Card, Chip, Input, Rating } from "../components/ui";
import { useFavoriteActivities } from "../data/hooks";

const CATEGORY_OPTIONS = [
  { value: "all", label: "전체", icon: IconStar },
  { value: "관광지/관광", label: "관광", icon: IconMapPin },
  { value: "식당", label: "식당", icon: IconToolsKitchen2 },
  { value: "카페", label: "카페", icon: IconCoffee },
  { value: "쇼핑", label: "쇼핑", icon: IconShoppingBag },
  { value: "기타", label: "기타", icon: IconBookmark },
];

const SORT_OPTIONS = [
  { value: "recent", label: "최신순" },
  { value: "rating", label: "평점순" },
  { value: "visits", label: "방문순" },
  { value: "name", label: "이름순" },
];

const CATEGORY_ICONS = {
  관광지: IconMapPin,
  관광: IconMapPin,
  식당: IconToolsKitchen2,
  카페: IconCoffee,
  쇼핑: IconShoppingBag,
  기타: IconBookmark,
};

function matchesCategory(activityType, filterValue) {
  if (filterValue === "all") return true;
  if (filterValue === "관광지/관광")
    return activityType === "관광지" || activityType === "관광";
  return activityType === filterValue;
}

/**
 * 즐겨찾기 목록을 이름 기준으로 그룹화.
 * 그룹의 대표는 최신 updatedAt 항목 (평점/위치 표시용).
 */
function groupByName(favorites) {
  const groups = new Map();
  for (const fav of favorites) {
    const key = (fav.name || "").trim();
    if (!key) continue;
    const arr = groups.get(key) ?? [];
    arr.push(fav);
    groups.set(key, arr);
  }

  const result = [];
  for (const [name, items] of groups) {
    const sorted = [...items].sort((a, b) =>
      (b.updatedAt || "").localeCompare(a.updatedAt || ""),
    );
    const rep = sorted[0]; // 대표 (최신)

    // 평점 평균 (0인 것은 제외)
    const rated = sorted.filter((it) => it.rating > 0);
    const avgRating =
      rated.length > 0
        ? rated.reduce((sum, it) => sum + it.rating, 0) / rated.length
        : 0;

    // 방문 이력용 정렬 (오래된 순)
    const visits = [...items].sort((a, b) =>
      (a.date || a.createdAt || "").localeCompare(b.date || b.createdAt || ""),
    );

    result.push({
      key: rep.id,
      name,
      type: rep.type,
      location: rep.location,
      gpsLat: rep.gpsLat,
      gpsLng: rep.gpsLng,
      avgRating,
      visitCount: items.length,
      visits, // 실제 액티비티 목록 (각각 trip 정보 포함)
      latestUpdated: rep.updatedAt,
      regions: Array.from(
        new Set(items.map((it) => it.trip?.regionMajor).filter(Boolean)),
      ),
    });
  }
  return result;
}

function FavoritesPage() {
  const favorites = useFavoriteActivities();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [region, setRegion] = useState("all");
  const [sort, setSort] = useState("recent");

  // 그룹핑
  const grouped = useMemo(() => groupByName(favorites), [favorites]);

  // 지역 목록 자동 추출
  const regions = useMemo(() => {
    const set = new Set();
    for (const g of grouped) {
      g.regions.forEach((r) => set.add(r));
    }
    return Array.from(set).sort();
  }, [grouped]);

  // 필터 · 정렬 적용
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return grouped
      .filter((g) => matchesCategory(g.type, category))
      .filter((g) => {
        if (region === "all") return true;
        return g.regions.includes(region);
      })
      .filter((g) => {
        if (!q) return true;
        return (
          g.name?.toLowerCase().includes(q) ||
          g.location?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sort === "recent") {
          return (b.latestUpdated || "").localeCompare(a.latestUpdated || "");
        }
        if (sort === "rating") {
          return b.avgRating - a.avgRating;
        }
        if (sort === "visits") {
          return b.visitCount - a.visitCount;
        }
        if (sort === "name") {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [grouped, search, category, region, sort]);

  return (
    <div>
      <header className="mb-6 pt-4">
        <h1 className="font-heading text-xl font-medium text-text tracking-tight">
          즐겨찾기
        </h1>
        <p className="text-xs text-text-muted mt-1 tracking-wide">
          다시 가고 싶은 곳
        </p>
      </header>

      {/* 검색 */}
      <div className="relative mb-3">
        <IconSearch
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none"
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="이름 또는 장소로 검색"
          className="pl-9 pr-8"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="검색어 지우기"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text"
          >
            <IconX size={14} />
          </button>
        )}
      </div>

      {/* 카테고리 */}
      <div className="mb-3">
        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <Chip
                key={opt.value}
                variant={category === opt.value ? "selected" : "default"}
                onClick={() => setCategory(opt.value)}
                icon={<Icon size={14} />}
              >
                {opt.label}
              </Chip>
            );
          })}
        </div>
      </div>

      {/* 지역 */}
      {regions.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] text-text-subtle mb-1 tracking-wide">
            지역
          </p>
          <div className="flex flex-wrap gap-2">
            <Chip
              variant={region === "all" ? "selected" : "default"}
              onClick={() => setRegion("all")}
            >
              전체
            </Chip>
            {regions.map((r) => (
              <Chip
                key={r}
                variant={region === r ? "selected" : "default"}
                onClick={() => setRegion(r)}
              >
                {r}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {/* 정렬 */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs text-text-muted">{filtered.length}개</span>
        <div className="flex gap-1 flex-wrap">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSort(opt.value)}
              className={`px-2 py-1 rounded-md text-[11px] transition-colors ${
                sort === opt.value
                  ? "bg-accent/10 text-accent"
                  : "text-text-muted hover:text-text hover:bg-surface-alt"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 리스트 */}
      {filtered.length === 0 ? (
        <Card padding="lg" className="text-center text-text-subtle text-sm">
          {favorites.length === 0
            ? "아직 즐겨찾기한 곳이 없습니다\n일정에서 별표를 눌러 추가해 보세요"
            : "조건에 맞는 곳이 없습니다"}
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((group) => (
            <FavoriteCard key={group.key} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   카드 (아코디언)
   ═══════════════════════════════════════════════════════════ */

function FavoriteCard({ group }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = CATEGORY_ICONS[group.type] || IconBookmark;

  return (
    <Card padding="none" className="overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-start gap-3 p-3 text-left hover:bg-surface-alt transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-surface-alt flex items-center justify-center text-text-muted shrink-0">
          <Icon size={20} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-text truncate">
              {group.name}
            </p>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-alt text-text-muted">
              {group.type}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent">
              방문 {group.visitCount}회
            </span>
          </div>

          {group.location && (
            <p className="text-xs text-text-muted mt-0.5 truncate">
              {group.location}
            </p>
          )}

          {group.avgRating > 0 && (
            <div className="mt-1">
              <Rating value={group.avgRating} readonly size="sm" />
            </div>
          )}
        </div>

        <div className="shrink-0 pt-1">
          {expanded ? (
            <IconChevronUp size={16} className="text-text-muted" />
          ) : (
            <IconChevronDown size={16} className="text-text-muted" />
          )}
        </div>
      </button>

      {expanded && <FavoriteDetails group={group} />}
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════
   아코디언 펼침 내용: 지도 링크 + 방문 이력
   ═══════════════════════════════════════════════════════════ */

function FavoriteDetails({ group }) {
  const hasMapTarget =
    (group.gpsLat != null && group.gpsLng != null) || !!group.location;

  const mapLinks = hasMapTarget ? buildMapLinks(group) : null;

  const formatDate = (str) => {
    if (!str) return "";
    return str.replaceAll("-", ".");
  };

  return (
    <div className="border-t border-border">
      {/* 지도 링크 */}
      {mapLinks && (
        <div className="p-3 border-b border-border">
          <p className="text-[10px] text-text-subtle mb-2 tracking-wide">
            지도 · 길찾기
          </p>
          <div className="flex gap-2 flex-wrap">
            <MapLinkButton href={mapLinks.kakao} label="카카오맵" />
            <MapLinkButton href={mapLinks.naver} label="네이버지도" />
            <MapLinkButton href={mapLinks.google} label="구글맵" />
          </div>
        </div>
      )}

      {/* 방문 이력 */}
      <div className="p-3">
        <p className="text-[10px] text-text-subtle mb-2 tracking-wide">
          방문 이력 ({group.visits.length}회)
        </p>
        <ul className="space-y-1.5">
          {group.visits.map((visit) => (
            <li key={visit.id} className="flex items-center gap-2 text-xs">
              <span className="text-text-muted tabular-nums shrink-0">
                {formatDate(visit.date)}
              </span>
              <span className="text-text truncate">
                {visit.trip?.title || "이름 없는 여행"}
              </span>
              {visit.rating > 0 && (
                <Rating value={visit.rating} readonly size="sm" />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MapLinkButton({ href, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs text-text bg-surface-alt hover:bg-surface border border-border transition-colors"
    >
      <IconMap size={12} />
      {label}
      <IconExternalLink size={10} className="text-text-subtle" />
    </a>
  );
}

/**
 * 카카오맵 / 네이버지도 / 구글맵 웹 URL 생성.
 * GPS 우선, 없으면 location(주소) 기반 검색.
 */
function buildMapLinks(group) {
  const { name, location, gpsLat, gpsLng } = group;
  const encodedName = encodeURIComponent(name);
  const encodedLocation = encodeURIComponent(location || "");
  const encodedQuery = encodeURIComponent(
    location ? `${name} ${location}` : name,
  );

  const hasGps = gpsLat != null && gpsLng != null;

  return {
    kakao: hasGps
      ? `https://map.kakao.com/link/map/${encodedName},${gpsLat},${gpsLng}`
      : `https://map.kakao.com/link/search/${encodedQuery}`,
    naver: hasGps
      ? `https://map.naver.com/v5/search/${encodedQuery}?c=${gpsLng},${gpsLat},15,0,0,0,dh`
      : `https://map.naver.com/v5/search/${encodedQuery}`,
    google: hasGps
      ? `https://www.google.com/maps/search/?api=1&query=${gpsLat},${gpsLng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`,
  };
}

export default FavoritesPage;
