import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { assignmentsService, type BackendStudentAssignmentOut } from '@/services/api/assignments.service';

const Assignments: React.FC = () => {
  const [items, setItems] = useState<BackendStudentAssignmentOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await assignmentsService.getMyAssignments();
      setItems(res.assignments ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? e?.message ?? 'Failed to load assignments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const pending = useMemo(() => items.filter((x) => x.status === 'PENDING'), [items]);
  const completed = useMemo(() => items.filter((x) => x.status !== 'PENDING'), [items]);

  const submit = async (studentAssignmentId: number) => {
    try {
      await assignmentsService.submitMyAssignment(studentAssignmentId);
      await refresh();
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? e?.message ?? 'Failed to submit assignment');
    }
  };

  return (
    <div className="container">
      <Link to="/student/dashboard" style={{ marginBottom: '20px', display: 'inline-block' }}>← Back to Dashboard</Link>
      
      <h1 className="page-title">My Assignments</h1>

      {error && (
        <div className="card" style={{ borderLeft: '4px solid #e74c3c' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div className="card">
        <h2>Pending Assignments</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          {isLoading && <p>Loading...</p>}
          {!isLoading && pending.length === 0 && <p style={{ color: '#666' }}>No pending assignments.</p>}
          {pending.map((a) => (
            <div key={a.studentAssignmentId} className="card" style={{ background: '#fff3cd', borderLeft: '4px solid #ffc107' }}>
              <h3>{a.assignment?.title ?? `Assignment #${a.assignmentId}`}</h3>
              <p>Due Date: {a.assignment?.dueDate ? new Date(a.assignment.dueDate).toLocaleDateString() : '-'}</p>
              <p>Status: <strong>{a.status}</strong></p>
              <button className="button button-primary" style={{ marginTop: '10px' }} onClick={() => submit(a.studentAssignmentId)}>
                Submit Assignment
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Completed Assignments</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          {isLoading && <p>Loading...</p>}
          {!isLoading && completed.length === 0 && <p style={{ color: '#666' }}>No completed assignments yet.</p>}
          {completed.map((a) => (
            <div key={a.studentAssignmentId} className="card" style={{ background: '#d4edda', borderLeft: '4px solid #28a745' }}>
              <h3>{a.assignment?.title ?? `Assignment #${a.assignmentId}`}</h3>
              <p>Submitted: {a.submittedAt ? new Date(a.submittedAt).toLocaleString() : '-'}</p>
              <p>
                Status: <strong>{a.status}</strong>
              </p>
              <p>
                Score: <strong>{a.score ?? '-'}</strong>
              </p>
              <button className="button button-secondary" style={{ marginTop: '10px' }} onClick={refresh}>
                Refresh
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Assignments;
