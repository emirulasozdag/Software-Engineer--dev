import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

import TeacherLayout from '@/layouts/TeacherLayout';
import AdminLayout from '@/layouts/AdminLayout';
import StudentLayout from '@/layouts/StudentLayout';

// Auth pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';

// Student pages
import StudentDashboard from '@/pages/student/Dashboard';
import PlacementTest from '@/pages/student/PlacementTest';
import LearningPlan from '@/pages/student/LearningPlan';
import AIContentDelivery from '@/pages/student/AIContentDelivery';
import ContentViewer from '@/pages/student/ContentViewer';
import ContentHistory from '@/pages/student/ContentHistory';
import Progress from '@/pages/student/Progress';
import Assignments from '@/pages/student/Assignments';
import Chatbot from '@/pages/student/Chatbot';
import Messages from '@/pages/student/Messages';
import StudentSystemFeedback from '@/pages/student/SystemFeedback';

// Teacher pages
import TeacherDashboard from '@/pages/teacher/Dashboard';
import StudentList from '@/pages/teacher/StudentList';
import StudentDetails from '@/pages/teacher/StudentDetails';
import CreateAssignment from '@/pages/teacher/CreateAssignment';
import AIDrafts from '@/pages/teacher/AIDrafts';
import TeacherMessages from '@/pages/teacher/Messages';

// Admin pages
import AdminDashboard from '@/pages/admin/Dashboard';
import UserManagement from '@/pages/admin/UserManagement';
import SystemStats from '@/pages/admin/SystemStats';
import FeedbackManagement from '@/pages/admin/FeedbackManagement';

// Shared pages
import UnauthorizedPage from '@/pages/UnauthorizedPage';
import NotFoundPage from '@/pages/NotFoundPage';
import MaintenancePage from '@/pages/MaintenancePage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />

          {/* Student routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="placement-test" element={<PlacementTest />} />
              <Route path="learning-plan" element={<LearningPlan />} />
              <Route path="ai-content-delivery" element={<AIContentDelivery />} />
              <Route path="content/history" element={<ContentHistory />} />
              <Route path="content/:contentId" element={<ContentViewer />} />
              <Route path="progress" element={<Progress />} />
              <Route path="assignments" element={<Assignments />} />
              <Route path="chatbot" element={<Chatbot />} />
              <Route path="messages" element={<Messages />} />
              <Route path="feedback" element={<StudentSystemFeedback />} />
            </Route>
          </Route>

          {/* Teacher routes */}
          <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
            <Route path="/teacher" element={<TeacherLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<TeacherDashboard />} />
              <Route path="students" element={<StudentList />} />
              <Route path="students/:studentId" element={<StudentDetails />} />
              <Route path="assignments/create" element={<CreateAssignment />} />
              <Route path="ai-drafts" element={<AIDrafts />} />
              <Route path="messages" element={<TeacherMessages />} />
            </Route>
          </Route>

          {/* Admin routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="stats" element={<SystemStats />} />
              <Route path="feedback" element={<FeedbackManagement />} />
            </Route>
          </Route>

          {/* Default redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
