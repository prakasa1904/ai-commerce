import React from 'react';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { RefreshCw, Loader2 } from 'lucide-react';

interface Column<T> {
  header: string;
  accessor: string;
  className?: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  className?: string;
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  loading?: boolean;
  skeletonRows?: number;
  getRowClassName?: (row: T) => string | undefined;
  onRowClick?: (row: T) => void;
  error?: Error | null;
  onRetry?: () => void;
}

export function DataTable<T>({
  columns,
  data,
  emptyMessage = 'No records.',
  emptyAction,
  className,
  page = 1,
  pageSize,
  total,
  onPageChange,
  loading = false,
  skeletonRows = 5,
  getRowClassName,
  onRowClick,
  error = null,
  onRetry,
}: DataTableProps<T>) {
  const [showSkeleton, setShowSkeleton] = React.useState(false);

  React.useEffect(() => {
    if (!loading) {
      setShowSkeleton(false);
      return;
    }
    const timer = window.setTimeout(() => setShowSkeleton(true), 1000);
    return () => window.clearTimeout(timer);
  }, [loading]);

  const showSkeletonBody = loading && showSkeleton;

  const start = typeof page === 'number' && typeof pageSize === 'number' ? (page - 1) * pageSize + 1 : 1;
  const hasPager = typeof total === 'number';
  const end = hasPager && typeof pageSize === 'number' ? Math.max(start, Math.min(page * pageSize, total)) : data.length;
  const rangeText = hasPager ? `${start}–${end} of ${total}` : '';
  const nextDisabled = hasPager ? page >= Math.ceil(total / (pageSize ?? 10)) : false;
  const prevDisabled = page <= 1;

  const paginationFooter = hasPager ? (
    <div className="flex items-center justify-between border-t border-wheat/40 px-5 py-3 text-sm text-soil">
      <span>{rangeText}</span>
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onPageChange?.(Math.max(1, page - 1))}
          disabled={prevDisabled}
        >
          Previous
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onPageChange?.(page + 1)} disabled={nextDisabled}>
          Next
        </Button>
      </div>
    </div>
  ) : null;

  return (
    <div className={cn('rounded-2xl border border-wheat/60 bg-card shadow-sm', 'overflow-auto', 'max-h-[520px] relative', className)}>
      {error ? (
        <Alert variant="destructive" className="border-b border-destructive/50">
          <AlertTitle>Could not load data</AlertTitle>
          <AlertDescription>The list could not be loaded, possibly because of a server error or an expired session.</AlertDescription>
          <Button
            variant="default"
            size="sm"
            className="mt-2"
            onClick={onRetry}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Retry
          </Button>
        </Alert>
      ) : null}
      <div className="min-w-[640px]">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-wheat/40 bg-cream/60">
              {columns.map((col) => (
                <th
                  key={col.accessor}
                  scope="col"
                  className={cn(
                    'sticky top-0 z-10 px-5 py-3 text-left text-[0.62rem] font-black uppercase tracking-[0.2em] text-clay bg-cream/60',
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          {showSkeletonBody ? (
            <tbody>
              {Array.from({ length: skeletonRows }).map((_, i) => (
                <tr key={i} className="border-b border-wheat/30 last:border-0">
                  {columns.map((col) => (
                    <td key={col.accessor} className="px-5 py-4">
                      <div className="h-4 w-full max-w-[180px] rounded-sm bg-wheat/70 animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ) : data.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-wheat/70 flex items-center justify-center text-forest/30">
                      <span className="font-black text-2xl leading-none" aria-hidden="true">
                        ·
                      </span>
                    </div>
                    <div className="text-sm font-medium text-soil/70">{emptyMessage}</div>
                    {emptyAction ? <div className="mt-2">{emptyAction}</div> : null}
                  </div>
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {data.map((row, i) => {
                const key = (row as { id?: number | string }).id ?? i;
                return (
                  <tr
                    key={key}
                    className={cn(
                      'border-b border-wheat/30 last:border-0 transition-colors hover:bg-cream/50',
                      onRowClick ? 'cursor-pointer' : '',
                      getRowClassName?.(row)
                    )}
                    onClick={(e) => {
                      if (!(e.target instanceof Element)) return;
                      if (e.target.closest('button, a, [role="button"], select, input, textarea, label')) return;
                      onRowClick?.(row);
                    }}
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter' && e.key !== ' ') return;
                      if (!(e.target instanceof Element)) return;
                      if (e.target.closest('button, a, [role="button"], select, input, textarea, label')) return;
                      e.preventDefault();
                      onRowClick?.(row);
                    }}
                  >
                    {columns.map((col, colIndex) => (
                      <td
                        key={col.accessor}
                        className={cn('px-5 py-3 text-sm text-forest', onRowClick && colIndex === 0 ? 'relative' : '')}
                      >
                        {onRowClick && colIndex === 0 ? (
                          <button
                            type="button"
                            className="absolute inset-0 h-full w-full cursor-pointer border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-forest focus-visible:outline-offset-[-2px] pointer-events-none"
                            onClick={() => onRowClick(row)}
                          />
                        ) : null}
                        {col.render ? col.render(row) : (row as Record<string, unknown>)[col.accessor] as React.ReactNode}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>
      </div>
      {paginationFooter}
    </div>
  );
}