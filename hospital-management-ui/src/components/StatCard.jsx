import { cn } from '@/lib/utils';

const toneMap = {
  primary: "bg-primary-soft text-primary",
  teal: "bg-teal-soft text-teal",
  emerald: "bg-accent text-emerald",
  warning: "bg-warning/15 text-warning-foreground",
  danger: "bg-danger/15 text-danger",
};

export function StatCard({ label, value, delta, trend = "up", icon: Icon, tone = "primary" }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
        </div>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", toneMap[tone])}>
          {Icon && <Icon className="h-5 w-5" />}
        </div>
      </div>
      {delta ? (
        <p className={cn("mt-3 text-xs font-medium", trend === "up" ? "text-success" : "text-danger")}>
          {trend === "up" ? "▲" : "▼"} {delta} <span className="text-muted-foreground font-normal">vs last week</span>
        </p>
      ) : null}
    </div>
  );
}
