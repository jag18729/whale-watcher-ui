import { useState, useCallback } from 'react';
import { usePolling } from '@/hooks/usePolling';
import * as api from '@/lib/api';
import { formatPrice, cn } from '@/lib/utils';

export default function AlertsPanel() {
  const { data: alerts, refresh, loading } = usePolling(api.getAlerts, 30000);
  const [symbol, setSymbol] = useState('');
  const [condition, setCondition] = useState('above');
  const [targetPrice, setTargetPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !targetPrice) return;
    setSubmitting(true);
    try {
      await api.createAlert(symbol.toUpperCase(), condition, parseFloat(targetPrice));
      setSymbol('');
      setTargetPrice('');
      refresh();
    } catch {} finally { setSubmitting(false); }
  }, [symbol, condition, targetPrice, refresh]);

  const handleDelete = useCallback(async (id: string) => {
    await api.deleteAlert(id);
    refresh();
  }, [refresh]);

  const conditionLabel: Record<string, string> = {
    above: '↑ Above',
    below: '↓ Below',
    crosses: '↕ Crosses',
  };

  return (
    <div className="card-glass p-5">
      <h2 className="font-heading font-semibold text-lg mb-4">Alerts</h2>

      {/* Create form */}
      <form onSubmit={handleCreate} className="flex flex-wrap gap-2 mb-4">
        <input
          value={symbol}
          onChange={e => setSymbol(e.target.value)}
          placeholder="Symbol"
          className="input-dark text-sm w-20"
          required
        />
        <select
          value={condition}
          onChange={e => setCondition(e.target.value)}
          className="input-dark text-sm w-28"
        >
          <option value="above">Above</option>
          <option value="below">Below</option>
          <option value="crosses">Crosses</option>
        </select>
        <input
          value={targetPrice}
          onChange={e => setTargetPrice(e.target.value)}
          placeholder="Price"
          type="number"
          step="0.01"
          className="input-dark text-sm w-24"
          required
        />
        <button type="submit" disabled={submitting} className="btn-primary text-sm px-3 py-2">
          Set
        </button>
      </form>

      {loading && !alerts ? (
        <div className="text-whale-muted text-sm py-4 text-center animate-pulse">Loading...</div>
      ) : !alerts?.length ? (
        <div className="text-whale-muted text-sm py-4 text-center">No active alerts.</div>
      ) : (
        <div className="space-y-1 max-h-[250px] overflow-y-auto">
          {alerts.map((a: any) => (
            <div
              key={a.id || a._id}
              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-whale-border/30 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-semibold text-sm">{a.symbol}</span>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  a.condition === 'above' ? 'bg-whale-gain/15 text-whale-gain' :
                  a.condition === 'below' ? 'bg-whale-loss/15 text-whale-loss' :
                  'bg-whale-cyan/15 text-whale-cyan'
                )}>
                  {conditionLabel[a.condition] || a.condition}
                </span>
                <span className="font-mono text-sm text-whale-cyan">{formatPrice(a.target_price)}</span>
              </div>
              <button
                onClick={() => handleDelete(a.id || a._id)}
                className="opacity-0 group-hover:opacity-100 text-whale-muted hover:text-whale-loss text-xs transition-opacity"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
