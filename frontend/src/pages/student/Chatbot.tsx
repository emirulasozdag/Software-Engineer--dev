import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I\'m your AI English tutor. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages([...messages, { role: 'user', content: input }]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'This is a placeholder response. The actual chatbot will be integrated with the backend API.'
      }]);
    }, 1000);
  };

  return (
    <div className="container">
      <Link to="/student/dashboard" style={{ marginBottom: '20px', display: 'inline-block' }}>← Back to Dashboard</Link>
      
      <h1 className="page-title">AI Chatbot Tutor</h1>
      
      <div className="card" style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#f9f9f9', borderRadius: '4px' }}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                marginBottom: '15px',
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div
                style={{
                  maxWidth: '70%',
                  padding: '10px 15px',
                  borderRadius: '8px',
                  background: msg.role === 'user' ? '#3498db' : '#ecf0f1',
                  color: msg.role === 'user' ? 'white' : 'black'
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <input
            className="input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything about English..."
            style={{ marginBottom: 0 }}
          />
          <button className="button button-primary" onClick={handleSend}>
            Send
          </button>
        </div>
      </div>

      <div className="card">
        <h3>Suggested Questions</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '15px' }}>
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
