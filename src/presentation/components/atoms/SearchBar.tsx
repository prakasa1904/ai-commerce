// Atom Component: SearchBar
// ≤5 lines principle: Simple, reusable search input
import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  value, 
  onChange = () => {}, 
  placeholder = 'Search products...' 
}) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    style={{
      width: '100%',
      padding: '12px 20px',
      borderRadius: '8px',
      border: '1px solid rgba(255,255,255,0.1)',
      background: 'rgba(255,255,255,0.03)',
      color: '#f1f5f9',
      fontSize: '16px',
      outline: 'none',
      backdropFilter: 'blur(10px)'
    }}
  />
);

export default SearchBar;