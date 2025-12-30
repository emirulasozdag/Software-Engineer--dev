import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

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

          {/* Student routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/placement-test" element={<PlacementTest />} />
            <Route path="/student/learning-plan" element={<LearningPlan />} />
            <Route path="/student/ai-content-delivery" element={<AIContentDelivery />} />
            <Route path="/student/content/history" element={<ContentHistory />} />
            <Route path="/student/content/:contentId" element={<ContentViewer />} />
            <Route path="/student/progress" element={<Progress />} />
            <Route path="/student/assignments" element={<Assignments />} />
            <Route path="/student/chatbot" element={<Chatbot />} />
            <Route path="/student/messages" element={<Messages />} />
          </Route>

          {/* Teacher routes */}
          <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/students" element={<StudentList />} />
            <Route path="/teacher/students/:studentId" element={<StudentDetails />} />
            <Route path="/teacher/assignments/create" element={<CreateAssignment />} />
            <Route path="/teacher/ai-drafts" element={<AIDrafts />} />
            <Route path="/teacher/messages" element={<TeacherMessages />} />
          </Route>

          {/* Admin routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/stats" element={<SystemStats />} />
            <Route path="/admin/feedback" element={<FeedbackManagement />} />
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
