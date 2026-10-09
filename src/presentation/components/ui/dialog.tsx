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

export const Dialog = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: DialogProps) => {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center"
      onClick={() => onOpenChange(false)}
      aria-modal="true"
      role="dialog"
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
            <h3 className="font-display font-black text-lg text-forest">{title}</h3>
            {description && <p className="mt-1 text-sm text-soil/60">{description}</p>}
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={() => onOpenChange(false)}
            className="text-forest/70 hover:text-forest transition-colors rounded-full p-1.5"
          >
            <span className="font-black text-xl leading-none" aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-wheat/40 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};