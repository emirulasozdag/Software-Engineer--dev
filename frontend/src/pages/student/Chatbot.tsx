import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { ChatMessage, ChatbotCapabilities } from '@/types/communication.types';
import { communicationService } from '@/services/api/communication.service';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [capabilities, setCapabilities] = useState<ChatbotCapabilities | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

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
    <div className="container">
      <Link to="/student/dashboard" style={{ marginBottom: '20px', display: 'inline-block' }}>
        ← Back to Dashboard
      </Link>
      
      <div className="toolbar">
        <div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>AI Chatbot Tutor (UC20)</h1>
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
                  <div className={`chat-bubble ${msg.role === 'user' ? 'user' : 'assistant'}`}>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                    <div className="chat-time">{new Date(msg.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              ))}
              {sending && (
                <div className="chat-row left">
                  <div className="chat-bubble assistant">
                    <div className="text-muted">Thinking...</div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </>
          </div>
        )}

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
          <button className="button button-primary" onClick={handleSend} disabled={sending || loading}>
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
            'How am I doing in my English learning?',
            'Explain present perfect tense',
            'I want to focus more on speaking skills',
            'What are my strengths and weaknesses?',
            'Give me practice exercises for my level',
            'How can I improve my pronunciation?'
          ].map((question, index) => (
            <button
              key={index}
              className="chip"
              onClick={() => setInput(question)}
              disabled={sending || loading}
            >
              {question}
            </button>
          ))}
        </div>
        
        {capabilities && capabilities.capabilities.length > 0 && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
            <h4 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
              💡 What I can help with:
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.85rem', lineHeight: '1.6' }}>
              {capabilities.capabilities.slice(0, 4).map((cap, idx) => (
                <li key={idx}>{cap}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
