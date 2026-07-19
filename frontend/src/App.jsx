import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Feature Views
import AttendanceView from './features/attendance/AttendanceView';
import CollectFeesView from './features/fees/CollectFeesView';
import AcademicsView from './features/academics/AcademicsView';
import TransportView from './features/transport/TransportView';
import ReportsView from './features/reports/ReportsView';
import AdminUserManagementView from './features/admin/AdminUserManagementView';
import AdminSettingsView from './features/admin/AdminSettingsView';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/unauthorized"
        element={
          <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 p-4">
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
                Back to Login
              </a>
            </div>
          </div>
        }
      />

      {/* Dynamic RBAC Shell */}
      <Route element={<ProtectedRoute allowedRoles={['*']} />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<SuperAdminDashboard />} />

          {/* Admin Feature Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<SuperAdminDashboard />} />
            <Route path="/admin/users" element={<AdminUserManagementView />} />
            <Route path="/admin/staff" element={<AdminUserManagementView />} />
            <Route path="/admin/settings" element={<AdminSettingsView />} />
            <Route path="/settings" element={<AdminSettingsView />} />
            <Route path="/settings/users" element={<AdminUserManagementView />} />
          </Route>

          {/* Teacher Feature Routes */}
          <Route element={<ProtectedRoute allowedRoles={['teacher', 'admin']} />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/attendance" element={<AttendanceView />} />
            <Route path="/teacher/academics" element={<AcademicsView />} />
            <Route path="/teacher/timetable" element={<AcademicsView />} />
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="/attendance/student" element={<AttendanceView />} />
          </Route>

          {/* Student Feature Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student', 'admin']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard activeTab="home" />} />
            <Route path="/student/timetable" element={<AcademicsView />} />
            <Route path="/student/academics" element={<StudentDashboard activeTab="report" />} />
            <Route path="/student/transport" element={<TransportView />} />
            <Route path="/student-dashboard" element={<StudentDashboard activeTab="home" />} />
          </Route>

          {/* Fees Collector Feature Routes */}
          <Route element={<ProtectedRoute allowedRoles={['fees_collector', 'admin']} />}>
            <Route path="/fees/collect" element={<CollectFeesView />} />
            <Route path="/fees/receipts" element={<CollectFeesView />} />
          </Route>

          {/* Accountant Feature Routes */}
          <Route element={<ProtectedRoute allowedRoles={['accountant', 'admin']} />}>
            <Route path="/accountant/overview" element={<ReportsView />} />
            <Route path="/accountant/reports" element={<ReportsView />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
