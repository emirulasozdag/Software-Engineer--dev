import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { communicationService } from '@/services/api/communication.service';
import { ChatMessage } from '@/types/communication.types';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const welcome: ChatMessage = useMemo(
    () => ({
      id: 'welcome',
      role: 'assistant',
      content: "Merhaba! Ben senin AI İngilizce asistanınım. Bugün ne çalışmak istersin?",
      timestamp: new Date().toISOString(),
    }),
    []
  );

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    setError(null);
    try {
      const history = await communicationService.getChatHistory();
      setMessages(history.length ? history : [welcome]);
      setTimeout(scrollToBottom, 50);
    } catch (e: any) {
      setMessages([welcome]);
      setError(e?.response?.data?.detail || 'Chat history yüklenemedi.');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
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
      const botMsg = await communicationService.sendChatbotMessage(text);
      setMessages((prev) => [...prev, botMsg]);
      setTimeout(scrollToBottom, 20);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Mesaj gönderilemedi.');
    } finally {
      setSending(false);
    }
  };

  const handleNewSession = async () => {
    setError(null);
    try {
      await communicationService.startNewChatSession();
      setMessages([welcome]);
      setTimeout(scrollToBottom, 20);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Yeni sohbet başlatılamadı.');
    }
  };

  return (
    <div className="container">
      <Link to="/student/dashboard" style={{ marginBottom: '20px', display: 'inline-block' }}>← Back to Dashboard</Link>
      
      <h1 className="page-title">AI Chatbot Tutor</h1>
      
      <div className="card chat-shell">
        <div className="chat-topbar">
          <div>
            <div style={{ fontWeight: 700 }}>Sohbet</div>
            <div className="text-muted" style={{ marginTop: 4 }}>
              UC20: Dersler ve alıştırmalar hakkında soru sor, anında geri bildirim al.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="button button-secondary" onClick={handleNewSession} disabled={sending || loadingHistory}>
              New chat
            </button>
            <button className="button button-primary" onClick={loadHistory} disabled={sending || loadingHistory}>
              {loadingHistory ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {error && <div className="card" style={{ borderColor: 'rgba(220,38,38,0.25)', background: 'rgba(220,38,38,0.06)' }}>{error}</div>}

        <div className="chat-body">
          {loadingHistory ? (
            <div className="loading">Loading chat…</div>
          ) : (
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
          )}
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
          <button className="button button-primary" onClick={handleSend} disabled={sending || loadingHistory}>
            {sending ? 'Sending…' : 'Send'}
          </button>
        </div>
      </div>

      <div className="card">
        <h3>Suggested Questions</h3>
        <div className="chip-row" style={{ marginTop: '15px' }}>
          {[
            'Explain present perfect tense',
            'How do I improve my pronunciation?',
            'What\'s the difference between "affect" and "effect"?',
            'Give me practice exercises for conditionals'
          ].map((question, index) => (
            <button
              key={index}
              className="button button-secondary"
              onClick={() => setInput(question)}
              style={{ fontSize: '0.9rem' }}
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
