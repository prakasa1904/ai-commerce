import * as React from 'react';
import { cn } from './utils';

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  id: string;
  'aria-controls': string;
  tabIndex: number;
}

export interface TabsPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  'aria-labelledby': string;
}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(({ className, ...props }, ref) => {
  const listRef = { current: null as HTMLDivElement | null };
  const [activeIndex, setActiveIndex] = React.useState(0);

  const setRefs = (node: HTMLDivElement | null) => {
    listRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };

  const getTabs = () => Array.from(listRef.current?.querySelectorAll<HTMLElement>('[role="tab"]') ?? []);

  React.useEffect(() => {
    const tabs = getTabs();
    const derivedIndex = tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true');
    if (derivedIndex !== -1 && derivedIndex !== activeIndex) setActiveIndex(derivedIndex);
    tabs.forEach((tab, index) => {
      tab.tabIndex = index === derivedIndex ? 0 : -1;
    });
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const tabs = getTabs();
    if (tabs.length === 0) return;
    let nextIndex = activeIndex;
    if (e.key === 'ArrowRight') nextIndex = (activeIndex + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') nextIndex = (activeIndex - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') nextIndex = 0;
    else if (e.key === 'End') nextIndex = tabs.length - 1;
    else return;

    e.preventDefault();
    setActiveIndex(nextIndex);
    tabs[nextIndex]?.focus();
    tabs[nextIndex]?.click();
  };

  return (
    <div
      ref={setRefs}
      role="tablist"
      aria-orientation="horizontal"
      onKeyDown={handleKeyDown}
      className={cn(
        'inline-flex items-center justify-start rounded-md border border-wheat/40 bg-cream/60 p-1',
        className
      )}
      {...props}
    />
  );
});
TabsList.displayName = 'TabsList';

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, active, id, 'aria-controls': ariaControls, tabIndex, ...props }, ref) => {
    return (
      <button
        ref={ref}
        id={id}
        type="button"
        role="tab"
        aria-selected={active}
        aria-controls={ariaControls}
        tabIndex={tabIndex}
        className={cn(
          'inline-flex items-center rounded-sm px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          active
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-forest/70 hover:bg-wheat/50 hover:text-forest',
          className
        )}
        {...props}
      />
    );
  }
);
TabsTrigger.displayName = 'TabsTrigger';

const TabsPanel = React.forwardRef<HTMLDivElement, TabsPanelProps>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      role="tabpanel"
      tabIndex={0}
      className={cn('outline-none focus-visible:ring-2 ring-ring', className)}
      {...props}
    />
  );
});
TabsPanel.displayName = 'TabsPanel';

export { TabsList, TabsTrigger, TabsPanel };