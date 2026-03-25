import { createContext, useContext, useState, useEffect } from 'react';

// In Docker: VITE_API_URL="" → relative paths are proxied by Vite to the backend container
// In local dev: VITE_API_URL=http://localhost:3001 → direct requests
const API = import.meta.env.VITE_API_URL ?? '';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al montar, verificar si hay token guardado y obtener perfil
  useEffect(() => {
    const token = localStorage.getItem('trebor_token');
    if (token) {
      fetchMe(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchMe = async (token) => {
    try {
      const res = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        // Token inválido o expirado
        localStorage.removeItem('trebor_token');
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Llamado desde AuthCallback después del OAuth redirect
  const loginWithToken = (token) => {
    localStorage.setItem('trebor_token', token);
    return fetchMe(token);
  };

  const logout = async () => {
    const token = localStorage.getItem('trebor_token');
    if (token) {
      await fetch(`${API}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    localStorage.removeItem('trebor_token');
    setUser(null);
  };

  // Helper para hacer fetch autenticado desde cualquier parte
  const authFetch = (url, options = {}) => {
    const token = localStorage.getItem('trebor_token');
    const isFormData = options.body instanceof FormData;
    const headers = {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // No forzar Content-Type en FormData — el browser lo setea con el boundary
      ...(!isFormData && !options.headers?.['Content-Type'] ? { 'Content-Type': 'application/json' } : {}),
    };
    return fetch(url, { ...options, headers });
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithToken, logout, authFetch, API }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
