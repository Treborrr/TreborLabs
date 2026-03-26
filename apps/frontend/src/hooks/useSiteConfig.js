import { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL ?? '';
const CACHE_KEY = 'trebor_site_config';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

const useSiteConfig = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchConfig = async () => {
      try {
        // Verificar cache
        const cachedStr = sessionStorage.getItem(CACHE_KEY);
        if (cachedStr) {
          try {
            const cached = JSON.parse(cachedStr);
            if (Date.now() - cached.timestamp < CACHE_TTL) {
              if (isMounted) {
                setConfig(cached.data);
                setLoading(false);
              }
              return;
            }
          } catch {
            // Cache inválida, continuar con fetch
          }
        }

        // Fetch a la API
        const res = await fetch(`${API}/api/site-config`);
        if (!res.ok) throw new Error('site-config fetch failed');
        const json = await res.json();
        const data = json.data ?? json;

        // Guardar en cache
        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data, timestamp: Date.now() })
        );

        if (isMounted) {
          setConfig(data);
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setConfig(null);
          setLoading(false);
        }
      }
    };

    fetchConfig();

    return () => { isMounted = false; };
  }, []);

  return { config, loading };
};

export default useSiteConfig;
