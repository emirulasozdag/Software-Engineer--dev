import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface MaintenanceInfo {
  message: string;
  announcement?: string;
  reason?: string;
}

const MaintenancePage: React.FC = () => {
  const navigate = useNavigate();
  const [maintenanceInfo, setMaintenanceInfo] = useState<MaintenanceInfo | null>(null);

  useEffect(() => {
    const info = localStorage.getItem('maintenance_mode');
    if (info) {
      try {
        setMaintenanceInfo(JSON.parse(info));
      } catch {
        setMaintenanceInfo({
          message: 'System is under maintenance',
          announcement: 'The system is currently under maintenance. Please try again later.',
        });
      }
    } else {
      // No maintenance info, redirect to home
      navigate('/');
    }
  }, [navigate]);

  const handleRetry = () => {
    localStorage.removeItem('maintenance_mode');
    navigate('/');
  };

  return (
    <div className="container" style={{ maxWidth: 600, marginTop: '10vh' }}>
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🔧</div>
        <h1 style={{ fontSize: 32, marginBottom: 16, color: '#1e293b' }}>
          {maintenanceInfo?.message || 'System Maintenance'}
        </h1>
        
        {maintenanceInfo?.announcement && (
          <div
            style={{
              background: '#fef3c7',
              border: '1px solid #fbbf24',
              borderRadius: 12,
              padding: 20,
              marginBottom: 20,
              textAlign: 'left',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 8, color: '#92400e' }}>
              📢 Announcement
            </div>
            <div style={{ color: '#78350f', fontSize: 15, lineHeight: 1.6 }}>
              {maintenanceInfo.announcement}
            </div>
          </div>
        )}

        {maintenanceInfo?.reason && (
          <div
            style={{
              background: '#f1f5f9',
              borderRadius: 8,
              padding: 16,
              marginBottom: 20,
              textAlign: 'left',
              fontSize: 14,
            }}
          >
            <strong>Reason:</strong> {maintenanceInfo.reason}
          </div>
        )}

        <p style={{ color: '#64748b', marginBottom: 24, fontSize: 16 }}>
          We apologize for the inconvenience. Our team is working to get the system back online as
          soon as possible.
        </p>

        <button
          className="button button-primary"
          onClick={handleRetry}
          style={{ minWidth: 200 }}
        >
          Check Again
        </button>

        <div style={{ marginTop: 20, fontSize: 14, color: '#94a3b8' }}>
          If you continue to see this message after maintenance is complete, please refresh your
          browser.
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
