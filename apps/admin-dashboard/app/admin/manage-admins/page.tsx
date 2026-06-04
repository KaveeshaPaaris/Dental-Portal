'use client';

import { useState, useEffect } from 'react';
import { Shield, UserPlus, ShieldAlert, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { AdminProfile } from '@/types';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ManageAdminsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [admins, setAdmins] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ full_name: '', email: '', password: '', role: 'ADMIN' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    // Only SUPER_ADMIN can access this page
    if (user && user.role !== 'SUPER_ADMIN') {
      toast.error('Unauthorized access');
      router.push('/admin/dashboard');
      return;
    }

    const fetchAdmins = async () => {
      try {
        const res = await api.get('/admin/admins');
        setAdmins(res.data);
      } catch (error) {
        toast.error('Failed to load admins');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchAdmins();
  }, [user, router]);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/admin/admins', newAdmin);
      toast.success('Admin created successfully');
      setShowModal(false);
      setNewAdmin({ full_name: '', email: '', password: '', role: 'ADMIN' });
      const res = await api.get('/admin/admins');
      setAdmins(res.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create admin');
    } finally {
      setCreating(false);
    }
  };

  const handleDeactivate = async (id: string, currentlyActive: boolean) => {
    if (id === user?.id) {
      toast.error("You cannot deactivate your own account");
      return;
    }
    const action = currentlyActive ? 'deactivate' : 'activate';
    try {
      await api.patch(`/admin/admins/${id}`, { is_active: !currentlyActive });
      toast.success(`Account ${action}d successfully`);
      const res = await api.get('/admin/admins');
      setAdmins(res.data);
    } catch (error) {
      toast.error(`Failed to ${action} account`);
    }
  };

  if (loading) return <div className="skeleton" style={{ height: 600 }}></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Shield color="var(--color-primary)" /> Admin Management
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Manage staff and super admin accounts.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <UserPlus size={18} /> Invite Admin
        </button>
      </div>

      {showModal && (
        <div className="card" style={{ marginBottom: 24, border: '2px solid var(--color-primary)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: 16 }}>Create New Admin Account</h2>
          <form onSubmit={handleCreateAdmin}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" required className="form-input" value={newAdmin.full_name} onChange={e => setNewAdmin({...newAdmin, full_name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" required className="form-input" value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Temporary Password</label>
                <input type="password" required className="form-input" minLength={6} value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-input" value={newAdmin.role} onChange={e => setNewAdmin({...newAdmin, role: e.target.value})}>
                  <option value="ADMIN">Staff (Can manage bookings & inventory)</option>
                  <option value="SUPER_ADMIN">Super Admin (Full access)</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" disabled={creating}>Cancel</button>
              <button type="submit" className={`btn btn-primary ${creating ? 'btn-loading' : ''}`} disabled={creating}>Create Account</button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Name</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Email</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Role</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Status</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '16px 24px', fontWeight: 500 }}>
                  {admin.full_name}
                  {admin.id === user?.id && <span className="badge badge-primary" style={{ marginLeft: 8 }}>You</span>}
                </td>
                <td style={{ padding: '16px 24px', color: 'var(--color-text-secondary)' }}>{admin.email}</td>
                <td style={{ padding: '16px 24px' }}>
                  {admin.role === 'SUPER_ADMIN' ? (
                    <span className="badge badge-accent" style={{ display: 'flex', alignItems: 'center', gap: 4, width: 'fit-content' }}>
                      <ShieldAlert size={14} /> Super Admin
                    </span>
                  ) : (
                    <span className="badge" style={{ background: 'var(--color-surface-2)' }}>Staff</span>
                  )}
                </td>
                <td style={{ padding: '16px 24px' }}>
                  {admin.is_active ? <span className="badge badge-success">Active</span> : <span className="badge badge-error">Inactive</span>}
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <button 
                    onClick={() => handleDeactivate(admin.id, admin.is_active)} 
                    className="btn btn-secondary btn-sm"
                    disabled={admin.id === user?.id}
                  >
                    {admin.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
