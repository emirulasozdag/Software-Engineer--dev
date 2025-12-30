import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Achievement } from '@/types/rewards.types';

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({ achievement, onClose }) => {
  const navigate = useNavigate();

  const handleGoToProgress = () => {
    onClose();
    navigate('/student/progress');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        padding: '20px',
        maxWidth: '320px',
        zIndex: 9999,
        animation: 'slideInRight 0.3s ease-out',
      }}
    >
      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
          }
        `}
      </style>
      
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'none',
          border: 'none',
          fontSize: '20px',
          cursor: 'pointer',
          color: '#666',
          padding: '0',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Close"
      >
        ×
      </button>

      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <div
          style={{
            fontSize: '60px',
            animation: 'pulse 0.5s ease-in-out 2',
            marginBottom: '10px',
          }}
        >
          {achievement.badge_icon || '🏆'}
        </div>
        <h3 style={{ margin: '0 0 5px 0', color: '#2ecc71', fontSize: '18px' }}>
          Achievement Unlocked!
        </h3>
        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>
          {achievement.name}
        </div>
        {achievement.description && (
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
            {achievement.description}
          </div>
        )}
        <div style={{ fontSize: '14px', color: '#3498db', fontWeight: 'bold' }}>
          +{achievement.points} points
        </div>
      </div>

      <button
        onClick={handleGoToProgress}
        className="button button-primary"
        style={{
          width: '100%',
          padding: '10px',
          fontSize: '14px',
        }}
      >
        Go to My Progress
      </button>
    </div>
  );
};

interface AchievementNotificationContainerProps {
  achievements: Achievement[];
  onClose: () => void;
}

export const AchievementNotificationContainer: React.FC<AchievementNotificationContainerProps> = ({
  achievements,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (currentIndex >= achievements.length) {
      onClose();
      return;
    }

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 5000); // Show each achievement for 5 seconds

    return () => clearTimeout(timer);
  }, [currentIndex, achievements.length, onClose]);

  if (currentIndex >= achievements.length || achievements.length === 0) {
    return null;
  }

  const handleClose = () => {
    if (currentIndex < achievements.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  return <AchievementNotification achievement={achievements[currentIndex]} onClose={handleClose} />;
};
