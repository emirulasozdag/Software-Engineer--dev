import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { aiContentService, type TeacherDraftContentOut } from '@/services/api/ai-content.service';

const AIDrafts: React.FC = () => {
  const [drafts, setDrafts] = useState<TeacherDraftContentOut[]>([]);
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRationale, setLastRationale] = useState<string | null>(null);

  const refresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await aiContentService.listMyDrafts();
      setDrafts(res.drafts ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? e?.message ?? 'Failed to load drafts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const createDraft = async () => {
    setIsLoading(true);
    setError(null);
    setLastRationale(null);
    try {
      const res = await aiContentService.createDraft({ title, instructions, contentType: 'LESSON', level: 'A1' });
      setLastRationale(res.rationale);
      setTitle('');
      setInstructions('');
      await refresh();
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? e?.message ?? 'Failed to create draft');
    } finally {
      setIsLoading(false);
    }
  };

  const publish = async (contentId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await aiContentService.publishDraft(contentId);
      await refresh();
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? e?.message ?? 'Failed to publish draft');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <Link to="/teacher/dashboard" style={{ marginBottom: '20px', display: 'inline-block' }}>
        ← Back to Dashboard
      </Link>

      <h1 className="page-title">Teacher–AI Draft Content</h1>
      <p style={{ color: '#666' }}>UC19 (FR35): teacher directives → AI draft → publish.</p>

      {error && (
        <div className="card" style={{ borderLeft: '4px solid #e74c3c' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="card">
        <h2>Create a new draft</h2>
        <label className="form-label">Title</label>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Grammar: Present Perfect" />
        <label className="form-label" style={{ marginTop: '10px' }}>
          Teacher directives (instructions)
        </label>
        <textarea className="input" rows={5} value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="What should the AI generate?" />
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button className="button button-primary" disabled={isLoading || !title.trim() || !instructions.trim()} onClick={createDraft}>
            {isLoading ? 'Working...' : 'Generate Draft'}
          </button>
          <button className="button button-secondary" disabled={isLoading} onClick={refresh}>
            Refresh
          </button>
        </div>
        {lastRationale && (
          <p style={{ marginTop: '10px', color: '#666' }}>
            <strong>Rationale:</strong> {lastRationale}
          </p>
        )}
      </div>

      <div className="card">
        <h2>My draft list</h2>
        {isLoading && <p>Loading...</p>}
        {!isLoading && drafts.length === 0 && <p style={{ color: '#666' }}>No drafts yet.</p>}
        {!isLoading &&
          drafts.map((d) => (
            <div key={d.contentId} className="card" style={{ background: '#f9f9f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                <div>
                  <h3 style={{ marginTop: 0 }}>{d.title}</h3>
                  <p style={{ color: '#666' }}>
                    ID: {d.contentId} | Level: <strong>{d.level}</strong> | Type: <strong>{d.contentType}</strong>
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <button className="button button-primary" disabled={isLoading} onClick={() => publish(d.contentId)}>
                    Publish
                  </button>
                </div>
              </div>
              <pre style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>{d.body}</pre>
            </div>
          ))}
      </div>
    </div>
  );
};

export default AIDrafts;


