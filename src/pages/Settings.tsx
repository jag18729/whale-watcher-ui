import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { usePolling } from '@/hooks/usePolling';
import * as api from '@/lib/api';
import { formatPrice, cn } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Settings() {
  const { user, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-whale-bg">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <h1 className="font-heading text-2xl font-bold">Settings</h1>

        {/* Profile */}
        <section className="card-glass p-6">
          <h2 className="font-heading font-semibold text-lg mb-4">Profile</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-whale-muted">Email</label>
              <p className="font-mono text-sm mt-1">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm text-whale-muted">Role</label>
              <p className="text-sm mt-1">{isAdmin ? '🔑 Admin' : 'User'}</p>
            </div>
          </div>
        </section>

        {/* Watchlist Management */}
        <WatchlistManager />

        {/* Holdings Management */}
        <HoldingsManager />

        {/* Alert Management */}
        <AlertManager />

        {isAdmin && <AdminPanel />}

        <Footer />
      </main>
    </div>
  );
}

function WatchlistManager() {
  const { data: watchlist, refresh, loading } = usePolling(api.getWatchlist, 60000);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  const handleBulkAdd = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setBusy(true);
    const symbols = input.split(/[\s,]+/).filter(Boolean).map(s => s.toUpperCase());
    for (const sym of symbols) {
      try { await api.addToWatchlist(sym); } catch {}
    }
    setInput('');
    refresh();
    setBusy(false);
  }, [input, refresh]);

  const handleRemove = useCallback(async (sym: string) => {
    await api.removeFromWatchlist(sym);
    refresh();
  }, [refresh]);

  return (
    <section className="card-glass p-6">
      <h2 className="font-heading font-semibold text-lg mb-4">Watchlist</h2>
      <form onSubmit={handleBulkAdd} className="flex gap-2 mb-4">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Add symbols (comma or space separated)..."
          className="input-dark text-sm flex-1"
        />
        <button type="submit" disabled={busy} className="btn-primary text-sm">
          {busy ? '...' : 'Add'}
        </button>
      </form>
      {loading && !watchlist ? (
        <p className="text-whale-muted text-sm animate-pulse">Loading...</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {(watchlist || []).map((item: any) => {
            const sym = typeof item === 'string' ? item : item.symbol;
            return (
              <span key={sym} className="inline-flex items-center gap-1.5 bg-whale-border/50 text-sm font-mono px-3 py-1.5 rounded-lg group">
                {sym}
                <button onClick={() => handleRemove(sym)} className="text-whale-muted hover:text-whale-loss opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
              </span>
            );
          })}
        </div>
      )}
    </section>
  );
}

function HoldingsManager() {
  const { data: holdings, refresh, loading } = usePolling(api.getHoldings, 60000);
  const [form, setForm] = useState({ symbol: '', shares: '', avg_cost: '', thesis: '', target_price: '' });
  const [busy, setBusy] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.addHolding({
        symbol: form.symbol.toUpperCase(),
        shares: parseFloat(form.shares),
        avg_cost: parseFloat(form.avg_cost),
        thesis: form.thesis,
        target_price: parseFloat(form.target_price),
      });
      setForm({ symbol: '', shares: '', avg_cost: '', thesis: '', target_price: '' });
      refresh();
    } catch {} finally { setBusy(false); }
  }, [form, refresh]);

  const handleDelete = useCallback(async (sym: string) => {
    await api.deleteHolding(sym);
    refresh();
  }, [refresh]);

  return (
    <section className="card-glass p-6">
      <h2 className="font-heading font-semibold text-lg mb-4">Holdings / Conviction Tracker</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-4">
        <input value={form.symbol} onChange={e => setForm(f => ({ ...f, symbol: e.target.value }))} placeholder="Symbol" className="input-dark text-sm" required />
        <input value={form.shares} onChange={e => setForm(f => ({ ...f, shares: e.target.value }))} placeholder="Shares" type="number" step="any" className="input-dark text-sm" required />
        <input value={form.avg_cost} onChange={e => setForm(f => ({ ...f, avg_cost: e.target.value }))} placeholder="Avg Cost" type="number" step="0.01" className="input-dark text-sm" required />
        <input value={form.target_price} onChange={e => setForm(f => ({ ...f, target_price: e.target.value }))} placeholder="Target $" type="number" step="0.01" className="input-dark text-sm" required />
        <input value={form.thesis} onChange={e => setForm(f => ({ ...f, thesis: e.target.value }))} placeholder="Thesis" className="input-dark text-sm" />
        <button type="submit" disabled={busy} className="btn-primary text-sm">{busy ? '...' : 'Add'}</button>
      </form>

      {loading && !holdings ? (
        <p className="text-whale-muted text-sm animate-pulse">Loading...</p>
      ) : !holdings?.length ? (
        <p className="text-whale-muted text-sm">No holdings yet.</p>
      ) : (
        <div className="space-y-1">
          {holdings.map((h: any) => (
            <div key={h.symbol} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-whale-border/30 transition-colors group">
              <div className="flex items-center gap-4">
                <span className="font-mono font-semibold text-sm w-14">{h.symbol}</span>
                <span className="text-whale-muted text-xs">{h.shares} shares @ {formatPrice(h.avg_cost)}</span>
                <span className="text-whale-cyan text-xs">→ {formatPrice(h.target_price)}</span>
                {h.thesis && <span className="text-whale-muted text-xs italic hidden md:inline truncate max-w-[200px]">{h.thesis}</span>}
              </div>
              <button onClick={() => handleDelete(h.symbol)} className="opacity-0 group-hover:opacity-100 text-whale-muted hover:text-whale-loss text-xs transition-opacity">✕</button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function AlertManager() {
  const { data: alerts, refresh, loading } = usePolling(api.getAlerts, 60000);
  const [symbol, setSymbol] = useState('');
  const [condition, setCondition] = useState('above');
  const [targetPrice, setTargetPrice] = useState('');
  const [busy, setBusy] = useState(false);

  const handleCreate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.createAlert(symbol.toUpperCase(), condition, parseFloat(targetPrice));
      setSymbol('');
      setTargetPrice('');
      refresh();
    } catch {} finally { setBusy(false); }
  }, [symbol, condition, targetPrice, refresh]);

  const handleDelete = useCallback(async (id: string) => {
    await api.deleteAlert(id);
    refresh();
  }, [refresh]);

  return (
    <section className="card-glass p-6">
      <h2 className="font-heading font-semibold text-lg mb-4">Alerts</h2>
      <form onSubmit={handleCreate} className="flex flex-wrap gap-2 mb-4">
        <input value={symbol} onChange={e => setSymbol(e.target.value)} placeholder="Symbol" className="input-dark text-sm w-24" required />
        <select value={condition} onChange={e => setCondition(e.target.value)} className="input-dark text-sm w-28">
          <option value="above">Above</option>
          <option value="below">Below</option>
          <option value="crosses">Crosses</option>
        </select>
        <input value={targetPrice} onChange={e => setTargetPrice(e.target.value)} placeholder="Price" type="number" step="0.01" className="input-dark text-sm w-28" required />
        <button type="submit" disabled={busy} className="btn-primary text-sm">{busy ? '...' : 'Create'}</button>
      </form>

      {loading && !alerts ? (
        <p className="text-whale-muted text-sm animate-pulse">Loading...</p>
      ) : !alerts?.length ? (
        <p className="text-whale-muted text-sm">No alerts.</p>
      ) : (
        <div className="space-y-1">
          {alerts.map((a: any) => (
            <div key={a.id || a._id} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-whale-border/30 transition-colors group">
              <div className="flex items-center gap-3">
                <span className="font-mono font-semibold text-sm">{a.symbol}</span>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  a.condition === 'above' ? 'bg-whale-gain/15 text-whale-gain' :
                  a.condition === 'below' ? 'bg-whale-loss/15 text-whale-loss' :
                  'bg-whale-cyan/15 text-whale-cyan'
                )}>{a.condition}</span>
                <span className="font-mono text-sm">{formatPrice(a.target_price)}</span>
              </div>
              <button onClick={() => handleDelete(a.id || a._id)} className="opacity-0 group-hover:opacity-100 text-whale-muted hover:text-whale-loss text-xs transition-opacity">✕</button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function AdminPanel() {
  return (
    <section className="card-glass p-6 border-whale-cyan/30">
      <h2 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
        🔑 Admin Panel
      </h2>
      <div className="space-y-3 text-sm text-whale-muted">
        <p>Admin features coming soon: user management, system stats, API health monitoring.</p>
      </div>
    </section>
  );
}
