import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CircleAlert, CircleCheck } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ToastVariant = 'default' | 'success' | 'destructive';

export interface Toast {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
}

type ToastAction =
  | { type: 'ADD'; toast: Toast }
  | { type: 'DISMISS'; id: number };

interface ToastState {
  toasts: Toast[];
}

const toastReducer = (state: ToastState, action: ToastAction): ToastState => {
  switch (action.type) {
    case 'ADD':
      return { toasts: [...state.toasts, action.toast] };
    case 'DISMISS':
      return { toasts: state.toasts.filter((t) => t.id !== action.id) };
  }
};

interface ToastContextValue {
  toasts: Toast[];
  toast: (toast: Omit<Toast, 'id'>) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_HIDE_MS = 4000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [{ toasts }, dispatch] = useReducer(toastReducer, { toasts: [] });
  const idRef = useRef(0);
  const timersRef = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    const timer = timersRef.current.get(id);
    if (timer !== undefined) clearTimeout(timer);
    timersRef.current.delete(id);
    dispatch({ type: 'DISMISS', id });
  }, []);

  const toast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = idRef.current++;
      timersRef.current.set(id, setTimeout(() => dismiss(id), AUTO_HIDE_MS));
      dispatch({ type: 'ADD', toast: { id, ...toast } });
    },
    [dismiss]
  );

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  const value = useMemo(() => ({ toasts, toast, dismiss }), [toasts, toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(<ToastViewport toasts={toasts} dismiss={dismiss} />, document.body)}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const iconFor: Record<ToastVariant, React.ComponentType<{ className?: string }>> = {
  default: CircleAlert,
  success: CircleCheck,
  destructive: CircleAlert,
};

const variantClasses: Record<ToastVariant, string> = {
  default: 'border-wheat/60 bg-card text-forest',
  success: 'border-moss/50 bg-moss/10 text-forest',
  destructive: 'border-rose/40 bg-rose/10 text-rose',
};

function ToastViewport({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex max-w-[330px] flex-col gap-3">
      {toasts.map((t) => {
        const Icon = iconFor[t.variant];
        return (
          <div
            key={t.id}
            role="status"
            tabIndex={0}
            className={cn(
              'flex items-start gap-3 rounded-xl border p-3 shadow-lg transition-transform hover:opacity-90',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
              variantClasses[t.variant]
            )}
            onClick={() => dismiss(t.id)}
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm text-current">{t.title}</p>
              {t.description ? <p className="text-xs text-current/70">{t.description}</p> : null}
            </div>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={(e) => {
                e.stopPropagation();
                dismiss(t.id);
              }}
              className="shrink-0 text-current/60 transition-colors hover:text-foreground rounded-md p-1"
            >
              <span className="inline-flex h-4 w-4 items-center justify-center font-black leading-none" aria-hidden="true">&times;</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}