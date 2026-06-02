import { Star, MessageSquare, TrendingUp, ThumbsUp } from "lucide-react";
import { PageHeader, PageBody } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { feedback } from "@/lib/mockData";

function Feedback() {
  return (
    <>
      <PageHeader title="Feedback & ratings" subtitle="Patient voice across all departments" />
      <PageBody>
        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Avg rating" value="4.86" delta="+0.12" icon={Star} tone="warning" />
          <StatCard label="Reviews" value="2,184" delta="+184" icon={MessageSquare} tone="primary" />
          <StatCard label="Positive" value="96%" delta="+1.4%" icon={ThumbsUp} tone="emerald" />
          <StatCard label="NPS" value={78} delta="+4" icon={TrendingUp} tone="teal" />
        </section>

        <section className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          {feedback.map((f) => (
            <div key={f.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold">{f.patient}</p>
                  <p className="text-xs text-muted-foreground">for {f.doctor}</p>
                </div>
                <span className="inline-flex items-center gap-0.5 text-warning-foreground">
                  {Array.from({ length: f.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current text-amber-500" />
                  ))}
                </span>
              </div>
              <p className="mt-3 text-sm text-foreground">"{f.comment}"</p>
              <p className="mt-3 text-[11px] text-muted-foreground">{f.date}</p>
            </div>
          ))}
        </section>
      </PageBody>
    </>
  );
}

export default Feedback;
