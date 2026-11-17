'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Save, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import styles from './page.module.css';

interface ScheduleOverride {
  id?: string;
  date: string;
  morning_enabled: boolean;
  evening_enabled: boolean;
  custom_session_enabled: boolean;
  custom_session_label: string | null;
  custom_session_start: string | null;
  custom_session_end: string | null;
  reason: string | null;
}

export default function SchedulePage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [overrides, setOverrides] = useState<Record<string, ScheduleOverride>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ScheduleOverride | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'SUPER_ADMIN') {
      router.replace('/admin/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN') {
      fetchOverrides();
    }
  }, [currentMonth, user]);

  useEffect(() => {
    if (selectedDate) {
      if (overrides[selectedDate]) {
        setFormData({ ...overrides[selectedDate] });
      } else {
        setFormData({
          date: selectedDate,
          morning_enabled: true,
          evening_enabled: true,
          custom_session_enabled: false,
          custom_session_label: '',
          custom_session_start: '08:00',
          custom_session_end: '16:00',
          reason: '',
        });
      }
    } else {
      setFormData(null);
    }
  }, [selectedDate, overrides]);

  const fetchOverrides = async () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const startDate = new Date(year, month, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

    try {
      const res = await api.get<ScheduleOverride[]>(`/schedule/overrides?from=${startDate}&to=${endDate}`);
      const overridesMap: Record<string, ScheduleOverride> = {};
      res.data.forEach(o => overridesMap[o.date] = o);
      setOverrides(overridesMap);
    } catch (err) {
      console.error('Failed to fetch overrides:', err);
      toast.error('Failed to load schedule overrides');
    }
  };

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

  const handleSave = async () => {
    if (!formData || !selectedDate) return;
    setIsSaving(true);
    try {
      await api.post('/schedule/overrides', formData);
      toast.success('Schedule updated');
      fetchOverrides();
    } catch (err) {
      toast.error('Failed to save override');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDate || !overrides[selectedDate]) {
      // Nothing to delete, just reset locally
      setFormData({
        date: selectedDate!,
        morning_enabled: true,
        evening_enabled: true,
        custom_session_enabled: false,
        custom_session_label: '',
        custom_session_start: '08:00',
        custom_session_end: '16:00',
        reason: '',
      });
      return;
    }
    
    setIsSaving(true);
    try {
      await api.delete(`/schedule/overrides/${selectedDate}`);
      toast.success('Override removed');
      fetchOverrides();
    } catch (err) {
      toast.error('Failed to remove override');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user || user.role !== 'SUPER_ADMIN') {
    return null; // or loading
  }

  // Calendar rendering logic
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const calendarDays = [];
  // Empty cells for days before the 1st
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(<div key={`empty-${i}`} className={`${styles.dayCell} ${styles.empty}`} />);
  }
  
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const override = overrides[dateStr];
    
    let badge = <div className={`${styles.badge} ${styles.default}`}>Standard Hours</div>;
    
    if (override) {
      if (override.custom_session_enabled) {
        badge = <div className={`${styles.badge} ${styles.custom}`}>Special Hours</div>;
      } else if (!override.morning_enabled && !override.evening_enabled) {
        badge = <div className={`${styles.badge} ${styles.closed}`}>Closed</div>;
      } else if (!override.morning_enabled) {
        badge = <div className={`${styles.badge} ${styles.partial}`}>Morning Closed</div>;
      } else if (!override.evening_enabled) {
        badge = <div className={`${styles.badge} ${styles.partial}`}>Evening Closed</div>;
      }
    }

    calendarDays.push(
      <div 
        key={dateStr} 
        className={`${styles.dayCell} ${selectedDate === dateStr ? styles.selected : ''}`}
        onClick={() => setSelectedDate(dateStr)}
      >
        <div className={styles.dateNumber}>{d}</div>
        {badge}
        {override?.reason && <div className={styles.badge} style={{background: 'transparent', color: '#64748b', fontSize: '0.65rem'}}>{override.reason}</div>}
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Schedule Management</h1>
          <p className="page-description">Manage clinic hours, close dates, and set custom sessions.</p>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.calendarSection}>
          <div className={styles.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <CalendarIcon size={24} className="text-primary" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-outline btn-sm" onClick={prevMonth}><ChevronLeft size={18} /></button>
              <button className="btn btn-outline btn-sm" onClick={nextMonth}><ChevronRight size={18} /></button>
            </div>
          </div>

          <div className={styles.calendarGrid}>
            <div className={styles.calendarHeader}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className={styles.dayName}>{d}</div>
              ))}
            </div>
            {calendarDays}
          </div>
        </div>

        {selectedDate && formData && (
          <div className={styles.panelSection}>
            <div className={styles.panelTitle}>
              {new Date(selectedDate).toLocaleString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>

            <div className={styles.toggleRow}>
              <span className={styles.toggleLabel}>Morning Session (9 AM - 1 PM)</span>
              <label className={styles.switch}>
                <input 
                  type="checkbox" 
                  checked={formData.morning_enabled} 
                  onChange={(e) => setFormData({...formData, morning_enabled: e.target.checked})}
                  disabled={formData.custom_session_enabled}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.toggleRow}>
              <span className={styles.toggleLabel}>Evening Session (5 PM - 9 PM)</span>
              <label className={styles.switch}>
                <input 
                  type="checkbox" 
                  checked={formData.evening_enabled} 
                  onChange={(e) => setFormData({...formData, evening_enabled: e.target.checked})}
                  disabled={formData.custom_session_enabled}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div style={{ margin: '1.5rem 0', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
              <div className={styles.toggleRow} style={{ background: 'var(--color-primary-light, #e0f2fe)' }}>
                <span className={styles.toggleLabel}>Enable Custom Session</span>
                <label className={styles.switch}>
                  <input 
                    type="checkbox" 
                    checked={formData.custom_session_enabled} 
                    onChange={(e) => setFormData({...formData, custom_session_enabled: e.target.checked})}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>

              {formData.custom_session_enabled && (
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label className={styles.formLabel}>Label (e.g. Special Hours)</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      value={formData.custom_session_label || ''}
                      onChange={(e) => setFormData({...formData, custom_session_label: e.target.value})}
                      placeholder="Special Hours"
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <div style={{flex: 1}}>
                      <label className={styles.formLabel}>Start Time</label>
                      <input 
                        type="time" 
                        className={styles.input} 
                        value={formData.custom_session_start || ''}
                        onChange={(e) => setFormData({...formData, custom_session_start: e.target.value})}
                      />
                    </div>
                    <div style={{flex: 1}}>
                      <label className={styles.formLabel}>End Time</label>
                      <input 
                        type="time" 
                        className={styles.input} 
                        value={formData.custom_session_end || ''}
                        onChange={(e) => setFormData({...formData, custom_session_end: e.target.value})}
                      />
                    </div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    Note: A custom session will replace both Morning and Evening sessions on the public booking page.
                  </div>
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Reason / Notes (Internal)</label>
              <textarea 
                className={styles.input} 
                value={formData.reason || ''}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                placeholder="e.g. Public Holiday, Doctor unavailable"
              />
            </div>

            <div className={styles.actions}>
              <button 
                className="btn btn-primary" 
                onClick={handleSave}
                disabled={isSaving}
              >
                <Save size={16} /> Save
              </button>
              {overrides[selectedDate] && (
                <button 
                  className="btn btn-outline" 
                  onClick={handleDelete}
                  disabled={isSaving}
                  style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                >
                  <Trash2 size={16} /> Reset Default
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
