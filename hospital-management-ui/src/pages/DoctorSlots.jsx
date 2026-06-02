import { useEffect, useState } from 'react';
import { Plus, Filter, CalendarClock, X, Loader2, Pencil, Trash2 } from 'lucide-react';
import { PageHeader, PageBody, StatusPill } from '@/components/PageHeader';
import appointmentService from '@/services/appointmentService';
import doctorService from '@/services/doctorService';

const DoctorSlots = () => {
  const [slots, setSlots] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({ doctorId: '', date: '', time: '', duration: 30 });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingSlot, setDeletingSlot] = useState(null);

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { if (success) { const t = setTimeout(() => setSuccess(''), 4000); return () => clearTimeout(t); } }, [success]);

  const fetchData = async () => {
    try { setLoading(true); const [slotsData, docsData] = await Promise.all([appointmentService.getSlots(), doctorService.getAllDoctors()]); setSlots(slotsData || []); setDoctors(docsData || []); }
    catch { setError('Failed to load slots.'); }
    finally { setLoading(false); }
  };

  const getDoctorName = (id) => doctors.find(d => d.id === id)?.name || `Doctor #${id}`;

  const openAddModal = () => { setEditingSlot(null); setFormData({ doctorId: doctors[0]?.id || '', date: '', time: '', duration: 30 }); setShowModal(true); };
  const openEditModal = (slot) => { setEditingSlot(slot); setFormData({ doctorId: slot.doctorId, date: slot.slotDate, time: slot.slotTime, duration: slot.duration || 30 }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const payload = {
        doctorId: formData.doctorId,
        slotDate: formData.date,
        slotTime: formData.time.length === 5 ? `${formData.time}:00` : formData.time
      };
      if (editingSlot) { await appointmentService.updateSlot(editingSlot.id, payload); setSuccess('Slot updated!'); }
      else { await appointmentService.createSlot(payload); setSuccess('Slot created!'); }
      setShowModal(false); fetchData();
    } catch { setError('Failed to save slot.'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    try { setFormLoading(true); await appointmentService.deleteSlot(deletingSlot.id); setSuccess('Slot deleted!'); setShowDeleteModal(false); fetchData(); }
    catch { setError('Failed to delete slot.'); }
    finally { setFormLoading(false); }
  };

  return (
    <>
      <PageHeader title="Doctor slots" subtitle="Manage availability across all specialists"
        actions={
          <button onClick={openAddModal} className="flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition">
            <Plus className="h-4 w-4" /> Create slot
          </button>
        }
      />
      <PageBody>
        {success && <div className="mb-4 rounded-xl bg-success/10 border border-success/20 px-4 py-3 text-sm text-success">{success}</div>}
        {error && <div className="mb-4 rounded-xl bg-warning/10 border border-warning/20 px-4 py-3 text-sm text-warning-foreground">{error}</div>}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {slots.map((s) => (
              <div key={s.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="flex items-start justify-between">
                  <div><p className="text-sm font-semibold">{getDoctorName(s.doctorId)}</p><p className="text-xs text-muted-foreground">{s.slotDate}</p></div>
                  <StatusPill status={s.available ? "Available" : "Booked"} />
                </div>
                <div className="mt-5 flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary"><CalendarClock className="h-5 w-5" /></span>
                  <div><p className="text-2xl font-bold">{s.slotTime}</p><p className="text-xs text-muted-foreground">{s.duration || 30} min session</p></div>
                </div>
                <div className="mt-5 flex gap-2">
                  <button onClick={() => openEditModal(s)} className="flex-1 flex items-center justify-center gap-1 h-9 rounded-lg border border-border text-sm hover:bg-muted transition cursor-pointer"><Pencil className="h-3.5 w-3.5" /> Edit</button>
                  <button onClick={() => { setDeletingSlot(s); setShowDeleteModal(true); }} className="flex-1 flex items-center justify-center gap-1 h-9 rounded-lg border border-danger/30 text-sm text-danger hover:bg-danger/10 transition cursor-pointer"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <>
            <div className="modal-backdrop-vp" onClick={() => setShowModal(false)} />
            <div className="modal-container-vp">
              <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-card">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <h3 className="text-lg font-semibold">{editingSlot ? 'Edit slot' : 'Create slot'}</h3>
                  <button onClick={() => setShowModal(false)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted"><X className="h-4 w-4" /></button>
                </div>
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Doctor</label>
                    <select value={formData.doctorId} onChange={(e) => setFormData(p => ({ ...p, doctorId: Number(e.target.value) }))}
                      className="mt-1.5 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                      {doctors.map(d => <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</label>
                    <input type="date" value={formData.date} onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))}
                      className="mt-1.5 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" required />
                  </div>
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Time</label>
                    <input type="time" value={formData.time} onChange={(e) => setFormData(p => ({ ...p, time: e.target.value }))}
                      className="mt-1.5 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" required />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setShowModal(false)} className="h-10 rounded-xl border border-border px-4 text-sm hover:bg-muted transition">Cancel</button>
                    <button type="submit" disabled={formLoading} className="flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition">
                      {formLoading && <Loader2 className="h-4 w-4 animate-spin" />} {editingSlot ? 'Save' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <>
            <div className="modal-backdrop-vp" onClick={() => setShowDeleteModal(false)} />
            <div className="modal-container-vp">
              <div className="w-full max-w-sm rounded-2xl border border-border bg-card shadow-card p-6 text-center">
                <X className="h-10 w-10 mx-auto text-danger bg-danger/10 rounded-full p-2" />
                <p className="mt-4 font-medium text-foreground">Delete this slot?</p>
                <p className="mt-1 text-sm text-muted-foreground">{getDoctorName(deletingSlot?.doctorId)} — {deletingSlot?.slotDate} {deletingSlot?.slotTime}</p>
                <div className="mt-6 flex gap-2 justify-center">
                  <button onClick={() => setShowDeleteModal(false)} className="h-10 rounded-xl border border-border px-4 text-sm hover:bg-muted transition cursor-pointer">Cancel</button>
                  <button onClick={handleDelete} disabled={formLoading} className="flex h-10 items-center gap-2 rounded-xl bg-danger px-4 text-sm font-medium text-danger-foreground hover:bg-danger/90 disabled:opacity-60 transition cursor-pointer">
                    {formLoading && <Loader2 className="h-4 w-4 animate-spin" />} Delete
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </PageBody>
    </>
  );
};

export default DoctorSlots;
