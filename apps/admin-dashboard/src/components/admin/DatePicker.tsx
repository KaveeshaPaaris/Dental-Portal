'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { format, parse } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';

interface DatePickerProps {
  value: string;
  onChange: (dateStr: string) => void;
  highlightedDates?: string[]; // Array of YYYY-MM-DD strings
}

export default function DatePicker({ value, onChange, highlightedDates = [] }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedDate = value ? new Date(value) : undefined;
  
  const handleSelect = (date: Date | undefined) => {
    if (date) {
      // Create local date string YYYY-MM-DD avoiding timezone offset issues
      const dateStr = format(date, 'yyyy-MM-dd');
      onChange(dateStr);
    } else {
      onChange('');
    }
    setIsOpen(false);
  };

  const modifiers = {
    highlighted: highlightedDates.map(d => {
      // Parse YYYY-MM-DD to local Date object
      const parsed = parse(d, 'yyyy-MM-dd', new Date());
      return parsed;
    })
  };

  return (
    <div className="custom-datepicker" style={{ position: 'relative' }} ref={popoverRef}>
      <style>{`
        .custom-datepicker {
          --rdp-cell-size: 40px;
          --rdp-accent-color: var(--color-primary);
          --rdp-background-color: var(--color-surface-2);
          --rdp-accent-background-color: var(--color-primary);
          --rdp-day_button-border-radius: 8px;
          --rdp-selected-border: 2px solid var(--color-primary);
        }
        
        /* The popover container */
        .rdp-popover {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          z-index: 50;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }

        .rdp-day_button:hover {
          background-color: var(--color-surface-2);
        }

        /* Custom dot for highlighted dates */
        .rdp-day_highlighted .rdp-day_button {
          position: relative;
        }
        .rdp-day_highlighted .rdp-day_button::after {
          content: '';
          position: absolute;
          bottom: 6px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          background-color: var(--color-primary);
          border-radius: 50%;
        }

        /* If selected, change dot color so it doesn't blend in */
        .rdp-selected.rdp-day_highlighted .rdp-day_button::after {
          background-color: #fff;
        }
        
        .rdp-nav_button {
          color: var(--color-text-primary);
        }
        .rdp-month_caption {
          color: var(--color-text-primary);
          font-weight: 600;
        }
      `}</style>

      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '9px 16px',
          borderRadius: 8,
          border: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          color: value ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
          cursor: 'pointer',
          minWidth: 160,
          userSelect: 'none'
        }}
      >
        <CalendarIcon size={16} />
        <span style={{ flex: 1 }}>{value ? format(selectedDate!, 'MMM dd, yyyy') : 'mm/dd/yyyy'}</span>
        {value && (
          <X 
            size={14} 
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            style={{ cursor: 'pointer', opacity: 0.6 }}
          />
        )}
      </div>

      {isOpen && (
        <div className="rdp-popover">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            modifiers={modifiers}
            modifiersClassNames={{ highlighted: 'rdp-day_highlighted' }}
          />
        </div>
      )}
    </div>
  );
}
