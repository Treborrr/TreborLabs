import { useState, useMemo } from 'react';

const posts = [
  {
    id: 1, featured: true,
    title: 'El Arte del Teclado Mecánico: Guía Completa para Beginners',
    category: 'Hardware',
    date: 'Mar 2026', readTime: '12 min read',
    excerpt: 'Desde los switches hasta los keycaps, descubre todo lo que necesitas saber para construir tu primer teclado mecánico personalizado.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCv8cUykiGbBcdQz3JHU_GVYgTPXzn4xsZe3EzO9haIfyecaZUaerY_ekr-I2HPZeslc0ceM6PXr_rI-_E4daymPH6JRPZIcGOVrwBX_bOiBndo59NQ0j5UEkX2GHMAO2ck-LZwHPhS1jjK7C4wtsMzTCPuwGGLMj5t51NxXBp4T9zE_rdJx_27gd6C1OQXiJHPOPYeEv9h0Dd1RcpONDfv43Pct1DHN0IeisrGHM9UfIKAJ6Yc_RmF3CCThnZ42TJIkYTbyMW0A6v9',
  },
  {
    id: 2, featured: false,
    title: 'Raspberry Pi 5: Un Análisis Técnico a Fondo',
    category: 'Tutorials',
    date: 'Feb 2026', readTime: '8 min read',
    excerpt: 'Analizamos el nuevo Pi 5 desde cero: CPU, memoria, GPIO y casos de uso reales para makers.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApuve3n0pKb9YaV-kiYU8M3yUSHpxGp2_ArAw50ea0Acpj0gcxce9xE3edHIgEdFKXtfHvUGyK8dZvr_AcmIhDOKQe19Z7oyyZNwebS-egSjiz3dNqo8poW3O6yAeitoUtBJm0-5ICKUekcum6GbdwrIhXHxL6P-sVZqbj56N7-MK_Z4UrHJvSP9WJRjtKdYy-1QWKGOCj3htjjQM3oIT7PfsCJTe70ct4D0QLNV8KRfYx7a3OdyYQQRxy6fXG76Lbswzo5FtUPNWT',
  },
  {
    id: 3, featured: false,
    title: 'QMK Firmware: Configuración Avanzada de Macros',
    category: 'Tutorials',
    date: 'Ene 2026', readTime: '6 min read',
    excerpt: 'Aprende a configurar capas, macros y tapdance en QMK para maximizar tu flujo de trabajo.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVJH3hZrzVsDBx2tnw62y_sLwDWiCc7WJNT21NG9VkCHx8fbe7GI1WoixJv6pfhKNx-_P29R7odfQ4A6KByhhwRmq11WKHAsfVZmAD3G-PQR2hM196dq_OGIGZMtAal9ErPVug2jA0KfRwo86D4e3d9Sj1NqUn8lr88ed6LIYeuhE2xQFMZx4zuCuva_Iqj3mXIQ-gEyTgsxCkQzoRFCKcT7i4GxqFwRgfX7G0c5d1qD-eqE8blxv4-j3N7OU6FY4dhDXnfXYTOIeC',
  },
  {
    id: 4, featured: false,
    title: 'Switches Trebor Violet: Diseño y Especificaciones',
    category: 'Hardware',
    date: 'Dic 2025', readTime: '5 min read',
    excerpt: 'El switch que diseñamos para el tactician. Análisis de fuerza de actuación, viaje y sonido.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhKNE3_0THQu9kkJhdNr46I-BQKSpz-UERx3L6rSKD0JS3V9WEp8NIt6hEselll9uDfJ0ajyIxpNGtOJGycfcK8W7KZFk7WQmFjnv0gDANk5bpzOZyLKfuG7MfmBds2CMmEiKvmEaJkKOrZ9RCBzIygVSbJuSLkStvLLNFNmhRfj7sqMu0gY123zYJet3pTmDOLzcWzuXH1K_G88CTaMtTYFI81EOtfZyzSkLYSWiJy5daX9JEFX-herqu2TGatfXa-wHZRGY0ObpB',
  },
];

const recentPosts = [
  'Tres meses con el Split v1: Review completa',
  'GPIO en Pi 5: guía práctica',
  'Gasket Mount vs Top Mount: diferencias acústicas',
];

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchCategory = activeCategory === 'All' || post.category === activeCategory;
      const matchSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  // Only feature the first post if we are on 'All' viewing all posts without searching
  const featuredPost = filteredPosts.length > 0 && activeCategory === 'All' && !searchQuery ? filteredPosts[0] : null;
  const regularPosts = featuredPost ? filteredPosts.slice(1) : filteredPosts;

  return (
    <main className="pt-32 pb-20 px-6 md:px-12 max-w-[1400px] mx-auto">
      {/* Header */}
    <header className="mb-16">
      <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter mb-4 text-on-surface">
        Hardware <span className="text-primary">Insights</span>
      </h1>
      <p className="font-body text-on-surface-variant max-w-2xl text-lg">
        Explorando la frontera de la computación táctica, desde teclados mecánicos personalizados hasta arquitecturas de un solo chip.
      </p>
    </header>

    {/* Search & Filter */}
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
      <div className="flex flex-wrap gap-2 p-1 bg-surface-container-low rounded-xl border border-outline-variant/15">
        {['All', 'Hardware', 'Tutorials', 'Community', 'News'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeCategory === cat ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="relative w-full md:w-80 group">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">search</span>
        <input 
          className="w-full bg-surface-container-highest border-none rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/40 placeholder:text-outline/60 transition-all focus:outline-none" 
          placeholder="Buscar artículos..." 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* Blog Grid */}
      <section className="lg:col-span-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Featured Post */}
          {featuredPost && (
            <article className="md:col-span-2 group">
              <div className="relative h-[400px] overflow-hidden rounded-xl bg-surface-container-low border border-outline-variant/10">
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8 w-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-mono tracking-widest uppercase border border-primary/30 rounded-full">{featuredPost.category}</span>
                    <span className="text-on-surface-variant text-xs font-mono">{featuredPost.date} · {featuredPost.readTime}</span>
                  </div>
                  <h2 className="font-headline text-2xl md:text-3xl font-bold tracking-tight text-on-surface mb-3 group-hover:text-primary transition-colors">{featuredPost.title}</h2>
                  <p className="text-on-surface-variant text-sm leading-relaxed hidden md:block max-w-2xl">{featuredPost.excerpt}</p>
                  <a className="inline-flex items-center gap-2 text-primary font-mono text-xs mt-4 group/link" href="#">
                    LEER ARTÍCULO <span className="material-symbols-outlined text-sm group-hover/link:translate-x-1 transition-transform">arrow_forward</span>
                  </a>
                </div>
              </div>
            </article>
          )}

          {/* Regular Posts */}
          {regularPosts.map((post) => (
            <article key={post.id} className="group">
              <div className="relative aspect-video overflow-hidden rounded-xl bg-surface-container-low border border-outline-variant/10 mb-4">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-surface/70 backdrop-blur text-primary text-[10px] font-mono tracking-widest uppercase border border-primary/20 rounded-full">{post.category}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant">
                  <span>{post.date}</span>
                  <span>·</span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className="font-headline font-bold text-lg tracking-tight group-hover:text-primary transition-colors">{post.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{post.excerpt}</p>
                <a className="inline-flex items-center gap-2 text-primary font-mono text-xs mt-2 group/link" href="#">
                  LEER MÁS <span className="material-symbols-outlined text-sm group-hover/link:translate-x-1 transition-transform">arrow_forward</span>
                </a>
              </div>
            </article>
          ))}
          
          {filteredPosts.length === 0 && (
            <div className="md:col-span-2 text-center py-20">
              <span className="material-symbols-outlined text-5xl text-outline-variant mb-4 font-light block">article</span>
              <p className="font-headline text-xl font-bold">No encontramos artículos.</p>
              <p className="text-on-surface-variant text-sm mt-2">Intenta ajustar tus términos de búsqueda o categoría.</p>
              <button 
                onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
                className="mt-6 px-6 py-2 bg-surface-container-high border border-outline-variant/30 rounded text-sm text-primary hover:bg-surface-container-highest transition-colors font-bold tracking-tight"
              >
                Limpiar Filtros
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Sidebar */}
      <aside className="lg:col-span-4 space-y-10">
        {/* Recent Posts */}
        <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
          <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-primary mb-6">Posts Recientes</h3>
          <div className="space-y-4">
            {recentPosts.map((title, i) => (
              <a key={i} href="#" className="flex items-start gap-3 group">
                <span className="font-mono text-[10px] text-primary mt-1 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <p className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors leading-relaxed">{title}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div className="bg-gradient-to-br from-primary/10 to-primary-container/20 rounded-xl p-6 border border-primary/20">
          <h3 className="font-headline font-bold text-lg mb-2">Newsletter Técnico</h3>
          <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">Recibe análisis técnicos, reviews y noticias de hardware directamente en tu inbox.</p>
          <div className="space-y-3">
            <input className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm placeholder:text-outline/60 focus:ring-1 focus:ring-primary/40 focus:outline-none" placeholder="tu@email.com" type="email" />
            <button className="w-full py-3 bg-primary-container text-on-primary-container rounded-md font-headline font-bold text-sm uppercase tracking-widest hover:bg-primary transition-all">
              Suscribirme
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
          <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-primary mb-6">Categorías</h3>
          <div className="space-y-2">
            {[
              { name: 'Hardware', count: 12 },
              { name: 'Tutorials', count: 8 },
              { name: 'Community', count: 5 },
              { name: 'News', count: 3 },
            ].map(({ name, count }) => (
              <a key={name} href="#" className="flex justify-between items-center py-2 text-on-surface-variant hover:text-primary transition-colors group">
                <span className="text-sm font-medium">{name}</span>
                <span className="font-mono text-[10px] bg-surface-container px-2 py-1 rounded group-hover:bg-primary/20 transition-colors">{count}</span>
              </a>
            ))}
          </div>
        </div>
      </aside>
    </div>

    {/* Footer */}
    <footer className="mt-32 pt-12 border-t border-primary/10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-4">
          <span className="text-primary font-headline font-bold text-xl uppercase tracking-widest">Trebor Labs</span>
          <p className="font-body text-sm text-gray-400">© 2026 Trebor Labs. Technical Hardware Editorial.</p>
        </div>
        {[
          { title: 'Blog', links: ['Hardware', 'Tutorials', 'Community', 'News'] },
          { title: 'Legal', links: ['Privacy', 'Terms', 'Shipping', 'Returns'] },
        ].map(({ title, links }) => (
          <div key={title} className="space-y-4">
            <p className="font-mono text-[10px] text-primary tracking-widest uppercase">{title}</p>
            <ul className="space-y-2">{links.map((l) => <li key={l}><a className="font-body text-sm text-gray-500 hover:text-primary transition-all" href="#">{l}</a></li>)}</ul>
          </div>
        ))}
        <div className="space-y-4">
          <p className="font-mono text-[10px] text-primary tracking-widest uppercase">Newsletter</p>
          <div className="flex border-b border-outline-variant pb-2">
            <input className="bg-transparent border-none text-xs w-full focus:outline-none placeholder:text-gray-600" placeholder="email@labs.com" type="email" />
            <button className="text-primary"><span className="material-symbols-outlined">arrow_forward</span></button>
          </div>
        </div>
      </div>
    </footer>
  </main>
  );
};

export default Blog;
