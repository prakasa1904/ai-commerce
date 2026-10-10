import React from 'react';

interface CratePlateProps {
  title: string;
  className?: string;
}

const CratePlate: React.FC<CratePlateProps> = ({ title, className }) => (
  <div className={className}>
    <div className="relative">
      <div aria-hidden="true" className="absolute -top-1 -left-2 h-5 w-5 bg-honey/80 blur-sm" />
      <span className="inline-block rounded-md bg-kraft px-3.5 py-2.5 font-display font-[800] text-[11px] uppercase leading-none tracking-[0.22em] text-forest shadow-md">
        {title}
      </span>
    </div>
  </div>
);

export default CratePlate;