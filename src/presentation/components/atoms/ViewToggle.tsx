import React from 'react';
import { LayoutGrid, ListOrdered } from 'lucide-react';

type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ view, onChange }) => {
  const mode = (v: ViewMode, icon: React.ReactElement, label: string) => (
    <button
      type="button"
      onClick={() => onChange(v)}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-forest focus-visible:outline-offset-2 ${view === v ? 'bg-forest text-cream shadow-sm' : 'bg-cream text-soil/70 hover:text-forest hover:border-moss/50 hover:border'}`}
      aria-pressed={view === v}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="inline-flex rounded-full border border-wheat/60 bg-cream px-1 py-0.5">
      {mode('grid', <LayoutGrid className="size-4" />, 'Grid')}
      {mode('list', <ListOrdered className="size-4" />, 'List')}
    </div>
  );
};

export default ViewToggle;