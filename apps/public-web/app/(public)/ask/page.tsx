'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, CreditCard, Banknote, Mail, Phone } from 'lucide-react';
import ReactMarkdown, { defaultUrlTransform } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import styles from './page.module.css';

type Message = {
  id: string;
  sender: 'user' | 'bot';
  text: string;
};

export default function AskPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const chatWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTo({
        top: chatWindowRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent, customInput?: string) => {
    e?.preventDefault();
    const textToSend = customInput || input;
    if (!textToSend.trim()) return;

    const userMessage = textToSend.trim();
    setInput('');

    const newUserMsg: Message = { id: Date.now().toString(), sender: 'user', text: userMessage };
    setMessages(prev => [...prev, newUserMsg]);
    setIsTyping(true);

    try {
      // Build conversation history for future multi-turn RAG support
      const history = [...messages, newUserMsg].map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant' as 'user' | 'assistant',
        content: m.text,
      }));

      const res = await api.post('/ai-chat/message', { message: userMessage, history });
      const answer = res.data.answer;

      setTimeout(() => {
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'bot', text: answer }]);
        setIsTyping(false);
      }, 500);
    } catch (error) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: "⚠️ I'm sorry, I'm having a little trouble connecting right now.\n\n📞 Please call or WhatsApp us at **+94 71 810 9283**.",
        }]);
        setIsTyping(false);
      }, 500);
    }
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <header className={styles.header}>
          <div className="badge badge-primary" style={{ marginBottom: 16 }}>24/7 Assistant</div>
          <h1 className={styles.title}>Ask a Question</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Get instant answers to common questions about our clinic.</p>
        </header>

        <div className={styles.chatContainer}>
          <div className={styles.chatWindow} ref={chatWindowRef}>
            {messages.length === 0 ? (
              <div className={styles.welcomeContainer}>
                <motion.div 
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className={styles.logoContainer}
                >
                  <Image src="/logo.png" alt="Charming Dental Clinic Logo" width={180} height={180} className="show-in-light" style={{ objectFit: 'contain' }} />
                  <Image src="/logo_dark.png" alt="Charming Dental Clinic Logo" width={180} height={180} className="show-in-dark" style={{ objectFit: 'contain' }} />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <h2 className={styles.welcomeTitle}>Welcome to Charming Dental Clinic AI</h2>
                  <p className={styles.welcomeSubtitle}>I'm here to answer your dental questions, help you find treatments, explain procedures, and assist you with booking an appointment.</p>
                </motion.div>

                <div className={styles.faqSection}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <h3 className={styles.faqTitle}>Frequently Asked Questions</h3>
                  </motion.div>
                  
                  <div className={styles.faqGrid}>
                    {[
                      { text: 'What dental treatments do you offer?' },
                      { text: 'How do I book an appointment?' },
                      { text: 'Where is the clinic located?' },
                      { text: 'What are your opening hours?' },
                      { text: 'What payment methods are accepted?' }
                    ].map((faq, idx) => (
                      <motion.button
                        key={idx}
                        className={styles.faqChip}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.25 + (idx * 0.05) }}
                        onClick={() => handleSend(undefined, faq.text)}
                      >
                        <span>{faq.text}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`${styles.message} ${msg.sender === 'user' ? styles.messageUser : styles.messageBot}`}>
                  {msg.sender === 'bot' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.875rem' }}>
                      <Bot size={16} /> Dental Assistant
                    </div>
                  )}
                  {msg.sender === 'bot' ? (
                    <div className={styles.markdownWrapper}>
                      {msg.text.includes('[PAYMENT_METHODS_CARD]') ? (
                        <div className={styles.paymentCard}>
                          <div className={styles.paymentCardHeader}>
                            <CreditCard size={24} />
                            <span>Payment Methods</span>
                          </div>
                          
                          <p className={styles.paymentCardText}>
                            We want to make your visit as convenient as possible. We currently accept:
                          </p>
                          
                          <div className={styles.paymentMethodsList}>
                            <div className={styles.paymentBadge}>
                              <Banknote size={20} className={styles.paymentBadgeIcon} />
                              <span>Cash</span>
                            </div>
                            <div className={styles.paymentBadge}>
                              <CreditCard size={20} className={styles.paymentBadgeIcon} />
                              <span>Credit Cards</span>
                            </div>
                            <div className={styles.paymentBadge}>
                              <CreditCard size={20} className={styles.paymentBadgeIcon} />
                              <span>Debit Cards</span>
                            </div>
                          </div>


                        </div>
                      ) : (
                        <>
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            urlTransform={(url) => (url.startsWith('tel:') ? url : defaultUrlTransform(url))}
                          >
                            {(() => {
                              let text = msg.text.replace('[SHOW_CONTACT_BUTTONS]', '').trim();
                              text = text.replace(/\[[^\]]+\]\(tel:[^\)]+\)|(\+94\s*71\s*810\s*9283)/g, (match, group1) => {
                                if (group1) {
                                  return `[${group1}](tel:+94718109283)`;
                                }
                                return match;
                              });
                              return text;
                            })()}
                          </ReactMarkdown>
                          

                        </>
                      )}
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
              ))
            )}
            {isTyping && (
              <div className={`${styles.message} ${styles.messageBot}`}>
                <div className={styles.typingIndicator}>
                  <div className={styles.typingDot}></div>
                  <div className={styles.typingDot}></div>
                  <div className={styles.typingDot}></div>
                </div>
              </div>
            )}
          </div>

          <form className={styles.inputArea} onSubmit={(e) => handleSend(e)}>
            <input 
              id="ai-chat-input"
              type="text" 
              className={styles.inputField} 
              placeholder="Ask anything about your dental care..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
            />
            <button type="submit" className={styles.sendBtn} disabled={!input.trim() || isTyping}>
              <Send size={20} style={{ marginLeft: -2 }} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
