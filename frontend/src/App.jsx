import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Navbar from './components/Navbar';

// Public Auth Views
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Views
import Dashboard from './pages/Dashboard';
import StudentProfile from './pages/StudentProfile';
import JobDetails from './pages/JobDetails';
import SkillGapAnalysis from './pages/SkillGapAnalysis';
import Recommendations from './pages/Recommendations';

function StudentLayout({ children }) {
  return (
    <div style={styles.appContainer}>
      <Navbar />
      <main style={styles.mainContent}>{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            }
          />
          <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Student & Authenticated Core Views */}
          <Route
            path="/student-profile"
            element={
              <ProtectedRoute>
                <StudentLayout>
                  <StudentProfile />
                </StudentLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/profile" element={<Navigate to="/student-profile" replace />} />

          <Route
            path="/job-details"
            element={
              <ProtectedRoute>
                <StudentLayout>
                  <JobDetails />
                </StudentLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/jobs" element={<Navigate to="/job-details" replace />} />

          <Route
            path="/skill-gap-analysis"
            element={
              <ProtectedRoute>
                <StudentLayout>
                  <SkillGapAnalysis />
                </StudentLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/analysis" element={<Navigate to="/skill-gap-analysis" replace />} />

          <Route
            path="/recommendations"
            element={
              <ProtectedRoute>
                <StudentLayout>
                  <Recommendations />
                </StudentLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

const styles = {
  appContainer: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f7',
    color: '#1d1d1f',
    display: 'flex',
    flexDirection: 'column',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", sans-serif',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
};
