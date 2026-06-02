import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, Star, Mail, Phone, CalendarPlus, X, Loader2, Stethoscope } from 'lucide-react';
import { PageHeader, PageBody } from '@/components/PageHeader';
import doctorService from '@/services/doctorService';
import authService from '@/services/authService';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [specialization, setSpecialization] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', specialization: '', experience: '', email: '', phone: '' });
  const [formErrors, setFormErrors] = useState({});

  const user = authService.getCurrentUser();
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => { fetchDoctors(); }, []);
  useEffect(() => { if (success) { const t = setTimeout(() => setSuccess(''), 4000); return () => clearTimeout(t); } }, [success]);
  useEffect(() => { if (error) { const t = setTimeout(() => setError(''), 6000); return () => clearTimeout(t); } }, [error]);

  const fetchDoctors = async () => {
    try { setLoading(true); setError(''); const data = await doctorService.getAllDoctors(); setDoctors(data); }
    catch { setError('Could not retrieve doctors directory.'); }
    finally { setLoading(false); }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!specialization.trim()) { fetchDoctors(); return; }
    try { setLoading(true); setError(''); const data = await doctorService.getDoctorsBySpecialization(specialization); setDoctors(data); }
    catch { setError(`No doctors found for: ${specialization}`); setDoctors([]); }
    finally { setLoading(false); }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.specialization.trim()) errors.specialization = 'Specialization is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email';
    if (formData.phone && !/^[+]?[\d\s()-]{7,15}$/.test(formData.phone)) errors.phone = 'Invalid phone';
    if (formData.experience && (isNaN(formData.experience) || Number(formData.experience) < 0)) errors.experience = 'Must be positive';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openAddModal = () => { setFormData({ name: '', specialization: '', experience: '', email: '', phone: '' }); setFormErrors({}); setShowAddModal(true); };
  const handleAddDoctor = async (e) => {
    e.preventDefault(); if (!validateForm()) return;
    try { setFormLoading(true); await doctorService.createDoctor({ name: formData.name, specialization: formData.specialization, experience: formData.experience ? Number(formData.experience) : 0, email: formData.email || null, phone: formData.phone || null }); setSuccess('Doctor added!'); setShowAddModal(false); fetchDoctors(); }
    catch { setError('Failed to add doctor.'); } finally { setFormLoading(false); }
  };

  const openEditModal = (doctor) => { setSelectedDoctor(doctor); setFormData({ name: doctor.name || '', specialization: doctor.specialization || '', experience: doctor.experience ?? '', email: doctor.email || '', phone: doctor.phone || '' }); setFormErrors({}); setShowEditModal(true); };
  const handleEditDoctor = async (e) => {
    e.preventDefault(); if (!validateForm()) return;
    try { setFormLoading(true); await doctorService.updateDoctor(selectedDoctor.id, { name: formData.name, specialization: formData.specialization, experience: formData.experience ? Number(formData.experience) : 0, email: formData.email || null, phone: formData.phone || null }); setSuccess('Doctor updated!'); setShowEditModal(false); fetchDoctors(); }
    catch { setError('Failed to update doctor.'); } finally { setFormLoading(false); }
  };

  const openDeleteModal = (doctor) => { setSelectedDoctor(doctor); setShowDeleteModal(true); };
  const handleDeleteDoctor = async () => {
    try { setFormLoading(true); await doctorService.deleteDoctor(selectedDoctor.id); setSuccess('Doctor deleted!'); setShowDeleteModal(false); fetchDoctors(); }
    catch { setError('Failed to delete doctor.'); } finally { setFormLoading(false); }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const FormField = ({ label, name, type = 'text', placeholder, required }) => (
    <div>
      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <input type={type} name={name} value={formData[name]} onChange={handleInputChange}
        className={`mt-1.5 h-10 w-full rounded-xl border ${formErrors[name] ? 'border-danger' : 'border-border'} bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition`}
        placeholder={placeholder} min={type === 'number' ? '0' : undefined} />
      {formErrors[name] && <p className="mt-1 text-xs text-danger">{formErrors[name]}</p>}
    </div>
  );

  const DoctorForm = ({ onSubmit, submitLabel }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormField label="Name" name="name" placeholder="Dr. Full Name" required />
      <FormField label="Specialization" name="specialization" placeholder="e.g. Cardiologist" required />
      <FormField label="Experience (years)" name="experience" type="number" placeholder="e.g. 10" />
      <FormField label="Email" name="email" type="email" placeholder="doctor@hospital.com" />
      <FormField label="Phone" name="phone" type="tel" placeholder="+91 98765 43210" />
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); }} disabled={formLoading}
          className="h-10 rounded-xl border border-border px-4 text-sm font-medium hover:bg-muted transition">Cancel</button>
        <button type="submit" disabled={formLoading}
          className="flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition">
          {formLoading && <Loader2 className="h-4 w-4 animate-spin" />} {submitLabel}
        </button>
      </div>
    </form>
  );

  const Modal = ({ show, title, children, onClose }) => {
    if (!show) return null;
    return (
      <>
        <div className="modal-backdrop-vp" onClick={onClose} />
        <div className="modal-container-vp">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-card">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold">{title}</h3>
              <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-6 py-5">{children}</div>
          </div>
        </div>
      </>
    );
  };

  const getInitials = (name) => name ? name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'DR';

  return (
    <>
      <PageHeader
        title="Doctor directory"
        subtitle={`${doctors.length} registered specialists`}
        actions={
          <>
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={specialization} onChange={(e) => setSpecialization(e.target.value)}
                placeholder="Search by specialization…" className="h-10 w-64 rounded-xl border border-border bg-card pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition" />
            </form>
            {specialization && (
              <button onClick={() => { setSpecialization(''); fetchDoctors(); }}
                className="h-10 rounded-xl border border-border px-3 text-sm hover:bg-muted transition">Clear</button>
            )}
            {isAdmin && (
              <button onClick={openAddModal}
                className="flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition">
                <Plus className="h-4 w-4" /> Add doctor
              </button>
            )}
          </>
        }
      />
      <PageBody>
        {success && <div className="mb-4 rounded-xl bg-success/10 border border-success/20 px-4 py-3 text-sm text-success">{success}</div>}
        {error && <div className="mb-4 rounded-xl bg-warning/10 border border-warning/20 px-4 py-3 text-sm text-warning-foreground">{error}</div>}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">Loading doctors...</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-border">
            <Stethoscope className="h-12 w-12 text-muted-foreground/40" />
            <h4 className="mt-4 text-lg font-semibold text-muted-foreground">No doctors found</h4>
            <p className="mt-1 text-sm text-muted-foreground">Try a different search criteria.</p>
            <button onClick={() => { setSpecialization(''); fetchDoctors(); }}
              className="mt-4 h-10 rounded-xl border border-border px-4 text-sm font-medium hover:bg-muted transition">View all doctors</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {doctors.map((d) => (
              <div key={d.id} className="group rounded-2xl border border-border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-soft">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-hero text-base font-semibold text-primary-foreground shrink-0">
                    {getInitials(d.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold truncate">{d.name}</h3>
                    <p className="text-xs text-muted-foreground">{d.doctorCode || `DR${String(d.id).padStart(6, '0')}`} · {d.experience} yrs</p>
                    <span className="mt-1 inline-flex items-center rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-medium text-primary">{d.specialization}</span>
                  </div>
                </div>
                <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                  {d.email && <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" />{d.email}</p>}
                  {d.phone && <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{d.phone}</p>}
                </div>
                <div className="mt-4 flex gap-2">
                  <Link to={`/doctors/${d.id}`}
                    className="flex-1 flex items-center justify-center h-9 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 transition">
                    View profile
                  </Link>
                  {isAdmin && (
                    <>
                      <button onClick={() => openEditModal(d)} className="h-9 rounded-lg border border-border px-3 text-sm hover:bg-muted transition">Edit</button>
                      <button onClick={() => openDeleteModal(d)} className="h-9 rounded-lg border border-danger/30 px-3 text-sm text-danger hover:bg-danger/10 transition">Delete</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal show={showAddModal} title="Add new doctor" onClose={() => setShowAddModal(false)}>
          <DoctorForm onSubmit={handleAddDoctor} submitLabel="Add Doctor" />
        </Modal>
        <Modal show={showEditModal} title="Edit doctor" onClose={() => setShowEditModal(false)}>
          <DoctorForm onSubmit={handleEditDoctor} submitLabel="Save Changes" />
        </Modal>
        <Modal show={showDeleteModal} title="Confirm deletion" onClose={() => setShowDeleteModal(false)}>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
              <X className="h-6 w-6 text-danger" />
            </div>
            <p className="mt-4 font-medium">Delete {selectedDoctor?.name}?</p>
            <p className="mt-1 text-sm text-muted-foreground">{selectedDoctor?.specialization}</p>
            <p className="mt-2 text-xs text-danger">This action cannot be undone.</p>
            <div className="mt-6 flex gap-2 justify-center">
              <button onClick={() => setShowDeleteModal(false)} disabled={formLoading}
                className="h-10 rounded-xl border border-border px-4 text-sm font-medium hover:bg-muted transition">Cancel</button>
              <button onClick={handleDeleteDoctor} disabled={formLoading}
                className="flex h-10 items-center gap-2 rounded-xl bg-danger px-4 text-sm font-medium text-danger-foreground hover:bg-danger/90 disabled:opacity-60 transition">
                {formLoading && <Loader2 className="h-4 w-4 animate-spin" />} Delete
              </button>
            </div>
          </div>
        </Modal>
      </PageBody>
    </>
  );
};

export default Doctors;
