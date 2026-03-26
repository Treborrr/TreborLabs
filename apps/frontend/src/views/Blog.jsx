import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL ?? '';

const readTime = (content = '') =>
  Math.max(1, Math.ceil(content.split(' ').length / 200));

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('es-PE', { month: 'short', year: 'numeric' }) : '';

const Blog = () => {
  const [posts, setPosts]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeCategory, setCategory] = useState('All');
  const [searchQuery, setSearch]      = useState('');

  useEffect(() => {
    fetch(`${API}/api/posts?limit=50`)
      .then(r => r.json())
      .then(data => setPosts(data.posts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const cats = [...new Set(posts.map(p => p.category).filter(Boolean))];
    return ['All', ...cats];
  }, [posts]);

  const categoryCounts = useMemo(() =>
    posts.reduce((acc, p) => {
      if (p.category) acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {}),
  [posts]);

  const filtered = useMemo(() => {
    return posts.filter(p => {
      const matchCat = activeCategory === 'All' || p.category === activeCategory;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q ||
        p.title.toLowerCase().includes(q) ||
        (p.excerpt || '').toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [posts, activeCategory, searchQuery]);

  const featuredPost = filtered.length > 0 && activeCategory === 'All' && !searchQuery
    ? filtered[0]
    : null;
  const regularPosts = featuredPost ? filtered.slice(1) : filtered;
  const recentPosts  = [...posts].slice(0, 5);

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
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
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
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Blog Grid */}
        <section className="lg:col-span-8">
          {loading ? (
            <div className="flex justify-center py-24">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Featured Post */}
              {featuredPost && (
                <article className="md:col-span-2 group">
                  <Link to={`/blog/${featuredPost.slug}`} className="block no-underline">
                    <div className="relative h-[400px] overflow-hidden rounded-xl bg-surface-container-low border border-outline-variant/10">
                      {featuredPost.coverImage ? (
                        <img
                          src={featuredPost.coverImage}
                          alt={featuredPost.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-container/20 to-surface-container-high flex items-center justify-center">
                          <span className="material-symbols-outlined text-6xl text-primary/20">article</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
                      <div className="absolute bottom-0 left-0 p-8 w-full">
                        <div className="flex items-center gap-3 mb-4">
                          {featuredPost.category && (
                            <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-mono tracking-widest uppercase border border-primary/30 rounded-full">
                              {featuredPost.category}
                            </span>
                          )}
                          <span className="text-on-surface-variant text-xs font-mono">
                            {formatDate(featuredPost.publishedAt)} · {readTime(featuredPost.content)} min read
                          </span>
                        </div>
                        <h2 className="font-headline text-2xl md:text-3xl font-bold tracking-tight text-on-surface mb-3 group-hover:text-primary transition-colors">
                          {featuredPost.title}
                        </h2>
                        {featuredPost.excerpt && (
                          <p className="text-on-surface-variant text-sm leading-relaxed hidden md:block max-w-2xl">
                            {featuredPost.excerpt}
                          </p>
                        )}
                        <span className="inline-flex items-center gap-2 text-primary font-mono text-xs mt-4 group/link">
                          LEER ARTÍCULO <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              )}

              {/* Regular Posts */}
              {regularPosts.map(post => (
                <article key={post.id} className="group">
                  <Link to={`/blog/${post.slug}`} className="block no-underline">
                    <div className="relative aspect-video overflow-hidden rounded-xl bg-surface-container-low border border-outline-variant/10 mb-4">
                      {post.coverImage ? (
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-container/20 to-surface-container-high flex items-center justify-center">
                          <span className="material-symbols-outlined text-4xl text-primary/20">article</span>
                        </div>
                      )}
                      {post.category && (
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-surface/70 backdrop-blur text-primary text-[10px] font-mono tracking-widest uppercase border border-primary/20 rounded-full">
                            {post.category}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant">
                        <span>{formatDate(post.publishedAt)}</span>
                        <span>·</span>
                        <span>{readTime(post.content)} min read</span>
                      </div>
                      <h3 className="font-headline font-bold text-lg tracking-tight group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-on-surface-variant text-sm leading-relaxed">{post.excerpt}</p>
                      )}
                      <span className="inline-flex items-center gap-2 text-primary font-mono text-xs mt-2 group/link">
                        LEER MÁS <span className="material-symbols-outlined text-sm group-hover/link:translate-x-1 transition-transform">arrow_forward</span>
                      </span>
                    </div>
                  </Link>
                </article>
              ))}

              {/* Empty state */}
              {filtered.length === 0 && !loading && (
                <div className="md:col-span-2 text-center py-20">
                  <span className="material-symbols-outlined text-5xl text-outline-variant mb-4 font-light block">article</span>
                  <p className="font-headline text-xl font-bold">No encontramos artículos.</p>
                  <p className="text-on-surface-variant text-sm mt-2">Intenta ajustar tus términos de búsqueda o categoría.</p>
                  <button
                    onClick={() => { setCategory('All'); setSearch(''); }}
                    className="mt-6 px-6 py-2 bg-surface-container-high border border-outline-variant/30 rounded text-sm text-primary hover:bg-surface-container-highest transition-colors font-bold tracking-tight"
                  >
                    Limpiar Filtros
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-10">
          {/* Recent Posts */}
          <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
            <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-primary mb-6">Posts Recientes</h3>
            <div className="space-y-4">
              {recentPosts.length > 0 ? recentPosts.map((post, i) => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="flex items-start gap-3 group no-underline">
                  <span className="font-mono text-[10px] text-primary mt-1 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                  <p className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors leading-relaxed">
                    {post.title}
                  </p>
                </Link>
              )) : (
                <p className="text-xs text-on-surface-variant/50 font-mono">Sin posts publicados aún.</p>
              )}
            </div>
          </div>

          {/* Newsletter */}
          <div className="bg-gradient-to-br from-primary/10 to-primary-container/20 rounded-xl p-6 border border-primary/20">
            <h3 className="font-headline font-bold text-lg mb-2">Newsletter Técnico</h3>
            <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
              Recibe análisis técnicos, reviews y noticias de hardware directamente en tu inbox.
            </p>
            <div className="space-y-3">
              <input
                className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm placeholder:text-outline/60 focus:ring-1 focus:ring-primary/40 focus:outline-none"
                placeholder="tu@email.com"
                type="email"
              />
              <button className="w-full py-3 bg-primary-container text-on-primary-container rounded-md font-headline font-bold text-sm uppercase tracking-widest hover:bg-primary transition-all">
                Suscribirme
              </button>
            </div>
          </div>

          {/* Categories */}
          {Object.keys(categoryCounts).length > 0 && (
            <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
              <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-primary mb-6">Categorías</h3>
              <div className="space-y-2">
                {Object.entries(categoryCounts).map(([name, count]) => (
                  <button
                    key={name}
                    onClick={() => setCategory(activeCategory === name ? 'All' : name)}
                    className="w-full flex justify-between items-center py-2 text-on-surface-variant hover:text-primary transition-colors group text-left"
                  >
                    <span className="text-sm font-medium">{name}</span>
                    <span className={`font-mono text-[10px] px-2 py-1 rounded transition-colors ${activeCategory === name ? 'bg-primary/20 text-primary' : 'bg-surface-container group-hover:bg-primary/20'}`}>
                      {count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

    </main>
  );
};

export default Blog;
