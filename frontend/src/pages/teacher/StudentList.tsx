import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { teacherService } from '@/services/api';
import { StudentOverview } from '@/types/teacher.types';

const StudentList: React.FC = () => {
  const [students, setStudents] = useState<StudentOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await teacherService.getMyStudents();
      setStudents(rows);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Students could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
  }, [students, query]);

  return (
    <div className="container">
      <Link to="/teacher/dashboard" style={{ marginBottom: '20px', display: 'inline-block' }}>
        ← Back to Dashboard
      </Link>
      
      <div className="toolbar">
        <div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>My Students</h1>
          <div className="subtitle">Select a student → review test results and the learning plan.</div>
        </div>
        <div className="actions">
          <button className="button button-primary" onClick={load} disabled={loading}>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </div>
      
      {error && <div className="card" style={{ borderColor: 'rgba(220,38,38,0.25)', background: 'rgba(220,38,38,0.06)' }}>{error}</div>}

      <div className="card">
        <div className="toolbar">
          <div>
            <h2 style={{ marginBottom: 6 }}>Student Overview</h2>
            <div className="text-muted">Total: {students.length}</div>
          </div>
          <div style={{ minWidth: 320 }}>
            <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name/email…" />
          </div>
        </div>
        <div className="divider" />

        {loading ? (
          <div className="loading">Loading…</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(16,24,40,0.10)' }}>
                <th style={{ textAlign: 'left', padding: '10px' }}>Student</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Current Level</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Last Activity</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => (
                <tr key={student.id} style={{ borderBottom: '1px solid rgba(16,24,40,0.08)' }}>
                  <td style={{ padding: '10px' }}>
                    <div style={{ fontWeight: 900 }}>{student.name}</div>
                    <div className="text-muted" style={{ fontSize: '0.9rem' }}>{student.email}</div>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span className="pill">{student.currentLevel}</span>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span className="text-muted">
                      {student.lastActivity ? new Date(student.lastActivity).toLocaleString() : '—'}
                    </span>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <Link to={`/teacher/students/${student.id}`}>
                      <button className="button button-primary" style={{ fontSize: '0.9rem', padding: '8px 12px' }}>
                        View Results
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '14px' }} className="text-muted">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StudentList;
