import {
  IconCar,
  IconMapPin,
  IconToolsKitchen2,
  IconBuilding,
  IconBookmark,
  IconX,
  IconSteeringWheel,
  IconTrain,
  IconPlane,
  IconBus,
  IconWalk,
  IconRoute,
  IconCoin,
  IconArrowNarrowRight,
  IconPencil,
  IconPlus,
  IconCoffee,
  IconShoppingBag,
  IconPhoto,
  IconStar,
  IconStarFilled,
} from "@tabler/icons-react";
import { useState } from "react";
import { Rating } from "./ui";
import ActivityForm from "./ActivityForm";
import PhotoGallery from "./PhotoGallery";
import { calcActivityTotal, hasChildrenCost } from "../data/calc";
import {
  useActivityPhotos,
  usePhotoUrls,
  useUpdateActivity,
} from "../data/hooks";

const TYPE_ICONS = {
  관광지: IconMapPin,
  식당: IconToolsKitchen2,
  숙소: IconBuilding,
  렌트카: IconSteeringWheel,
  기타: IconBookmark,
};

const SUB_TYPE_ICONS = {
  관광: IconMapPin,
  식당: IconToolsKitchen2,
  카페: IconCoffee,
  쇼핑: IconShoppingBag,
  기타: IconBookmark,
};

const TRANSPORT_ICONS = {
  도보: IconWalk,
  자차: IconCar,
  택시: IconCar,
  버스: IconBus,
  지하철: IconTrain,
  기차: IconTrain,
  비행기: IconPlane,
  렌트카: IconSteeringWheel,
  기타: IconRoute,
};

// 즐겨찾기 가능한 카테고리
const FAVORABLE_TYPES = new Set([
  "관광지",
  "식당",
  "관광",
  "카페",
  "쇼핑",
  "기타",
]);

function formatDuration(hours, minutes) {
  const h = Number(hours) || 0;
  const m = Number(minutes) || 0;
  if (h === 0 && m === 0) return null;
  if (h > 0 && m > 0) return `${h}시간 ${m}분`;
  if (h > 0) return `${h}시간`;
  return `${m}분`;
}

function hasMovementInfo(a) {
  return (
    a.origin ||
    a.transport ||
    (a.durationHours && Number(a.durationHours) > 0) ||
    (a.durationMinutes && Number(a.durationMinutes) > 0) ||
    (a.distanceKm && Number(a.distanceKm) > 0)
  );
}

function MiniBadge({ variant = "default", children }) {
  const variantMap = {
    default: "bg-surface-alt text-text-muted",
    accent: "bg-accent/10 text-accent",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] ${variantMap[variant]}`}
    >
      {children}
    </span>
  );
}

/**
 * 자식 활동 카드 (한 줄 컴팩트 카드)
 */
function SubActivityItem({ sub, onEdit, onDelete, onToggleFavorite }) {
  const Icon = SUB_TYPE_ICONS[sub.type] || IconBookmark;
  const canFavorite = FAVORABLE_TYPES.has(sub.type);
  return (
    <div className="flex items-center gap-2 pl-6 py-1.5">
      <div className="w-5 h-5 rounded flex items-center justify-center bg-surface-alt text-text-muted shrink-0">
        <Icon size={12} />
      </div>
      {sub.time && (
        <span className="text-[11px] text-text-muted shrink-0">{sub.time}</span>
      )}
      <span className="text-sm text-text truncate flex-1">{sub.name}</span>
      {sub.rating > 0 && <Rating value={sub.rating} readonly size="sm" />}
      {sub.cost > 0 && (
        <span className="text-[11px] text-text-muted shrink-0">
          {sub.cost.toLocaleString()}원
        </span>
      )}
      {canFavorite && (
        <button
          type="button"
          onClick={() => onToggleFavorite(sub)}
          aria-label={sub.isFavorite ? "즐겨찾기 해제" : "즐겨찾기"}
          className={`p-1 rounded-full transition-colors shrink-0 ${
            sub.isFavorite
              ? "text-accent hover:bg-surface-alt"
              : "text-text-subtle hover:text-text hover:bg-surface-alt"
          }`}
        >
          {sub.isFavorite ? (
            <IconStarFilled size={12} />
          ) : (
            <IconStar size={12} />
          )}
        </button>
      )}
      <button
        type="button"
        onClick={() => onEdit(sub)}
        aria-label="세부 일정 편집"
        className="p-1 rounded-full text-text-subtle hover:text-text hover:bg-surface-alt shrink-0 transition-colors"
      >
        <IconPencil size={12} />
      </button>
      <button
        type="button"
        onClick={() => onDelete(sub.id)}
        aria-label="세부 일정 삭제"
        className="p-1 rounded-full text-text-subtle hover:text-text hover:bg-surface-alt shrink-0 transition-colors"
      >
        <IconX size={12} />
      </button>
    </div>
  );
}

function ActivityItem({
  activity,
  editingId,
  subFormParentId,
  onStartEdit,
  onDelete,
  onStartAddSub,
  onSubmitForm,
  onCancelForm,
  tripId,
  tripStartDate,
  tripEndDate,
  previousActivity,
  previousActivityName,
}) {
  const Icon = TYPE_ICONS[activity.type] || IconBookmark;
  const TransportIcon = activity.transport
    ? TRANSPORT_ICONS[activity.transport]
    : null;

  const updateActivity = useUpdateActivity();

  const duration = formatDuration(
    activity.durationHours,
    activity.durationMinutes,
  );
  const hasMovement = hasMovementInfo(activity);

  const mealTags = [];
  if (activity.type === "식당") {
    if (activity.mealType) mealTags.push(activity.mealType);
    if (activity.cuisines?.length) mealTags.push(...activity.cuisines);
    if (activity.foodTypes?.length) mealTags.push(...activity.foodTypes);
  }

  const nightsDisplay =
    activity.type === "숙소" && activity.nights ? `${activity.nights}박` : null;
  const rentalDaysDisplay =
    activity.type === "렌트카" && activity.days ? `${activity.days}일` : null;

  const children = activity.children ?? [];
  const isEditingThisParent = editingId === activity.id;
  const isAddingSubToThis = subFormParentId === activity.id;

  // 사진 (부모 액티비티만, 편집 모드 아닐 때만 조회)
  const isParent = !activity.parentActivityId;
  const photos =
    useActivityPhotos(isParent && !isEditingThisParent ? activity.id : null) ||
    [];
  const urlMap = usePhotoUrls(photos);
  const firstPhoto = photos[0];
  const firstPhotoUrl = firstPhoto ? urlMap[firstPhoto.storagePath] : null;

  const [galleryOpenAt, setGalleryOpenAt] = useState(null);

  // 즐겨찾기 토글
  const canFavorite = FAVORABLE_TYPES.has(activity.type);
  const handleToggleFavorite = async (target) => {
    await updateActivity(target.id, { isFavorite: !target.isFavorite });
  };

  if (isEditingThisParent) {
    return (
      <ActivityForm
        initialData={activity}
        tripId={tripId}
        tripStartDate={tripStartDate}
        tripEndDate={tripEndDate}
        previousActivity={previousActivity ?? null}
        previousActivityName={previousActivityName}
        onSubmit={(payload) => onSubmitForm(payload, activity)}
        onCancel={onCancelForm}
      />
    );
  }

  return (
    <>
      <div className="bg-surface border border-border rounded-lg mb-2 relative overflow-hidden">
        {firstPhotoUrl && (
          <button
            type="button"
            onClick={() => setGalleryOpenAt(0)}
            className="block w-full aspect-video relative bg-surface-alt"
            aria-label="사진 크게 보기"
          >
            <img
              src={firstPhotoUrl}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {photos.length > 1 && (
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px] flex items-center gap-1">
                <IconPhoto size={11} />
                {photos.length}
              </span>
            )}
          </button>
        )}

        <div className="p-3">
          <div className="flex gap-3">
            <div className="flex flex-col items-center gap-1 min-w-[42px]">
              {activity.time && (
                <span className="text-[11px] text-text-muted">
                  {activity.time}
                </span>
              )}
              <div className="w-7 h-7 rounded-md flex items-center justify-center bg-surface-alt text-text-muted">
                <Icon size={16} />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <MiniBadge>{activity.type}</MiniBadge>
                {nightsDisplay && (
                  <MiniBadge variant="accent">{nightsDisplay}</MiniBadge>
                )}
                {rentalDaysDisplay && (
                  <MiniBadge variant="accent">{rentalDaysDisplay}</MiniBadge>
                )}
                {activity.rating > 0 && (
                  <Rating value={activity.rating} readonly size="sm" />
                )}
              </div>

              <h4 className="font-heading text-sm font-medium text-text">
                {activity.name}
              </h4>

              {hasMovement && (
                <div className="mt-1.5 flex items-center gap-1.5 flex-wrap text-[11px] text-text-muted">
                  {activity.origin && (
                    <>
                      <span className="text-text">{activity.origin}</span>
                      <IconArrowNarrowRight
                        size={12}
                        className="text-text-subtle"
                      />
                    </>
                  )}
                  {TransportIcon && <TransportIcon size={12} />}
                  {activity.transport && <span>{activity.transport}</span>}
                  {duration && (
                    <>
                      {activity.transport && (
                        <span className="text-text-subtle">·</span>
                      )}
                      <span>{duration}</span>
                    </>
                  )}
                  {activity.distanceKm > 0 && (
                    <>
                      <span className="text-text-subtle">·</span>
                      <span>{activity.distanceKm}km</span>
                    </>
                  )}
                </div>
              )}

              {activity.type === "렌트카" && activity.carModel && (
                <p className="inline-flex items-center gap-1 text-[11px] text-text-muted mt-1">
                  <IconCar size={11} />
                  {activity.carModel}
                </p>
              )}

              {mealTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {mealTags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 rounded-full text-[10px] bg-accent/10 text-accent"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {activity.type === "식당" && activity.foodDetails && (
                <p className="inline-flex items-center gap-1 text-[11px] text-text mt-1">
                  <IconToolsKitchen2 size={11} />
                  {activity.foodDetails}
                </p>
              )}

              {activity.location && (
                <p className="inline-flex items-center gap-1 text-[11px] text-text-muted mt-1">
                  <IconMapPin size={11} />
                  {activity.location}
                </p>
              )}

              {activity.type === "숙소" && activity.checkoutTime && (
                <p className="text-[11px] text-text-muted mt-0.5">
                  체크아웃 {activity.checkoutTime}
                </p>
              )}

              {activity.type === "렌트카" && activity.returnTime && (
                <p className="text-[11px] text-text-muted mt-0.5">
                  반납 {activity.returnTime}
                </p>
              )}

              {activity.cost > 0 && (
                <p className="inline-flex items-center gap-1 text-[11px] text-text-muted mt-0.5">
                  <IconCoin size={11} />
                  {activity.cost.toLocaleString()}원
                </p>
              )}

              {activity.memo && (
                <p className="text-xs text-text mt-1">{activity.memo}</p>
              )}
            </div>

            <div className="shrink-0 self-start flex flex-col gap-1">
              {canFavorite && (
                <button
                  type="button"
                  onClick={() => handleToggleFavorite(activity)}
                  aria-label={
                    activity.isFavorite ? "즐겨찾기 해제" : "즐겨찾기"
                  }
                  className={`p-1 rounded-full transition-colors ${
                    activity.isFavorite
                      ? "text-accent hover:bg-surface-alt"
                      : "text-text-subtle hover:text-text hover:bg-surface-alt"
                  }`}
                >
                  {activity.isFavorite ? (
                    <IconStarFilled size={14} />
                  ) : (
                    <IconStar size={14} />
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={() => onStartEdit(activity)}
                aria-label="일정 편집"
                className="p-1 rounded-full text-text-subtle hover:text-text hover:bg-surface-alt transition-colors"
              >
                <IconPencil size={14} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(activity.id)}
                aria-label="일정 삭제"
                className="p-1 rounded-full text-text-subtle hover:text-text hover:bg-surface-alt transition-colors"
              >
                <IconX size={14} />
              </button>
            </div>
          </div>

          {(children.length > 0 || isAddingSubToThis) && (
            <div className="mt-2 pt-2 border-t border-border">
              {children.map((sub) =>
                editingId === sub.id ? (
                  <ActivityForm
                    key={sub.id}
                    isSubActivity
                    parentActivity={activity}
                    initialData={sub}
                    tripId={tripId}
                    onSubmit={(payload) => onSubmitForm(payload, sub)}
                    onCancel={onCancelForm}
                  />
                ) : (
                  <SubActivityItem
                    key={sub.id}
                    sub={sub}
                    onEdit={onStartEdit}
                    onDelete={onDelete}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ),
              )}

              {isAddingSubToThis && (
                <div className="mt-2">
                  <ActivityForm
                    isSubActivity
                    parentActivity={activity}
                    tripId={tripId}
                    onSubmit={(payload) => onSubmitForm(payload, null)}
                    onCancel={onCancelForm}
                  />
                </div>
              )}

              {hasChildrenCost(activity) && (
                <div className="mt-2 pl-6 text-xs text-text-muted inline-flex items-center gap-1">
                  <IconCoin size={11} />총{" "}
                  {calcActivityTotal(activity).toLocaleString()}원
                </div>
              )}
            </div>
          )}

          {!isAddingSubToThis && (
            <button
              type="button"
              onClick={() => onStartAddSub(activity.id)}
              className="mt-2 ml-6 text-xs text-text-muted hover:text-text inline-flex items-center gap-1 transition-colors"
            >
              <IconPlus size={12} />
              세부 일정 추가
            </button>
          )}
        </div>
      </div>

      {galleryOpenAt !== null && photos.length > 0 && (
        <PhotoGallery
          photos={photos}
          urlMap={urlMap}
          startIndex={galleryOpenAt}
          onClose={() => setGalleryOpenAt(null)}
        />
      )}
    </>
  );
}

export default ActivityItem;
