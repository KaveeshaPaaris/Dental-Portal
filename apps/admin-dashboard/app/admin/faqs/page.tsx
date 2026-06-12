'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Edit, Trash2, Plus } from 'lucide-react';
import api from '@/lib/api';
import { FAQ } from '@/types';
import toast from 'react-hot-toast';

export default function AdminFAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ question: '', answer: '', keywords: '' });

  const fetchFAQs = async () => {
    try {
      const res = await api.get('/faqs/admin');
      setFaqs(res.data);
    } catch (error) {
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k)
    };

    try {
      if (editingId) {
        await api.patch(`/faqs/admin/${editingId}`, payload);
        toast.success('FAQ updated');
      } else {
        await api.post('/faqs/admin', payload);
        toast.success('FAQ added');
      }
      setShowModal(false);
      setFormData({ question: '', answer: '', keywords: '' });
      setEditingId(null);
      fetchFAQs();
    } catch (error) {
      toast.error('Failed to save FAQ');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      await api.delete(`/faqs/admin/${id}`);
      toast.success('FAQ deleted');
      fetchFAQs();
    } catch (error) {
      toast.error('Failed to delete FAQ');
    }
  };

  const openEdit = (faq: FAQ) => {
    setEditingId(faq.id);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      keywords: faq.keywords ? faq.keywords.join(', ') : ''
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
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Chatbot Knowledge Base</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Manage the answers provided by the automated AI Chatbot.</p>
        </div>
        <button onClick={() => { setEditingId(null); setFormData({ question: '', answer: '', keywords: '' }); setShowModal(true); }} className="btn btn-primary">
          <Plus size={18} /> Add New FAQ
        </button>
      </div>

      {showModal && (
        <div className="card" style={{ marginBottom: 24, border: '2px solid var(--color-primary)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: 16 }}>{editingId ? 'Edit FAQ' : 'Add New FAQ'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Question / Trigger Phrase</label>
              <input type="text" required className="form-input" value={formData.question} onChange={e => setFormData({...formData, question: e.target.value})} placeholder="e.g. What are your opening hours?" />
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Chatbot Answer</label>
              <textarea required className="form-input" rows={4} value={formData.answer} onChange={e => setFormData({...formData, answer: e.target.value})} placeholder="The exact text the bot will reply with..." />
            </div>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Keywords (comma separated)</label>
              <input type="text" className="form-input" value={formData.keywords} onChange={e => setFormData({...formData, keywords: e.target.value})} placeholder="hours, open, time, close" />
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: 4 }}>Used by the bot to match patient questions to this answer.</div>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Save'} FAQ</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
        {faqs.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>No FAQs found.</div>
        ) : (
          faqs.map(faq => (
            <div key={faq.id} className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                <MessageCircle size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: 4 }}>{faq.question}</div>
                <div style={{ color: 'var(--color-text-secondary)', marginBottom: 12 }}>{faq.answer}</div>
                {faq.keywords && faq.keywords.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {faq.keywords.map(kw => <span key={kw} className="badge" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>{kw}</span>)}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => openEdit(faq)} className="btn btn-secondary btn-sm"><Edit size={16} /></button>
                <button onClick={() => handleDelete(faq.id)} className="btn btn-danger btn-sm"><Trash2 size={16} /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
