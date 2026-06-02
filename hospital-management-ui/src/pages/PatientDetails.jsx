import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, CalendarCheck, Activity, FileText, Pill, Loader2, Download } from 'lucide-react';
import { PageBody, StatusPill } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import patientService from '@/services/patientService';
import appointmentService from '@/services/appointmentService';

const PatientDetails = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true); setError('');
      console.log("Patient ID:", id);
      const [patData, statsData, apptsData] = await Promise.all([
        patientService.getPatientDetails(id),
        patientService.getPatientStats(id).catch((err) => {
          console.error("Error loading patient stats:", err);
          return null;
        }),
        patientService.getPatientAppointments(id).catch((err) => {
          console.error("Error loading patient appointments:", err);
          return [];
        })
      ]);
      setPatient(patData);
      setStats(statsData);
      setAppointments(apptsData || []);
    } catch (err) {
      console.error("Error loading patient details:", err);
      setError(err.response?.data?.message || err.message || 'Unable to load patient details.');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'PT';

  const handleDownloadReceipt = async (apptId) => {
    try {
      const blob = await appointmentService.downloadReceipt(apptId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement('a'); a.href = url; a.download = `receipt-${apptId}.pdf`; a.click();
      window.URL.revokeObjectURL(url);
    } catch { alert('Failed to download receipt.'); }
  };

  if (loading) return <div className="flex flex-col items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="mt-3 text-sm text-muted-foreground">Loading patient details...</p></div>;
  if (error) return <PageBody><div className="rounded-2xl bg-warning/10 border border-warning/20 p-8 text-center"><h3 className="text-lg font-semibold">{error}</h3></div></PageBody>;

  return (
    <>
      <section className="border-b border-border bg-card">
        <div className="px-6 py-6 md:px-8 md:py-8">
          <Link to="/patients" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition"><ArrowLeft className="h-3.5 w-3.5" /> Back to patients</Link>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-emerald text-xl font-bold text-emerald-foreground shrink-0">{getInitials(patient?.name)}</div>
              <div>
                <div className="flex items-center gap-2"><h1 className="text-2xl font-bold md:text-3xl">{patient?.name}</h1><StatusPill status={patient?.status || 'Active'} /></div>
                <p className="text-sm text-muted-foreground">{patient?.patientCode || `PT${String(patient?.id).padStart(6, '0')}`}</p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  {patient?.email && <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{patient.email}</span>}
                  {patient?.phone && <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{patient.phone}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PageBody>
        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Total Visits" value={stats?.totalAppointments ?? appointments.length} icon={CalendarCheck} tone="primary" />
          <StatCard label="Completed" value={stats?.completedAppointments ?? 0} icon={Activity} tone="emerald" />
          <StatCard label="Cancelled" value={stats?.cancelledAppointments ?? 0} icon={FileText} tone="danger" />
          <StatCard label="Active" value={stats?.activeAppointments ?? 0} icon={Pill} tone="teal" />
        </section>

        <section className="mt-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-lg font-semibold">Appointment history</h2>
            <p className="text-xs text-muted-foreground">Timeline of medical activity</p>
            {appointments.length === 0 ? (
              <div className="mt-6 text-center text-muted-foreground py-8"><CalendarCheck className="h-8 w-8 mx-auto mb-2 opacity-40" /><p className="text-sm">No appointment history yet.</p></div>
            ) : (
              <ol className="relative mt-5 border-l-2 border-border pl-5 space-y-6">
                {appointments.map((a) => (
                  <li key={a.id} className="relative">
                    <span className="absolute -left-[1.6rem] flex h-3 w-3 rounded-full bg-primary ring-4 ring-card" />
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Dr. {a.doctorName || `Doctor #${a.doctorId}`}</p>
                      <div className="flex items-center gap-2">
                        <StatusPill status={a.status} />
                        {a.status === 'COMPLETED' && (
                          <button onClick={() => handleDownloadReceipt(a.id)} className="flex h-7 w-7 items-center justify-center rounded-lg text-primary hover:bg-muted transition" title="Download receipt">
                            <Download className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{a.appointmentDate} at {a.appointmentTime}</p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
      </PageBody>
    </>
  );
};

export default PatientDetails;
