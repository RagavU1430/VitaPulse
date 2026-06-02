import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Mail, Lock, Loader2 } from 'lucide-react';
import authService from '@/services/authService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials or connection issue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-hero opacity-[0.03]" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle at 20% 20%, var(--primary) 1px, transparent 1px), radial-gradient(circle at 80% 60%, var(--primary) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative w-full max-w-[420px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-hero shadow-card mx-auto">
            <Activity className="h-7 w-7 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to VitaPulse Healthcare Portal</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          {error && (
            <div className="mb-4 rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email address</label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  placeholder="name@hospital.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Password</label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign in
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-muted-foreground">
            New to VitaPulse?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
