'use client';

import { Phone, MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '15550000000';
const PHONE_NUMBER = '+15550000000';

export default function FABButtons() {
  return (
    <div className="fab-container">
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noreferrer"
        className="fab fab-whatsapp animate-pulse-glow"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        <MessageCircle size={26} />
      </a>
      <a
        href={`tel:${PHONE_NUMBER}`}
        className="fab fab-phone"
        aria-label="Call us"
        title="Call us"
      >
        <Phone size={22} />
      </a>
    </div>
  );
}
