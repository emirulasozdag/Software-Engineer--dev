import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { ChatMessage, ChatbotCapabilities } from '@/types/communication.types';
import { communicationService } from '@/services/api/communication.service';
import { AchievementNotificationContainer } from '@/components/AchievementNotification';
import { useAchievementNotifications } from '@/hooks/useAchievementNotifications';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [capabilities, setCapabilities] = useState<ChatbotCapabilities | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { newAchievements, clearAchievements, checkForNewAchievements } = useAchievementNotifications();

  const welcome: ChatMessage = useMemo(
    () => ({
      id: 'welcome',
      role: 'assistant',
      content:
        "Hello! I'm your AI English learning assistant. 👋\n\n" +
        "I have access to your learning progress, test results, and personalized plan. " +
        "I can help you with grammar questions, practice suggestions, and even adjust your learning plan if you want to focus on specific areas.\n\n" +
        "How can I help you today?",
      timestamp: new Date().toISOString(),
    }),
    []
  );

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load chat history and capabilities on mount
  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Load capabilities
        const caps = await communicationService.getChatbotCapabilities();
        setCapabilities(caps);

        // Load chat history
        const history = await communicationService.getChatHistory();
        if (history.length > 0) {
          setMessages(history);
        } else {
          setMessages([welcome]);
        }
      } catch (err: any) {
        console.error('Failed to load chatbot data:', err);
        setError('Failed to load chat. Starting fresh session.');
        setMessages([welcome]);
      } finally {
        setLoading(false);
        setTimeout(scrollToBottom, 50);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    setError(null);

    const now = new Date().toISOString();
    const optimisticUserMsg: ChatMessage = {
      id: `tmp-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: now
    };
    setMessages((prev) => [...prev, optimisticUserMsg]);
    setInput('');
    setTimeout(scrollToBottom, 20);

    try {
      // Call real API
      const botResponse = await communicationService.sendChatbotMessage(text);

      // Check for new achievements after chatbot interaction
      await checkForNewAchievements();

      // Replace optimistic message with real one and add bot response
      setMessages((prev) => {
        const withoutOptimistic = prev.filter(m => m.id !== optimisticUserMsg.id);
        return [...withoutOptimistic, { ...optimisticUserMsg, id: `user-${Date.now()}` }, botResponse];
      });

      setTimeout(scrollToBottom, 20);
    } catch (e: any) {
      console.error('Failed to send message:', e);
      const errorDetail = e.response?.data?.detail || e.message || 'Unknown error';
      setError(`Failed to send message: ${errorDetail}`);

      // Remove optimistic message on error
      setMessages((prev) => prev.filter(m => m.id !== optimisticUserMsg.id));
    } finally {
      setSending(false);
    }
  };

  const handleNewSession = async () => {
    setError(null);
    setLoading(true);

    try {
      await communicationService.startNewChatSession();
      setMessages([welcome]);
      setTimeout(scrollToBottom, 20);
    } catch (err: any) {
      console.error('Failed to start new session:', err);
      setError('Failed to start new session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-page">
      <div className="container">
        {newAchievements && newAchievements.length > 0 && (
          <AchievementNotificationContainer
            achievements={newAchievements}
            onClose={clearAchievements}
          />
        )}

        <Link to="/student/dashboard" style={{ marginBottom: '20px', display: 'inline-block' }}>
          ← Back to Dashboard
        </Link>

        <div className="toolbar">
          <div>
            <h1 className="page-title chatbot-title" style={{ marginBottom: 0 }}>AI Chatbot Tutor</h1>
            <div className="subtitle">
              {capabilities?.uses_llm
                ? `🤖 Context-aware AI assistant ${capabilities.can_modify_learning_plan ? '(can update your learning plan)' : ''}`
                : 'AI-powered English learning assistant'}
            </div>
          </div>
          <div className="actions">
            <button
              className="button button-secondary"
              onClick={handleNewSession}
              disabled={sending || loading}
            >
              New chat
            </button>
          </div>
        </div>

        <div className="chat-sections">
          <div className="card chat-shell">
            <div className="chat-topbar">
              <div className="pill">
                {capabilities?.uses_llm ? '✓ LLM Active' : 'Mock Mode'}
              </div>
              <div className="pill">{messages.length} msgs</div>
              {capabilities?.context_aware && <div className="pill">📊 Context-Aware</div>}
            </div>
            {error && (
              <div className="card" style={{ borderColor: 'rgba(220,38,38,0.25)', background: 'rgba(220,38,38,0.06)', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            {loading && messages.length === 0 ? (
              <div className="chat-body">
                <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                  Loading chat history...
                </div>
              </div>
            ) : (
              <div className="chat-body">
                <>
                  {messages.map((msg) => (
                    <div key={msg.id} className={`chat-row ${msg.role === 'user' ? 'right' : 'left'}`}>
                      {msg.role !== 'user' ? (
                        <div className="chat-avatar" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2a6 6 0 0 0-6 6v3a4 4 0 0 0 4 4h.5l1.8 2.6c.3.5 1.1.5 1.4 0L15.5 15H16a4 4 0 0 0 4-4V8a6 6 0 0 0-6-6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                            <path d="M9 9.5h.01M15 9.5h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                          </svg>
                        </div>
                      ) : null}

                      <div className={`chat-bubble ${msg.role === 'user' ? 'user' : 'assistant'}`}>
                        <div className="chat-text" style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                        <div className="chat-time">{new Date(msg.timestamp).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                  {sending && (
                    <div className="chat-row left">
                      <div className="chat-avatar" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2a6 6 0 0 0-6 6v3a4 4 0 0 0 4 4h.5l1.8 2.6c.3.5 1.1.5 1.4 0L15.5 15H16a4 4 0 0 0 4-4V8a6 6 0 0 0-6-6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                          <path d="M9 9.5h.01M15 9.5h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div className="chat-bubble assistant">
                        <div className="text-muted">Thinking...</div>
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </>
              </div>
            )}

            <div className="chat-compose-wrap bg-indigo-50/90 border-t border-indigo-100">
              <div className="chat-compose">
                <input
                  className="chat-compose__input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything about English..."
                  style={{ marginBottom: 0 }}
                />
                <button
                  className="chat-compose__send"
                  type="button"
                  aria-label="Send message"
                  onClick={handleSend}
                  disabled={sending || loading}
                  title={sending ? 'Sending…' : 'Send'}
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M22 2 11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M22 2 15 22l-4-9-9-4 20-7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="rounded-2xl bg-gradient-to-r from-indigo-50/30 to-white p-4">
              <div className="toolbar">
                <h3 className="text-indigo-800 font-bold tracking-tight" style={{ marginBottom: 0 }}>✨ Suggested prompts</h3>
                <span className="pill">Click to fill</span>
              </div>
              <div className="chip-row" style={{ marginTop: '15px' }}>
                {[
                  'How am I doing in my English learning?',
                  'Explain present perfect tense',
                  'I want to focus more on speaking skills',
                  'What are my strengths and weaknesses?',
                  'Give me practice exercises for my level',
                  'How can I improve my pronunciation?'
                ].map((question, index) => (
                  <button
                    key={index}
                    className="chat-chip"
                    onClick={() => setInput(question)}
                    disabled={sending || loading}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {capabilities && capabilities.capabilities.length > 0 && (
              <div className="chat-helpbox">
                <h4 className="chat-helpbox__title">What I can help with</h4>
                <div className="chat-helpbox__grid" role="list">
                  {capabilities.capabilities.slice(0, 4).map((cap, idx) => {
                    const emoji = idx === 0 ? '💬' : idx === 1 ? '📚' : idx === 2 ? '🎯' : '📈';
                    return (
                      <div key={idx} className="chat-helpbox__item" role="listitem">
                        <div className="chat-helpbox__icon" aria-hidden="true">{emoji}</div>
                        <div className="chat-helpbox__text">{cap}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <style>{`
        .chatbot-page {
          min-height: 100vh;
          background: linear-gradient(to bottom, rgba(238, 242, 255, 1), rgba(255, 255, 255, 1) 38%, rgba(255, 255, 255, 1));
        }

        /* Modern chat UI (scoped to this page via existing class names) */

        /* Prevent the chat panel itself from “lifting” on hover (global .card:hover). */
        .card.chat-shell:hover {
          box-shadow: var(--shadow-sm);
          transition: none;
          transform: none;
        }

        .chatbot-title {
          font-weight: 900;
          background: linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .chat-body,
        .chat-body:hover {
          background: rgba(238, 242, 255, 0.40);
          padding: 18px;
          border: 1px solid rgba(224, 231, 255, 1);
          border-radius: 18px 18px 0 0;
          box-shadow: inset 0 2px 14px rgba(15, 23, 42, 0.06);
          transition: none;
        }

        .chat-row {
          margin-bottom: 12px;
          gap: 10px;
          align-items: flex-end;
        }

        .chat-avatar {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
          box-shadow: 0 6px 16px rgba(79, 70, 229, 0.22);
          border: 0;
          flex: 0 0 40px;
        }
        .chat-avatar svg {
          width: 20px;
          height: 20px;
        }

        .chat-bubble {
          border: 0;
          padding: 12px 14px;
          border-radius: 18px;
          box-shadow: var(--shadow-sm);
        }

        .chat-bubble.assistant {
          background: #ffffff;
          border-top-left-radius: 0;
        }

        .chat-bubble.user {
          background: #4F46E5;
          color: #ffffff;
          border-top-right-radius: 0;
        }

        .chat-text {
          line-height: 1.45;
          font-size: 0.96rem;
        }

        .chat-bubble.user .chat-time {
          color: rgba(255, 255, 255, 0.78);
        }

        .chat-compose-wrap {
          position: relative;
          padding: 12px 18px;
          background: rgba(238, 242, 255, 0.55);
          border: 1px solid rgba(224, 231, 255, 1);
          border-top: 0;
          border-radius: 0 0 18px 18px;
        }

        .chat-compose {
          display: flex;
          gap: 10px;
          align-items: center;
          padding: 10px 12px;
          background: #ffffff;
          border: 1px solid rgba(16, 24, 40, 0.10);
          border-radius: 999px;
          box-shadow: var(--shadow-sm);
        }

        .chat-compose__input {
          flex: 1;
          border: 0;
          outline: none;
          background: transparent;
          font-size: 1rem;
          padding: 10px 12px;
          min-width: 0;
          color: var(--text);
        }

        .chat-compose__send {
          width: 40px;
          height: 40px;
          border-radius: 999px;
          border: 0;
          background: #4F46E5;
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 140ms ease, opacity 140ms ease;
        }

        .chat-compose__send:hover {
          background: #4338CA;
        }

        .chat-compose__send:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .chat-compose__send svg {
          width: 18px;
          height: 18px;
        }

        .chat-chip {
          background: rgba(238, 242, 255, 1);
          border: 0;
          color: rgba(67, 56, 202, 1);
          border-radius: 999px;
          padding: 10px 12px;
          font-weight: 700;
          cursor: pointer;
          transition: background-color 160ms ease, color 160ms ease, transform 160ms ease;
        }

        .chat-chip:hover {
          background: rgba(224, 231, 255, 1);
          transform: scale(1.05);
        }

        .chat-chip:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }

        .chat-helpbox,
        .chat-helpbox:hover {
          margin-top: 1.5rem;
          padding: 14px;
          background: rgba(238, 242, 255, 0.30);
          border: 1px solid rgba(224, 231, 255, 1);
          border-radius: 14px;
          box-shadow: none;
          transition: none;
        }

        .chat-helpbox__title {
          margin: 0 0 12px 0;
          font-size: 0.95rem;
          font-weight: 900;
          color: rgba(55, 65, 81, 1);
        }

        .chat-helpbox__grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        @media (min-width: 768px) {
          .chat-helpbox__grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .chat-helpbox__item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px;
          background: #ffffff;
          border: 1px solid rgba(224, 231, 255, 1);
          border-radius: 12px;
        }

        .chat-helpbox__icon {
          width: 32px;
          height: 32px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(238, 242, 255, 1);
          color: rgba(79, 70, 229, 1);
          flex: 0 0 32px;
          font-size: 16px;
        }

        .chat-helpbox__text {
          font-size: 0.9rem;
          line-height: 1.35;
          color: rgba(55, 65, 81, 1);
          font-weight: 700;
        }
      `}</style>
      </div>
    </div>
  );
};

export default Chatbot;
