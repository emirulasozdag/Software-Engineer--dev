import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const UnauthorizedPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: '500px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', color: '#e74c3c' }}>403</h1>
        <h2 className="page-title">Unauthorized Access</h2>
        <p style={{ marginTop: '20px', color: '#666' }}>
          You don't have permission to access this page.
        </p>
        {user && (
          <Link to={`/${user.role}/dashboard`}>
            <button className="button button-primary" style={{ marginTop: '20px' }}>
              Go to Dashboard
            </button>
          </Link>
        )}
        {!user && (
          <Link to="/login">
            <button className="button button-primary" style={{ marginTop: '20px' }}>
              Go to Login
            </button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default UnauthorizedPage;
