import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { communicationService, teacherService } from '@/services/api';

const TeacherDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [studentCount, setStudentCount] = useState<number | null>(null);
  const [unread, setUnread] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [students, msgs] = await Promise.all([
        teacherService.getMyStudents().catch(() => []),
        communicationService.getMessages().catch(() => []),
      ]);
      setStudentCount(students.length);
      const myId = user?.id;
      const unreadCount = myId ? msgs.filter((m: any) => m.receiverId === myId && !m.isRead).length : 0;
      setUnread(unreadCount);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container">
      <div className="card dash-hero">
        <div className="hero-row">
          <div>
            <h1 className="hero-title">Welcome, {user?.name}</h1>
            <div className="hero-sub">
              Öğrenci sonuçlarını (UC6), mesajları (UC18) ve ödevleri tek yerden yönet.
            </div>
            <div className="action-meta" style={{ marginTop: 12 }}>
              <span className="pill">Email: {user?.email}</span>
              <span className="pill">Role: {user?.role}</span>
              <span className="pill">Students: {loading ? '…' : (studentCount ?? 0)}</span>
              <span className="pill">Unread: {loading ? '…' : unread}</span>
            </div>
          </div>
          <div className="hero-actions">
            <button className="button button-secondary" onClick={load} disabled={loading}>
              {loading ? 'Loading…' : 'Refresh'}
            </button>
            <button className="button button-primary" onClick={logout}>Logout</button>
          </div>
        </div>
      </div>

      <div className="dash-grid">
        <Link to="/teacher/students" style={{ textDecoration: 'none' }} className="col-6">
          <div className="card click-card action-card">
            <span className="action-icon green">ST</span>
            <div>
              <h3 className="action-title">My Students (UC6)</h3>
              <div className="action-desc">Öğrenci seç, placement test sonuçlarını ve güçlü/zayıf alanları gör.</div>
              <div className="action-meta">
                <span className="pill">Results</span>
                <span className="pill">Levels</span>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/teacher/messages" style={{ textDecoration: 'none' }} className="col-6">
          <div className="card click-card action-card">
            <span className="action-icon">MS</span>
            <div>
              <h3 className="action-title">Messages & Announcements (UC18)</h3>
              <div className="action-desc">Öğrencilerle iletişim kur, duyuru yayınla.</div>
              <div className="action-meta">
                <span className="pill">Unread: {loading ? '…' : unread}</span>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/teacher/assignments/create" style={{ textDecoration: 'none' }} className="col-6">
          <div className="card click-card action-card">
            <span className="action-icon amber">HW</span>
            <div>
              <h3 className="action-title">Create Assignment</h3>
              <div className="action-desc">Ödev oluştur ve öğrencilere ata.</div>
            </div>
          </div>
        </Link>

        <div className="card col-6">
          <div className="toolbar">
            <div>
              <h2 style={{ marginBottom: 6 }}>Next Steps</h2>
              <div className="text-muted">Önerilen kısa akış</div>
            </div>
            <span className="pill">Checklist</span>
          </div>
          <div className="divider" />
          <div className="list">
            <div className="list-item" style={{ cursor: 'default' }}>
              <div style={{ fontWeight: 900 }}>1) UC6 sonuçları kontrol et</div>
              <div className="text-muted" style={{ marginTop: 6 }}>
                Placement testi tamamlamayan öğrenciye StudentDetails ekranından hatırlatma gönder (UC18).
              </div>
            </div>
            <div className="list-item" style={{ cursor: 'default' }}>
              <div style={{ fontWeight: 900 }}>2) UC7 planı gözden geçir</div>
              <div className="text-muted" style={{ marginTop: 6 }}>
                Zayıflıklara göre plan topic’leri güncellensin.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
