import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, CalendarCheck, Loader2 } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import { PageHeader, PageBody } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import appointmentService from '@/services/appointmentService';

const COLORS = ['oklch(0.52 0.15 245)', 'oklch(0.72 0.13 185)', 'oklch(0.73 0.18 145)', 'oklch(0.78 0.15 75)', 'oklch(0.62 0.22 25)'];

const Reports = () => {
  const [summary, setSummary] = useState(null);
  const [topDoctors, setTopDoctors] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryData, topData, trendData] = await Promise.all([
        appointmentService.getReportsSummary().catch(() => null),
        appointmentService.getTopDoctors().catch(() => []),
        appointmentService.getMonthlyTrend().catch(() => [])
      ]);
      setSummary(summaryData);
      setTopDoctors(topData || []);
      setMonthlyTrend(trendData || []);
    } catch { setError('Failed to load reports.'); }
    finally { setLoading(false); }
  };

  const pieData = summary ? [
    { name: 'Booked', value: summary.bookedAppointments || 0 },
    { name: 'Completed', value: summary.completedAppointments || 0 },
    { name: 'Cancelled', value: summary.cancelledAppointments || 0 },
  ].filter(d => d.value > 0) : [];

  return (
    <>
      <PageHeader title="Reports & Analytics" subtitle="System-wide health metrics and performance data" />
      <PageBody>
        {error && <div className="mb-4 rounded-xl bg-warning/10 border border-warning/20 px-4 py-3 text-sm text-warning-foreground">{error}</div>}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <>
            {/* Summary Stats */}
            <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard label="Total Appointments" value={summary?.totalAppointments ?? 0} icon={CalendarCheck} tone="primary" />
              <StatCard label="Completed" value={summary?.completedAppointments ?? 0} icon={TrendingUp} tone="emerald" />
              <StatCard label="Total Doctors" value={summary?.totalDoctors ?? 0} icon={Users} tone="teal" />
              <StatCard label="Total Patients" value={summary?.totalPatients ?? 0} icon={Users} tone="warning" />
            </section>

            {/* Charts Grid */}
            <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Monthly Trend */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <h3 className="text-lg font-semibold">Monthly trend</h3>
                <p className="text-xs text-muted-foreground">Appointment volume over time</p>
                <div className="mt-5 h-64">
                  {monthlyTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyTrend}>
                        <defs>
                          <linearGradient id="color1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="oklch(0.52 0.15 245)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="oklch(0.52 0.15 245)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 240)" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="count" stroke="oklch(0.52 0.15 245)" fill="url(#color1)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground"><p className="text-sm">No trend data available.</p></div>
                  )}
                </div>
              </div>

              {/* Status Distribution */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <h3 className="text-lg font-semibold">Status distribution</h3>
                <p className="text-xs text-muted-foreground">Appointment outcomes breakdown</p>
                <div className="mt-5 h-64">
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                          {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Legend />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground"><p className="text-sm">No data available.</p></div>
                  )}
                </div>
              </div>
            </section>

            {/* Top Doctors Table */}
            <section className="mt-6">
              <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
                <div className="border-b border-border px-6 py-4">
                  <h3 className="text-lg font-semibold">Top doctors</h3>
                  <p className="text-xs text-muted-foreground">By appointment volume</p>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium">#</th>
                      <th className="px-6 py-3 text-left font-medium">Doctor</th>
                      <th className="px-6 py-3 text-left font-medium">Specialization</th>
                      <th className="px-6 py-3 text-right font-medium">Appointments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topDoctors.length === 0 ? (
                      <tr><td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">No data available.</td></tr>
                    ) : (
                      topDoctors.map((d, i) => (
                        <tr key={i} className="border-t border-border/60 hover:bg-muted/30 transition">
                          <td className="px-6 py-3 font-medium text-muted-foreground">{i + 1}</td>
                          <td className="px-6 py-3 font-semibold">{d.doctorName}</td>
                          <td className="px-6 py-3 text-muted-foreground">{d.specialization || '—'}</td>
                          <td className="px-6 py-3 text-right font-bold text-primary">{d.appointmentCount}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </PageBody>
    </>
  );
};

export default Reports;
