import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { useAuth } from '../context/AuthContext';
import SEOMeta from '../components/SEOMeta';

const API = import.meta.env.VITE_API_URL ?? '';

const readTime = (content = '') =>
  Math.max(1, Math.ceil(content.split(' ').length / 200));

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

marked.use({ gfm: true, breaks: true });

const BlogPost = () => {
  const { slug } = useParams();
  const navigate  = useNavigate();
  const { user, authFetch } = useAuth();

  const [post, setPost]       = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Comments
  const [comments, setComments]       = useState([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo]         = useState(null); // { id, name }
  const [commentSaving, setCommentSaving] = useState(false);

  useEffect(() => {
    setComments([]);
    setCommentsLoaded(false);
  }, [slug]);

  useEffect(() => {
    if (!post?.id || commentsLoaded) return;
    fetch(`${API}/api/posts/${post.id}/comments`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setComments(d.comments || []); })
      .catch(() => {})
      .finally(() => setCommentsLoaded(true));
  }, [post?.id, commentsLoaded]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentSaving(true);
    try {
      const res = await authFetch(`${API}/api/posts/${post.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: commentText.trim(), parentId: replyTo?.id || null }),
      });
      const d = await res.json();
      if (res.ok) {
        if (replyTo) {
          setComments(prev => prev.map(c =>
            c.id === replyTo.id ? { ...c, replies: [...(c.replies || []), d.comment] } : c
          ));
        } else {
          setComments(prev => [...prev, { ...d.comment, replies: [] }]);
        }
        setCommentText('');
        setReplyTo(null);
      }
    } catch { } finally { setCommentSaving(false); }
  };

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    fetch(`${API}/api/posts/${slug}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then(data => {
        if (!data) return;
        setPost(data.post);
        setRelated(data.related || []);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <main className="pt-32 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (notFound || !post) {
    return (
      <main className="pt-32 pb-20 px-6 max-w-3xl mx-auto text-center">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant/20 mb-4 block">article</span>
        <h1 className="font-headline font-bold text-3xl mb-3">Artículo no encontrado</h1>
        <p className="text-on-surface-variant mb-8">Este post no existe o no está publicado.</p>
        <Link
          to="/blog"
          className="bg-primary-container text-on-primary-container font-headline font-bold px-6 py-3 rounded-lg text-xs uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all no-underline"
        >
          Volver al Blog
        </Link>
      </main>
    );
  }

  const htmlContent = DOMPurify.sanitize(marked.parse(post.content || ''));

  return (
    <main className="pt-28 pb-20">
      <SEOMeta
        title={`${post.title} — Trebor Labs Blog`}
        description={post.excerpt || post.title}
        image={post.coverImage || undefined}
      />
      {/* Hero / Cover */}
      {post.coverImage && (
        <div className="relative h-[400px] md:h-[520px] overflow-hidden mb-16">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-transparent" />
        </div>
      )}

      <div className="px-6 md:px-12 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* Article */}
          <article className="lg:col-span-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs font-mono text-on-surface-variant mb-8">
              <Link to="/blog" className="hover:text-primary transition-colors no-underline">Blog</Link>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
              {post.category && (
                <>
                  <span className="text-primary">{post.category}</span>
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </>
              )}
              <span className="truncate max-w-[200px]">{post.title}</span>
            </nav>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {post.category && (
                <span className="px-3 py-1 bg-primary/15 text-primary text-[10px] font-mono tracking-widest uppercase border border-primary/25 rounded-full">
                  {post.category}
                </span>
              )}
              {post.tags?.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant text-[10px] font-mono rounded">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="font-headline font-black text-3xl md:text-5xl tracking-tighter text-on-surface mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Author + Date */}
            <div className="flex items-center gap-4 pb-8 mb-10 border-b border-outline-variant/20">
              <div className="w-10 h-10 rounded-full bg-primary-container overflow-hidden flex-shrink-0">
                {post.author?.avatar ? (
                  <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-bold text-sm text-on-primary-container">
                      {(post.author?.name || 'A')[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">{post.author?.name || 'Trebor Labs'}</p>
                <p className="text-xs font-mono text-on-surface-variant">
                  {formatDate(post.publishedAt)} · {readTime(post.content)} min read
                </p>
              </div>
            </div>

            {/* Content */}
            <div
              className="prose-blog"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />

            {/* Tags footer */}
            {post.tags?.length > 0 && (
              <div className="mt-12 pt-8 border-t border-outline-variant/20 flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-surface-container-high text-on-surface-variant text-xs font-mono rounded-lg border border-outline-variant/20">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Navigation */}
            <div className="mt-12 pt-8 border-t border-outline-variant/20">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-primary font-mono text-sm hover:gap-3 transition-all no-underline"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Volver al Blog
              </Link>
            </div>

            {/* Comments */}
            <div className="mt-16 space-y-6">
              <h2 className="font-headline font-bold text-xl tracking-tight">
                Comentarios {comments.length > 0 && <span className="text-primary">({comments.length})</span>}
              </h2>

              {/* Comment list */}
              {comments.map(c => (
                <div key={c.id} className="space-y-3">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary-container/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="font-bold text-xs text-primary">{(c.user?.name || 'U')[0].toUpperCase()}</span>
                    </div>
                    <div className="flex-1 bg-surface-container-low rounded-xl p-4 border border-outline-variant/10 space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-bold text-sm text-on-surface">{c.user?.name || 'Usuario'}</span>
                        <span className="text-xs text-on-surface-variant/50 font-mono">
                          {new Date(c.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-sm text-on-surface-variant leading-relaxed">{c.content}</p>
                      {user && (
                        <button
                          onClick={() => setReplyTo(replyTo?.id === c.id ? null : { id: c.id, name: c.user?.name })}
                          className="text-xs font-mono text-primary hover:underline"
                        >
                          {replyTo?.id === c.id ? 'Cancelar' : 'Responder'}
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Replies */}
                  {(c.replies || []).map(r => (
                    <div key={r.id} className="flex items-start gap-4 ml-12">
                      <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="font-bold text-xs text-on-surface-variant">{(r.user?.name || 'U')[0].toUpperCase()}</span>
                      </div>
                      <div className="flex-1 bg-surface-container-low rounded-xl p-3 border border-outline-variant/10 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-on-surface">{r.user?.name}</span>
                          <span className="text-[10px] text-on-surface-variant/50 font-mono">
                            {new Date(r.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <p className="text-sm text-on-surface-variant">{r.content}</p>
                      </div>
                    </div>
                  ))}
                  {/* Inline reply form */}
                  {replyTo?.id === c.id && user && (
                    <form onSubmit={handleCommentSubmit} className="ml-12 flex gap-3">
                      <input
                        autoFocus
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        placeholder={`Respondiendo a ${replyTo.name}...`}
                        className="flex-1 bg-surface-container-highest border-none rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary/40 focus:outline-none"
                      />
                      <button type="submit" disabled={commentSaving || !commentText.trim()}
                        className="px-4 py-2 bg-primary-container text-on-primary-container rounded-lg font-mono text-xs hover:bg-primary hover:text-on-primary transition-all disabled:opacity-50">
                        {commentSaving ? '…' : 'Reply'}
                      </button>
                    </form>
                  )}
                </div>
              ))}

              {/* New comment form */}
              {user ? (
                !replyTo && (
                  <form onSubmit={handleCommentSubmit} className="space-y-3">
                    <textarea
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      placeholder="Deja tu comentario..."
                      rows={3}
                      className="w-full bg-surface-container-low border border-outline-variant/15 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary/40 focus:outline-none resize-none"
                    />
                    <button type="submit" disabled={commentSaving || !commentText.trim()}
                      className="flex items-center gap-2 bg-primary-container text-on-primary-container px-5 py-2.5 rounded-lg font-headline font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all disabled:opacity-50">
                      <span className="material-symbols-outlined text-sm">send</span>
                      {commentSaving ? 'Enviando…' : 'Comentar'}
                    </button>
                  </form>
                )
              ) : (
                <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 p-5 text-center space-y-2">
                  <p className="text-sm text-on-surface-variant">Inicia sesión para dejar un comentario.</p>
                  <Link to="/login" className="inline-flex items-center gap-1 text-primary font-mono text-sm hover:underline no-underline">
                    <span className="material-symbols-outlined text-sm">login</span>Iniciar sesión
                  </Link>
                </div>
              )}
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            {/* About Author */}
            <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
              <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-primary mb-5">Autor</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-container overflow-hidden flex-shrink-0">
                  {post.author?.avatar ? (
                    <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-bold text-sm text-on-primary-container">
                        {(post.author?.name || 'A')[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-bold text-sm text-on-surface">{post.author?.name || 'Trebor Labs'}</p>
                  <p className="text-xs text-on-surface-variant font-mono mt-0.5">Technical Editor</p>
                </div>
              </div>
            </div>

            {/* Related Posts */}
            {related.length > 0 && (
              <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
                <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-primary mb-6">
                  Artículos Relacionados
                </h3>
                <div className="space-y-5">
                  {related.map(r => (
                    <Link
                      key={r.id}
                      to={`/blog/${r.slug}`}
                      className="block group no-underline"
                    >
                      {r.coverImage && (
                        <div className="aspect-video rounded-lg overflow-hidden mb-3 bg-surface-container-high">
                          <img
                            src={r.coverImage}
                            alt={r.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <p className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors leading-snug">
                        {r.title}
                      </p>
                      {r.publishedAt && (
                        <p className="text-xs font-mono text-on-surface-variant mt-1">
                          {formatDate(r.publishedAt)}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Share */}
            <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
              <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-primary mb-5">Compartir</h3>
              <div className="flex gap-3">
                {[
                  { icon: 'link', label: 'Copiar link', action: () => navigator.clipboard.writeText(window.location.href) },
                  { icon: 'share', label: 'Compartir', action: () => navigator.share?.({ title: post.title, url: window.location.href }) },
                ].map(({ icon, label, action }) => (
                  <button
                    key={icon}
                    onClick={action}
                    title={label}
                    className="flex items-center gap-2 px-4 py-2 bg-surface-container-high rounded-lg text-xs font-mono text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default BlogPost;
