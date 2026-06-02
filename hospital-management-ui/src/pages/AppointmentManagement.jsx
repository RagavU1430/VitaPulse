import { useEffect, useState } from 'react';
import { Filter, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { PageHeader, PageBody, StatusPill } from '@/components/PageHeader';
import appointmentService from '@/services/appointmentService';
import doctorService from '@/services/doctorService';
import authService from '@/services/authService';

const AppointmentManagement = () => {
  const user = authService.getCurrentUser();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { if (success) { const t = setTimeout(() => setSuccess(''), 4000); return () => clearTimeout(t); } }, [success]);

  const fetchData = async () => {
    try { setLoading(true); setError('');
      const [apptsData, docsData] = await Promise.all([
        user?.role === 'DOCTOR' && user?.id ? appointmentService.getAppointmentsByDoctor(user.id) : appointmentService.getAllAppointments(),
        doctorService.getAllDoctors().catch(() => [])
      ]);
      setAppointments(apptsData || []); setDoctors(docsData || []);
    } catch { setError('Failed to load appointments.'); }
    finally { setLoading(false); }
  };

  const handleComplete = async (id) => {
    try { await appointmentService.completeAppointment(id); setSuccess('Appointment completed!'); fetchData(); }
    catch { setError('Failed to complete appointment.'); }
  };

  const handleCancel = async (id) => {
    try { await appointmentService.cancelAppointment(id); setSuccess('Appointment cancelled.'); fetchData(); }
    catch { setError('Failed to cancel appointment.'); }
  };

  const getDoctorName = (id) => doctors.find(d => d.id === id)?.name || `Doctor #${id}`;
  const filtered = statusFilter ? appointments.filter(a => a.status === statusFilter) : appointments;

  return (
    <>
      <PageHeader title="Appointment management" subtitle="Operational overview of all consultations"
        actions={
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20">
            <option value="">All statuses</option>
            <option value="BOOKED">Booked</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        }
      />
      <PageBody>
        {success && <div className="mb-4 rounded-xl bg-success/10 border border-success/20 px-4 py-3 text-sm text-success">{success}</div>}
        {error && <div className="mb-4 rounded-xl bg-warning/10 border border-warning/20 px-4 py-3 text-sm text-warning-foreground">{error}</div>}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">ID</th>
                    <th className="px-6 py-3 text-left font-medium">Patient</th>
                    <th className="px-6 py-3 text-left font-medium">Doctor</th>
                    <th className="px-6 py-3 text-left font-medium">Date / Time</th>
                    <th className="px-6 py-3 text-left font-medium">Status</th>
                    <th className="px-6 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan="6" className="px-6 py-10 text-center text-muted-foreground">No appointments found.</td></tr>
                  ) : (
                    filtered.map((a) => (
                      <tr key={a.id} className="border-t border-border/60 hover:bg-muted/30 transition">
                        <td className="px-6 py-3 font-mono text-xs text-muted-foreground">AP{String(a.id).padStart(6, '0')}</td>
                        <td className="px-6 py-3">
                          <p className="font-medium">{a.patientName || `Patient #${a.patientId}`}</p>
                          <p className="text-xs text-muted-foreground">{a.patientCode || `PT${String(a.patientId).padStart(6, '0')}`}</p>
                        </td>
                        <td className="px-6 py-3">
                          <p className="font-medium">Dr. {a.doctorName || getDoctorName(a.doctorId)}</p>
                        </td>
                        <td className="px-6 py-3 text-muted-foreground">{a.appointmentDate}<br /><span className="text-foreground font-medium">{a.appointmentTime}</span></td>
                        <td className="px-6 py-3"><StatusPill status={a.status} /></td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            {(a.status === 'BOOKED' || a.status === 'SCHEDULED') && (
                              <>
                                <button onClick={() => handleComplete(a.id)} className="flex h-8 items-center gap-1 rounded-lg bg-success/10 px-2 text-xs font-medium text-success hover:bg-success/20 transition" title="Complete">
                                  <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                                </button>
                                <button onClick={() => handleCancel(a.id)} className="flex h-8 items-center gap-1 rounded-lg bg-danger/10 px-2 text-xs font-medium text-danger hover:bg-danger/20 transition" title="Cancel">
                                  <XCircle className="h-3.5 w-3.5" /> Cancel
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </PageBody>
    </>
  );
};

export default AppointmentManagement;
