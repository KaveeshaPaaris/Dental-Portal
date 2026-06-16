'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Eye, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '@/lib/api';
import { Booking } from '@/types';
import toast from 'react-hot-toast';
import DatePicker from '@/components/admin/DatePicker';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 50;

  // Sorting & Filtering State
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState('');
  const [sessionFilter, setSessionFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [highlightedDates, setHighlightedDates] = useState<string[]>([]);

  useEffect(() => {
    const fetchDates = async () => {
      try {
        const res = await api.get('/bookings/created-dates');
        setHighlightedDates(res.data.dates);
      } catch (err) {
        console.error('Failed to fetch booked dates', err);
      }
    };
    fetchDates();
  }, []);

  const fetchBookings = async (currentPage = 1) => {
    try {
      setLoading(true);
      let url = `/bookings?page=${currentPage}&limit=${limit}&sortBy=${sortBy}&order=${sortOrder}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (sessionFilter) url += `&preferred_session=${sessionFilter}`;
      if (dateFilter) url += `&booked_date=${dateFilter}`;

      const res = await api.get(url);
      setBookings(res.data.data);
      setTotal(res.data.total);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(page);
  }, [page, sortBy, sortOrder, statusFilter, sessionFilter, dateFilter]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setPage(1); // Reset to page 1 on sort change
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1); // Reset to page 1 on filter change
  };

  const handleSessionFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSessionFilter(e.target.value);
    setPage(1); // Reset to page 1 on filter change
  };

  const handleDateFilterChange = (val: string) => {
    setDateFilter(val);
    setPage(1); // Reset to page 1 on filter change
  };

  const clearFilters = () => {
    setStatusFilter('');
    setSessionFilter('');
    setDateFilter('');
    setSortBy('created_at');
    setSortOrder('desc');
    setPage(1);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_REVIEW': return <span className="badge badge-warning">Pending Review</span>;
      case 'ACCEPTED': return <span className="badge badge-success">Accepted</span>;
      case 'REJECTED': return <span className="badge badge-error">Rejected</span>;
      case 'COMPLETED': return <span className="badge badge-info">Completed</span>;
      case 'CANCELLED': return <span className="badge badge-error">Cancelled</span>;
      case 'PENDING_OTP': return <span className="badge" style={{ background: 'var(--color-surface-2)' }}>Awaiting OTP</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  const handleStatusChange = async (id: string, action: 'accept' | 'reject') => {
    const booking = bookings.find(b => b.id === id);
    try {
      if (action === 'accept' && booking) {
        await api.patch(`/bookings/${id}/accept`, {
          assigned_date: booking.preferred_date,
          assigned_session: booking.preferred_session,
        });
      } else {
        await api.patch(`/bookings/${id}/${action}`);
      }
      toast.success(`Booking ${action}ed successfully`);
      fetchBookings(page);
    } catch (error) {
      toast.error(`Failed to ${action} booking`);
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) return <span style={{ opacity: 0.3, marginLeft: 6, fontSize: '0.75rem' }}>↕</span>;
    return sortOrder === 'asc'
      ? <span style={{ color: 'var(--color-primary)', marginLeft: 6, fontSize: '0.85rem' }}>↑</span>
      : <span style={{ color: 'var(--color-primary)', marginLeft: 6, fontSize: '0.85rem' }}>↓</span>;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Bookings Queue</h1>
        <Link href="/admin/bookings/schedule" className="btn btn-primary">
          <Calendar size={18} /> Schedule Board
        </Link>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 8, fontWeight: 500 }}>Status</label>
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              minWidth: 180,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">All Statuses</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="PENDING_OTP">Awaiting OTP</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 8, fontWeight: 500 }}>Session</label>
          <select
            value={sessionFilter}
            onChange={handleSessionFilterChange}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              minWidth: 150,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">All Sessions</option>
            <option value="MORNING">Morning</option>
            <option value="EVENING">Evening</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 8, fontWeight: 500 }}>Booked Date</label>
          <DatePicker 
            value={dateFilter} 
            onChange={handleDateFilterChange} 
            highlightedDates={highlightedDates} 
          />
        </div>
        <button
          onClick={clearFilters}
          className="btn btn-secondary"
          style={{ height: 42, padding: '0 20px' }}
        >
          Clear Filters
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        {loading && bookings.length === 0 ? (
           <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading bookings...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
              <tr>
                <th 
                  onClick={() => handleSort('patient_name')} 
                  style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                  title="Sort by Patient Name"
                >
                  Patient <SortIcon column="patient_name" />
                </th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Time</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Contact</th>
                <th 
                  onClick={() => handleSort('preferred_date')} 
                  style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                  title="Sort by Requested Date"
                >
                  Requested Date <SortIcon column="preferred_date" />
                </th>
                <th 
                  onClick={() => handleSort('status')} 
                  style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                  title="Sort by Status"
                >
                  Status <SortIcon column="status" />
                </th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No bookings found matching your criteria.
                  </td>
                </tr>
              ) : (
                bookings.map((booking, index) => {
                  const bookedDateStr = format(new Date(booking.created_at), 'MMM dd, yyyy');
                  const prevBooking = index > 0 ? bookings[index - 1] : null;
                  const prevBookedDateStr = prevBooking ? format(new Date(prevBooking.created_at), 'MMM dd, yyyy') : null;
                  
                  const showSeparator = sortBy === 'created_at' && bookedDateStr !== prevBookedDateStr;

                  return (
                    <React.Fragment key={booking.id}>
                      {showSeparator && (
                        <tr style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
                          <td colSpan={6} style={{ padding: '12px 24px', fontWeight: 600, color: 'var(--color-primary)' }}>
                            {bookedDateStr}
                          </td>
                        </tr>
                      )}
                      <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-2)' }}>
                        <td style={{ padding: '16px 24px', fontWeight: 500 }}>
                          {booking.patient_name}
                          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                            Source: {booking.source}
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px', color: 'var(--color-text-secondary)' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem' }}>
                            <Clock size={14} color="var(--color-text-muted)" />
                            {format(new Date(booking.created_at), 'hh:mm a')}
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px', color: 'var(--color-text-secondary)' }}>
                          {booking.patient_phone}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <Calendar size={14} color="var(--color-text-muted)" />
                            {format(new Date(booking.preferred_date), 'MMM dd, yyyy')}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                            <Clock size={14} color="var(--color-text-muted)" />
                            {booking.preferred_session}
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          {getStatusBadge(booking.status)}
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            {booking.status === 'PENDING_REVIEW' && (
                              <>
                                <button onClick={() => handleStatusChange(booking.id, 'accept')} className="btn btn-sm" style={{ color: 'var(--color-success)', background: 'rgba(34,197,94,0.1)' }} title="Accept">
                                  <CheckCircle size={16} />
                                </button>
                                <button onClick={() => handleStatusChange(booking.id, 'reject')} className="btn btn-sm" style={{ color: 'var(--color-error)', background: 'rgba(239,68,68,0.1)' }} title="Reject">
                                  <XCircle size={16} />
                                </button>
                              </>
                            )}
                            <Link href={`/admin/bookings/${booking.id}`} className="btn btn-secondary btn-sm" title="View Details">
                              <Eye size={16} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {total > limit && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
          <div style={{ color: 'var(--color-text-secondary)' }}>
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} bookings
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button 
              className="btn btn-secondary" 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </button>
            <button 
              className="btn btn-secondary" 
              disabled={page * limit >= total} 
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
