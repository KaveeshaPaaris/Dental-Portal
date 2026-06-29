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
                bucket="inventory-images"
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

      {/* ── Table ──────────────────────────────────────────── */}
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Item</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Status</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>In Stock</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Threshold</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)', textAlign: 'right' }}>Adjust Stock</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No items in inventory. Click "Add New Item" to get started.
                </td>
              </tr>
            ) : (
              inventory.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {/* Item name + image */}
                  <td style={{ padding: '14px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {item.image_url ? (
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: 8,
                          overflow: 'hidden',
                          flexShrink: 0,
                          border: '1px solid var(--color-border)',
                          position: 'relative',
                        }}>
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            sizes="44px"
                            style={{ objectFit: 'cover' }}
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: 8,
                          background: 'var(--color-surface-2)',
                          border: '1px solid var(--color-border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <ImageIcon size={18} color="var(--color-text-muted)" />
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                        {item.description && (
                          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                            {item.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Status badge */}
                  <td style={{ padding: '14px 24px' }}>
                    {item.is_low_stock ? (
                      <span className="badge badge-error" style={{ display: 'flex', alignItems: 'center', gap: 4, width: 'fit-content' }}>
                        <AlertTriangle size={13} /> Low Stock
                      </span>
                    ) : (
                      <span className="badge badge-success">Sufficient</span>
                    )}
                  </td>

                  {/* Quantity */}
                  <td style={{ padding: '14px 24px', fontWeight: 600 }}>
                    {item.current_quantity}{' '}
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 400 }}>
                      {item.unit}
                    </span>
                  </td>

                  {/* Threshold */}
                  <td style={{ padding: '14px 24px', color: 'var(--color-text-secondary)' }}>
                    {item.minimum_threshold} {item.unit}
                  </td>

                  {/* Quick Adjust */}
                  <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6 }}>
                      <input
                        type="number"
                        min="1"
                        value={adjustAmounts[item.id] ?? 1}
                        onChange={e => setAdjustAmounts(prev => ({ ...prev, [item.id]: parseInt(e.target.value) || 1 }))}
                        style={{
                          width: 60,
                          padding: '4px 8px',
                          borderRadius: 6,
                          border: '1px solid var(--color-border)',
                          background: 'var(--color-surface)',
                          color: 'var(--color-text-primary)',
                          fontSize: '0.875rem',
                          textAlign: 'center',
                        }}
                      />
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
                  </td>

                  {/* Edit / Delete */}
                  <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                      <button onClick={() => openEdit(item)} className="btn btn-secondary btn-sm" title="Edit">
                        <Edit size={15} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="btn btn-danger btn-sm" title="Delete">
                        <Trash2 size={15} />
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
