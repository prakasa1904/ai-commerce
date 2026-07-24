// Layout Component: Root layout wrapper
// ≤50 lines: Header + Main + Footer layers

import React, { ReactNode } from 'react';

interface LayoutProps { children: ReactNode; }

const Layout: React.FC<LayoutProps> = ({ children }) => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a' }}>
    <header style={{ padding: '20px 32px', borderBottom: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', background: '#0f172a' }}>
      <h2 style={{ color: '#f1f5f9', letterSpacing: '-1px' }}>🌾 Farm Marketplace</h2>
    </header>
    <main style={{ flex: 1, padding: '8px' }}>{children}</main>
    <footer style={{ padding: '32px 32px 16px', borderTop: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
      <p>Farm Fresh Goodness © 2026</p>
    </footer>
  </div>
);

export default Layout;
