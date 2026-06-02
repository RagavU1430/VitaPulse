import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import AppSidebar from './AppSidebar';
import Topbar from './Topbar';
import authService from '@/services/authService';

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (!authService.isAuthenticated()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar — always visible on lg+, toggled on mobile */}
      <div className={cn("hidden lg:block")}>
        <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>
      {mobileOpen && (
        <div className="lg:hidden">
          <AppSidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main content area */}
      <div className={cn(
        "flex flex-col transition-all duration-300",
        collapsed ? "lg:ml-[68px]" : "lg:ml-[260px]"
      )}>
        <Topbar onMenuClick={() => setMobileOpen(!mobileOpen)} />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
