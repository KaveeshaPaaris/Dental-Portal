import { Check } from 'lucide-react';
import styles from './BookingProgress.module.css';

const STEPS = ['Your Details', 'Verify Email', 'We Confirm'];

/**
 * Progress bar for the booking flow. `current` is 1-3.
 * Finished steps show a tick and their connecting line is filled in.
 */
export default function BookingProgress({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className={styles.wrap}>
      <p className={styles.stepText}>Step {current} of {STEPS.length}</p>
      <ol className={styles.steps} aria-label="Booking progress">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const state = n < current ? 'done' : n === current ? 'current' : 'todo';
          return (
            <li
              key={label}
              className={`${styles.step} ${styles[state]}`}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              {i > 0 && (
                <span className={styles.line} aria-hidden="true">
                  <span className={styles.lineFill} />
                </span>
              )}
              <span className={styles.dot}>
                {state === 'done' ? <Check size={14} strokeWidth={3} aria-hidden="true" /> : n}
              </span>
              <span className={styles.label}>{label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
