const API_BASE = import.meta.env.VITE_API_URL || 'https://market.vandine.us';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('ww_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('ww_token');
    localStorage.removeItem('ww_user');
    window.location.href = '/';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || body.message || `HTTP ${res.status}`);
  }

  return res.json();
}

// Auth
export const login = (email: string, password: string) =>
  request<{ user: any; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const register = (email: string, password: string) =>
  request<{ user: any; token: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const getProfile = () => request<any>('/auth/profile');

// Watchlist
export const getWatchlist = () => request<any[]>('/watchlist');
export const addToWatchlist = (symbol: string) =>
  request<any>('/watchlist', { method: 'POST', body: JSON.stringify({ symbol }) });
export const removeFromWatchlist = (symbol: string) =>
  request<any>(`/watchlist/${symbol}`, { method: 'DELETE' });

// Alerts
export const getAlerts = () => request<any[]>('/alerts');
export const createAlert = (symbol: string, condition: string, target_price: number) =>
  request<any>('/alerts', {
    method: 'POST',
    body: JSON.stringify({ symbol, condition, target_price }),
  });
export const deleteAlert = (id: string) =>
  request<any>(`/alerts/${id}`, { method: 'DELETE' });

// Holdings
export const getHoldings = () => request<any[]>('/holdings');
export const addHolding = (data: {
  symbol: string;
  shares: number;
  avg_cost: number;
  thesis: string;
  target_price: number;
}) => request<any>('/holdings', { method: 'POST', body: JSON.stringify(data) });
export const deleteHolding = (symbol: string) =>
  request<any>(`/holdings/${symbol}`, { method: 'DELETE' });

// Public
export const getQuotes = () => request<any>('/quotes');
export const getQuote = (symbol: string) => request<any>(`/quotes/${symbol}`);
export const getTrades = (symbol: string, limit = 60) =>
  request<any[]>(`/trades/${symbol}?limit=${limit}`);
export const getSparkline = (symbol: string, points = 30) =>
  request<any>(`/sparkline/${symbol}?points=${points}`);
export const healthCheck = () => request<any>('/health');
