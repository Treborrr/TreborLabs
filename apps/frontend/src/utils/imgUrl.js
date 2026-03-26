const API = import.meta.env.VITE_API_URL ?? '';

/**
 * Normaliza URLs de imágenes de producto.
 * - URLs absolutas (http/https): se devuelven tal cual.
 * - Paths relativos /uploads/...: se prefija con la URL del backend.
 */
export function imgUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${API}${url}`;
  return url;
}
