import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const NotFoundPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: '500px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', color: '#3498db' }}>404</h1>
        <h2 className="page-title">Page Not Found</h2>
        <p style={{ marginTop: '20px', color: '#666' }}>
          The page you are looking for doesn't exist or has been moved.
        </p>
        {user ? (
          <Link to={`/${user.role}/dashboard`}>
            <button className="button button-primary" style={{ marginTop: '20px' }}>
              Go to Dashboard
            </button>
          </Link>
        ) : (
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

export default NotFoundPage;
