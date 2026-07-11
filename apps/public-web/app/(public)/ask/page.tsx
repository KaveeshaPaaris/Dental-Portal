'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';
import ReactMarkdown, { defaultUrlTransform } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '@/lib/api';
import styles from './page.module.css';

type Message = {
  id: string;
  sender: 'user' | 'bot';
  text: string;
};

export default function AskPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'initial', sender: 'bot', text: 'Hello! I am the Charming Dental Assistant. Ask me anything about our services, opening hours, or treatments.' }
  ]);
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

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
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
            {messages.map((msg) => (
              <div key={msg.id} className={`${styles.message} ${msg.sender === 'user' ? styles.messageUser : styles.messageBot}`}>
                {msg.sender === 'bot' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.875rem' }}>
                    <Bot size={16} /> Dental Assistant
                  </div>
                )}
                {msg.sender === 'bot' ? (
                  <div className={styles.markdownWrapper}>
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
                    {msg.text.includes('[SHOW_CONTACT_BUTTONS]') && (
                      <div className={styles.actionButtons}>
                        <a 
                          href="https://wa.me/94718109283?text=Hello%20Charming%20Dental%20Clinic,%20I%20would%20like%20to%20book%20an%20appointment." 
                          className={`btn ${styles.btnWhatsapp}`} 
                          target="_blank" 
                          rel="noreferrer"
                        >
                          💬 Chat on WhatsApp
                        </a>
                        <a 
                          href="tel:+94718109283" 
                          className="btn btn-outline"
                        >
                          📞 Call the Clinic
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  msg.text
                )}
              </div>
            ))}
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

          <form className={styles.inputArea} onSubmit={handleSend}>
            <input 
              type="text" 
              className={styles.inputField} 
              placeholder="Type your question here..." 
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
