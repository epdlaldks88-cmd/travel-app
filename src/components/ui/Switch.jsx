/**
 * Switch (iOS 스타일 토글)
 *
 * Props:
 *   checked   - boolean
 *   onChange  - (newValue: boolean) => void
 *   disabled  - boolean
 *   size      - 'sm' | 'md' (기본)
 *   'aria-label' - 스크린리더용 (라벨을 외부에서 관리할 때)
 *
 * 트랙: 노브가 오른쪽으로 슬라이드. ON 시 bg-accent, OFF 시 bg-border.
 */

const sizeMap = {
  sm: {
    track: "w-9 h-5",
    knob: "w-4 h-4",
    translate: "translate-x-4",
  },
  md: {
    track: "w-[46px] h-7",
    knob: "w-6 h-6",
    translate: "translate-x-[18px]",
  },
};

export default function Switch({
  checked = false,
  onChange,
  disabled = false,
  size = "md",
  ...rest
}) {
  const s = sizeMap[size];

  const handleClick = () => {
    if (disabled) return;
    onChange?.(!checked);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={handleClick}
      className={[
        "relative inline-flex items-center shrink-0",
        "rounded-full transition-colors duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        s.track,
        checked ? "bg-accent" : "bg-border",
      ].join(" ")}
      {...rest}
    >
      <span
        className={[
          "inline-block bg-white rounded-full shadow-sm",
          "transition-transform duration-200 ease-out",
          "ml-0.5",
          s.knob,
          checked ? s.translate : "translate-x-0",
        ].join(" ")}
      />
    </button>
  );
}
