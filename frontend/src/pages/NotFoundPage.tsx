import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const NotFoundPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="center-page">
      <div className="card center-card">
        <div className="big-code">404</div>
        <h2 className="page-title">Page Not Found</h2>
        <p className="subtitle" style={{ marginTop: 12 }}>
          The page you are looking for doesn't exist or has been moved.
        </p>
        {user ? (
          <Link to={`/${user.role}/dashboard`}>
            <button className="button button-primary" style={{ marginTop: 16 }}>
              Go to Dashboard
            </button>
          </Link>
        ) : (
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

export default NotFoundPage;
