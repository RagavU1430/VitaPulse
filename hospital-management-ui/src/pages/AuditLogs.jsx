import { ShieldAlert, Download, Filter } from "lucide-react";
import { PageHeader, PageBody } from "@/components/PageHeader";
import { auditLogs } from "@/lib/mockData";

function AuditLogs() {
  return (
    <>
      <PageHeader 
        title="Audit logs" 
        subtitle="Every action across the platform · HIPAA-compliant"
        actions={
          <>
            <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted/50 transition shadow-sm">
              <Filter className="h-4 w-4" /> Filter
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition shadow-sm">
              <Download className="h-4 w-4" /> Export
            </button>
          </>
        }
      />
      <PageBody>
        <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-3.5 text-left font-medium">When</th>
                  <th className="px-6 py-3.5 text-left font-medium">Actor</th>
                  <th className="px-6 py-3.5 text-left font-medium">Action</th>
                  <th className="px-6 py-3.5 text-left font-medium">Target</th>
                  <th className="px-6 py-3.5 text-left font-medium">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {auditLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-muted/30 transition">
                    <td className="px-6 py-3.5 text-muted-foreground">{l.at}</td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-soft text-primary">
                          <ShieldAlert className="h-3.5 w-3.5" />
                        </span>
                        <span className="font-medium text-foreground">{l.actor}</span>
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-foreground">{l.action}</td>
                    <td className="px-6 py-3.5 text-muted-foreground">{l.target}</td>
                    <td className="px-6 py-3.5 font-mono text-xs text-muted-foreground">{l.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </PageBody>
    </>
  );
}

export default AuditLogs;
