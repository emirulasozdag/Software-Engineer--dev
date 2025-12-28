import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const UnauthorizedPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="center-page">
      <div className="card center-card">
        <div className="big-code danger">403</div>
        <h2 className="page-title">Unauthorized Access</h2>
        <p className="subtitle" style={{ marginTop: 12 }}>
          You don't have permission to access this page.
        </p>
        {user && (
          <Link to={`/${user.role}/dashboard`}>
            <button className="button button-primary" style={{ marginTop: 16 }}>
              Go to Dashboard
            </button>
          </Link>
        )}
        {!user && (
          <Link to="/login">
            <button className="button button-primary" style={{ marginTop: 16 }}>
              Go to Login
            </button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default UnauthorizedPage;
