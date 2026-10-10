import React from 'react';

interface PillProps {
  label: string;
  active: boolean;
  onClick: () => void;
  id?: string;
}

const Pill: React.FC<PillProps> = ({ label, active, onClick, id }) => (
  <button
    id={id}
    type="button" onClick={onClick}
    aria-pressed={active}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-forest focus-visible:outline-offset-2 ${active ? 'bg-forest text-cream shadow-sm' : 'bg-cream text-soil/70 hover:text-forest hover:border-moss/50 hover:border'}`}
  >
    {label}
  </button>
);

export default Pill;