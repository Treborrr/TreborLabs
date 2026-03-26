import { useEffect } from 'react';

/**
 * Sets document.title, meta description, OG tags, and canonical link.
 * Usage: <SEOMeta title="Page Title" description="..." image="..." url="..." />
 */
const SEOMeta = ({ title, description, image, url }) => {
  const fullTitle = title ? `${title} | Trebor Labs` : 'Trebor Labs — Technical Hardware Editorial';
  const desc = description || 'Teclados mecánicos custom y kits Raspberry Pi de alta calidad. Hardware técnico editorial.';
  const img = image || '/og-default.png';
  const canonical = url || (typeof window !== 'undefined' ? window.location.href.split('?')[0] : '');

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (name, content, prop = false) => {
      const attr = prop ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };

    setMeta('description', desc);
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', desc, true);
    setMeta('og:image', img, true);
    setMeta('og:url', canonical, true);
    setMeta('og:type', 'website', true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', desc);
    setMeta('twitter:image', img);

    // B6.4 — Canonical link
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) { link = document.createElement('link'); link.setAttribute('rel', 'canonical'); document.head.appendChild(link); }
    link.setAttribute('href', canonical);
  }, [fullTitle, desc, img, canonical]);

  return null;
};

export default SEOMeta;

