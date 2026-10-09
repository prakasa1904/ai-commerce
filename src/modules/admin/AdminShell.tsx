import React, { useState } from 'react';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';

const AdminShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-wheat">
      <AdminHeader mobileOpen={mobileOpen} onToggleMobile={() => setMobileOpen((open) => !open)} />
      <div className="flex flex-1 max-w-7xl mx-auto w-full gap-6 px-4 py-8">
        <AdminSidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
      <footer className="shrink-0 bg-forest border-t border-forest/60 px-4 py-6">
        <div className="max-w-7xl mx-auto text-center text-xs text-cream/60">
          Farm Marketplace · Admin console
        </div>
      </footer>
    </div>
  );
};

export default AdminShell;