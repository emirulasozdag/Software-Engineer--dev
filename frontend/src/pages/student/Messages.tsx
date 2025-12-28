import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';
import { communicationService } from '@/services/api/communication.service';
import { Announcement, Contact, Message } from '@/types/communication.types';

const Messages: React.FC = () => {
  const { user } = useAuth();
  const myId = user?.id;

  const [tab, setTab] = useState<'messages' | 'announcements'>('messages');
  const [messages, setMessages] = useState<Message[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [compose, setCompose] = useState({ receiverId: '', subject: '', content: '' });
  const [sending, setSending] = useState(false);

  const [query, setQuery] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [msgs, anns, conts] = await Promise.all([
        communicationService.getMessages(),
        communicationService.getAnnouncements(),
        communicationService.getContacts(),
      ]);
      setMessages(msgs);
      setAnnouncements(anns);
      setContacts(conts);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Veriler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unreadCount = useMemo(() => {
    if (!myId) return 0;
    return messages.filter((m) => m.receiverId === myId && !m.isRead).length;
  }, [messages, myId]);

  const filteredMessages = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = messages;
    if (!q) return base;
    return base.filter((m) => {
      const from = (m.senderName || m.senderId || '').toLowerCase();
      const subj = (m.subject || '').toLowerCase();
      const body = (m.content || '').toLowerCase();
      return from.includes(q) || subj.includes(q) || body.includes(q);
    });
  }, [messages, query]);

  const selected = useMemo(() => filteredMessages.find((m) => m.id === selectedId) || null, [filteredMessages, selectedId]);

  const selectMessage = async (m: Message) => {
    setSelectedId(m.id);
    if (!myId) return;
    if (m.receiverId === myId && !m.isRead) {
      try {
        await communicationService.markMessageAsRead(m.id);
        setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, isRead: true } : x)));
      } catch {
        // ignore (non-blocking)
      }
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      await communicationService.deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedId === id) setSelectedId(null);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Silinemedi.');
    }
  };

  const send = async () => {
    if (!compose.receiverId || !compose.content.trim()) {
      setError('Lütfen alıcı ve mesaj içeriği gir.');
      return;
    }
    setSending(true);
    setError(null);
    try {
      const msg = await communicationService.sendMessage(compose.receiverId, compose.subject, compose.content);
      setMessages((prev) => [msg, ...prev]);
      setCompose({ receiverId: '', subject: '', content: '' });
      setSelectedId(msg.id);
      setTab('messages');
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Mesaj gönderilemedi.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container">
      <Link to="/student/dashboard" style={{ marginBottom: '20px', display: 'inline-block' }}>← Back to Dashboard</Link>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Messages & Announcements (UC18)</h1>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="button button-secondary" onClick={() => setTab('messages')}>
            Messages {unreadCount > 0 && <span className="pill">Unread: {unreadCount}</span>}
          </button>
          <button className="button button-secondary" onClick={() => setTab('announcements')}>Announcements</button>
          <button className="button button-primary" onClick={load} disabled={loading || sending}>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </div>
      
      {error && <div className="card" style={{ borderColor: 'rgba(220,38,38,0.25)', background: 'rgba(220,38,38,0.06)' }}>{error}</div>}

      {tab === 'messages' && (
        <div className="split" style={{ marginTop: 16 }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
              <h2 style={{ marginBottom: 0 }}>Inbox</h2>
              <span className="pill">{filteredMessages.length} messages</span>
            </div>
            <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name/subject/content…" />

            {loading ? (
              <div className="loading">Loading…</div>
            ) : (
              <div className="list">
                {filteredMessages.length === 0 && <div className="text-muted">No messages yet.</div>}
                {filteredMessages.map((m) => {
                  const fromLabel = m.senderName || `User #${m.senderId}`;
                  return (
                    <div
                      key={m.id}
                      className={`list-item ${selectedId === m.id ? 'active' : ''} ${myId && m.receiverId === myId && !m.isRead ? 'unread' : ''}`}
                      onClick={() => selectMessage(m)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                        <div style={{ fontWeight: 800 }}>{fromLabel}</div>
                        <div className="text-muted" style={{ fontSize: '0.85rem' }}>{new Date(m.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="text-muted" style={{ marginTop: 4, fontSize: '0.9rem' }}>{m.subject || '(no subject)'}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ marginBottom: 6 }}>Message</h2>
                {selected ? (
                  <div className="text-muted">
                    From <strong>{selected.senderName || selected.senderId}</strong> · To{' '}
                    <strong>{selected.receiverName || selected.receiverId}</strong>
                  </div>
                ) : (
                  <div className="text-muted">Select a message to view details.</div>
                )}
              </div>
              {selected && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="button button-danger" onClick={() => deleteMessage(selected.id)}>
                    Delete
                  </button>
                </div>
              )}
            </div>

            {selected && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{selected.subject || '(no subject)'}</div>
                <div className="text-muted" style={{ marginTop: 6 }}>{new Date(selected.createdAt).toLocaleString()}</div>
                <div style={{ marginTop: 14, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{selected.content}</div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="card">
        <h2>Compose New Message</h2>
        <div className="form-group">
          <label className="form-label">To</label>
          <select
            className="input"
            value={compose.receiverId}
            onChange={(e) => setCompose((p) => ({ ...p, receiverId: e.target.value }))}
          >
            <option value="">Select…</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.role})
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Subject</label>
          <input
            className="input"
            type="text"
            placeholder="Message subject"
            value={compose.subject}
            onChange={(e) => setCompose((p) => ({ ...p, subject: e.target.value }))}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Message</label>
          <textarea
            className="input"
            rows={5}
            placeholder="Type your message here..."
            style={{ resize: 'vertical' }}
            value={compose.content}
            onChange={(e) => setCompose((p) => ({ ...p, content: e.target.value }))}
          />
        </div>
        <button className="button button-primary" onClick={send} disabled={sending || loading}>
          {sending ? 'Sending…' : 'Send Message'}
        </button>
      </div>

      {tab === 'announcements' && (
        <div className="card">
          <h2>Announcements</h2>
          <div className="text-muted mb-16">Teacher duyuruları burada listelenir.</div>
          {loading ? (
            <div className="loading">Loading…</div>
          ) : (
            <div className="list">
              {announcements.length === 0 && <div className="text-muted">No announcements yet.</div>}
              {announcements.map((a) => (
                <div key={a.id} className="list-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ fontWeight: 900 }}>{a.title}</div>
                    <span className="pill">{new Date(a.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-muted" style={{ marginTop: 6 }}>
                    By <strong>{a.authorName}</strong> · Audience: <strong>{a.targetAudience}</strong>
                  </div>
                  <div style={{ marginTop: 10, whiteSpace: 'pre-wrap', lineHeight: 1.45 }}>{a.content}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Messages;
