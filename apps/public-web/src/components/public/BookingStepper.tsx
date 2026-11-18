import { Fragment } from 'react';
import styles from './BookingHeader.module.css';

const STEPS = ['Details', 'Verify OTP', 'Confirmed'] as const;

export type BookingStep = 1 | 2 | 3;

/** 3-step progress indicator. Reusable on the details, OTP and success screens. */
export default function BookingStepper({ currentStep }: { currentStep: BookingStep }) {
  return (
    <ol className={styles.stepper} aria-label="Booking progress">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const state = n < currentStep ? 'done' : n === currentStep ? 'active' : 'todo';
        return (
          <Fragment key={label}>
            {i > 0 && <li className={`${styles.line} ${n <= currentStep ? styles.lineOn : ''}`} aria-hidden="true" />}
            <li
              className={`${styles.step} ${styles[state]}`}
              aria-current={state === 'active' ? 'step' : undefined}
            >
              <span className={styles.bar} aria-hidden="true" />
              <span className={styles.circle} aria-hidden="true">{n}</span>
              <span className={styles.stepLabel}>{label}</span>
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}
