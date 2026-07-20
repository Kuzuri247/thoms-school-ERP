import React, { useState } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import {
  LogOut,
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  BookOpen,
  CalendarCheck,
  CreditCard,
  FileSpreadsheet,
  Bus,
  Menu,
  X,
  Award,
  Receipt,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const Layout = () => {
  const { user, logout, hasRole } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname.startsWith(path);

  const navLinkClass = (path) => `
    flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200
    ${
      isActive(path)
        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 translate-x-0.5'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
    }
  `;

  const getRoleBadgeColor = (role = '') => {
    const norm = role.toLowerCase().replace(/\s+/g, '_');
    switch (norm) {
      case 'super_admin':
      case 'admin':
        return 'bg-purple-50 text-purple-700 border-purple-200/80';
      case 'teacher':
      case 'teachers':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'student':
      case 'students':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'fees_collector':
        return 'bg-blue-50 text-blue-700 border-blue-200/80';
      case 'accountant':
        return 'bg-teal-50 text-teal-700 border-teal-200/80';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const roleHomePath = () => {
    if (hasRole(['admin'])) return '/admin/dashboard';
    if (hasRole(['teacher'])) return '/teacher/dashboard';
    if (hasRole(['student'])) return '/student/dashboard';
    if (hasRole(['fees_collector'])) return '/fees/collect';
    if (hasRole(['accountant'])) return '/accountant/overview';
    return '/dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-50/80 flex flex-col font-sans">
      {/* Dynamic Glassmorphic Top Bar */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to={roleHomePath()} className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-base font-extrabold text-slate-900 tracking-tight block leading-none group-hover:text-indigo-600 transition-colors">
                  Thomson ERP
                </span>
                <span className="text-[10px] text-slate-500 font-semibold tracking-wide">
                  School Management System
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-200/80">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-50 to-violet-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-sm shadow-xs">
                {(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-extrabold text-slate-900 leading-tight">
                  {user.full_name || user.email?.split('@')[0]}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span
                    className={`inline-block border text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    {user.role ? user.role.replace('_', ' ') : 'User'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-9 h-9 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100 flex items-center justify-center transition-all duration-200"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        {/* Mobile menu backdrop */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 md:hidden"
          />
        )}

        {/* Navigation Sidebar */}
        <aside
          className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 p-4 transform transition-transform duration-300 ease-out md:sticky md:top-24 md:h-[calc(100vh-7rem)] md:translate-x-0 md:border-r-0 md:bg-transparent md:p-0 md:w-60 flex-shrink-0
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        >
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs flex flex-col gap-1 h-full overflow-y-auto custom-scrollbar">
            <div className="px-3 py-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center justify-between">
              <span>Main Portal</span>
              <Sparkles className="w-3 h-3 text-indigo-500" />
            </div>

            {/* Admin Links */}
            {hasRole(['admin']) && (
              <>
                <Link to="/admin/dashboard" className={navLinkClass('/admin/dashboard')}>
                  <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                </Link>
                <Link to="/admin/users" className={navLinkClass('/admin/users')}>
                  <Users className="w-4 h-4" /> User Management
                </Link>
                <Link to="/admin/staff" className={navLinkClass('/admin/staff')}>
                  <Shield className="w-4 h-4" /> Staff Assignments
                </Link>
                <Link to="/admin/settings" className={navLinkClass('/admin/settings')}>
                  <Settings className="w-4 h-4" /> System Settings
                </Link>
              </>
            )}

            {/* Teacher Links */}
            {hasRole(['teacher', 'admin']) && (
              <>
                <div className="mt-3 px-3 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Teacher Suite
                </div>
                <Link to="/teacher/dashboard" className={navLinkClass('/teacher/dashboard')}>
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                {hasRole(['teacher']) && (
                  <>
                    <Link to="/teacher/attendance" className={navLinkClass('/teacher/attendance')}>
                      <CalendarCheck className="w-4 h-4" /> Attendance Register
                    </Link>
                    <Link to="/teacher/academics" className={navLinkClass('/teacher/academics')}>
                      <Award className="w-4 h-4" /> Marks & Grading
                    </Link>
                    <Link to="/teacher/timetable" className={navLinkClass('/teacher/timetable')}>
                      <BookOpen className="w-4 h-4" /> Class Schedule
                    </Link>
                  </>
                )}
              </>
            )}

            {/* Student Links */}
            {hasRole(['student', 'admin']) && (
              <>
                <div className="mt-3 px-3 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Student Portal
                </div>
                <Link to="/student/dashboard" className={navLinkClass('/student/dashboard')}>
                  <LayoutDashboard className="w-4 h-4" /> Personal Dashboard
                </Link>
                {hasRole(['student']) && (
                  <>
                    <Link to="/student/timetable" className={navLinkClass('/student/timetable')}>
                      <BookOpen className="w-4 h-4" /> My Schedule
                    </Link>
                    <Link to="/student/academics" className={navLinkClass('/student/academics')}>
                      <Award className="w-4 h-4" /> My Report Card
                    </Link>
                    <Link to="/student/transport" className={navLinkClass('/student/transport')}>
                      <Bus className="w-4 h-4" /> Transport Tracking
                    </Link>
                  </>
                )}
              </>
            )}

            {/* Finance & Accounts Links */}
            {hasRole(['fees_collector', 'accountant', 'admin']) && (
              <>
                <div className="mt-3 px-3 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Finance & Accounts
                </div>
                <Link to="/finance/dashboard" className={navLinkClass('/finance/dashboard')}>
                  <CreditCard className="w-4 h-4" /> Finance Dashboard
                </Link>
              </>
            )}
          </div>
        </aside>

        {/* Dynamic Route Content */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs min-h-[550px] animate-in fade-in duration-200">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
