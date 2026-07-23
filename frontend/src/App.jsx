import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SchoolLandingPage from './pages/SchoolLandingPage';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Feature Views
import FinanceDashboard from './features/fees/FinanceDashboard';
import AdminUserManagementView from './features/admin/AdminUserManagementView';
import AdminClassDirectoryView from './features/admin/AdminClassDirectoryView';
import UserProfileView from './features/users/UserProfileView';
import Noticeboard from './features/noticeboard/Noticeboard';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<SchoolLandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/unauthorized"
        element={
          <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 p-4 font-sans">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md w-full text-center space-y-4">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto font-bold text-xl">
                !
              </div>
              <h1 className="text-xl font-bold text-slate-900">Access Denied</h1>
              <p className="text-sm text-slate-500">
                You do not have permission to view this page under your current role.
              </p>
              <a
                href="/"
                className="inline-block px-4 py-2 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition"
              >
                Back to School Landing
              </a>
            </div>
          </div>
        }
      />

      {/* Dynamic RBAC Shell */}
      <Route element={<ProtectedRoute allowedRoles={['*']} />}>
        <Route element={<Layout />}>
          <Route path="/profile/:id" element={<UserProfileView />} />

          {/* Super Admin Exclusive Route */}
          <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
            <Route path="/dashboard" element={<SuperAdminDashboard />} />
          </Route>

          {/* Admin & Super Admin Management Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'super_admin']} />}>
            <Route path="/admin/dashboard" element={<SuperAdminDashboard />} />
            <Route path="/admin/users" element={<AdminUserManagementView initialTab="all" />} />
            <Route path="/admin/classes" element={<AdminClassDirectoryView />} />
            <Route path="/admin/notices" element={<Noticeboard />} />
          </Route>

          {/* Teacher Suite Routes (Strictly Teacher, Admin, Super Admin) */}
          <Route element={<ProtectedRoute allowedRoles={['teacher', 'admin', 'super_admin']} />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboard activeTab="overview" />} />
            <Route path="/teacher/attendance" element={<TeacherDashboard activeTab="attendance" />} />
            <Route path="/teacher/academics" element={<TeacherDashboard activeTab="exams" />} />
            <Route path="/teacher/timetable" element={<TeacherDashboard activeTab="timetable" />} />
            <Route path="/teacher/homework" element={<TeacherDashboard activeTab="homework" />} />
          </Route>

          {/* Student Portal Routes (Strictly Student, Admin, Super Admin) */}
          <Route element={<ProtectedRoute allowedRoles={['student', 'admin', 'super_admin']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard activeTab="home" />} />
            <Route path="/student/work" element={<StudentDashboard activeTab="work" />} />
            <Route path="/student/timetable" element={<StudentDashboard activeTab="timetable" />} />
            <Route path="/student/fees" element={<StudentDashboard activeTab="fees" />} />
          </Route>

          {/* Finance & Fees Terminal Routes */}
          <Route element={<ProtectedRoute allowedRoles={['cashier', 'admin', 'super_admin']} />}>
            <Route path="/finance/dashboard" element={<FinanceDashboard />} />
            <Route path="/fees/collect" element={<Navigate to="/finance/dashboard" replace />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
