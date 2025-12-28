import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { ChatMessage } from '@/types/communication.types';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const welcome: ChatMessage = useMemo(
    () => ({
      id: 'welcome',
      role: 'assistant',
      content:
        "Merhaba! Ben senin AI İngilizce asistanınım. Şu an demo (mock) modundayım.\n" +
        "İstersen sorunu yaz; ben de örnek bir açıklama + mini çalışma önerisi üreteyim.",
      timestamp: new Date().toISOString(),
    }),
    []
  );

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // UC20: API entegrasyonunu daha sonra yapacağız. Şimdilik mock/local state.
  // İlk açılış
  React.useEffect(() => {
    setMessages([welcome]);
    setTimeout(scrollToBottom, 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    setError(null);

    const now = new Date().toISOString();
    const optimisticUserMsg: ChatMessage = { id: `tmp-${Date.now()}`, role: 'user', content: text, timestamp: now };
    setMessages((prev) => [...prev, optimisticUserMsg]);
    setInput('');
    setTimeout(scrollToBottom, 20);

    try {
      // Mock response (no API)
      await new Promise((r) => setTimeout(r, 650));
      const reply: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        content:
          `Demo cevap (mock):\n` +
          `- Konu: ${text.slice(0, 60)}${text.length > 60 ? '…' : ''}\n` +
          `- Açıklama: Bu soruyu çalışmak için 1 kısa kural + 1 örnek + 1 mini alıştırma yeterli.\n` +
          `- Mini alıştırma: 2 tane örnek cümle yaz ve ben kontrol edeyim.`,
      };
      setMessages((prev) => [...prev, reply]);
      setTimeout(scrollToBottom, 20);
    } catch (e: any) {
      setError('Mesaj gönderilemedi.');
    } finally {
      setSending(false);
    }
  };

  const handleNewSession = async () => {
    setError(null);
    setMessages([welcome]);
    setTimeout(scrollToBottom, 20);
  };

  return (
    <div className="container">
      <Link to="/student/dashboard" style={{ marginBottom: '20px', display: 'inline-block' }}>← Back to Dashboard</Link>
      
      <div className="toolbar">
        <div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>AI Chatbot Tutor (UC20)</h1>
          <div className="subtitle">Şimdilik mock modunda: UI var, API entegrasyonunu sonra yapacağız.</div>
        </div>
        <div className="actions">
          <button className="button button-secondary" onClick={handleNewSession} disabled={sending}>
            New chat
          </button>
        </div>
      </div>
      
      <div className="card chat-shell">
        <div className="chat-topbar">
          <div className="pill">Mode: mock</div>
          <div className="pill">{messages.length} msgs</div>
        </div>
        {error && <div className="card" style={{ borderColor: 'rgba(220,38,38,0.25)', background: 'rgba(220,38,38,0.06)' }}>{error}</div>}

        <div className="chat-body">
          <>
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-row ${msg.role === 'user' ? 'right' : 'left'}`}>
                <div className={`chat-bubble ${msg.role === 'user' ? 'user' : 'assistant'}`}>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                  <div className="chat-time">{new Date(msg.timestamp).toLocaleString()}</div>
                </div>
              </div>
            ))}
            {sending && (
              <div className="chat-row left">
                <div className="chat-bubble assistant">
                  <div className="text-muted">Yazıyor…</div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        </div>

        <div className="chat-input">
          <input
            className="input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything about English..."
            style={{ marginBottom: 0 }}
          />
          <button className="button button-primary" onClick={handleSend} disabled={sending}>
            {sending ? 'Sending…' : 'Send'}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="toolbar">
          <h3 style={{ marginBottom: 0 }}>Suggested prompts</h3>
          <span className="pill">Click to fill</span>
        </div>
        <div className="chip-row" style={{ marginTop: '15px' }}>
          {[
            'Explain present perfect tense',
            'How do I improve my pronunciation?',
            'What\'s the difference between "affect" and "effect"?',
            'Give me practice exercises for conditionals'
          ].map((question, index) => (
            <button
              key={index}
              className="chip"
              onClick={() => setInput(question)}
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
