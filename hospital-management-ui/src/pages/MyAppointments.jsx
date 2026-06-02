import { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Download, X, Eye, Loader2, CalendarCheck } from 'lucide-react';
import { PageHeader, PageBody, StatusPill } from '@/components/PageHeader';
import appointmentService from '@/services/appointmentService';
import authService from '@/services/authService';

const MyAppointments = () => {
  const user = authService.getCurrentUser();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchAppointments(); }, []);
  useEffect(() => { if (success) { const t = setTimeout(() => setSuccess(''), 4000); return () => clearTimeout(t); } }, [success]);

  const fetchAppointments = async () => {
    try { setLoading(true); setError('');
      const data = user?.id ? await appointmentService.getAppointmentsByPatient(user.id) : await appointmentService.getAllAppointments();
      setAppointments(data || []);
    } catch { setError('Failed to load appointments.'); }
    finally { setLoading(false); }
  };

  const handleCancel = async (id) => {
    try { await appointmentService.cancelAppointment(id); setSuccess('Appointment cancelled.'); fetchAppointments(); }
    catch { setError('Failed to cancel appointment.'); }
  };

  const handleDownloadReceipt = async (id) => {
    try {
      const blob = await appointmentService.downloadReceipt(id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement('a'); a.href = url; a.download = `receipt-${id}.pdf`; a.click();
      window.URL.revokeObjectURL(url);
    } catch { setError('Failed to download receipt.'); }
  };

  return (
    <>
      <PageHeader title="My appointments" subtitle="Upcoming and past consultations" />
      <PageBody>
        {success && <div className="mb-4 rounded-xl bg-success/10 border border-success/20 px-4 py-3 text-sm text-success">{success}</div>}
        {error && <div className="mb-4 rounded-xl bg-warning/10 border border-warning/20 px-4 py-3 text-sm text-warning-foreground">{error}</div>}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-border">
            <CalendarCheck className="h-12 w-12 text-muted-foreground/40" />
            <h4 className="mt-4 text-lg font-semibold text-muted-foreground">No appointments found</h4>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((a) => (
              <div key={a.id} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-card md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-primary-soft text-primary shrink-0">
                    <span className="text-[10px] font-medium uppercase">{a.appointmentDate?.slice(5, 7)}/{a.appointmentDate?.slice(8, 10)}</span>
                    <span className="text-lg font-bold leading-none">{a.appointmentTime}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold">Dr. {a.doctorName || `Doctor #${a.doctorId}`}</h3>
                      <StatusPill status={a.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">Patient: {a.patientName || `Patient #${a.patientId}`}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {a.appointmentDate}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {a.appointmentTime}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {a.status === 'COMPLETED' && (
                    <button onClick={() => handleDownloadReceipt(a.id)} className="flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-sm hover:bg-muted transition">
                      <Download className="h-3.5 w-3.5" /> Receipt
                    </button>
                  )}
                  {(a.status === 'BOOKED' || a.status === 'SCHEDULED') && (
                    <button onClick={() => handleCancel(a.id)} className="flex h-9 items-center gap-1 rounded-lg border border-danger/30 px-3 text-sm text-danger hover:bg-danger/10 transition">
                      <X className="h-3.5 w-3.5" /> Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </PageBody>
    </>
  );
};

export default MyAppointments;
