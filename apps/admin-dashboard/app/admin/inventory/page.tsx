'use client';

import { useState, useEffect } from 'react';
import { Package, AlertTriangle, Plus } from 'lucide-react';
import api from '@/lib/api';
import { InventoryItem } from '@/types';
import toast from 'react-hot-toast';

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New item modal state (mocked as inline form for brevity)
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', unit: '', current_quantity: 0, minimum_threshold: 0 });

  const fetchInventory = async () => {
    try {
      const res = await api.get('/admin/inventory');
      setInventory(res.data);
    } catch (error) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/inventory', newItem);
      toast.success('Item added to inventory');
      setShowAddForm(false);
      setNewItem({ name: '', unit: '', current_quantity: 0, minimum_threshold: 0 });
      fetchInventory();
    } catch (error) {
      toast.error('Failed to add item');
    }
  };

  const handleAdjustStock = async (id: string, action: 'RESTOCK' | 'USED', amount: number) => {
    if (amount <= 0) return;
    try {
      await api.post(`/admin/inventory/${id}/log`, { action, quantity: amount });
      toast.success(`Stock ${action.toLowerCase()}ed`);
      fetchInventory();
    } catch (error) {
      toast.error('Failed to adjust stock');
    }
  };

  if (loading) {
    return <div className="skeleton" style={{ height: 500 }}></div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Inventory Management</h1>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary">
          <Plus size={18} /> Add New Item
        </button>
      </div>

      {showAddForm && (
        <div className="card" style={{ marginBottom: 24, background: 'var(--color-surface-2)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: 16 }}>Add New Inventory Item</h2>
          <form onSubmit={handleAddItem} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 16, alignItems: 'end' }}>
            <div className="form-group">
              <label className="form-label">Item Name</label>
              <input type="text" required className="form-input" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Unit (e.g. boxes, pcs)</label>
              <input type="text" required className="form-input" value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Initial Quantity</label>
              <input type="number" required min="0" className="form-input" value={newItem.current_quantity} onChange={e => setNewItem({...newItem, current_quantity: parseInt(e.target.value)})} />
            </div>
            <div className="form-group">
              <label className="form-label">Low Stock Alert Threshold</label>
              <input type="number" required min="0" className="form-input" value={newItem.minimum_threshold} onChange={e => setNewItem({...newItem, minimum_threshold: parseInt(e.target.value)})} />
            </div>
            <button type="submit" className="btn btn-primary">Save Item</button>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Item</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Status</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>In Stock</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Threshold</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)', textAlign: 'right' }}>Quick Adjust</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No items in inventory.
                </td>
              </tr>
            ) : (
              inventory.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Package size={20} color="var(--color-text-muted)" />
                    {item.name}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {item.is_low_stock ? (
                      <span className="badge badge-error" style={{ display: 'flex', alignItems: 'center', gap: 4, width: 'fit-content' }}>
                        <AlertTriangle size={14} /> Low Stock
                      </span>
                    ) : (
                      <span className="badge badge-success">Sufficient</span>
                    )}
                  </td>
                  <td style={{ padding: '16px 24px', fontWeight: 600 }}>
                    {item.current_quantity} <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 400 }}>{item.unit}</span>
                  </td>
                  <td style={{ padding: '16px 24px', color: 'var(--color-text-secondary)' }}>
                    {item.minimum_threshold}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                      <button onClick={() => handleAdjustStock(item.id, 'USED', 1)} className="btn btn-secondary btn-sm" title="Mark 1 Used">
                        -1
                      </button>
                      <button onClick={() => handleAdjustStock(item.id, 'RESTOCK', 10)} className="btn btn-secondary btn-sm" title="Restock 10">
                        +10
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
