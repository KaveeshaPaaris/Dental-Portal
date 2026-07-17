'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Phone, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const WHATSAPP_NUMBER = '94776429760';
const PHONE_NUMBER = '+94776429760';

export default function FABButtons() {
  const router = useRouter();
  const pathname = usePathname();

  const [hasOpenedChat, setHasOpenedChat] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  useEffect(() => {
    // The blink will stop when hasOpenedChat is set to true below.
    // By not using sessionStorage, the blink will successfully reset and restart every time the page is refreshed.
  }, []);

  const handleAIClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setHasOpenedChat(true);
    setIsMobileExpanded(false);
    
    if (pathname !== '/ask') {
      router.push('/ask');
    } else {
      const chatInput = document.getElementById('ai-chat-input') as HTMLInputElement | null;
      if (chatInput) {
        chatInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => chatInput.focus(), 500);
      }
    }
  };

  return (
    <div className={`fab-container ${isMobileExpanded ? 'expanded' : ''}`}>
      {/* Mobile Toggle Button */}
      <button 
        className="fab fab-mobile-toggle"
        onClick={() => setIsMobileExpanded(!isMobileExpanded)}
        aria-label="Toggle Actions"
      >
        <span className={`toggle-icon ${isMobileExpanded ? 'rotate' : ''}`}>
          <MessageCircle size={24} />
        </span>
      </button>

      {/* Action Items */}
      <div className={`fab-actions ${isMobileExpanded ? 'show' : ''}`}>
        <button
          onClick={handleAIClick}
          className="fab-ai-pill group"
          aria-label="Open AI Dental Assistant"
          title="Ask our AI Dental Assistant"
        >
          <div className={`ai-icon-container ${!hasOpenedChat ? 'ai-icon-animating' : ''}`}>
            <Image src="/logo.png" alt="Dental Logo" width={32} height={32} className="show-in-light" style={{ objectFit: 'contain' }} />
            <Image src="/logo_dark.png" alt="Dental Logo" width={32} height={32} className="show-in-dark" style={{ objectFit: 'contain' }} />
          </div>
          <span className="fab-ai-text">Ask AI</span>
        </button>

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
    </div>
  );
}
