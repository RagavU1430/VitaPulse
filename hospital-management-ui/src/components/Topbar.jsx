import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Plus, ChevronDown, MessageSquareText, Menu, LogOut, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import authService from '@/services/authService';

export default function Topbar({ onMenuClick }) {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || 'VP';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <button onClick={onMenuClick} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted lg:hidden">
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="relative hidden flex-1 md:block max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search patients, doctors, appointments…"
          className="h-10 w-full rounded-xl border border-border bg-muted/60 pl-9 pr-4 text-sm outline-none focus:bg-card focus:ring-2 focus:ring-ring/20 transition"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* New appointment button */}
        {user?.role === 'PATIENT' && (
          <button
            onClick={() => navigate('/book-appointment')}
            className="hidden h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition sm:inline-flex cursor-pointer"
          >
            <Plus className="h-4 w-4" /> New appointment
          </button>
        )}

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl hover:bg-muted transition"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger ring-2 ring-background" />
          </button>
          {showNotifs && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
              <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-border bg-card shadow-card">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <p className="text-sm font-semibold">Notifications</p>
                  <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-medium text-primary">4 new</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {[
                    { title: "New appointment booked", body: "Patient booking confirmed · 09:30", time: "2m" },
                    { title: "Lab results ready", body: "Neurology panel completed", time: "12m" },
                    { title: "Schedule conflict resolved", body: "Doctor reassigned to available suite", time: "1h" },
                    { title: "System update", body: "VitaPulse v2.4 deployed successfully", time: "3h" },
                  ].map((n) => (
                    <div key={n.title} className="flex gap-3 border-b border-border/60 px-4 py-3 last:border-b-0 hover:bg-muted/60 cursor-pointer">
                      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{n.title}</p>
                        <p className="text-xs text-muted-foreground">{n.body}</p>
                      </div>
                      <span className="text-[11px] text-muted-foreground">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-2 py-1.5 transition-colors hover:bg-muted"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-emerald text-xs font-semibold text-emerald-foreground">
              {initials}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-xs font-semibold leading-tight">{user?.name || user?.email || 'User'}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{user?.role || 'Guest'}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
          {showProfile && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
              <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-border bg-card shadow-card py-1">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-sm font-semibold">{user?.email}</p>
                  <p className="text-xs text-muted-foreground">{user?.role}</p>
                </div>
                <button
                  onClick={() => { setShowProfile(false); navigate('/settings'); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition"
                >
                  <Settings className="h-4 w-4" /> Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-muted transition"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
