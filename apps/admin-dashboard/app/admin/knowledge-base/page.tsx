'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Edit, Trash2, Plus, Eye, EyeOff, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import api from '@/lib/api';
import { KnowledgeBaseArticle, KnowledgeBaseStatus } from '@/types';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'General',
  'Services & Treatments',
  'Appointments & Bookings',
  'Pricing & Payments',
  'Clinic Information',
  'Post-Treatment Care',
  'Oral Hygiene',
  'Emergency & Urgent',
];

const EMPTY_FORM = {
  title: '',
  category: 'General',
  content: '',
  status: 'DRAFT' as KnowledgeBaseStatus,
};

export default function AdminKnowledgeBasePage() {
  const [articles, setArticles] = useState<KnowledgeBaseArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | KnowledgeBaseStatus>('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');

  const fetchArticles = async () => {
    try {
      const res = await api.get('/admin/knowledge-base');
      setArticles(res.data);
    } catch {
      toast.error('Failed to load knowledge base articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.patch(`/admin/knowledge-base/${editingId}`, formData);
        toast.success('Article updated');
      } else {
        await api.post('/admin/knowledge-base', formData);
        toast.success('Article created');
      }
      setShowModal(false);
      setFormData(EMPTY_FORM);
      setEditingId(null);
      fetchArticles();
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Failed to save article';
      toast.error(msg);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this article? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/knowledge-base/${id}`);
      toast.success('Article deleted');
      fetchArticles();
    } catch {
      toast.error('Failed to delete article');
    }
  };

  const handleToggleStatus = async (article: KnowledgeBaseArticle) => {
    const newStatus: KnowledgeBaseStatus = article.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await api.patch(`/admin/knowledge-base/${article.id}`, { status: newStatus });
      toast.success(`Article ${newStatus === 'PUBLISHED' ? 'published' : 'moved to draft'}`);
      fetchArticles();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const openEdit = (article: KnowledgeBaseArticle) => {
    setEditingId(article.id);
    setFormData({
      title: article.title,
      category: article.category,
      content: article.content,
      status: article.status,
    });
    setShowModal(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCreate = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setShowModal(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categories = ['ALL', ...Array.from(new Set(articles.map(a => a.category)))];

  const filtered = articles.filter(a => {
    const matchStatus = filterStatus === 'ALL' || a.status === filterStatus;
    const matchCategory = filterCategory === 'ALL' || a.category === filterCategory;
    return matchStatus && matchCategory;
  });

  if (loading) {
    return <div className="skeleton" style={{ height: 600 }} />;
  }

  const publishedCount = articles.filter(a => a.status === 'PUBLISHED').length;
  const draftCount = articles.filter(a => a.status === 'DRAFT').length;

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 12 }}>
            <BookOpen color="var(--color-primary)" /> Knowledge Base
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 4 }}>
            Manage articles that will power the AI assistant (RAG). Published articles are available for retrieval.
          </p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <Plus size={18} /> New Article
        </button>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
            <FileText size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{articles.length}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Total Articles</div>
          </div>
        </div>
        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
            <Eye size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{publishedCount}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Published (Active for AI)</div>
          </div>
        </div>
        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
            <EyeOff size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{draftCount}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Drafts</div>
          </div>
        </div>
      </div>

      {/* ── Create / Edit Form ── */}
      {showModal && (
        <div className="card" style={{ marginBottom: 24, border: '2px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{editingId ? 'Edit Article' : 'New Knowledge Base Article'}</h2>
            <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm">✕</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. What are your clinic opening hours?"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  required
                  className="form-input"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Content *</label>
              <textarea
                required
                className="form-input"
                rows={8}
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write the full knowledge article here. Be detailed and accurate — the AI assistant will use this content to answer patient questions..."
              />
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                Write clearly and in full sentences. The more detail you provide, the better the AI can answer related questions.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.status === 'PUBLISHED'}
                  onChange={e => setFormData({ ...formData, status: e.target.checked ? 'PUBLISHED' : 'DRAFT' })}
                />
                <span style={{ fontWeight: 500 }}>Publish immediately</span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  (Unpublished articles are saved as drafts and excluded from AI retrieval)
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary">{editingId ? 'Update Article' : 'Create Article'}</button>
            </div>
          </form>
        </div>
      )}

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <select
          className="form-input"
          style={{ width: 'auto', minWidth: 160 }}
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as any)}
        >
          <option value="ALL">All Statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
        </select>
        <select
          className="form-input"
          style={{ width: 'auto', minWidth: 200 }}
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
        >
          {categories.map(c => <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>)}
        </select>
        {(filterStatus !== 'ALL' || filterCategory !== 'ALL') && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { setFilterStatus('ALL'); setFilterCategory('ALL'); }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── Article Table ── */}
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Title</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Category</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Status</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Updated</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  {articles.length === 0
                    ? 'No articles yet. Click "New Article" to add your first knowledge base entry.'
                    : 'No articles match the current filters.'}
                </td>
              </tr>
            ) : (
              filtered.map(article => (
                <>
                  <tr
                    key={article.id}
                    style={{ borderBottom: expandedId === article.id ? 'none' : '1px solid var(--color-border)', cursor: 'pointer' }}
                    onClick={() => setExpandedId(expandedId === article.id ? null : article.id)}
                  >
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                        {expandedId === article.id ? <ChevronUp size={16} color="var(--color-primary)" /> : <ChevronDown size={16} color="var(--color-text-muted)" />}
                        {article.title}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span className="badge" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' }}>
                        {article.category}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      {article.status === 'PUBLISHED' ? (
                        <span className="badge badge-success">Published</span>
                      ) : (
                        <span className="badge" style={{ background: 'var(--color-surface-2)' }}>Draft</span>
                      )}
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                      {new Date(article.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <button
                          onClick={() => handleToggleStatus(article)}
                          className="btn btn-secondary btn-sm"
                          title={article.status === 'PUBLISHED' ? 'Move to Draft' : 'Publish'}
                        >
                          {article.status === 'PUBLISHED' ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button onClick={() => openEdit(article)} className="btn btn-secondary btn-sm" title="Edit">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(article.id)} className="btn btn-danger btn-sm" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === article.id && (
                    <tr key={`${article.id}-expanded`} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td colSpan={5} style={{ padding: '0 24px 20px 56px' }}>
                        <div style={{
                          background: 'var(--color-surface-2)',
                          borderRadius: 8,
                          padding: '16px 20px',
                          fontSize: '0.9375rem',
                          lineHeight: 1.7,
                          color: 'var(--color-text-secondary)',
                          whiteSpace: 'pre-wrap',
                          maxHeight: 300,
                          overflowY: 'auto',
                        }}>
                          {article.content}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
