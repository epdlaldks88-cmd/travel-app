import { IconEdit, IconTrash, IconBuilding } from "@tabler/icons-react";
import { Card } from "./ui";
import AccommodationForm from "./AccommodationForm";

/**
 * 숙소 요약 카드.
 * 편집 모드일 땐 카드 자리에 폼 렌더.
 */
function AccommodationItem({
  accommodation,
  editingId,
  tripStartDate,
  tripEndDate,
  onStartEdit,
  onSubmitForm,
  onCancelForm,
  onDelete,
}) {
  const isEditing = editingId === accommodation.id;

  if (isEditing) {
    return (
      <AccommodationForm
        initialData={accommodation}
        tripStartDate={tripStartDate}
        tripEndDate={tripEndDate}
        onSubmit={(payload) => onSubmitForm(payload, accommodation)}
        onCancel={onCancelForm}
      />
    );
  }

  const formatDate = (str) => (str ? str.replaceAll("-", ".").slice(5) : "");

  const dateRange =
    accommodation.checkInDate && accommodation.checkOutDate
      ? `${formatDate(accommodation.checkInDate)} – ${formatDate(accommodation.checkOutDate)}`
      : formatDate(accommodation.checkInDate);

  return (
    <Card padding="md" className="mb-2">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-surface-alt flex items-center justify-center text-text-muted shrink-0">
          <IconBuilding size={20} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-text truncate">
              {accommodation.name}
            </p>
            <span className="text-xs text-text-muted whitespace-nowrap">
              {accommodation.nights}박
            </span>
          </div>

          {dateRange && (
            <p className="text-xs text-text-muted mt-0.5">{dateRange}</p>
          )}

          {accommodation.location && (
            <p className="text-xs text-text-subtle mt-0.5 truncate">
              {accommodation.location}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2 text-xs">
            {accommodation.totalCost > 0 && (
              <span className="text-text">
                {accommodation.totalCost.toLocaleString()}원
              </span>
            )}
            {accommodation.rating > 0 && (
              <span className="text-accent">
                ◆ {accommodation.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onStartEdit(accommodation)}
            aria-label="편집"
            className="p-1.5 rounded-full text-text-muted hover:text-text hover:bg-surface-alt transition-colors"
          >
            <IconEdit size={16} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(accommodation.id)}
            aria-label="삭제"
            className="p-1.5 rounded-full text-text-muted hover:text-danger hover:bg-surface-alt transition-colors"
          >
            <IconTrash size={16} />
          </button>
        </div>
      </div>

      {accommodation.memo && (
        <p className="text-xs text-text-muted mt-3 pt-3 border-t border-border whitespace-pre-wrap">
          {accommodation.memo}
        </p>
      )}
    </Card>
  );
}

export default AccommodationItem;
