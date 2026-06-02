import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, CalendarDays, Clock, User, Loader2 } from 'lucide-react';
import { PageHeader, PageBody } from '@/components/PageHeader';
import doctorService from '@/services/doctorService';
import appointmentService from '@/services/appointmentService';
import authService from '@/services/authService';

const BookAppointment = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (!user || user.role !== 'PATIENT') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const [step, setStep] = useState(0);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const steps = ["Doctor", "Slot", "Confirm"];

  useEffect(() => { fetchDoctors(); }, []);

  const fetchDoctors = async () => {
    try { setLoading(true); const data = await doctorService.getAllDoctors(); setDoctors(data); }
    catch { setError('Failed to load doctors.'); }
    finally { setLoading(false); }
  };

  const fetchSlots = async (doctorId, doc) => {
    try {
      setLoading(true);
      console.log("Selected Doctor", doc);
      const data = await doctorService.getDoctorSlots(doctorId);
      console.log("Slots Response", data);
      setSlots(data || []);
    } catch {
      setError('Failed to load slots.');
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDoctor = (doc) => { setSelectedDoctor(doc); setSelectedSlot(null); fetchSlots(doc.id, doc); setStep(1); };
  const handleSelectSlot = (slot) => { setSelectedSlot(slot); setStep(2); };

  const handleBook = async () => {
    try {
      setBookingLoading(true); setError('');
      await appointmentService.bookAppointment(selectedDoctor.id, selectedSlot.id, user.id);
      setSuccess('Appointment booked successfully!');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Booking failed.');
    } finally { setBookingLoading(false); }
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'DR';

  return (
    <>
      <PageHeader title="Book appointment" subtitle="Schedule a new consultation" />
      <PageBody>
        <div className="mx-auto max-w-4xl">
          {/* Stepper */}
          <ol className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-card">
            {steps.map((s, i) => (
              <li key={s} className="flex flex-1 items-center gap-3">
                <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <span className={`text-sm font-medium ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
                {i < steps.length - 1 ? <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" /> : null}
              </li>
            ))}
          </ol>

          {success ? (
            <div className="mt-6 rounded-2xl border border-success/30 bg-success/10 p-8 text-center shadow-card">
              <Check className="h-12 w-12 mx-auto text-success mb-3" />
              <h3 className="text-lg font-semibold text-success">{success}</h3>
              <p className="mt-2 text-sm text-muted-foreground">Your appointment has been confirmed.</p>
              <div className="mt-6 flex justify-center gap-3">
                <button onClick={() => { setSuccess(''); setSelectedDoctor(null); setSelectedSlot(null); setStep(0); fetchDoctors(); }}
                  className="h-10 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition shadow-sm cursor-pointer">
                  Book another appointment
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-card">
              {error && <div className="mb-4 rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">{error}</div>}

              {step === 0 && (
                <>
                  <h2 className="text-lg font-semibold">Choose a doctor</h2>
                  <p className="text-xs text-muted-foreground">Browse our specialists</p>
                  {loading ? (
                    <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                  ) : (
                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {doctors.map((d) => (
                        <button key={d.id} onClick={() => handleSelectDoctor(d)}
                          className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${selectedDoctor?.id === d.id ? "border-primary bg-primary-soft" : "border-border hover:border-primary/40"}`}>
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-hero text-xs font-semibold text-primary-foreground shrink-0">{getInitials(d.name)}</div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold">{d.name}</p>
                            <p className="text-xs text-muted-foreground">{d.specialization}</p>
                          </div>
                          {selectedDoctor?.id === d.id && <Check className="h-4 w-4 text-primary" />}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {step === 1 && (
                <>
                  <h2 className="text-lg font-semibold">Select a time slot</h2>
                  <p className="text-xs text-muted-foreground">Available slots for {selectedDoctor?.name}</p>
                  {loading ? (
                    <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                  ) : slots.length === 0 ? (
                    <div className="mt-5 text-center py-8 text-muted-foreground">
                      <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No available slots for this doctor.</p>
                    </div>
                  ) : (
                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {slots.map((s) => (
                        <button key={s.id} onClick={() => handleSelectSlot(s)}
                          className={`rounded-xl border p-3 text-center transition cursor-pointer ${selectedSlot?.id === s.id ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/40"}`}>
                          <p className="text-sm font-medium">{s.slotDate}</p>
                          <p className="text-lg font-bold">{s.slotTime}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {step === 2 && (
                <>
                  <h2 className="text-lg font-semibold">Confirm appointment</h2>
                  <p className="text-xs text-muted-foreground">Review and confirm your booking</p>
                  <div className="mt-5 space-y-3">
                    <Row icon={User} label="Doctor" value={`${selectedDoctor?.name} · ${selectedDoctor?.specialization}`} />
                    <Row icon={CalendarDays} label="Date" value={selectedSlot?.slotDate} />
                    <Row icon={Clock} label="Time" value={selectedSlot?.slotTime} />
                  </div>
                </>
              )}

              {/* Navigation */}
              <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                <button disabled={step === 0} onClick={() => setStep(s => s - 1)}
                  className="h-10 rounded-xl border border-border px-4 text-sm font-medium hover:bg-muted disabled:opacity-40 transition">Back</button>
                {step === 2 ? (
                  <button onClick={handleBook} disabled={bookingLoading}
                    className="flex h-10 items-center gap-2 rounded-xl bg-emerald px-4 text-sm font-medium text-emerald-foreground hover:bg-emerald/90 disabled:opacity-60 transition">
                    {bookingLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Confirm booking
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </PageBody>
    </>
  );
};

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary"><Icon className="h-4 w-4" /></span>
      <div><p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p><p className="text-sm font-semibold">{value}</p></div>
    </div>
  );
}

export default BookAppointment;
