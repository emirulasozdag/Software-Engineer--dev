import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { assignmentsService } from '@/services/api/assignments.service';

const CreateAssignment: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'homework' as 'homework' | 'test' | 'activity',
    dueDate: '',
    studentUserIdsCsv: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const due = formData.dueDate ? new Date(`${formData.dueDate}T00:00:00.000Z`).toISOString() : new Date().toISOString();
      const ids = formData.studentUserIdsCsv
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)
        .map((x) => Number(x))
        .filter((n) => Number.isFinite(n) && n > 0);

      await assignmentsService.createAssignment({
        title: formData.title,
        description: formData.description,
        dueDate: due,
        assignmentType: formData.type,
        studentUserIds: ids,
      });
      alert('Assignment created successfully!');
      navigate('/teacher/dashboard');
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? e?.message ?? 'Failed to create assignment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <Link to="/teacher/dashboard" style={{ marginBottom: '20px', display: 'inline-block' }}>
        ← Back to Dashboard
      </Link>
      
      <h1 className="page-title">Create Assignment</h1>
      
      <div className="card">
        {error && (
          <div style={{ borderLeft: '4px solid #e74c3c', paddingLeft: '10px', marginBottom: '15px' }}>
            <strong>Error:</strong> {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Assignment Title</label>
            <input
              className="input"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="e.g., Grammar Exercise: Present Perfect"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="input"
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              placeholder="Provide detailed instructions for the assignment..."
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assignment Type</label>
            <select
              className="input"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            >
              <option value="homework">Homework</option>
              <option value="test">Test</option>
              <option value="activity">Activity</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input
              className="input"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assign To</label>
            <input
              className="input"
              type="text"
              value={formData.studentUserIdsCsv}
              onChange={(e) => setFormData({ ...formData, studentUserIdsCsv: e.target.value })}
              placeholder="Student user IDs (comma separated), e.g. 12, 15, 22"
            />
            <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '5px' }}>
              Tip: IDs are <strong>User</strong> IDs (from Admin → User Management).
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button className="button button-primary" type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Assignment'}
            </button>
            <button 
              className="button button-secondary" 
              type="button"
              onClick={() => navigate('/teacher/dashboard')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssignment;
