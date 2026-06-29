'use client';

import { Phone, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const WHATSAPP_NUMBER = '94776429760';
const PHONE_NUMBER = '+94776429760';

export default function FABButtons() {
  return (
    <div className="fab-container">
      <motion.a
        animate={{ scale: [1, 1.1, 1, 1] }}
        transition={{ duration: 8, repeat: Infinity, times: [0, 0.05, 0.1, 1], ease: "easeInOut" }}
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noreferrer"
        className="fab fab-whatsapp"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
        whileHover={{ scale: 1.1 }}
      >
        <MessageCircle size={26} />
      </motion.a>
      <motion.a
        animate={{ scale: [1, 1.1, 1, 1] }}
        transition={{ duration: 8, repeat: Infinity, times: [0, 0.05, 0.1, 1], delay: 4, ease: "easeInOut" }}
        href={`tel:${PHONE_NUMBER}`}
        className="fab fab-phone"
        aria-label="Call us"
        title="Call us"
        whileHover={{ scale: 1.1 }}
      >
        <Phone size={22} />
      </motion.a>
    </div>
  );
}
