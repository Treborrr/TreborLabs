import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const API = import.meta.env.VITE_API_URL ?? '';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user, authFetch } = useAuth();
  const [ids, setIds] = useState(new Set());

  const load = useCallback(async () => {
    if (!user) { setIds(new Set()); return; }
    try {
      const res = await authFetch(`${API}/api/users/me/wishlist`);
      const data = await res.json();
      setIds(new Set((data.items || []).map(i => i.productId)));
    } catch { setIds(new Set()); }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const toggle = useCallback(async (productId) => {
    if (!user) return;
    const inList = ids.has(productId);
    // Optimistic
    setIds(prev => {
      const next = new Set(prev);
      inList ? next.delete(productId) : next.add(productId);
      return next;
    });
    try {
      if (inList) {
        await authFetch(`${API}/api/wishlist/${productId}`, { method: 'DELETE' });
      } else {
        await authFetch(`${API}/api/wishlist`, { method: 'POST', body: JSON.stringify({ productId }) });
      }
    } catch {
      // Rollback
      setIds(prev => {
        const next = new Set(prev);
        inList ? next.add(productId) : next.delete(productId);
        return next;
      });
    }
  }, [user, ids]);

  return (
    <WishlistContext.Provider value={{ ids, toggle, count: ids.size }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
