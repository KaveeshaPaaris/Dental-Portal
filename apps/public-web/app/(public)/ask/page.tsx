'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';
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
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const res = await api.post('/faqs/ask', { question: userMessage });
      const answer = res.data.answer;
      
      setTimeout(() => {
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'bot', text: answer }]);
        setIsTyping(false);
      }, 500); // Small delay to feel more natural
    } catch (error) {
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          id: (Date.now() + 1).toString(), 
          sender: 'bot', 
          text: 'I’m sorry, I am having trouble connecting to my knowledge base right now. Please call us at +1 (555) 123-4567.' 
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
          <div className={styles.chatWindow}>
            {messages.map((msg) => (
              <div key={msg.id} className={`${styles.message} ${msg.sender === 'user' ? styles.messageUser : styles.messageBot}`}>
                {msg.sender === 'bot' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.875rem' }}>
                    <Bot size={16} /> Dental Assistant
                  </div>
                )}
                {msg.text}
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
            <div ref={endOfMessagesRef} />
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
