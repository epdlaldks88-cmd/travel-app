import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  IconCircleCheck,
  IconAlertCircle,
  IconInfoCircle,
  IconX,
} from "@tabler/icons-react";

/**
 * 전역 Toast 시스템.
 *
 * 사용:
 *   const toast = useToast();
 *   toast.success("저장되었습니다");
 *   toast.error("오류가 발생했습니다");
 *   toast.info("메시지");
 *
 * 앱 최상단에 <ToastProvider>로 감싸야 함.
 */

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message, variant = "info", duration = 2500) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, variant }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss],
  );

  const value = {
    success: (msg, duration) => show(msg, "success", duration),
    error: (msg, duration) => show(msg, "error", duration ?? 4000),
    info: (msg, duration) => show(msg, "info", duration),
    dismiss,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast는 ToastProvider 안에서 써야 합니다");
  return ctx;
}

/* ─── 렌더링 ─── */

function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-[60] flex flex-col items-center gap-2 pointer-events-none px-4">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 마운트 직후 페이드인
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const variantStyles = {
    success: "bg-text text-bg",
    error: "bg-danger text-white",
    info: "bg-text text-bg",
  };

  const Icon =
    toast.variant === "success"
      ? IconCircleCheck
      : toast.variant === "error"
        ? IconAlertCircle
        : IconInfoCircle;

  return (
    <div
      className={`
        pointer-events-auto max-w-md w-full sm:w-auto
        px-4 py-3 rounded-xl shadow-lg
        flex items-center gap-2
        ${variantStyles[toast.variant]}
        transition-all duration-200
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
      `}
    >
      <Icon size={18} className="shrink-0" />
      <span className="text-sm flex-1">{toast.message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="닫기"
        className="p-0.5 rounded-full hover:bg-white/10 transition-colors shrink-0"
      >
        <IconX size={14} />
      </button>
    </div>
  );
}
