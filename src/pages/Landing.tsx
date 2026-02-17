import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import * as api from '@/lib/api';
import Footer from '@/components/Footer';

export default function Landing() {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fn = isRegister ? api.register : api.login;
      const { user, token } = await fn(email, password);
      login(user, token);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Hero */}
      <div className="text-center mb-10 animate-fade-in">
        <h1 className="text-5xl md:text-7xl font-heading font-bold mb-3 tracking-tight">
          Whale Watcher <span className="inline-block animate-bounce">🐋</span>
        </h1>
        <p className="text-whale-muted text-lg md:text-xl max-w-md mx-auto">
          Market intelligence for the bold. Track positions, set alerts, watch the whales.
        </p>
        <div className="flex items-center justify-center gap-4 mt-6 text-sm text-whale-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-whale-gain animate-pulse" />
            Live Quotes
          </span>
          <span>•</span>
          <span>Conviction Tracker</span>
          <span>•</span>
          <span>Price Alerts</span>
        </div>
      </div>

      {/* Auth Card */}
      <div className="card-glass p-8 w-full max-w-sm animate-slide-up">
        <h2 className="text-xl font-heading font-semibold mb-6 text-center">
          {isRegister ? 'Create Account' : 'Sign In'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-whale-muted mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-dark"
              placeholder="trader@example.com"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm text-whale-muted mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-dark"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && (
            <p className="text-whale-loss text-sm bg-whale-loss/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {isRegister ? 'Creating...' : 'Signing in...'}
              </span>
            ) : (
              isRegister ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="text-whale-cyan text-sm hover:underline"
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
