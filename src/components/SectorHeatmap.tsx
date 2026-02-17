import { usePolling } from '@/hooks/usePolling';
import * as api from '@/lib/api';
import { formatPct, cn } from '@/lib/utils';

const SECTORS: Record<string, string[]> = {
  'Tech': ['AAPL', 'MSFT', 'NVDA', 'GOOG', 'META', 'AMZN'],
  'Energy': ['XOM', 'CVX', 'OXY', 'SLB', 'XLE'],
  'Defense': ['LMT', 'RTX', 'NOC', 'GD', 'BA'],
  'Crypto': ['BTC-USD', 'ETH-USD', 'COIN', 'MARA', 'MSTR'],
  'ETFs': ['SPY', 'QQQ', 'IWM', 'DIA', 'VTI'],
  'Speculative': ['GME', 'AMC', 'PLTR', 'SOFI', 'RIVN'],
};

function heatColor(pct: number | null): string {
  if (pct == null) return 'bg-whale-border';
  if (pct > 3) return 'bg-green-500/60';
  if (pct > 1) return 'bg-green-500/30';
  if (pct > 0) return 'bg-green-500/15';
  if (pct > -1) return 'bg-red-500/15';
  if (pct > -3) return 'bg-red-500/30';
  return 'bg-red-500/60';
}

export default function SectorHeatmap() {
  const { data: quotes } = usePolling(api.getQuotes, 15000);

  const quotesMap: Record<string, any> = {};
  if (quotes) {
    if (Array.isArray(quotes)) {
      quotes.forEach((q: any) => { quotesMap[q.symbol] = q; });
    } else if (typeof quotes === 'object') {
      Object.assign(quotesMap, quotes);
    }
  }

  function sectorAvg(symbols: string[]): number | null {
    const vals = symbols
      .map(s => quotesMap[s]?.changePercent ?? quotesMap[s]?.change_pct)
      .filter((v): v is number => v != null);
    if (!vals.length) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }

  return (
    <div className="card-glass p-5">
      <h2 className="font-heading font-semibold text-lg mb-4">Sector Heatmap</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Object.entries(SECTORS).map(([name, symbols]) => {
          const avg = sectorAvg(symbols);
          return (
            <div
              key={name}
              className={cn(
                'rounded-lg p-4 border border-whale-border/50 transition-colors',
                heatColor(avg)
              )}
            >
              <div className="font-heading font-medium text-sm mb-1">{name}</div>
              <div className={cn(
                'font-mono text-lg font-semibold',
                avg == null ? 'text-whale-muted' : avg >= 0 ? 'text-whale-gain' : 'text-whale-loss'
              )}>
                {formatPct(avg)}
              </div>
              <div className="text-whale-muted text-xs mt-1">
                {symbols.slice(0, 3).join(', ')}…
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
