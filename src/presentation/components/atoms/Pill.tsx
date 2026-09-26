import React from 'react';

interface PillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

const Pill: React.FC<PillProps> = ({ label, active, onClick }) => (
  <button
    type="button" onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${active ? 'bg-forest text-cream shadow-sm' : 'bg-cream text-soil/70 hover:text-forest hover:border-moss/50 hover:border'}`}
  >
    {label}
  </button>
);

export default Pill;