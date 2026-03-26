import { useState, useEffect } from 'react';
import api from '../utils/api'; // Assuming api instance exists

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
          } catch (e) {
            console.warn('Invalid cache for site_config', e);
          }
        }

        // Llamar a API si no hay cache o expiró
        const response = await api.get('/site-config');
        const data = response.data.data;

        // Guardar cache
        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data,
            timestamp: Date.now()
          })
        );

        if (isMounted) {
          setConfig(data);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching site config:', error);
        // Retornar un fallback explícito si la API falla de forma drástica, 
        // aunque el backend ya retorna los defaults si no existe registro
        if (isMounted) {
          setConfig(null);
          setLoading(false);
        }
      }
    };

    fetchConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  return { config, loading };
};

export default useSiteConfig;
