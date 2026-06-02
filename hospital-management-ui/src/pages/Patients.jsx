import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, Mail, Phone, Loader2, Users } from 'lucide-react';
import { PageHeader, PageBody, StatusPill } from '@/components/PageHeader';
import patientService from '@/services/patientService';
import authService from '@/services/authService';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchPatients(); }, []);

  const fetchPatients = async () => {
    try { setLoading(true); setError(''); const data = await patientService.getAllPatients(); setPatients(data); }
    catch { setError('Could not retrieve patients.'); }
    finally { setLoading(false); }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) { fetchPatients(); return; }
    try { setLoading(true); const data = await patientService.searchPatients(searchTerm); setPatients(data); }
    catch { setError('No patients found.'); setPatients([]); }
    finally { setLoading(false); }
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'PT';

  return (
    <>
      <PageHeader title="Patient directory" subtitle={`${patients.length} patients registered`}
        actions={
          <>
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email…" className="h-10 w-64 rounded-xl border border-border bg-card pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition" />
            </form>
            {searchTerm && (
              <button onClick={() => { setSearchTerm(''); fetchPatients(); }}
                className="h-10 rounded-xl border border-border px-3 text-sm hover:bg-muted transition">Clear</button>
            )}
          </>
        }
      />
      <PageBody>
        {error && <div className="mb-4 rounded-xl bg-warning/10 border border-warning/20 px-4 py-3 text-sm text-warning-foreground">{error}</div>}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="mt-3 text-sm text-muted-foreground">Loading patients...</p></div>
        ) : patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-border">
            <Users className="h-12 w-12 text-muted-foreground/40" /><h4 className="mt-4 text-lg font-semibold text-muted-foreground">No patients found</h4>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {patients.map((p) => (
              <Link key={p.id} to={`/patients/${p.id}`}
                className="group rounded-2xl border border-border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-soft">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-soft font-semibold text-teal shrink-0">
                    {getInitials(p.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold truncate">{p.name}</h3>
                      <StatusPill status={p.status || 'Active'} />
                    </div>
                    <p className="text-xs text-muted-foreground">{p.patientCode || `PT${String(p.id).padStart(6, '0')}`}</p>
                    <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                      {p.email && <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" />{p.email}</p>}
                      {p.phone && <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{p.phone}</p>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </PageBody>
    </>
  );
};

export default Patients;
