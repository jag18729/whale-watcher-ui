import { useState, useCallback, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, User, getStoredAuth, storeAuth, clearAuth } from '@/lib/auth';
import Landing from '@/pages/Landing';
import Dashboard from '@/pages/Dashboard';
import Settings from '@/pages/Settings';

function App() {
  const stored = getStoredAuth();
  const [user, setUser] = useState<User | null>(stored.user);
  const [token, setToken] = useState<string | null>(stored.token);

  const handleLogin = useCallback((u: User, t: string) => {
    setUser(u);
    setToken(t);
    storeAuth(u, t);
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    setToken(null);
    clearAuth();
  }, []);

  const authValue = useMemo(() => ({
    user,
    token,
    login: handleLogin,
    logout: handleLogout,
    isAdmin: user?.email === 'rafa@vandine.us',
  }), [user, token, handleLogin, handleLogout]);

  return (
    <AuthContext.Provider value={authValue}>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/settings" element={user ? <Settings /> : <Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthContext.Provider>
  );
}

export default App;
