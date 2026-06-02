import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Stethoscope, Users, CalendarClock, CalendarPlus,
  CalendarCheck, CalendarRange, BarChart3, Star, ShieldAlert, Settings,
  Activity, ChevronLeft, LogOut
} from 'lucide-react';
import authService from '@/services/authService';

const groups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", to: "/dashboard", icon: LayoutDashboard, roles: ['PATIENT', 'DOCTOR', 'ADMIN'] },
    ],
  },
  {
    label: "Care Network",
    items: [
      { title: "Doctors", to: "/doctors", icon: Stethoscope, roles: ['PATIENT', 'ADMIN'] },
      { title: "Patients", to: "/patients", icon: Users, roles: ['ADMIN'] },
    ],
  },
  {
    label: "Appointments",
    items: [
      { title: "Doctor Slots", to: "/doctor-slots", icon: CalendarClock, roles: ['ADMIN'] },
      { title: "Book Appointment", to: "/book-appointment", icon: CalendarPlus, roles: ['PATIENT'] },
      { title: "My Appointments", to: "/my-appointments", icon: CalendarCheck, roles: ['PATIENT'] },
      { title: "Appointment Mgmt", to: "/appointments", icon: CalendarRange, roles: ['DOCTOR', 'ADMIN'] },
    ],
  },
  {
    label: "Insights",
    items: [
      { title: "Reports & Analytics", to: "/reports", icon: BarChart3, roles: ['ADMIN'] },
      { title: "Feedback & Ratings", to: "/feedback", icon: Star, roles: ['ADMIN'] },
      { title: "Audit Logs", to: "/audit", icon: ShieldAlert, roles: ['ADMIN'] },
      { title: "Settings", to: "/settings", icon: Settings, roles: ['PATIENT', 'DOCTOR', 'ADMIN'] },
    ],
  },
];

export default function AppSidebar({ collapsed, onToggle }) {
  const user = authService.getCurrentUser();
  const role = user?.role || '';
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 bottom-0 z-40 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-sidebar-border px-4 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-hero shadow-card">
          <Activity className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight">VitaPulse</span>
            <span className="text-[11px] text-muted-foreground leading-tight">Healthcare OS</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className={cn(
            "ml-auto flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition",
            collapsed && "ml-0 mt-2"
          )}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {groups.map((g) => {
          const visibleItems = g.items.filter(item => item.roles.includes(role));
          if (visibleItems.length === 0) return null;
          return (
            <div key={g.label} className="mb-4">
              {!collapsed && (
                <p className="mb-2 px-2 text-[11px] uppercase tracking-wider text-muted-foreground/80 font-semibold">
                  {g.label}
                </p>
              )}
              <ul className="space-y-1">
                {visibleItems.map((item) => {
                  const isActive = location.pathname === item.to ||
                    (item.to !== "/dashboard" && location.pathname.startsWith(item.to));
                  return (
                    <li key={item.title}>
                      <NavLink
                        to={item.to}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                        )}
                        title={collapsed ? item.title : undefined}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-sidebar-border p-3">
          <div className="rounded-xl bg-primary-soft p-3">
            <p className="text-xs font-semibold text-primary">System status</p>
            <p className="mt-1 text-[11px] text-muted-foreground">All services operational · 99.98% uptime</p>
          </div>
        </div>
      )}
    </aside>
  );
}
