import { CalendarHeart, Users, MessageCircle } from 'lucide-react';
import BookingStepper, { type BookingStep } from './BookingStepper';
import styles from './BookingHeader.module.css';

const CHIPS = [
  { icon: CalendarHeart, text: 'Since 2006' },
  { icon: Users, text: 'Family dental care' },
  { icon: MessageCircle, text: 'Confirmation via WhatsApp' },
];

export default function BookingHeader({ currentStep = 1 }: { currentStep?: BookingStep }) {
  return (
    <header className={styles.header}>
      <p className={styles.eyebrow}>Book online</p>
      <h1 className={styles.title}>Book your appointment</h1>
      <p className={styles.subtitle}>We&apos;ll text a code to confirm your booking.</p>
      <BookingStepper currentStep={currentStep} />
      <ul className={styles.chips}>
        {CHIPS.map(({ icon: Icon, text }) => (
          <li key={text} className={styles.chip}>
            <Icon size={14} aria-hidden="true" />
            {text}
          </li>
        ))}
      </ul>
    </header>
  );
}
