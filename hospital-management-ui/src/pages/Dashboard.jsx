import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users, Stethoscope, CalendarCheck, CalendarClock, Activity,
  FileBarChart, UserPlus, CalendarPlus, ArrowUpRight, Sparkles, Send, Loader2
} from 'lucide-react';
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { PageBody, StatusPill } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import authService from '@/services/authService';
import doctorService from '@/services/doctorService';
import patientService from '@/services/patientService';
import appointmentService from '@/services/appointmentService';
import API from '@/services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const role = user?.role;

  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [doctorMap, setDoctorMap] = useState({});

  // AI assistant state
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'ai', text: 'Hello! I am your VitaPulse AI Assistant. How can I assist you with clinical navigation, symptom summaries, or appointment processes today?' }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, chatLoading]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [statsData, apptsData, docsData, patsData] = await Promise.all([
        appointmentService.getDashboardStats().catch(() => null),
        appointmentService.getAllAppointments().catch(() => []),
        doctorService.getAllDoctors().catch(() => []),
        role === 'ADMIN' ? patientService.getAllPatients().catch(() => []) : Promise.resolve([]),
      ]);

      if (statsData) {
        setStats(statsData);
      } else {
        setStats({
          totalDoctors: docsData?.length || 0,
          totalPatients: patsData?.length || 0,
          totalAppointments: apptsData?.length || 0,
          availableSlots: 0,
        });
      }

      setAppointments(apptsData || []);
      const dMap = {};
      (docsData || []).forEach(doc => { dMap[doc.id] = doc.name; });
      setDoctorMap(dMap);
    } catch {
      setError('Could not retrieve dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMessage = chatInput;
    setChatHistory(prev => [...prev, { sender: 'user', text: userMessage }]);
    setChatInput('');
    setChatLoading(true);
    try {
      const response = await API.post('/ai/chat', { message: userMessage });
      const reply = response.data?.reply || 'No response received.';
      
      // Simulate word-by-word typing speed effect
      let currentText = '';
      const words = reply.split(' ');
      let wordIndex = 0;
      
      setChatHistory(prev => [...prev, { sender: 'ai', text: '' }]);
      
      const interval = setInterval(() => {
        if (wordIndex < words.length) {
          currentText += (wordIndex === 0 ? '' : ' ') + words[wordIndex];
          setChatHistory(prev => {
            const next = [...prev];
            next[next.length - 1] = { sender: 'ai', text: currentText };
            return next;
          });
          wordIndex++;
        } else {
          clearInterval(interval);
          setChatLoading(false);
        }
      }, 30);
    } catch {
      setChatLoading(false);
      setChatHistory(prev => [...prev, { sender: 'ai', text: 'Error: Unable to connect to AI Assistant.' }]);
    }
  };

  const recentAppointments = [...appointments].sort((a, b) => b.id - a.id).slice(0, 6);

  const today = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <>
      {/* Hero Banner */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-hero opacity-95" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative px-6 py-10 md:px-8 md:py-14">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="text-primary-foreground">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
                <Activity className="h-3.5 w-3.5" />
                {dayNames[today.getDay()]}, {monthNames[today.getMonth()]} {today.getDate()} {today.getFullYear()}
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                Welcome back{user?.name ? `, ${user.name}` : ''}
              </h1>
              <p className="mt-2 max-w-xl text-sm opacity-90 md:text-base">
                Healthcare operations are running smoothly. Monitor your clinical overview and manage appointments efficiently.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {role === 'PATIENT' && (
                  <button
                    onClick={() => navigate('/book-appointment')}
                    className="flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-medium text-primary hover:bg-white/90 transition cursor-pointer"
                  >
                    <CalendarPlus className="h-4 w-4" /> New appointment
                  </button>
                )}
                <button
                  onClick={fetchData}
                  className="flex h-10 items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-4 text-sm font-medium text-primary-foreground hover:bg-white/20 transition cursor-pointer"
                >
                  <FileBarChart className="h-4 w-4" /> Refresh data
                </button>
              </div>
            </div>
            {!loading && stats && (
              <div className="hidden grid-cols-3 gap-3 md:grid">
                {[
                  { l: "Doctors", v: stats.totalDoctors ?? 0 },
                  { l: "Appointments", v: stats.totalAppointments ?? 0 },
                  { l: "Slots", v: stats.availableSlots ?? 0 },
                ].map((k) => (
                  <div key={k.l} className="rounded-2xl bg-white/15 px-4 py-3 text-primary-foreground backdrop-blur">
                    <p className="text-[11px] opacity-80">{k.l}</p>
                    <p className="text-2xl font-bold">{k.v}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <PageBody>
        {error && (
          <div className="mb-6 rounded-xl bg-warning/10 border border-warning/20 px-4 py-3 text-sm text-warning-foreground">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              <StatCard label="Total Doctors" value={stats?.totalDoctors ?? 0} icon={Stethoscope} tone="primary" />
              {role === 'ADMIN' && (
                <StatCard label="Total Patients" value={stats?.totalPatients ?? 0} icon={Users} tone="teal" />
              )}
              <StatCard label="Appointments" value={stats?.totalAppointments ?? 0} icon={CalendarCheck} tone="emerald" />
              <StatCard label="Available Slots" value={stats?.availableSlots ?? 0} icon={CalendarClock} tone="primary" />
            </section>

            {/* Main Grid */}
            <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Recent Appointments Table */}
              <div className="rounded-2xl border border-border bg-card shadow-card lg:col-span-2">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                  <div>
                    <h2 className="text-lg font-semibold">Recent appointments</h2>
                    <p className="text-xs text-muted-foreground">Latest activity</p>
                  </div>
                  <Link to="/appointments" className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition">
                    View all <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-6 py-3 text-left font-medium">Appt ID</th>
                        <th className="px-6 py-3 text-left font-medium">Patient</th>
                        <th className="px-6 py-3 text-left font-medium">Doctor</th>
                        <th className="px-6 py-3 text-left font-medium">Date / Time</th>
                        <th className="px-6 py-3 text-left font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAppointments.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-10 text-center text-muted-foreground">
                            <CalendarCheck className="h-8 w-8 mx-auto mb-2 opacity-40" />
                            No appointments scheduled.
                          </td>
                        </tr>
                      ) : (
                        recentAppointments.map((appt) => (
                          <tr key={appt.id} className="border-t border-border/60 hover:bg-muted/30 transition">
                            <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                              AP{String(appt.id).padStart(6, '0')}
                            </td>
                            <td className="px-6 py-3">
                              <p className="font-medium">{appt.patientName || 'Patient'}</p>
                              <p className="text-xs text-muted-foreground">{appt.patientCode || `PT${String(appt.patientId).padStart(6, '0')}`}</p>
                            </td>
                            <td className="px-6 py-3">
                              <p className="font-medium">Dr. {appt.doctorName || doctorMap[appt.doctorId] || `#${appt.doctorId}`}</p>
                            </td>
                            <td className="px-6 py-3">
                              <p className="font-medium">{appt.appointmentDate}</p>
                              <p className="text-xs text-muted-foreground">{appt.appointmentTime}</p>
                            </td>
                            <td className="px-6 py-3">
                              <StatusPill status={appt.status} />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* AI Assistant */}
              <div className="rounded-2xl border border-border bg-card shadow-card flex flex-col">
                <div className="flex items-center justify-between border-b border-border bg-gradient-emerald rounded-t-2xl px-5 py-4">
                  <div className="flex items-center gap-2 text-emerald-foreground">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">VitaPulse Copilot</p>
                      <p className="text-[11px] opacity-90">Powered by Gemini AI</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-emerald-foreground">Online</span>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-3" style={{ maxHeight: '280px', minHeight: '200px' }}>
                  {chatHistory.map((chat, idx) => (
                    <div key={idx} className={chat.sender === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                      <div className={`max-w-[85%] rounded-xl px-3 py-2.5 text-sm ${
                        chat.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}>
                        <p className="whitespace-pre-line">{chat.text}</p>
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-xl px-4 py-3 flex gap-1">
                        <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Suggestions */}
                <div className="flex flex-wrap gap-1.5 px-5 pb-3">
                  {[
                    "How do I book?",
                    "Heart pain specialist?",
                    "What can you do?"
                  ].map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={chatLoading}
                      onClick={() => setChatInput(s)}
                      className="rounded-full bg-muted hover:bg-primary-soft hover:text-primary border border-border/80 px-2.5 py-1 text-[11px] text-muted-foreground transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSendChat} className="flex items-center gap-2 border-t border-border p-3">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask Copilot anything…"
                    disabled={chatLoading}
                    className="h-10 flex-1 rounded-xl border border-border bg-muted/50 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition"
                  />
                  <button
                    type="submit"
                    disabled={chatLoading}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </section>

            {/* Quick Actions */}
            <section className="mt-6">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <h3 className="text-sm font-semibold">Quick actions</h3>
                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    { l: "Book Appointment", i: CalendarPlus, c: "bg-primary-soft text-primary", to: "/book-appointment", roles: ['PATIENT'] },
                    { l: "View Doctors", i: Stethoscope, c: "bg-teal-soft text-teal", to: "/doctors", roles: ['PATIENT', 'ADMIN'] },
                    { l: "My Appointments", i: CalendarCheck, c: "bg-accent text-emerald", to: "/my-appointments", roles: ['PATIENT'] },
                    { l: "Appointment Mgmt", i: CalendarClock, c: "bg-teal-soft text-teal", to: "/appointments", roles: ['DOCTOR', 'ADMIN'] },
                    { l: "Reports", i: FileBarChart, c: "bg-warning/15 text-warning-foreground", to: "/reports", roles: ['ADMIN'] },
                  ].filter(q => q.roles.includes(role)).map((q) => (
                    <button
                      key={q.l}
                      onClick={() => navigate(q.to)}
                      className="flex flex-col items-start gap-2 rounded-xl border border-border bg-card p-3 text-left transition hover:border-primary/40 hover:shadow-soft cursor-pointer"
                    >
                      <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${q.c}`}>
                        <q.i className="h-4 w-4" />
                      </span>
                      <span className="text-sm font-medium">{q.l}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </PageBody>
    </>
  );
};

export default Dashboard;
