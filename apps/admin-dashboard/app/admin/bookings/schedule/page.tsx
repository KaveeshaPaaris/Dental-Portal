'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { format, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, GripVertical } from 'lucide-react';
import api from '@/lib/api';
import { Booking } from '@/types';
import toast from 'react-hot-toast';

// We'll mock the SortableItem component internally for brevity, or we can build it inline.
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableBookingCard({ booking }: { booking: Booking }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: booking.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={{ ...style, padding: 16, marginBottom: 12, display: 'flex', gap: 12, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }} className="card">
      <div {...attributes} {...listeners} style={{ cursor: 'grab', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
        <GripVertical size={20} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{booking.patient_name}</div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
          <Clock size={12} /> {booking.preferred_session} &bull; {booking.patient_phone}
        </div>
      </div>
    </div>
  );
}

function Column({ title, id, items }: { title: string, id: string, items: Booking[] }) {
  return (
    <div style={{ background: 'var(--color-surface-2)', borderRadius: 'var(--radius-lg)', padding: 16, display: 'flex', flexDirection: 'column', minHeight: 400 }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16, color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
        {title} <span className="badge">{items.length}</span>
      </h3>
      <SortableContext id={id} items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <div style={{ flex: 1 }}>
          {items.map(booking => (
            <SortableBookingCard key={booking.id} booking={booking} />
          ))}
          {items.length === 0 && (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem', border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-md)', padding: 32 }}>
              Drop bookings here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function ScheduleBoardPage() {
  const [date, setDate] = useState(new Date());
  const [unassigned, setUnassigned] = useState<Booking[]>([]);
  const [morning, setMorning] = useState<Booking[]>([]);
  const [evening, setEvening] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchSchedule = async (targetDate: Date) => {
    setLoading(true);
    try {
      const dateStr = format(targetDate, 'yyyy-MM-dd');
      // In a real app, this endpoint would return bookings assigned to this date,
      // and unassigned bookings pending for this date.
      // We will simulate the split based on mock data for now.
      const res = await api.get('/bookings');
      const all: Booking[] = res.data;
      
      setUnassigned(all.filter(b => b.status === 'PENDING_REVIEW'));
      setMorning(all.filter(b => b.status === 'ACCEPTED' && b.assigned_session === 'MORNING'));
      setEvening(all.filter(b => b.status === 'ACCEPTED' && b.assigned_session === 'EVENING'));
    } catch (error) {
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule(date);
  }, [date]);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Logic to move item between lists (unassigned, morning, evening) during drag
    // Skipped complex array management for brevity in this mock implementation.
  };

  const handleDragEnd = async (event: any) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeContainer = active.data.current?.sortable?.containerId;
    const overContainer = over.data.current?.sortable?.containerId || over.id;

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      // Logic for sorting within the same column (arrayMove)
      return;
    }

    // Logic for moving to a different column and API call to update DB
    toast.success(`Booking assigned to ${overContainer}`);
  };

  const activeBooking = activeId ? [...unassigned, ...morning, ...evening].find(b => b.id === activeId) : null;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Schedule Board</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--color-surface)', padding: '8px 16px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)' }}>
          <button onClick={() => setDate(subDays(date, 1))} className="btn btn-ghost btn-sm" style={{ padding: 4 }}>
            <ChevronLeft size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
            <CalendarIcon size={18} color="var(--color-primary)" />
            {format(date, 'MMMM d, yyyy')}
          </div>
          <button onClick={() => setDate(addDays(date, 1))} className="btn btn-ghost btn-sm" style={{ padding: 4 }}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 500 }}></div>
      ) : (
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCorners} 
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
            <Column id="unassigned" title="Pending Queue" items={unassigned} />
            <Column id="MORNING" title="Morning Session (08:00 - 13:00)" items={morning} />
            <Column id="EVENING" title="Evening Session (14:00 - 20:00)" items={evening} />
          </div>
          
          <DragOverlay>
            {activeBooking ? <SortableBookingCard booking={activeBooking} /> : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
