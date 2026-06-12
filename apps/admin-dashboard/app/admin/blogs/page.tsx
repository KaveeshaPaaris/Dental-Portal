'use client';

import { useState, useEffect } from 'react';
import { Newspaper, Edit, Trash2, Plus, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';
import { Blog } from '@/types';
import toast from 'react-hot-toast';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

const EMPTY_FORM = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: 'General',
  cover_image: '',
  is_published: false,
};

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const fetchBlogs = async () => {
    try {
      const res = await api.get('/blogs/admin/all');
      setBlogs(res.data);
    } catch (error) {
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: editingId ? formData.slug : generateSlug(title),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      cover_image: formData.cover_image || undefined,
    };

    try {
      if (editingId) {
        await api.patch(`/blogs/admin/${editingId}`, payload);
        toast.success('Blog post updated');
      } else {
        await api.post('/blogs/admin', payload);
        toast.success('Blog post created');
      }
      setShowModal(false);
      setFormData(EMPTY_FORM);
      setEditingId(null);
      fetchBlogs();
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Failed to save blog post';
      toast.error(msg);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    try {
      await api.delete(`/blogs/admin/${id}`);
      toast.success('Blog post deleted');
      fetchBlogs();
    } catch (error) {
      toast.error('Failed to delete blog post');
    }
  };

  const handleTogglePublish = async (blog: Blog) => {
    try {
      await api.patch(`/blogs/admin/${blog.id}`, {
        is_published: !blog.is_published,
      });
      toast.success(blog.is_published ? 'Blog post unpublished' : 'Blog post published');
      fetchBlogs();
    } catch (error) {
      toast.error('Failed to update publish status');
    }
  };

  const openEdit = (blog: Blog) => {
    setEditingId(blog.id);
    setFormData({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      category: blog.category,
      cover_image: blog.cover_image || '',
      is_published: blog.is_published,
    });
    setShowModal(true);
  };

  if (loading) {
    return <div className="skeleton" style={{ height: 600 }}></div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Newspaper color="var(--color-primary)" /> Blog Posts
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Create and manage blog posts for the public website.</p>
        </div>
        <button onClick={() => { setEditingId(null); setFormData(EMPTY_FORM); setShowModal(true); }} className="btn btn-primary">
          <Plus size={18} /> New Post
        </button>
      </div>

      {showModal && (
        <div className="card" style={{ marginBottom: 24, border: '2px solid var(--color-primary)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: 16 }}>{editingId ? 'Edit Blog Post' : 'Create New Blog Post'}</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.title}
                  onChange={e => handleTitleChange(e.target.value)}
                  placeholder="e.g. 10 Tips for Healthier Teeth"
                />
              </div>
              <div className="form-group">
                <label className="form-label">URL Slug</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.slug}
                  onChange={e => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="10-tips-for-healthier-teeth"
                />
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                  Auto-generated from title. Edit if needed.
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Oral Hygiene, Treatments"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Cover Image URL (optional)</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.cover_image}
                  onChange={e => setFormData({ ...formData, cover_image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Excerpt (short preview text)</label>
              <textarea
                required
                className="form-input"
                rows={2}
                value={formData.excerpt}
                onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="A brief summary shown on the blog listing page..."
              />
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Content (full article)</label>
              <textarea
                required
                className="form-input"
                rows={10}
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write the full blog post content here..."
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={e => setFormData({ ...formData, is_published: e.target.checked })}
                />
                <span style={{ fontWeight: 500 }}>Publish immediately</span>
              </label>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Create'} Post</button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Title</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Category</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Status</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No blog posts yet. Click "New Post" to create your first article.
                </td>
              </tr>
            ) : (
              blogs.map(blog => (
                <tr key={blog.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: 500 }}>{blog.title}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: 4, fontFamily: 'monospace' }}>
                      /blogs/{blog.slug}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span className="badge" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' }}>
                      {blog.category}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {blog.is_published ? (
                      <span className="badge badge-success">Published</span>
                    ) : (
                      <span className="badge" style={{ background: 'var(--color-surface-2)' }}>Draft</span>
                    )}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                      <button
                        onClick={() => handleTogglePublish(blog)}
                        className="btn btn-secondary btn-sm"
                        title={blog.is_published ? 'Unpublish' : 'Publish'}
                      >
                        {blog.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button onClick={() => openEdit(blog)} className="btn btn-secondary btn-sm" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(blog.id)} className="btn btn-danger btn-sm" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
