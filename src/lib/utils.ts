export function formatPrice(price: number | undefined | null): string {
  if (price == null) return '—';
  return price.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function formatPct(pct: number | undefined | null): string {
  if (pct == null) return '—';
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

export function formatPL(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${formatPrice(value)}`;
}

export function pctColor(pct: number | undefined | null): string {
  if (pct == null) return 'text-whale-muted';
  return pct >= 0 ? 'text-whale-gain' : 'text-whale-loss';
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
