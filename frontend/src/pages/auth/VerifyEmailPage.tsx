import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '@/services/api';

const VerifyEmailPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        const response = await authService.verifyEmail(token);
        setStatus('success');
        setMessage(response.message || 'Email verified successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Email verification failed. The link may have expired.');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h1 className="page-title">Email Verification</h1>
        
        {status === 'verifying' && (
          <div className="loading">
            <p>Verifying your email...</p>
          </div>
        )}
        
        {status === 'success' && (
          <div>
            <p style={{ color: '#27ae60', fontSize: '1.2rem', marginBottom: '20px' }}>✓ {message}</p>
            <p>Redirecting to login page...</p>
          </div>
        )}
        
        {status === 'error' && (
          <div>
            <p className="error-message" style={{ fontSize: '1.2rem', marginBottom: '20px' }}>✗ {message}</p>
            <Link to="/login" className="button button-primary">Go to Login</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
