import React from 'react';
import { cn } from '../ui/utils';

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
  className?: string;
}

export function DataTable<T>({ columns, data, emptyMessage = 'No records.', className }: DataTableProps<T>) {
  return (
    <div className={cn('overflow-x-auto rounded-2xl border border-wheat/60 bg-card shadow-sm', className)}>
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className="border-b border-wheat/40 bg-cream/60">
            {columns.map((col) => (
              <th
                key={col.accessor}
                scope="col"
                className={`px-5 py-3 text-left text-[0.62rem] font-black uppercase tracking-[0.2em] text-clay ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={(row as { id?: number }).id ?? i} className="border-b border-wheat/30 last:border-0 transition-colors hover:bg-cream/50">
              {columns.map((col) => (
                <td key={col.accessor} className="px-5 py-3 text-sm text-forest">
                  {col.render ? col.render(row) : (row as Record<string, unknown>)[col.accessor] as React.ReactNode}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-5 py-12 text-center text-sm text-soil/50">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}