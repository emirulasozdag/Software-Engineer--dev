import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const CreateAssignment: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'homework' as 'homework' | 'test' | 'activity',
    dueDate: '',
    students: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // API call will be implemented later
    console.log('Creating assignment:', formData);
    alert('Assignment created successfully!');
    navigate('/teacher/dashboard');
  };

  return (
    <div className="container">
      <Link to="/teacher/dashboard" style={{ marginBottom: '20px', display: 'inline-block' }}>
        ← Back to Dashboard
      </Link>
      
      <h1 className="page-title">Create Assignment</h1>
      
      <div className="card">
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
            <select
              className="input"
              multiple
              size={5}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                setFormData({ ...formData, students: selected });
              }}
            >
              <option value="1">John Doe</option>
              <option value="2">Sarah Smith</option>
              <option value="3">Mike Johnson</option>
              <option value="all">All Students</option>
            </select>
            <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '5px' }}>
              Hold Ctrl/Cmd to select multiple students
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button className="button button-primary" type="submit">
              Create Assignment
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
