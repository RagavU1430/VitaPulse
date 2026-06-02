export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col gap-3 border-b border-border bg-card px-6 py-6 md:flex-row md:items-end md:justify-between md:px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function PageBody({ children }) {
  return <div className="px-6 py-6 md:px-8 md:py-8">{children}</div>;
}

export function StatusPill({ status }) {
  const s = (status || '').toLowerCase();
  const map = {
    completed: "bg-success/15 text-success border-success/30",
    scheduled: "bg-primary/10 text-primary border-primary/25",
    pending: "bg-warning/15 text-warning-foreground border-warning/30",
    cancelled: "bg-danger/15 text-danger border-danger/30",
    active: "bg-success/15 text-success border-success/30",
    inactive: "bg-muted text-muted-foreground border-border",
    available: "bg-emerald/15 text-emerald border-emerald/30",
    booked: "bg-primary/10 text-primary border-primary/25",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${map[s] ?? "bg-muted text-muted-foreground border-border"}`}>
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
