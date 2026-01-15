import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';
import { communicationService } from '@/services/api/communication.service';
import { Announcement, Contact, Message } from '@/types/communication.types';

const TeacherMessages: React.FC = () => {
  const { user } = useAuth();
  const myId = user?.id;

  const [tab, setTab] = useState<'messages' | 'announcements'>('messages');
  const [box, setBox] = useState<'all' | 'inbox' | 'sent'>('all');
  const [messages, setMessages] = useState<Message[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [compose, setCompose] = useState({ receiverId: '', subject: '', content: '' });
  const [sending, setSending] = useState(false);

  const [announceForm, setAnnounceForm] = useState({
    title: '',
    content: '',
    targetAudience: 'students' as 'students' | 'all' | 'teachers',
  });
  const [posting, setPosting] = useState(false);

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
      setError(e?.response?.data?.detail || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inboxCount = useMemo(() => {
    if (!myId) return 0;
    return messages.filter((m) => m.receiverId === myId).length;
  }, [messages, myId]);

  const sentCount = useMemo(() => {
    if (!myId) return 0;
    return messages.filter((m) => m.senderId === myId).length;
  }, [messages, myId]);

  const unreadCount = useMemo(() => {
    if (!myId) return 0;
    return messages.filter((m) => m.receiverId === myId && !m.isRead).length;
  }, [messages, myId]);

  const filteredMessages = useMemo(() => {
    const base =
      box === 'all'
        ? messages
        : box === 'inbox'
          ? messages.filter((m) => (myId ? m.receiverId === myId : true))
          : messages.filter((m) => (myId ? m.senderId === myId : true));

    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter((m) => {
      const from = (m.senderName || m.senderId || '').toLowerCase();
      const to = (m.receiverName || m.receiverId || '').toLowerCase();
      const subj = (m.subject || '').toLowerCase();
      const body = (m.content || '').toLowerCase();
      return from.includes(q) || to.includes(q) || subj.includes(q) || body.includes(q);
    });
  }, [messages, query, box, myId]);

  const selected = useMemo(
    () => filteredMessages.find((m) => m.id === selectedId) || null,
    [filteredMessages, selectedId],
  );

  const selectMessage = async (m: Message) => {
    setSelectedId(m.id);
    if (!myId) return;
    if (m.receiverId === myId && !m.isRead) {
      try {
        await communicationService.markMessageAsRead(m.id);
        setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, isRead: true } : x)));
      } catch {
        // ignore
      }
    }
  };

  const deleteMessage = async (id: string) => {
    setError(null);
    try {
      await communicationService.deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedId === id) setSelectedId(null);
      setNotice('Message deleted.');
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Could not be deleted.');
    }
  };

  const replyToSelected = () => {
    if (!selected || !myId) return;
    const otherId = selected.senderId === myId ? selected.receiverId : selected.senderId;
    const baseSubject = selected.subject?.trim() || '';
    const subject = baseSubject.toLowerCase().startsWith('re:') ? baseSubject : `Re: ${baseSubject || 'Message'}`;
    const otherName =
      selected.senderId === myId
        ? selected.receiverName || selected.receiverId
        : selected.senderName || selected.senderId;
    const quoted = `\n\n---\nOn ${new Date(selected.createdAt).toLocaleString()}, ${otherName} wrote:\n${selected.content}`;

    setCompose((p) => ({ receiverId: otherId, subject, content: p.content ? p.content : quoted }));
    setNotice('Reply drafted below.');
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 50);
  };

  const send = async () => {
    if (!compose.receiverId || !compose.content.trim()) {
      setError('Please provide a recipient and message content.');
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
      setNotice('Message sent.');
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Message could not be sent.');
    } finally {
      setSending(false);
    }
  };

  const postAnnouncement = async () => {
    if (!announceForm.title.trim() || !announceForm.content.trim()) {
      setError('Title and content are required for an announcement.');
      return;
    }
    setPosting(true);
    setError(null);
    try {
      const ann = await communicationService.createAnnouncement(
        announceForm.title,
        announceForm.content,
        announceForm.targetAudience,
      );
      setAnnouncements((prev) => [ann, ...prev]);
      setAnnounceForm({ title: '', content: '', targetAudience: 'students' });
      setTab('announcements');
      setNotice('Announcement posted.');
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Announcement could not be posted.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: 24 }}>
      <div className="container">
        <Link to="/teacher/dashboard" style={{ marginBottom: '20px', display: 'inline-block' }}>
          ← Back to Dashboard
        </Link>

        <div className="toolbar">
          <div>
            <h1 className="page-title" style={{ marginBottom: 0 }}>
              Teacher Communication
            </h1>
            <div className="subtitle">Message students and post announcements.</div>
          </div>
          <div className="actions">
            <div className="tabs">
              <button type="button" className={`tab ${tab === 'messages' ? 'active' : ''}`} onClick={() => setTab('messages')}>
                Messages {unreadCount > 0 && <span className="pill">Unread: {unreadCount}</span>}
              </button>
              <button
                type="button"
                className={`tab ${tab === 'announcements' ? 'active' : ''}`}
                onClick={() => setTab('announcements')}
              >
                Announcements
              </button>
            </div>
            <button type="button" className="button button-primary" onClick={load} disabled={loading || sending || posting}>
              {loading ? 'Loading…' : 'Refresh'}
            </button>
          </div>
        </div>

        {error && (
          <div className="card" style={{ borderColor: 'rgba(220,38,38,0.25)', background: 'rgba(220,38,38,0.06)' }}>
            {error}
          </div>
        )}
        {notice && (
          <div className="card" style={{ borderColor: 'rgba(37,99,235,0.25)', background: 'rgba(37,99,235,0.06)' }}>
            {notice}
          </div>
        )}

        {tab === 'messages' && (
          <div className="split" style={{ marginTop: 16 }}>
            <div className="card tc-card">
              <div className="kpis" style={{ marginBottom: 12 }}>
                <div className="kpi">
                  <div className="label">Inbox</div>
                  <div className="value">{inboxCount}</div>
                </div>
                <div className="kpi">
                  <div className="label">Sent</div>
                  <div className="value">{sentCount}</div>
                </div>
                <div className="kpi">
                  <div className="label">Unread</div>
                  <div className="value">{unreadCount}</div>
                </div>
              </div>

              <div className="tabs" style={{ marginBottom: 10 }}>
                <button type="button" className={`tab ${box === 'all' ? 'active' : ''}`} onClick={() => setBox('all')}>
                  All
                </button>
                <button type="button" className={`tab ${box === 'inbox' ? 'active' : ''}`} onClick={() => setBox('inbox')}>
                  Inbox
                </button>
                <button type="button" className={`tab ${box === 'sent' ? 'active' : ''}`} onClick={() => setBox('sent')}>
                  Sent
                </button>
              </div>

              <input
                className="input tc-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by person/subject/content…"
              />

              {loading ? (
                <div className="loading">Loading…</div>
              ) : (
                <div className="list">
                  {filteredMessages.length === 0 && <div className="text-muted">No messages yet.</div>}
                  {filteredMessages.map((m) => {
                    const isInbound = myId ? m.receiverId === myId : true;
                    const counterpart = isInbound ? m.senderName || `User #${m.senderId}` : m.receiverName || `User #${m.receiverId}`;
                    const initials = (counterpart || 'U')
                      .split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((x) => x[0]?.toUpperCase())
                      .join('');
                    return (
                      <div
                        key={m.id}
                        className={`list-item ${selectedId === m.id ? 'active' : ''} ${myId && m.receiverId === myId && !m.isRead ? 'unread' : ''}`}
                        onClick={() => selectMessage(m)}
                      >
                        <div className="msg-row">
                          <span className={`avatar ${isInbound ? '' : 'muted'}`}>{initials || 'U'}</span>
                          <div className="msg-main">
                            <div className="msg-title">
                              <div className="who">
                                {counterpart}{' '}
                                <span className="pill" style={{ marginLeft: 8 }}>
                                  {isInbound ? 'IN' : 'OUT'}
                                </span>
                              </div>
                              <div className="date">{new Date(m.createdAt).toLocaleDateString()}</div>
                            </div>
                            <div className="msg-subject">{m.subject || '(no subject)'}</div>
                            <div className="msg-snippet">{m.content}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="card tc-card">
              <div className="toolbar tc-toolbar">
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
                  <div className="actions">
                    <button type="button" className="button button-ghost" onClick={replyToSelected} disabled={!myId}>
                      Reply
                    </button>
                    <button type="button" className="button button-danger" onClick={() => deleteMessage(selected.id)}>
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {selected && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{selected.subject || '(no subject)'}</div>
                  <div className="text-muted" style={{ marginTop: 6 }}>
                    {new Date(selected.createdAt).toLocaleString()}
                  </div>
                  <div className="divider" />
                  <div style={{ marginTop: 14, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{selected.content}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'messages' && (
          <div className="card tc-card">
            <div className="toolbar tc-toolbar">
              <div>
                <h2 style={{ marginBottom: 6 }}>Compose</h2>
                <div className="text-muted">Send a new message to a student.</div>
              </div>
              <div className="pill">Draft</div>
            </div>
            <div className="divider" />
            <div className="form-group">
              <div className="grid-2">
                <div>
                  <label className="form-label">To</label>
                  <select
                    className="input tc-input"
                    value={compose.receiverId}
                    onChange={(e) => setCompose((p) => ({ ...p, receiverId: e.target.value }))}
                  >
                    <option value="">Select…</option>
                    {contacts.length === 0 && (
                      <option value="" disabled>
                        No student contact found (create Student accounts first)
                      </option>
                    )}
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.role})
                      </option>
                    ))}
                  </select>
                  {contacts.length === 0 && (
                    <div className="text-muted" style={{ marginTop: 6 }}>
                      This dropdown is empty because there are no <strong>Student</strong> accounts yet (or you're not logged in). Once you create
                      at least one student account, it will appear here.
                    </div>
                  )}
                </div>
                <div>
                  <label className="form-label">Subject</label>
                  <input
                    className="input tc-input"
                    type="text"
                    placeholder="Message subject"
                    value={compose.subject}
                    onChange={(e) => setCompose((p) => ({ ...p, subject: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea
                className="input tc-input"
                rows={5}
                placeholder="Type your message here..."
                style={{ resize: 'vertical' }}
                value={compose.content}
                onChange={(e) => setCompose((p) => ({ ...p, content: e.target.value }))}
              />
              <div className="text-muted" style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <span>Tip: The Reply button auto-fills from the selected message.</span>
                <span>{compose.content.length} chars</span>
              </div>
            </div>
            <button type="button" className="tc-btn tc-btn-gradient" onClick={send} disabled={sending || loading}>
              {sending ? 'Sending…' : 'Send Message'}
            </button>
          </div>
        )}

        {tab === 'announcements' && (
          <div className="card tc-card">
            <div className="toolbar tc-toolbar">
              <div>
                <h2 style={{ marginBottom: 6 }}>Create Announcement</h2>
                <div className="text-muted">Post an announcement.</div>
              </div>
              <div className="pill">Teacher</div>
            </div>
            <div className="divider" />

            <div className="grid-2">
              <div>
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input
                    className="input tc-input"
                    type="text"
                    placeholder="Announcement title"
                    value={announceForm.title}
                    onChange={(e) => setAnnounceForm((p) => ({ ...p, title: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Target Audience</label>
                  <select
                    className="input tc-input"
                    value={announceForm.targetAudience}
                    onChange={(e) => setAnnounceForm((p) => ({ ...p, targetAudience: e.target.value as any }))}
                  >
                    <option value="students">Students</option>
                    <option value="all">All Users</option>
                    <option value="teachers">Teachers</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Content</label>
                  <textarea
                    className="input tc-input"
                    rows={5}
                    placeholder="Announcement content..."
                    style={{ resize: 'vertical' }}
                    value={announceForm.content}
                    onChange={(e) => setAnnounceForm((p) => ({ ...p, content: e.target.value }))}
                  />
                  <div className="text-muted" style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                    <span>Keep it short & clear.</span>
                    <span>{announceForm.content.length} chars</span>
                  </div>
                </div>
                <button type="button" className="tc-btn tc-btn-gradient" onClick={postAnnouncement} disabled={posting || loading}>
                  {posting ? 'Posting…' : 'Post Announcement'}
                </button>
              </div>

              <div>
                <div className="pill" style={{ marginBottom: 10 }}>
                  Live Preview
                </div>
                <div className="list-item announcement-card">
                  <div className="msg-row">
                    <span className="avatar">{(user?.name || 'T').slice(0, 1).toUpperCase()}</span>
                    <div className="msg-main">
                      <div className="announcement-head">
                        <div style={{ fontWeight: 900 }}>{announceForm.title.trim() || 'Announcement title'}</div>
                        <span className="pill">{new Date().toLocaleDateString()}</span>
                      </div>
                      <div className="announcement-meta">
                        By <strong>{user?.name || 'Teacher'}</strong> · Audience: <strong>{announceForm.targetAudience}</strong>
                      </div>
                      <div style={{ marginTop: 10, whiteSpace: 'pre-wrap', lineHeight: 1.45 }}>
                        {announceForm.content.trim() || 'Announcement content preview…'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'announcements' && (
          <div className="card tc-card">
            <div className="toolbar tc-toolbar">
              <div>
                <h2 style={{ marginBottom: 6 }}>Announcements Feed</h2>
                <div className="text-muted">List of published announcements.</div>
              </div>
              <span className="pill">{announcements.length} items</span>
            </div>
            <div className="divider" />
            {loading ? (
              <div className="loading">Loading…</div>
            ) : (
              <div className="list">
                {announcements.length === 0 && <div className="text-muted">No announcements yet.</div>}
                {announcements.map((a) => (
                  <div key={a.id} className="list-item announcement-card">
                    <div className="msg-row">
                      <span className="avatar">{(a.authorName || 'T').slice(0, 1).toUpperCase()}</span>
                      <div className="msg-main">
                        <div className="announcement-head">
                          <div style={{ fontWeight: 900 }}>{a.title}</div>
                          <span className="pill">{new Date(a.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="announcement-meta">
                          By <strong>{a.authorName}</strong> · Audience: <strong>{a.targetAudience}</strong>
                        </div>
                        <div style={{ marginTop: 10, whiteSpace: 'pre-wrap', lineHeight: 1.45 }}>{a.content}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherMessages;
