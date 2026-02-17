import { useState, useCallback } from 'react';
import { usePolling } from '@/hooks/usePolling';
import * as api from '@/lib/api';
import { formatPrice, formatPct, pctColor, cn } from '@/lib/utils';
import Sparkline from './Sparkline';

export default function WatchlistPanel() {
  const { data: watchlist, refresh: refreshWl, loading: wlLoading } = usePolling(api.getWatchlist, 30000);
  const { data: quotes, loading: qLoading } = usePolling(api.getQuotes, 15000);
  const [adding, setAdding] = useState(false);
  const [symbol, setSymbol] = useState('');

  const quotesMap: Record<string, any> = {};
  if (quotes) {
    if (Array.isArray(quotes)) {
      quotes.forEach((q: any) => { quotesMap[q.symbol] = q; });
    } else if (typeof quotes === 'object') {
      Object.assign(quotesMap, quotes);
    }
  }

  const handleAdd = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim()) return;
    setAdding(true);
    try {
      await api.addToWatchlist(symbol.trim().toUpperCase());
      setSymbol('');
      refreshWl();
    } catch {} finally { setAdding(false); }
  }, [symbol, refreshWl]);

  const handleRemove = useCallback(async (sym: string) => {
    await api.removeFromWatchlist(sym);
    refreshWl();
  }, [refreshWl]);

  const loading = wlLoading || qLoading;

  return (
    <div className="card-glass p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading font-semibold text-lg">Watchlist</h2>
        <span className="text-xs text-whale-muted">{watchlist?.length || 0} symbols</span>
      </div>

      {/* Add symbol */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          value={symbol}
          onChange={e => setSymbol(e.target.value)}
          placeholder="Add symbol..."
          className="input-dark text-sm flex-1"
        />
        <button type="submit" disabled={adding} className="btn-primary text-sm px-3 py-2">
          +
        </button>
      </form>

      {loading && !watchlist ? (
        <div className="text-whale-muted text-sm py-8 text-center animate-pulse">Loading...</div>
      ) : !watchlist?.length ? (
        <div className="text-whale-muted text-sm py-8 text-center">
          No symbols yet. Add one above.
        </div>
      ) : (
        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          {watchlist.map((item: any) => {
            const sym = typeof item === 'string' ? item : item.symbol;
            const q = quotesMap[sym];
            const price = q?.price ?? q?.latestPrice ?? q?.last;
            const change = q?.changePercent ?? q?.change_pct;
            return (
              <div
                key={sym}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-whale-border/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-semibold text-sm w-16">{sym}</span>
                  {q?.sparkline && <Sparkline data={q.sparkline} />}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-mono text-sm">{formatPrice(price)}</div>
                    {change != null && (
                      <div className={cn('font-mono text-xs', pctColor(change))}>
                        {formatPct(change)}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemove(sym)}
                    className="opacity-0 group-hover:opacity-100 text-whale-muted hover:text-whale-loss text-xs transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
