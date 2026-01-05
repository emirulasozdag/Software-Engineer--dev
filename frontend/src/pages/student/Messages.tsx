import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';
import { communicationService } from '@/services/api/communication.service';
import { Announcement, Contact, Message } from '@/types/communication.types';

const Messages: React.FC = () => {
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

  const [compose, setCompose] = useState({ receiverId: '', subject: '', content: '' });
  const [sending, setSending] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

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

    setCompose((p) => ({
      receiverId: otherId,
      subject,
      content: p.content ? p.content : quoted,
    }));
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

  return (
    <div className="aurora-page bg-gradient-to-br from-indigo-50 via-white to-slate-50">
      <div className="aurora-pulse" aria-hidden="true" />
      <div className="container aurora-content">
        <Link
          to="/student/dashboard"
          className="aurora-link"
          style={{ marginBottom: '20px', display: 'inline-block' }}
        >
          ← Back to Dashboard
        </Link>

        <div className="toolbar">
          <div>
            <h1 className="text-3xl font-extrabold text-indigo-900 tracking-tight" style={{ marginBottom: 0 }}>Communication</h1>
            <div className="subtitle aurora-subtitle">Message your teacher and follow announcements.</div>
          </div>
          <div className="actions">
            <div className="tabs">
              <button className={`tab ${tab === 'messages' ? 'active' : ''}`} onClick={() => setTab('messages')}>
                Messages {unreadCount > 0 && <span className="pill">Unread: {unreadCount}</span>}
              </button>
              <button className={`tab ${tab === 'announcements' ? 'active' : ''}`} onClick={() => setTab('announcements')}>
                Announcements
              </button>
            </div>
            {tab === 'messages' && (
              <button
                className="button button-primary"
                onClick={() => setIsComposeOpen(true)}
                disabled={sending || loading}
              >
                New Message ✏️
              </button>
            )}
            <button className="button button-secondary" onClick={load} disabled={loading || sending}>
              {loading ? 'Loading…' : 'Refresh'}
            </button>
          </div>
        </div>

        {error && <div className="card aurora-alert" style={{ borderColor: 'rgba(220,38,38,0.25)', background: 'rgba(220,38,38,0.06)' }}>{error}</div>}
        {notice && <div className="card aurora-alert" style={{ borderColor: 'rgba(37,99,235,0.25)', background: 'rgba(37,99,235,0.06)' }}>{notice}</div>}

        {tab === 'messages' && (
          <div
            className="grid gap-4"
            style={{
              marginTop: 16,
              gridTemplateColumns: 'minmax(0, 1fr)',
            }}
          >
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: 'minmax(0, 1fr)',
              }}
            >
              <div
                className="split"
                style={{
                  marginTop: 0,
                  gridTemplateColumns: '360px minmax(0, 1fr)',
                  alignItems: 'stretch',
                  minHeight: '70vh',
                }}
              >
                <div className="card glass-card bg-white/80 backdrop-blur-xl border border-white shadow-lg rounded-2xl text-slate-800" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <h2 className="text-lg font-bold text-slate-700" style={{ marginBottom: 10 }}>Inbox</h2>
                  <div className="kpis" style={{ marginBottom: 12 }}>
                    <div className="kpi aurora-kpi inbox bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 border-indigo-500/30">
                      <div className="label">Inbox</div>
                      <div className="value text-4xl font-black text-indigo-600">{inboxCount}</div>
                    </div>
                    <div className="kpi aurora-kpi sent bg-gradient-to-br from-violet-500/20 to-violet-600/20 border-violet-500/30">
                      <div className="label">Sent</div>
                      <div className="value text-4xl font-black text-indigo-600">{sentCount}</div>
                    </div>
                    <div className="kpi aurora-kpi unread bg-gradient-to-br from-rose-500/20 to-rose-600/20 border-rose-500/30">
                      <div className="label">Unread</div>
                      <div className="value text-4xl font-black text-indigo-600">{unreadCount}</div>
                    </div>
                  </div>

                  <div className="tabs" style={{ marginBottom: 10 }}>
                    <button className={`tab ${box === 'all' ? 'active' : ''}`} onClick={() => setBox('all')}>All</button>
                    <button className={`tab ${box === 'inbox' ? 'active' : ''}`} onClick={() => setBox('inbox')}>Inbox</button>
                    <button className={`tab ${box === 'sent' ? 'active' : ''}`} onClick={() => setBox('sent')}>Sent</button>
                  </div>

                  <input
                    className="input aurora-input bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:ring-indigo-500"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by person/subject/content…"
                  />

                  {loading ? (
                    <div className="loading">Loading…</div>
                  ) : (
                    <div className="list" style={{ overflow: 'auto', flex: 1, paddingRight: 2 }}>
                      {filteredMessages.length === 0 && <div className="text-muted aurora-muted">No messages yet.</div>}
                      {filteredMessages.map((m) => {
                        const isInbound = myId ? m.receiverId === myId : true;
                        const counterpart = isInbound
                          ? (m.senderName || `User #${m.senderId}`)
                          : (m.receiverName || `User #${m.receiverId}`);
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

                <div className="card glass-card bg-white/80 backdrop-blur-xl border border-white shadow-lg rounded-2xl text-slate-800" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div className="toolbar">
                    <div>
                      <h2 className="text-lg font-bold text-slate-700" style={{ marginBottom: 6 }}>Message</h2>
                      {selected ? (
                        <div className="text-muted aurora-muted">
                          From <strong>{selected.senderName || selected.senderId}</strong> · To{' '}
                          <strong>{selected.receiverName || selected.receiverId}</strong>
                        </div>
                      ) : null}
                    </div>
                    {selected && (
                      <div className="actions">
                        <button className="button button-ghost" onClick={replyToSelected} disabled={!myId}>
                          Reply
                        </button>
                        <button className="button button-danger" onClick={() => deleteMessage(selected.id)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {!selected && (
                    <div className="flex flex-col items-center justify-center" style={{ minHeight: 260, flex: 1 }}>
                      <div className="text-slate-400 font-medium text-lg italic">Select a message to view details</div>
                    </div>
                  )}

                  {selected && (
                    <div style={{ marginTop: 14, overflow: 'auto', flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{selected.subject || '(no subject)'}</div>
                      <div className="text-muted aurora-muted" style={{ marginTop: 6 }}>{new Date(selected.createdAt).toLocaleString()}</div>
                      <div className="divider" />
                      <div style={{ marginTop: 14, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{selected.content}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'messages' && isComposeOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <button
              className="absolute inset-0 bg-slate-900/30"
              aria-label="Close compose modal"
              onClick={() => setIsComposeOpen(false)}
              type="button"
            />
            <div className="relative w-full max-w-2xl">
              <div className="card glass-card bg-white/90 backdrop-blur-xl border border-white shadow-lg rounded-2xl text-slate-800" style={{ marginBottom: 0 }}>
                <div className="toolbar">
                  <div>
                    <h2 className="text-lg font-bold text-slate-700" style={{ marginBottom: 6 }}>Compose</h2>
                    <div className="text-muted aurora-muted">Write a new message to your teacher.</div>
                  </div>
                  <div className="actions">
                    <button
                      className="button button-ghost"
                      type="button"
                      onClick={() => setIsComposeOpen(false)}
                      disabled={sending}
                    >
                      Close
                    </button>
                  </div>
                </div>
                <div className="divider" />

                <div className="form-group">
                  <div className="grid-2">
                    <div>
                      <label className="form-label">To</label>
                      <select
                        className="input aurora-input bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:ring-indigo-500"
                        value={compose.receiverId}
                        onChange={(e) => setCompose((p) => ({ ...p, receiverId: e.target.value }))}
                      >
                        <option value="">Select…</option>
                        {contacts.length === 0 && (
                          <option value="" disabled>
                            No teacher contact found (create a Teacher account first)
                          </option>
                        )}
                        {contacts.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.role})
                          </option>
                        ))}
                      </select>
                      {contacts.length === 0 && (
                        <div className="text-muted aurora-muted" style={{ marginTop: 6 }}>
                          This dropdown is empty because there is no <strong>Teacher</strong> account yet. Create a Teacher account and
                          log in; it will be listed here.
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="form-label">Subject</label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">📝</span>
                        <input
                          className="input aurora-input bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:ring-indigo-500 pl-10"
                          type="text"
                          placeholder="Message subject"
                          value={compose.subject}
                          onChange={(e) => setCompose((p) => ({ ...p, subject: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Message</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-3 text-slate-400" aria-hidden="true">💬</span>
                    <textarea
                      className="input aurora-input bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:ring-indigo-500 pl-10 pt-3"
                      rows={6}
                      placeholder="Type your message here..."
                      style={{ resize: 'vertical' }}
                      value={compose.content}
                      onChange={(e) => setCompose((p) => ({ ...p, content: e.target.value }))}
                    />
                  </div>
                  <div className="text-muted aurora-muted" style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                    <span>Tip: The Reply button auto-fills from the selected message.</span>
                    <span>{compose.content.length} chars</span>
                  </div>
                </div>

                <div className="actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button
                    className="button button-primary aurora-send bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                    onClick={async () => {
                      await send();
                      setIsComposeOpen(false);
                    }}
                    disabled={sending || loading}
                  >
                    {sending ? 'Sending…' : 'Send Message'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'announcements' && (
          <div className="card glass-card bg-white/80 backdrop-blur-xl border border-white shadow-lg rounded-2xl text-slate-800">
            <div className="toolbar">
              <div>
                <h2 className="aurora-h2" style={{ marginBottom: 6 }}>Announcements</h2>
                <div className="text-muted aurora-muted">Class announcements and important reminders.</div>
              </div>
              <span className="pill">{announcements.length} items</span>
            </div>
            <div className="divider" />
            {loading ? (
              <div className="loading">Loading…</div>
            ) : (
              <div className="list">
                {announcements.length === 0 && <div className="text-muted aurora-muted">No announcements yet.</div>}
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

        <style>{`
        .aurora-page {
          min-height: 100vh;
          position: relative;
          color: rgba(30, 41, 59, 1);
        }

        .aurora-pulse {
          position: absolute;
          inset: -40px;
          background:
            radial-gradient(900px 500px at 20% 15%, rgba(99, 102, 241, 0.22), transparent 60%),
            radial-gradient(750px 520px at 80% 30%, rgba(139, 92, 246, 0.16), transparent 60%),
            radial-gradient(820px 520px at 55% 85%, rgba(244, 63, 94, 0.10), transparent 60%);
          filter: blur(18px);
          opacity: 0.80;
          pointer-events: none;
        }

        .aurora-content {
          position: relative;
          z-index: 1;
        }

        .aurora-link {
          color: rgba(30, 41, 59, 0.90);
          text-decoration: none;
        }
        .aurora-link:hover {
          color: rgba(15, 23, 42, 1);
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .aurora-title {
          color: rgba(30, 27, 75, 1);
          font-weight: 800;
        }

        .aurora-h2 {
          color: rgba(30, 27, 75, 1);
          font-weight: 800;
        }

        .aurora-subtitle,
        .aurora-muted {
          color: rgba(71, 85, 105, 1);
        }

        .aurora-alert {
          color: rgba(30, 41, 59, 1);
        }

        .aurora-page .tabs .tab {
          background: rgba(255, 255, 255, 0.75);
          border-color: rgba(226, 232, 240, 1);
          color: rgba(51, 65, 85, 1);
        }
        .aurora-page .tabs .tab.active {
          background: rgba(99, 102, 241, 0.14);
          border-color: rgba(99, 102, 241, 0.26);
          color: rgba(30, 27, 75, 1);
        }

        .aurora-page .pill {
          background: rgba(255, 255, 255, 0.70);
          border-color: rgba(226, 232, 240, 1);
          color: rgba(71, 85, 105, 1);
        }

        .aurora-page .divider {
          background: rgba(226, 232, 240, 1);
        }

        .aurora-page .list-item {
          background: rgba(255, 255, 255, 0.78);
          border-color: rgba(226, 232, 240, 1);
          color: rgba(30, 41, 59, 1);
        }
        .aurora-page .list-item:hover {
          background: rgba(255, 255, 255, 0.92);
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.10);
        }
        .aurora-page .list-item.active {
          border-color: rgba(99, 102, 241, 0.34);
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.14);
        }
        .aurora-page .list-item.unread {
          background: rgba(255, 228, 230, 0.70);
          border-color: rgba(244, 63, 94, 0.26);
        }

        .aurora-page .avatar {
          background: rgba(99, 102, 241, 0.14);
          border-color: rgba(99, 102, 241, 0.22);
          color: rgba(30, 27, 75, 1);
        }
        .aurora-page .avatar.muted {
          background: rgba(255, 255, 255, 0.60);
          border-color: rgba(226, 232, 240, 1);
          color: rgba(71, 85, 105, 1);
        }

        .aurora-page .kpi.aurora-kpi {
          border-width: 1px;
          border-style: solid;
          background: rgba(255, 255, 255, 0.60);
        }
        .aurora-page .kpi.aurora-kpi .label {
          color: rgba(71, 85, 105, 1);
        }
        .aurora-page .kpi.aurora-kpi .value {
          font-size: inherit;
          font-weight: inherit;
          letter-spacing: inherit;
          color: inherit;
        }

        .aurora-page .kpi.aurora-kpi.inbox {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.22), rgba(79, 70, 229, 0.14));
          border-color: rgba(99, 102, 241, 0.30);
        }
        .aurora-page .kpi.aurora-kpi.sent {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.20), rgba(124, 58, 237, 0.14));
          border-color: rgba(139, 92, 246, 0.30);
        }
        .aurora-page .kpi.aurora-kpi.unread {
          background: linear-gradient(135deg, rgba(244, 63, 94, 0.22), rgba(225, 29, 72, 0.12));
          border-color: rgba(244, 63, 94, 0.30);
        }

        .aurora-page .form-label {
          color: rgba(51, 65, 85, 1);
        }
        .aurora-page .input.aurora-input {
          background: rgba(255, 255, 255, 1);
          border-color: rgba(226, 232, 240, 1);
          color: rgba(30, 41, 59, 1);
        }
        .aurora-page .input.aurora-input::placeholder {
          color: rgba(148, 163, 184, 1);
        }
        .aurora-page .input.aurora-input:focus {
          outline: none;
          border-color: rgba(99, 102, 241, 0.55);
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.20);
        }

        .aurora-page .button.aurora-send {
          background-image: linear-gradient(90deg, rgba(99, 102, 241, 1), rgba(124, 58, 237, 1));
          border-color: rgba(255, 255, 255, 0.12);
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.50);
        }
        .aurora-page .button.aurora-send:hover {
          background-image: linear-gradient(90deg, rgba(129, 140, 248, 1), rgba(139, 92, 246, 1));
          box-shadow: 0 0 26px rgba(99, 102, 241, 0.55);
        }
      `}</style>
      </div>
    </div>
  );
};

export default Messages;
