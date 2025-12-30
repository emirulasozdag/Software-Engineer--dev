import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { assignmentsService, type BackendStudentAssignmentOut } from '@/services/api/assignments.service';

const Assignments: React.FC = () => {
  const navigate = useNavigate();
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

  const handleAssignmentClick = (assignment: BackendStudentAssignmentOut) => {
    if (assignment.status === 'PENDING') {
      // Navigate to take assignment
      navigate(`/student/assignment/${assignment.studentAssignmentId}`);
    } else {
      // Navigate to view results
      navigate(`/student/assignment/${assignment.studentAssignmentId}/results`);
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
            <div
              key={a.studentAssignmentId}
              className="card"
              style={{ background: '#fff3cd', borderLeft: '4px solid #ffc107', cursor: 'pointer' }}
              onClick={() => handleAssignmentClick(a)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 10px 0' }}>
                    {a.assignment?.title ?? `Assignment #${a.assignmentId}`}
                    <span style={{
                      marginLeft: '10px',
                      fontSize: '0.8rem',
                      padding: '3px 8px',
                      background: a.assignment?.contentType === 'TEST' ? '#3498db' : '#95a5a6',
                      color: 'white',
                      borderRadius: '4px'
                    }}>
                      {a.assignment?.contentType === 'TEST' ? '📝 TEST' : '📄 TEXT'}
                    </span>
                  </h3>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Due:</strong> {a.assignment?.dueDate ? new Date(a.assignment.dueDate).toLocaleDateString() : '-'}
                  </p>
                  {a.assignment?.description && (
                    <p style={{ margin: '5px 0', color: '#666', fontSize: '0.9rem' }}>{a.assignment.description}</p>
                  )}
                </div>
                <button
                  className="button button-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAssignmentClick(a);
                  }}
                >
                  {a.assignment?.contentType === 'TEST' ? 'Take Test' : 'View'}
                </button>
              </div>
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
            <div
              key={a.studentAssignmentId}
              className="card"
              style={{ background: '#d4edda', borderLeft: '4px solid #28a745', cursor: 'pointer' }}
              onClick={() => handleAssignmentClick(a)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 10px 0' }}>
                    {a.assignment?.title ?? `Assignment #${a.assignmentId}`}
                    <span style={{
                      marginLeft: '10px',
                      fontSize: '0.8rem',
                      padding: '3px 8px',
                      background: a.assignment?.contentType === 'TEST' ? '#3498db' : '#95a5a6',
                      color: 'white',
                      borderRadius: '4px'
                    }}>
                      {a.assignment?.contentType === 'TEST' ? '📝 TEST' : '📄 TEXT'}
                    </span>
                  </h3>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Submitted:</strong> {a.submittedAt ? new Date(a.submittedAt).toLocaleString() : '-'}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Status:</strong> {a.status}
                  </p>
                  {a.score !== null && a.score !== undefined && (
                    <p style={{ margin: '5px 0' }}>
                      <strong>Score:</strong> <span style={{ fontSize: '1.2rem', color: '#27ae60' }}>{a.score}/100</span>
                    </p>
                  )}
                </div>
                <button
                  className="button button-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAssignmentClick(a);
                  }}
                >
                  View Results
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Assignments;
