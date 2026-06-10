'use client';

import { useState, useEffect } from 'react';
import { Save, Globe, Type } from 'lucide-react';
import api from '@/lib/api';
import { SiteContent } from '@/types';
import toast from 'react-hot-toast';

export default function AdminContentPage() {
  const [content, setContent] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  // Local state for edits before saving
  const [edits, setEdits] = useState<Record<string, string>>({});

  const fetchContent = async () => {
    try {
      const res = await api.get('/content');
      const data = res.data;
      setContent(data);
      
      const initialEdits: Record<string, string> = {};
      data.forEach((item: SiteContent) => {
        initialEdits[item.key] = String(item.value);
      });
      setEdits(initialEdits);
    } catch (error) {
      toast.error('Failed to load site content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleSave = async (key: string) => {
    setSavingKey(key);
    try {
      await api.put(`/content/${key}`, { value: edits[key] });
      toast.success('Content updated');
      fetchContent();
    } catch (error) {
      toast.error('Failed to update content');
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return <div className="skeleton" style={{ height: 600 }}></div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Globe color="var(--color-primary)" /> Website Content Editor
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Update the text displayed on the public website directly from this dashboard.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
        {content.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No editable content keys found in the database.
          </div>
        ) : (
          content.map(item => (
            <div key={item.key} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Type size={18} color="var(--color-text-muted)" /> {item.label || item.key}
                  </h3>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: 4, fontFamily: 'monospace' }}>
                    Key: {item.key}
                  </div>
                </div>
                <button 
                  onClick={() => handleSave(item.key)} 
                  disabled={savingKey === item.key || edits[item.key] === String(item.value)}
                  className={`btn btn-primary ${savingKey === item.key ? 'btn-loading' : ''}`}
                >
                  <Save size={16} /> Save Changes
                </button>
              </div>

              {String(item.value).length > 100 ? (
                <textarea 
                  className="form-input" 
                  rows={5} 
                  value={edits[item.key] || ''}
                  onChange={e => setEdits({...edits, [item.key]: e.target.value})}
                />
              ) : (
                <input 
                  type="text" 
                  className="form-input" 
                  value={edits[item.key] || ''}
                  onChange={e => setEdits({...edits, [item.key]: e.target.value})}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
