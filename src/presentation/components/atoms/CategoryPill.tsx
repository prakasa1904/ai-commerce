// Atom Component: CategoryPill
import React from 'react';

interface CategoryPillProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const CategoryPill: React.FC<CategoryPillProps> = ({
  label,
  active = false,
  onClick = () => {}
}) => (
  <button
    onClick={onClick}
    style={{
      padding: '8px 16px',
      border: 'none',
      borderRadius: '16px',
      background: active ? '#1e40af' : 'rgba(255,255,255,0.03)',
      color: active ? '#fff' : '#94a3b8',
      fontSize: '12px',
      fontWeight: 600,
      cursor: 'pointer',
      backdropFilter: active ? 'blur(8px)' : 'none',
      letterSpacing: '1.5px'
    }}
  >
    {label}
  </button>
);

export default CategoryPill;
