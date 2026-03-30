import { createContext, useContext, useState, useEffect } from 'react';

// In Docker: VITE_API_URL="" → relative paths are proxied by Vite to the backend container
// In local dev: VITE_API_URL=http://localhost:3001 → direct requests
const API = import.meta.env.VITE_API_URL ?? '';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al montar, verificar sesión vía httpOnly cookie
  useEffect(() => {
    fetchMe();
  }, []);

  const fetchMe = async () => {
    try {
      const res = await fetch(`${API}/auth/me`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Llamado desde AuthCallback después del OAuth / email-verify redirect
  // El backend ya estableció la cookie; solo necesitamos refrescar el estado
  const loginCallback = () => fetchMe();

  const logout = async () => {
    await fetch(`${API}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {});
    setUser(null);
  };

  // Helper para hacer fetch autenticado desde cualquier parte
  // Usa credentials: 'include' para enviar la httpOnly cookie automáticamente
  const authFetch = (url, options = {}) => {
    const isFormData = options.body instanceof FormData;
    const headers = {
      ...options.headers,
      // No forzar Content-Type en FormData — el browser lo setea con el boundary
      ...(!isFormData && !options.headers?.['Content-Type'] ? { 'Content-Type': 'application/json' } : {}),
    };
    return fetch(url, { ...options, headers, credentials: 'include' });
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginCallback, logout, authFetch, API }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
