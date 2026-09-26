import React from 'react';
import type { ProductCategory } from '../../../domain/types/product';

const MARK_STYLE = 'w-6 h-6';

const LeafMark: React.FC = () => (
  <svg className={MARK_STYLE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2.5C12 3 9 13.5 9 13.5S8 16 4 19a2.5 2.5 0 0 0 2.9 3.5A4 4 0 0 1 12 22.5s3.4-5.5 3.6-6.6a2.5 2.5 0 0 0 .3-3.5" />
    <path d="M11 6.3c-.2 4.5 0 5.5 0 5.5" />
  </svg>
);

const AppleMark: React.FC = () => (
  <svg className={MARK_STYLE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="13.5" r="5" />
    <path d="M12 18.1V6.6" />
    <path d="M10.3 7.7c.3-.8.3-1.4.5-1.5.9 1.2 2 2.2 2.8 3.2-1-.8-1.4-1.5-1.9-1.5-1.1-1.7-1-2.6-.6-2.3Z" />
    <path d="M7.9 12.9c.6.4 1.2.7 1.8 1.2" />
  </svg>
);

const WheatMark: React.FC = () => (
  <svg className={MARK_STYLE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2.5v17" />
    <path d="M9 5.5l3 5.2" />
    <path d="M14.2 11v5M14.6 12.6l-4.1.8" />
    <path d="M6.3 10.3 10.2 12.6" />
    <path d="M14.4 9.6 13 6.2" />
    <path d="M10.8 8.6 7 9.3" />
  </svg>
);

const MilkMark: React.FC = () => (
  <svg className={MARK_STYLE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10.5 2.2C10.5 2.2 5 8.4 5 13.4c0 4.6 4 8.8 7.5 8.8 3.5 0 7.5-4.2 7.5-8.8 0-5-5.5-11.2-5.5-11.2" />
    <path d="M7 4c0 2.2 1.5 4.8 3 6.5 1 1.2 1.5 2.5 2 2.5 2 0 2-4 2-5 0-2.8-2-6.4-3-6.4-1 0-3 3.6-3 6.4Z" />
    <path d="M15 15.5c0 3.5 1.5 4.5 4 4.5M15 18.5c1.2 0 2 1 2.5 2" />
  </svg>
);

const CowMark: React.FC = () => (
  <svg className={MARK_STYLE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2.5v2.4a5 5 0 0 1 0 9.6c-.6-2.8-3-3.1-3-3.1" />
    <path d="M5 8.4V3.6a3.5 3.5 0 0 1 3.5-4c.9 2.1 3.4 3.4 3.4 3.4" />
    <circle cx="8" cy="16.7" r="1.7" />
    <path d="M13.2 4.2c.6 1 .8 1.9.8 2.6 0 1.1-1.6 1.9-3 2.5 3.4 0 5.9 0 6 3.2a4 4 0 0 1-3.6 3.7c-.5.1-3.2.5-6 0 .4.3 1.1 1.3 3 1.7-2.7 2-5.5 2.4-5.5 2.4.5.7.8 1.5 1 2.5" />
    <ellipse cx="15.4" cy="18.5" rx="2" ry="1.2" />
  </svg>
);

const SproutMark: React.FC = () => (
  <svg className={MARK_STYLE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3.5v16.1" />
    <path d="M12 7.8c-1.2 1.9-1.6 3-1.8 6.4 1.4-1.2 2.6-2.3 2.6-5.4 0-3 1.3-3.6 3.6-5.5-2 2.4-4.4 3.9-6.2 6.9" />
  </svg>
);

const CrateMark: React.FC = () => (
  <svg className={MARK_STYLE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 3.5c0 1.4 1.8 2.5 4 2.5s4 .9 4-1.4-1.8-2.4-1.8-2.4" />
    <path d="M4 8.6V17.7c0 1.4 1.8 2.5 4 2.5M12 17.7v-9.1c0-1.4 1.8-2.5 4-2.5" />
    <path d="M4.5 11.2V13.9" />
    <path d="M4.5 15.5V18.2" />
    <path d="M4.5 5.9V8.6" />
    <path d="M20 3.5c0-1.4-1.8-2.5-4-2.5s-4-.9-4 1.4 1.8 2.4 1.8 2.4" />
  </svg>
);

const categoryMarks: Record<ProductCategory, React.FC> = {
  vegetables: LeafMark,
  fruits: AppleMark,
  grains: WheatMark,
  dairy: MilkMark,
  livestock: CowMark,
  organic: SproutMark,
  supplies: CrateMark,
};

export default categoryMarks;