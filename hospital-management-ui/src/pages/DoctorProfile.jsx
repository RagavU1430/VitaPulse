import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Mail, Phone, ArrowLeft, CalendarCheck, CheckCircle2, CalendarClock, Award, XCircle, Loader2 } from 'lucide-react';
import { PageBody, StatusPill } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import authService from '@/services/authService';
import API from '@/services/api';

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const userRole = currentUser?.role;

  const [doctor, setDoctor] = useState(null);
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => { fetchDoctorProfile(); }, [id]);

  const fetchDoctorProfile = async () => {
    try {
      setLoading(true); setError(''); setUnauthorized(false);
      const docRes = await API.get(`/doctors/${id}`);
      const doctorData = docRes.data;
      if (userRole === 'DOCTOR' && doctorData.email !== currentUser.email) { setUnauthorized(true); setLoading(false); return; }
      setDoctor(doctorData);
      const [statsRes, patientsRes] = await Promise.all([
        API.get(`/doctors/${id}/statistics`).catch(() => ({ data: null })),
        API.get(`/doctors/${id}/patients`).catch(() => ({ data: [] }))
      ]);
      if (statsRes.data) setStats(statsRes.data);
      setPatients(patientsRes.data || []);
    } catch (err) {
      if (err.response?.status === 404) setError('Doctor profile not found.');
      else if (err.response?.status === 403) setUnauthorized(true);
      else setError('Unable to load doctor profile.');
    } finally { setLoading(false); }
  };

  const getInitials = (name) => name ? name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'DR';

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-3 text-sm text-muted-foreground">Loading doctor profile...</p>
    </div>
  );

  if (unauthorized) return (
    <PageBody><div className="rounded-2xl bg-danger/10 border border-danger/20 p-8 text-center">
      <XCircle className="h-12 w-12 mx-auto text-danger mb-3" />
      <h3 className="text-lg font-semibold">Access Denied</h3>
      <p className="mt-1 text-sm text-muted-foreground">You are not authorized to view this profile.</p>
    </div></PageBody>
  );

  if (error) return (
    <PageBody><div className="rounded-2xl bg-warning/10 border border-warning/20 p-8 text-center">
      <h3 className="text-lg font-semibold">{error}</h3>
    </div></PageBody>
  );

  return (
    <>
      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-hero">
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "radial-gradient(circle at 30% 30%, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="relative px-6 py-8 md:px-8 md:py-12">
          <Link to="/doctors" className="inline-flex items-center gap-1 text-xs text-primary-foreground/80 hover:text-primary-foreground transition">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to doctors
          </Link>
          <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="flex items-end gap-5">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-xl font-bold text-primary ring-4 ring-white/30 shrink-0">
                {getInitials(doctor?.name)}
              </div>
              <div className="text-primary-foreground">
                <div className="flex items-center gap-2 text-xs opacity-90">
                  <span className="rounded-full bg-white/20 px-2 py-0.5 backdrop-blur">{doctor?.doctorCode || `DR${String(doctor?.id).padStart(6, '0')}`}</span>
                  <span className="inline-flex items-center gap-1"><Award className="h-3 w-3" /> {doctor?.experience} years</span>
                </div>
                <h1 className="mt-1 text-3xl font-bold md:text-4xl">{doctor?.name}</h1>
                <p className="mt-1 text-sm opacity-90">{doctor?.specialization}</p>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs opacity-90">
                  {doctor?.email && <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{doctor.email}</span>}
                  {doctor?.phone && <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{doctor.phone}</span>}
                </div>
              </div>
            </div>
            {userRole === 'PATIENT' && (
              <div className="flex gap-2">
                <button onClick={() => navigate('/book-appointment')} className="h-10 rounded-xl bg-white px-4 text-sm font-medium text-primary hover:bg-white/90 transition cursor-pointer">Book appointment</button>
              </div>
            )}
          </div>
        </div>
      </section>

      <PageBody>
        {/* Stats */}
        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Total Appointments" value={stats?.totalAppointments ?? 0} icon={CalendarCheck} tone="primary" />
          <StatCard label="Completed" value={stats?.completedAppointments ?? 0} icon={CheckCircle2} tone="emerald" />
          <StatCard label="Cancelled" value={stats?.cancelledAppointments ?? 0} icon={XCircle} tone="danger" />
          <StatCard label="Available Slots" value={stats?.availableSlots ?? 0} icon={CalendarClock} tone="teal" />
        </section>

        {/* Patients Table */}
        <section className="mt-6">
          <div className="rounded-2xl border border-border bg-card shadow-card">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold">Recent patients</h2>
              <p className="text-xs text-muted-foreground">Patients who have booked appointments</p>
            </div>
            {patients.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-muted-foreground">
                <CalendarCheck className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No patients have scheduled appointments yet.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">Patient Code</th>
                    <th className="px-6 py-3 text-left font-medium">Patient Name</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((pat, i) => (
                    <tr key={i} className="border-t border-border/60 hover:bg-muted/30 transition">
                      <td className="px-6 py-3 font-mono text-xs text-primary font-semibold">{pat.patientCode}</td>
                      <td className="px-6 py-3 font-medium">{pat.patientName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </PageBody>
    </>
  );
};

export default DoctorProfile;
