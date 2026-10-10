import React from 'react';
import { Link } from '@tanstack/react-router';

const AisleHeader: React.FC<{ title: string; copy?: string; children?: React.ReactNode }> = ({ title, copy, children }) => (
  <div className="flex flex-wrap items-center justify-between gap-6">
    <div className="flex items-center gap-5">
      {children && <span className="flex h-14 w-14 items-center justify-center rounded-full bg-kraft text-forest shadow-md" aria-hidden="true">{children}</span>}
      <div>
        <p className="font-display text-honey font-bold text-sm tracking-[0.3em] uppercase">The market aisle</p>
        <h2 className="mt-3 text-4xl font-black text-forest font-display">{title}</h2>
        {copy && <p className="mt-2 max-w-xl text-sm text-soil/70">{copy}</p>}
      </div>
    </div>
    <Link to="/cat" className="font-display text-xs font-black uppercase tracking-[0.18em] text-pine hover:text-clay transition-colors">&larr; All aisles</Link>
  </div>
);

export default AisleHeader;