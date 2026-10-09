import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from './utils';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const focusableSelector =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export const Dialog = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: DialogProps) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const titleId = React.useId();

  React.useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const previouslyFocused = document.activeElement as HTMLElement | null;
    containerRef.current?.focus({ preventScroll: true });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onOpenChange(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const container = containerRef.current;
      const focusables = container?.querySelectorAll<HTMLElement>(focusableSelector);
      if (!focusables || focusables.length === 0) {
        e.preventDefault();
        container?.focus({ preventScroll: true });
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus({ preventScroll: true });
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return createPortal(
    <div
      ref={containerRef}
      tabIndex={-1}
      className="fixed inset-0 z-[90] flex items-center justify-center outline-none"
      onClick={() => onOpenChange(false)}
      aria-modal="true"
      role="dialog"
      aria-labelledby={titleId}
    >
      <div className="fixed inset-0 bg-forest/60 backdrop-blur-sm" aria-hidden="true" />
      <div
        className={cn(
          'relative mx-4 w-full max-w-2xl rounded-2xl bg-card border border-wheat/60 shadow-2xl outline-none',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-wheat/40 px-6 py-4">
          <div>
            <h3 id={titleId} className="font-display font-black text-lg text-forest">
              {title}
            </h3>
            {description && <p className="mt-1 text-sm text-soil/60">{description}</p>}
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={() => onOpenChange(false)}
            className="text-forest/70 hover:text-forest transition-colors rounded-full p-1.5"
          >
            <span className="font-black text-xl leading-none" aria-hidden="true">
              &times;
            </span>
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-wheat/40 px-6 py-4">{footer}</div>
        )}
      </div>
    </div>,
    document.body
  );
};