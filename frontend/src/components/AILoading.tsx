import React from 'react';

interface AILoadingProps {
  message?: string;
}

const AILoading: React.FC<AILoadingProps> = ({ message = 'Our AI is working...' }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '40px 60px',
          borderRadius: '12px',
          textAlign: 'center',
          maxWidth: '400px',
          width: '90%',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        }}
      >
        {/* Animated spinner */}
        <div
          style={{
            width: '60px',
            height: '60px',
            margin: '0 auto 20px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        
        {/* Message */}
        <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50', fontSize: '1.3rem' }}>
          {message}
        </h3>
        
        {/* Subtitle */}
        <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.95rem' }}>
          This may take up to a minute...
        </p>

        {/* CSS animation */}
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default AILoading;
