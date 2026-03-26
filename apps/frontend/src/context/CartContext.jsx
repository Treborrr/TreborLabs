import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();
const CART_KEY = 'trebor_cart';

const parsePrice = (price) => {
  if (typeof price === 'number') return price;
  return parseFloat(String(price).replace('$', '')) || 0;
};

const getLocalItems = () => {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; }
};

const mapDbItems = (dbItems) =>
  dbItems.map(item => ({
    id: item.productId,
    qty: item.quantity,
    name: item.product.name,
    price: item.product.price,
    image: item.product.images?.[0] || null,
    slug: item.product.slug,
    category: item.product.category,
  }));

export const CartProvider = ({ children }) => {
  const { user, loading, authFetch, API } = useAuth();
  const [items, setItems] = useState([]);
  const prevUserRef = useRef(undefined); // undefined = not yet initialized

  const fetchCart = useCallback(async () => {
    try {
      const res = await authFetch(`${API}/api/cart`);
      if (!res.ok) return;
      const data = await res.json();
      setItems(mapDbItems(data.cart?.items || []));
    } catch {}
  }, [authFetch, API]);

  const mergeLocalAndFetchDB = useCallback(async () => {
    const localItems = getLocalItems();
    if (localItems.length > 0) {
      await authFetch(`${API}/api/cart/merge`, {
        method: 'POST',
        body: JSON.stringify({
          items: localItems.map(i => ({ productId: i.id, quantity: i.qty })),
        }),
      }).catch(() => {});
      localStorage.removeItem(CART_KEY);
    }
    await fetchCart();
  }, [authFetch, API, fetchCart]);

  // Handle auth state transitions
  useEffect(() => {
    if (loading) return;

    const prev = prevUserRef.current;
    prevUserRef.current = user ?? null;

    if (prev === undefined) {
      // First init after loading resolves
      if (user) {
        mergeLocalAndFetchDB();
      } else {
        setItems(getLocalItems());
      }
    } else if (user && !prev) {
      // Logged in
      mergeLocalAndFetchDB();
    } else if (!user && prev) {
      // Logged out
      setItems([]);
    }
  }, [user, loading, mergeLocalAndFetchDB]);

  // Sync to localStorage for anonymous users
  useEffect(() => {
    if (!user && prevUserRef.current !== undefined) {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    }
  }, [items, user]);

  const addToCart = async (product) => {
    if (user) {
      try {
        const res = await authFetch(`${API}/api/cart/items`, {
          method: 'POST',
          body: JSON.stringify({ productId: product.id, quantity: 1 }),
        });
        if (res.ok) {
          setItems(prev => {
            const existing = prev.find(i => i.id === product.id);
            if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
            return [...prev, {
              id: product.id,
              qty: 1,
              name: product.name,
              price: product.price,
              image: product.images?.[0] || product.image || null,
              slug: product.slug,
              category: product.category,
            }];
          });
        }
      } catch {}
    } else {
      setItems(prev => {
        const existing = prev.find(i => i.id === product.id);
        if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
        return [...prev, { ...product, qty: 1 }];
      });
    }
  };

  const removeFromCart = async (id) => {
    if (user) {
      try {
        await authFetch(`${API}/api/cart/items/${id}`, { method: 'DELETE' });
        setItems(prev => prev.filter(i => i.id !== id));
      } catch {}
    } else {
      setItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const updateQty = async (id, qty) => {
    if (qty <= 0) return removeFromCart(id);
    if (user) {
      try {
        await authFetch(`${API}/api/cart/items/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ quantity: qty }),
        });
        setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
      } catch {}
    } else {
      setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
    }
  };

  const clearCart = async () => {
    if (user) {
      try { await authFetch(`${API}/api/cart`, { method: 'DELETE' }); } catch {}
    }
    setItems([]);
  };

  const count = items.reduce((sum, i) => sum + i.qty, 0);
  const total = items.reduce((sum, i) => sum + (parsePrice(i.price) * i.qty), 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, count, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
