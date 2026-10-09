import * as React from 'react';
import { cn } from './utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, ...props }, ref) => {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          'flex h-10 w-full appearance-none items-center justify-between rounded-md border border-input bg-card px-3 pr-9 py-2 text-sm font-medium text-forest shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
      <svg aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-forest/50" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 10l5 5 5-5z" />
      </svg>
    </div>
  );
});
Select.displayName = 'Select';

export { Select };