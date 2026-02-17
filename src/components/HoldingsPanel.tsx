import { usePolling } from '@/hooks/usePolling';
import * as api from '@/lib/api';
import { formatPrice, formatPct, formatPL, pctColor, cn } from '@/lib/utils';

export default function HoldingsPanel() {
  const { data: holdings, loading } = usePolling(api.getHoldings, 30000);
  const { data: quotes } = usePolling(api.getQuotes, 15000);

  const quotesMap: Record<string, any> = {};
  if (quotes) {
    if (Array.isArray(quotes)) {
      quotes.forEach((q: any) => { quotesMap[q.symbol] = q; });
    } else if (typeof quotes === 'object') {
      Object.assign(quotesMap, quotes);
    }
  }

  if (loading && !holdings) {
    return (
      <div className="card-glass p-5">
        <h2 className="font-heading font-semibold text-lg mb-4">Holdings</h2>
        <div className="text-whale-muted text-sm py-8 text-center animate-pulse">Loading...</div>
      </div>
    );
  }

  const totalPL = (holdings || []).reduce((sum: number, h: any) => {
    const q = quotesMap[h.symbol];
    const price = q?.price ?? q?.latestPrice ?? q?.last ?? h.avg_cost;
    return sum + (price - h.avg_cost) * h.shares;
  }, 0);

  return (
    <div className="card-glass p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading font-semibold text-lg">Conviction Tracker</h2>
        <div className={cn('font-mono text-sm font-semibold', totalPL >= 0 ? 'text-whale-gain' : 'text-whale-loss')}>
          P&L: {formatPL(totalPL)}
        </div>
      </div>

      {!holdings?.length ? (
        <div className="text-whale-muted text-sm py-8 text-center">
          No holdings. Add some in Settings.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-whale-muted text-xs border-b border-whale-border">
                <th className="text-left py-2 font-medium">Symbol</th>
                <th className="text-right py-2 font-medium">Shares</th>
                <th className="text-right py-2 font-medium">Avg Cost</th>
                <th className="text-right py-2 font-medium">Price</th>
                <th className="text-right py-2 font-medium">P&L</th>
                <th className="text-right py-2 font-medium">Target</th>
                <th className="text-left py-2 font-medium pl-4">Thesis</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h: any) => {
                const q = quotesMap[h.symbol];
                const price = q?.price ?? q?.latestPrice ?? q?.last;
                const pl = price != null ? (price - h.avg_cost) * h.shares : null;
                const plPct = price != null ? ((price - h.avg_cost) / h.avg_cost) * 100 : null;
                return (
                  <tr key={h.symbol} className="border-b border-whale-border/50 hover:bg-whale-border/20 transition-colors">
                    <td className="py-2.5 font-mono font-semibold">{h.symbol}</td>
                    <td className="text-right py-2.5 font-mono">{h.shares}</td>
                    <td className="text-right py-2.5 font-mono">{formatPrice(h.avg_cost)}</td>
                    <td className="text-right py-2.5 font-mono">{formatPrice(price)}</td>
                    <td className={cn('text-right py-2.5 font-mono', pctColor(pl))}>
                      {pl != null ? `${formatPL(pl)} (${formatPct(plPct)})` : '—'}
                    </td>
                    <td className="text-right py-2.5 font-mono text-whale-cyan">{formatPrice(h.target_price)}</td>
                    <td className="py-2.5 pl-4 text-whale-muted max-w-[200px] truncate">{h.thesis || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
