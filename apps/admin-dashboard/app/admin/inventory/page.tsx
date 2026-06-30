'use client';

import { useState, useEffect } from 'react';
import { Package, AlertTriangle, Plus, Edit, Trash2, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import api from '@/lib/api';
import { InventoryItem } from '@/types';
import toast from 'react-hot-toast';
import ImageUploader from '@/components/ImageUploader';

const EMPTY_FORM = {
  name: '',
  description: '',
  unit: '',
  current_quantity: 0,
  minimum_threshold: 0,
  image_url: '',
};

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  // Stock adjust inline state: { [itemId]: amount }
  const [adjustAmounts, setAdjustAmounts] = useState<Record<string, number>>({});

  const fetchInventory = async () => {
    try {
      const res = await api.get('/admin/inventory');
      setInventory(res.data);
    } catch {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  // ── Form handlers ──────────────────────────────────────────
  function openCreate() {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(item: InventoryItem) {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      description: item.description ?? '',
      unit: item.unit,
      current_quantity: item.current_quantity,
      minimum_threshold: item.minimum_threshold,
      image_url: item.image_url ?? '',
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      ...formData,
      image_url: formData.image_url || undefined,
    };

    try {
      if (editingId) {
        // When editing, don't send current_quantity (managed via stock logs)
        const { current_quantity, ...updatePayload } = payload;
        await api.patch(`/admin/inventory/${editingId}`, updatePayload);
        toast.success('Item updated');
      } else {
        await api.post('/admin/inventory', payload);
        toast.success('Item added to inventory');
      }
      closeModal();
      fetchInventory();
    } catch {
      toast.error('Failed to save item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this inventory item? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/inventory/${id}`);
      toast.success('Item deleted');
      fetchInventory();
    } catch {
      toast.error('Failed to delete item');
    }
  };

  const handleAdjustStock = async (id: string, action: 'RESTOCK' | 'USED') => {
    const amount = adjustAmounts[id] ?? 1;
    if (amount <= 0) { toast.error('Enter a quantity greater than 0'); return; }
    try {
      await api.post(`/admin/inventory/${id}/log`, {
        action,
        quantity_change: action === 'USED' ? -amount : amount,
      });
      toast.success(`Stock ${action === 'RESTOCK' ? 'restocked' : 'marked as used'} (${amount})`);
      fetchInventory();
    } catch {
      toast.error('Failed to adjust stock');
    }
  };

  if (loading) return <div className="skeleton" style={{ height: 500 }} />;

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Package color="var(--color-primary)" /> Inventory Management
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 4 }}>
            Manage supplies, set thresholds, and track stock levels.
          </p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <Plus size={18} /> Add New Item
        </button>
      </div>

      {/* ── Modal (Create / Edit) ───────────────────────────── */}
      {showModal && (
        <div className="card" style={{ marginBottom: 24, border: '2px solid var(--color-primary)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 20 }}>
            {editingId ? 'Edit Inventory Item' : 'Add New Inventory Item'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Item Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Latex Gloves"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Unit</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.unit}
                  onChange={e => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g. boxes, pcs, ml"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">
                Description
                <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: 6, fontSize: '0.8rem' }}>
                  (optional)
                </span>
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the item"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {!editingId && (
                <div className="form-group">
                  <label className="form-label">Initial Quantity</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="form-input"
                    value={formData.current_quantity}
                    onChange={e => setFormData({ ...formData, current_quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
              )}
              <div className="form-group" style={{ gridColumn: editingId ? '1 / -1' : 'auto' }}>
                <label className="form-label">Low Stock Alert Threshold</label>
                <input
                  type="number"
                  required
                  min="0"
                  className="form-input"
                  value={formData.minimum_threshold}
                  onChange={e => setFormData({ ...formData, minimum_threshold: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            {/* Image Uploader */}
            <div style={{ marginBottom: 24 }}>
              <ImageUploader
                label="Item Image"
                bucket="blog-images"
                value={formData.image_url}
                onChange={url => setFormData({ ...formData, image_url: url })}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" onClick={closeModal} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving…' : editingId ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Grid ──────────────────────────────────────────── */}
      {inventory.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          No items in inventory. Click "Add New Item" to get started.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
          {inventory.map(item => (
            <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: 0, overflow: 'hidden' }}>
              {/* Top: Image */}
              {item.image_url ? (
                <div style={{
                  width: '100%',
                  height: 180,
                  position: 'relative',
                  borderBottom: '1px solid var(--color-border)',
                  background: 'var(--color-surface-2)',
                }}>
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 340px"
                    style={{ objectFit: 'cover' }}
                    unoptimized
                  />
                </div>
              ) : (
                <div style={{
                  width: '100%',
                  height: 180,
                  background: 'var(--color-surface-2)',
                  borderBottom: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <ImageIcon size={48} color="var(--color-text-muted)" />
                </div>
              )}

              {/* Bottom: Info and Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', padding: 20, flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <h3 style={{ fontWeight: 600, fontSize: '1.25rem', margin: '0 0 8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </h3>
                  {item.is_low_stock && (
                    <span className="badge badge-error" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', fontSize: '0.75rem' }}>
                      <AlertTriangle size={14} /> Low
                    </span>
                  )}
                </div>
                
                {item.description && (
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.description}
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: 16, fontSize: '0.875rem', marginTop: 'auto', marginBottom: 16, background: 'var(--color-surface-2)', padding: '12px 16px', borderRadius: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>In Stock</div>
                    <strong style={{ color: 'var(--color-text-primary)', fontSize: '1.125rem' }}>{item.current_quantity}</strong> <span style={{ color: 'var(--color-text-muted)' }}>{item.unit}</span>
                  </div>
                  <div style={{ width: 1, background: 'var(--color-border)' }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Threshold</div>
                    <span style={{ color: 'var(--color-text-primary)', fontSize: '1.125rem' }}>{item.minimum_threshold}</span>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: 'var(--color-border)', margin: '0 -20px 16px' }}></div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="number"
                      min="1"
                      value={adjustAmounts[item.id] ?? 1}
                      onChange={e => setAdjustAmounts(prev => ({ ...prev, [item.id]: parseInt(e.target.value) || 1 }))}
                      style={{
                        width: 56,
                        padding: '6px 8px',
                        borderRadius: 6,
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-surface)',
                        color: 'var(--color-text-primary)',
                        fontSize: '0.875rem',
                        textAlign: 'center',
                      }}
                    />
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        onClick={() => handleAdjustStock(item.id, 'USED')}
                        className="btn btn-secondary btn-sm"
                        title="Mark as used"
                      >
                        − Used
                      </button>
                      <button
                        onClick={() => handleAdjustStock(item.id, 'RESTOCK')}
                        className="btn btn-primary btn-sm"
                        title="Restock"
                      >
                        + Restock
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => openEdit(item)} className="btn btn-secondary btn-sm" title="Edit">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="btn btn-danger btn-sm" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
