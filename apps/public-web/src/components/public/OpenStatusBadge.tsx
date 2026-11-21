'use client';

import { useSyncExternalStore } from 'react';
import styles from '../../../app/(public)/contact/page.module.css';

/** Opening windows per weekday (0 = Sunday), as [open, close] minutes after midnight, Sri Lanka time. */
export type OpeningWindows = Record<number, [number, number][]>;

type Status = 'unknown' | 'open' | 'closed' | 'call';

const CLINIC_TZ = 'Asia/Colombo';

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
}

function getClinicNow() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: CLINIC_TZ,
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  const minutes = parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10);
  return { day, minutes };
}

export default function OpenStatusBadge({
  windows,
  callDays = [],
}: {
  windows: OpeningWindows;
  /** Weekdays where the clinic opens only by prior arrangement (e.g. Sunday). */
  callDays?: number[];
}) {
  const status = useSyncExternalStore<Status>(
    subscribe,
    () => {
      const { day, minutes } = getClinicNow();
      if (callDays.includes(day)) return 'call';
      const isOpen = (windows[day] ?? []).some(([from, to]) => minutes >= from && minutes < to);
      return isOpen ? 'open' : 'closed';
    },
    () => 'unknown',
  );

  // Render nothing on the server / first paint so we never show a wrong status.
  if (status === 'unknown') return null;

  const label = status === 'open' ? 'Open now' : status === 'call' ? 'Call in advance' : 'Closed now';

  return (
    <div className={`${styles.closedBadge} ${status === 'open' ? styles.openBadge : ''}`} role="status">
      <span className={`${styles.badgeDot} ${status === 'open' ? styles.openDot : ''}`}></span> {label}
    </div>
  );
}
