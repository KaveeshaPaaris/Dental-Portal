'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  DndContext, DragOverlay, closestCorners,
  KeyboardSensor, PointerSensor, useSensor, useSensors,
  DragStartEvent, DragEndEvent, DragOverEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext, arrayMove, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, isSameMonth, isSameDay, addMonths, subMonths,
} from 'date-fns';
import {
  ChevronLeft, ChevronRight, GripVertical, Clock, Phone, Mail,
  User, CheckCircle, ArrowLeftCircle, X, SunMedium, Moon, Loader2, CalendarCheck,
} from 'lucide-react';
import api from '@/lib/api';
import { Booking } from '@/types';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────

type ColumnId = 'pending' | 'MORNING' | 'EVENING';

// ─── Helpers ──────────────────────────────────────────────────

function findContainer(id: string, columns: Record<ColumnId, Booking[]>): ColumnId | null {
  for (const col of Object.keys(columns) as ColumnId[]) {
    if (columns[col].some(b => b.id === id)) return col;
  }
  return null;
}

function resolveOverContainer(
  overId: string,
  overSortableContainerId: string | undefined,
  columns: Record<ColumnId, Booking[]>,
): ColumnId | null {
  // Prefer the sortable container id reported by dnd-kit (most reliable)
  const candidate = overSortableContainerId ?? overId;
  if (candidate === 'pending' || candidate === 'MORNING' || candidate === 'EVENING') {
    return candidate as ColumnId;
  }
  // Fallback: the over target is an item, find its column
  return findContainer(overId, columns);
}

// ─── Mini Calendar ────────────────────────────────────────────

function MiniCalendar({
  selectedDate, onSelectDate, bookedDates,
}: {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  bookedDates: Set<string>;
}) {
  const [viewMonth, setViewMonth] = useState(selectedDate);
  const monthStart = startOfMonth(viewMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 1 });
  const days: Date[] = [];
  let cur = calStart;
  while (cur <= calEnd) { days.push(cur); cur = addDays(cur, 1); }

  return (
    <div style={{
      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-xl)', padding: 20, position: 'sticky', top: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button onClick={() => setViewMonth(subMonths(viewMonth, 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: 4, borderRadius: 6 }}>
          <ChevronLeft size={18} />
        </button>
        <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>
          {format(viewMonth, 'MMMM yyyy')}
        </span>
        <button onClick={() => setViewMonth(addMonths(viewMonth, 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: 4, borderRadius: 6 }}>
          <ChevronRight size={18} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-muted)', padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, viewMonth);
          return (
            <button key={dateStr} onClick={() => onSelectDate(day)} style={{
              position: 'relative', width: '100%', aspectRatio: '1', borderRadius: 8,
              border: isToday && !isSelected ? '1px solid var(--color-primary)' : '1px solid transparent',
              background: isSelected ? 'var(--color-primary)' : 'transparent',
              color: isSelected ? '#fff' : isCurrentMonth ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              fontWeight: isSelected || isToday ? 700 : 400, fontSize: '0.8125rem', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
              opacity: isCurrentMonth ? 1 : 0.35, transition: 'all 0.15s',
            }}>
              {format(day, 'd')}
              {bookedDates.has(dateStr) && (
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: isSelected ? '#fff' : 'var(--color-primary)', flexShrink: 0 }} />
              )}
            </button>
          );
        })}
      </div>

      <button onClick={() => { setViewMonth(new Date()); onSelectDate(new Date()); }} style={{
        marginTop: 16, width: '100%', padding: '8px',
        background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
        borderRadius: 8, fontSize: '0.8125rem', fontWeight: 500,
        color: 'var(--color-text-secondary)', cursor: 'pointer',
      }}>
        Today
      </button>
    </div>
  );
}

// ─── Booking Card ─────────────────────────────────────────────
// The ENTIRE card is draggable — listeners are on the outer div.
// onClick fires only if the pointer didn't travel (dnd-kit handles this via activationConstraint).

function SortableBookingCard({
  booking, onClick, showDate,
}: {
  booking: Booking;
  onClick: () => void;
  showDate?: boolean;
}) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: booking.id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onClick}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition ?? 'transform 200ms ease',
        opacity: isDragging ? 0 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 10,
        padding: '12px 14px',
        marginBottom: 10,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none',
        boxShadow: 'none',
        outline: 'none',
      }}
      className="booking-card"
    >
      {/* Visual grip hint (decorative only — whole card is draggable) */}
      <div style={{
        color: 'var(--color-text-muted)',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
        pointerEvents: 'none',
      }}>
        <GripVertical size={16} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          {booking.appointment_number && (
            <span style={{
              background: 'var(--color-primary)', color: '#fff',
              borderRadius: 6, fontSize: '0.6875rem', fontWeight: 700,
              padding: '1px 7px', flexShrink: 0,
            }}>
              #{booking.appointment_number}
            </span>
          )}
          <span style={{
            fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.9rem',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {booking.patient_name}
          </span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={11} />
          Booked {format(new Date(booking.created_at), 'MMM d, h:mm a')}
          {showDate && booking.preferred_date && (
            <span style={{ marginLeft: 4, color: 'var(--color-primary)', fontWeight: 500 }}>
              · {format(new Date(booking.preferred_date), 'MMM d')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Drag Overlay Ghost Card ───────────────────────────────────

function GhostCard({ booking, showDate }: { booking: Booking; showDate?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'var(--color-surface)',
      border: '2px solid var(--color-primary)',
      borderRadius: 10, padding: '12px 14px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
      cursor: 'grabbing', userSelect: 'none',
      transform: 'rotate(1.5deg) scale(1.03)',
      opacity: 0.96,
    }}>
      <div style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <GripVertical size={16} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          {booking.appointment_number && (
            <span style={{
              background: 'var(--color-primary)', color: '#fff',
              borderRadius: 6, fontSize: '0.6875rem', fontWeight: 700, padding: '1px 7px', flexShrink: 0,
            }}>
              #{booking.appointment_number}
            </span>
          )}
          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {booking.patient_name}
          </span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={11} />
          Booked {format(new Date(booking.created_at), 'MMM d, h:mm a')}
          {showDate && booking.preferred_date && (
            <span style={{ marginLeft: 4, color: 'var(--color-primary)', fontWeight: 500 }}>
              · {format(new Date(booking.preferred_date), 'MMM d')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Column ───────────────────────────────────────────────────

function DroppableColumn({
  id, title, icon, items, onCardClick, showDate, isOver,
}: {
  id: ColumnId;
  title: string;
  icon: React.ReactNode;
  items: Booking[];
  onCardClick: (b: Booking) => void;
  showDate?: boolean;
  isOver?: boolean;
}) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div style={{
      background: isOver
        ? 'color-mix(in srgb, var(--color-primary) 7%, var(--color-surface-2))'
        : 'var(--color-surface-2)',
      border: `2px solid ${isOver ? 'var(--color-primary)' : 'var(--color-border)'}`,
      borderRadius: 'var(--radius-xl)',
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 460,
      flex: 1,
      transition: 'border-color 0.18s ease, background 0.18s ease',
    }}>
      {/* Column header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: isOver ? 'var(--color-primary)' : 'var(--color-text-muted)', transition: 'color 0.18s' }}>
            {icon}
          </span>
          <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>
            {title}
          </span>
        </div>
        <span style={{
          background: isOver ? 'var(--color-primary)' : 'var(--color-surface)',
          color: isOver ? '#fff' : 'var(--color-text-secondary)',
          border: `1px solid ${isOver ? 'var(--color-primary)' : 'var(--color-border)'}`,
          borderRadius: 20, fontSize: '0.75rem', fontWeight: 700,
          padding: '2px 10px', minWidth: 28, textAlign: 'center',
          transition: 'all 0.18s ease',
        }}>
          {items.length}
        </span>
      </div>

      {/* Drop zone */}
      <SortableContext id={id} items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} style={{ flex: 1, minHeight: 120 }}>
          {items.length === 0 ? (
            <div style={{
              height: '100%', minHeight: 120,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              color: isOver ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontSize: '0.8125rem',
              border: `2px dashed ${isOver ? 'var(--color-primary)' : 'var(--color-border)'}`,
              borderRadius: 10, padding: 24, textAlign: 'center', gap: 8,
              transition: 'all 0.18s ease',
              background: isOver ? 'color-mix(in srgb, var(--color-primary) 5%, transparent)' : 'transparent',
            }}>
              <CalendarCheck size={22} />
              {isOver ? '↓ Release to drop here' : 'Drop bookings here'}
            </div>
          ) : (
            items.map(b => (
              <SortableBookingCard
                key={b.id}
                booking={b}
                onClick={() => onCardClick(b)}
                showDate={showDate}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// ─── Booking Detail Modal ─────────────────────────────────────

function BookingModal({
  booking, selectedDate, onClose, onComplete, onMoveToPending, onChangeSession,
}: {
  booking: Booking;
  selectedDate: Date;
  onClose: () => void;
  onComplete: () => void;
  onMoveToPending: () => void;
  onChangeSession: (session: 'MORNING' | 'EVENING') => void;
}) {
  const [completing, setCompleting] = useState(false);
  const [moving, setMoving] = useState(false);
  const isAccepted = booking.status === 'ACCEPTED';

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)', padding: 28,
          width: '100%', maxWidth: 480, boxShadow: 'var(--shadow-xl)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 4 }}>{booking.patient_name}</h2>
            {booking.appointment_number && (
              <span style={{ background: 'var(--color-primary)', color: '#fff', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, padding: '2px 10px' }}>
                Appointment #{booking.appointment_number}
              </span>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            <Phone size={15} /><span>{booking.patient_phone}</span>
          </div>
          {booking.patient_email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              <Mail size={15} /><span>{booking.patient_email}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            <Clock size={15} />
            <span>Requested: {format(new Date(booking.preferred_date), 'MMMM d, yyyy')} · {booking.preferred_session}</span>
          </div>
          {isAccepted && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              <User size={15} />
              <span>Scheduled: {booking.assigned_date && format(new Date(booking.assigned_date), 'MMMM d, yyyy')} · {booking.assigned_session}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
            <Clock size={13} />
            <span>Booked at: {format(new Date(booking.created_at), 'MMM d, yyyy h:mm a')}</span>
          </div>
        </div>

        {booking.notes && (
          <div style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, padding: 12, marginBottom: 20, fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--color-text-primary)', display: 'block', marginBottom: 4 }}>Notes</strong>
            {booking.notes}
          </div>
        )}

        {isAccepted && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Change Session</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['MORNING', 'EVENING'] as const).map(s => (
                <button key={s} onClick={() => onChangeSession(s)} style={{
                  flex: 1, padding: '8px 0',
                  background: booking.assigned_session === s ? 'var(--color-primary)' : 'var(--color-surface-2)',
                  color: booking.assigned_session === s ? '#fff' : 'var(--color-text-secondary)',
                  border: `1px solid ${booking.assigned_session === s ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 8, fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  {s === 'MORNING' ? <SunMedium size={15} /> : <Moon size={15} />}
                  {s === 'MORNING' ? 'Morning' : 'Evening'}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          {isAccepted && (
            <button onClick={async () => { setMoving(true); await onMoveToPending(); setMoving(false); }} disabled={moving} style={{
              flex: 1, padding: '10px',
              background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
              borderRadius: 8, fontWeight: 600, fontSize: '0.875rem',
              color: 'var(--color-text-secondary)', cursor: moving ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              {moving ? <Loader2 size={15} className="spin" /> : <ArrowLeftCircle size={15} />}
              Move to Pending
            </button>
          )}
          <button onClick={async () => { setCompleting(true); await onComplete(); setCompleting(false); }} disabled={completing} style={{
            flex: 1, padding: '10px',
            background: completing ? 'var(--color-surface-2)' : '#22c55e',
            border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.875rem',
            color: completing ? 'var(--color-text-secondary)' : '#fff',
            cursor: completing ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            {completing ? <Loader2 size={15} className="spin" /> : <CheckCircle size={15} />}
            Complete ✓
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────

export default function ScheduleBoardPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());
  const [columns, setColumns] = useState<Record<ColumnId, Booking[]>>({
    pending: [], MORNING: [], EVENING: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overColumnId, setOverColumnId] = useState<ColumnId | null>(null);
  const [modalBooking, setModalBooking] = useState<Booking | null>(null);

  // ★ KEY FIX: record where the dragged item STARTED (before any optimistic moves)
  const dragOriginRef = useRef<ColumnId | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // 5px movement to start drag — small enough to feel responsive, large enough to allow clicks
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const fetchBookedDates = useCallback(async () => {
    try {
      const res = await api.get('/bookings/dates');
      setBookedDates(new Set(res.data.dates));
    } catch { /* silent */ }
  }, []);

  const fetchSchedule = useCallback(async (date: Date) => {
    setLoading(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const res = await api.get(`/bookings/schedule?date=${dateStr}`);
      setColumns({
        pending: res.data.pending ?? [],
        MORNING: res.data.morning ?? [],
        EVENING: res.data.evening ?? [],
      });
    } catch {
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookedDates(); }, [fetchBookedDates]);
  useEffect(() => { fetchSchedule(selectedDate); }, [selectedDate, fetchSchedule]);

  const refresh = () => { fetchSchedule(selectedDate); fetchBookedDates(); };

  // ─── Drag handlers ────────────────────────────────────────────

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    setActiveId(id);
    // Snapshot the ORIGINAL container right when drag begins — before any optimistic state changes
    setColumns(current => {
      dragOriginRef.current = findContainer(id, current);
      return current; // no change, just reading
    });
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) { setOverColumnId(null); return; }

    // Read current columns to find containers
    setColumns(prev => {
      const activeContainer = findContainer(active.id as string, prev);
      const overContainer = resolveOverContainer(
        over.id as string,
        over.data.current?.sortable?.containerId as string | undefined,
        prev,
      );

      setOverColumnId(overContainer);

      // Only move if crossing columns
      if (!activeContainer || !overContainer || activeContainer === overContainer) return prev;

      const activeItems = [...prev[activeContainer]];
      const overItems = [...prev[overContainer]];
      const activeIndex = activeItems.findIndex(b => b.id === active.id);
      if (activeIndex === -1) return prev;

      const [moved] = activeItems.splice(activeIndex, 1);
      const overItemIndex = overItems.findIndex(b => b.id === over.id);
      // Insert before hovered item, or at end if not over an item
      const insertAt = overItemIndex >= 0 ? overItemIndex : overItems.length;
      overItems.splice(insertAt, 0, moved);

      return { ...prev, [activeContainer]: activeItems, [overContainer]: overItems };
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    const originContainer = dragOriginRef.current; // where it STARTED
    dragOriginRef.current = null;
    setActiveId(null);
    setOverColumnId(null);

    if (!over || !originContainer) {
      fetchSchedule(selectedDate); // revert optimistic move
      return;
    }

    // After handleDragOver, the item is already in the new column in state.
    // Use current state to find where it landed.
    const landedContainer = findContainer(active.id as string, columns)
      ?? resolveOverContainer(
        over.id as string,
        over.data.current?.sortable?.containerId as string | undefined,
        columns,
      );

    if (!landedContainer) { fetchSchedule(selectedDate); return; }

    try {
      if (originContainer !== landedContainer) {
        // ── Cross-column move ──────────────────────────────────
        if (landedContainer === 'pending') {
          await api.patch(`/bookings/${active.id}/status`, { status: 'PENDING_REVIEW' });
          toast.success('Moved back to pending queue');
        } else if (originContainer === 'pending') {
          await api.patch(`/bookings/${active.id}/accept`, {
            assigned_date: format(selectedDate, 'yyyy-MM-dd'),
            assigned_session: landedContainer,
          });
          toast.success(`Accepted into ${landedContainer === 'MORNING' ? 'Morning' : 'Evening'} session`);
        } else {
          // MORNING ↔ EVENING
          await api.patch(`/bookings/${active.id}/status`, { assigned_session: landedContainer });
          toast.success(`Moved to ${landedContainer === 'MORNING' ? 'Morning' : 'Evening'} session`);
        }
        fetchBookedDates();
      } else {
        // ── Same-column reorder ────────────────────────────────
        const items = columns[originContainer];
        const oldIndex = items.findIndex(b => b.id === active.id);
        const newIndex = items.findIndex(b => b.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          setColumns(prev => ({ ...prev, [originContainer]: arrayMove(prev[originContainer], oldIndex, newIndex) }));
          if (originContainer !== 'pending') {
            await api.patch(`/bookings/${active.id}/reorder`, { slot_order: newIndex + 1 });
          }
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update booking');
      fetchSchedule(selectedDate); // revert on API failure
    }
  };

  const handleDragCancel = () => {
    dragOriginRef.current = null;
    setActiveId(null);
    setOverColumnId(null);
    fetchSchedule(selectedDate); // always revert on cancel
  };

  // ─── Modal handlers ───────────────────────────────────────────

  const handleComplete = async () => {
    if (!modalBooking) return;
    try {
      await api.patch(`/bookings/${modalBooking.id}/complete`);
      toast.success('Booking marked as completed!');
      setModalBooking(null);
      refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to complete booking');
    }
  };

  const handleMoveToPending = async () => {
    if (!modalBooking) return;
    try {
      await api.patch(`/bookings/${modalBooking.id}/status`, { status: 'PENDING_REVIEW' });
      toast.success('Booking moved to pending queue');
      setModalBooking(null);
      refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update booking');
    }
  };

  const handleChangeSession = async (session: 'MORNING' | 'EVENING') => {
    if (!modalBooking || modalBooking.assigned_session === session) return;
    try {
      await api.patch(`/bookings/${modalBooking.id}/status`, { assigned_session: session });
      toast.success(`Session changed to ${session}`);
      setModalBooking(prev => prev ? { ...prev, assigned_session: session } : null);
      refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to change session');
    }
  };

  const allBookings = [...columns.pending, ...columns.MORNING, ...columns.EVENING];
  const activeBooking = activeId ? allBookings.find(b => b.id === activeId) ?? null : null;

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Schedule Board</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 12 }}>
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          {activeId && (
            <span style={{
              fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 500,
              background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
              padding: '2px 10px', borderRadius: 20, animation: 'fadeIn 0.2s ease',
            }}>
              ↕ Drop into a column to move
            </span>
          )}
        </p>
      </div>

      {/* Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'start' }}>
        <MiniCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} bookedDates={bookedDates} />

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 460 }}>
            <Loader2 size={32} className="spin" style={{ color: 'var(--color-primary)' }} />
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div style={{ display: 'flex', gap: 16 }}>
              <DroppableColumn
                id="pending" title="Pending Queue" icon={<Clock size={18} />}
                items={columns.pending} onCardClick={setModalBooking}
                showDate isOver={overColumnId === 'pending'}
              />
              <DroppableColumn
                id="MORNING" title="Morning (08:00–13:00)" icon={<SunMedium size={18} />}
                items={columns.MORNING} onCardClick={setModalBooking}
                isOver={overColumnId === 'MORNING'}
              />
              <DroppableColumn
                id="EVENING" title="Evening (14:00–20:00)" icon={<Moon size={18} />}
                items={columns.EVENING} onCardClick={setModalBooking}
                isOver={overColumnId === 'EVENING'}
              />
            </div>

            <DragOverlay dropAnimation={{
              duration: 180,
              easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
            }}>
              {activeBooking ? <GhostCard booking={activeBooking} showDate /> : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Modal */}
      {modalBooking && (
        <BookingModal
          booking={modalBooking}
          selectedDate={selectedDate}
          onClose={() => setModalBooking(null)}
          onComplete={handleComplete}
          onMoveToPending={handleMoveToPending}
          onChangeSession={handleChangeSession}
        />
      )}

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

        /* Hover effect on booking cards */
        .booking-card:hover {
          border-color: var(--color-primary) !important;
          background: color-mix(in srgb, var(--color-primary) 4%, var(--color-surface)) !important;
          box-shadow: 0 2px 12px rgba(0,0,0,0.12) !important;
        }
        .booking-card:active {
          cursor: grabbing !important;
        }
      `}</style>
    </div>
  );
}
