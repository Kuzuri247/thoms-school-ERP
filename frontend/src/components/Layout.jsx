import React, { useState } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import {
  LogOut,
  LayoutDashboard,
  Users,
  CreditCard,
  Menu,
  X,
  Award,
  BookOpen,
  CalendarCheck,
  Calendar,
  BookText,
  Clock,
  GraduationCap,
  Sparkles,
  Building2,
  Megaphone,
  Send,
  Settings,
  Bus,
  FileSpreadsheet,
  Download,
  FileCheck,
  Bell,
  Plus,
  Check,
  Trash2,
  AlertCircle
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import {
  isSuperAdmin as checkIsSuperAdmin,
  isAdmin as checkIsAdmin,
  isTeacher as checkIsTeacher,
  isStudent as checkIsStudent,
  isCashier as checkIsCashier,
  getRoleHomePath,
  getRoleBadgeStyle,
  normalizeRole
} from '../utils/roleUtils';

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Mid-Term Exam Evaluation Pending',
    category: 'Exam Alert',
    time: '10 mins ago',
    unread: true,
    type: 'warning'
  },
  {
    id: 2,
    title: 'Collect Transport Fee Dues - Class 10',
    category: 'Fee Reminder',
    time: '1 hour ago',
    unread: true,
    type: 'fee'
  },
  {
    id: 3,
    title: 'Staff Faculty Meeting at 3:00 PM',
    category: 'Meeting',
    time: '3 hours ago',
    unread: false,
    type: 'general'
  }
];

const Layout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Notification & Reminder States
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderCategory, setReminderCategory] = useState('General');
  const [reminderTime, setReminderTime] = useState('');

  if (!user || !normalizeRole(user.role)) {
    return null;
  }

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const handleDismissNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleCreateReminderSubmit = (e) => {
    e.preventDefault();
    if (!reminderTitle.trim()) return;

    const newReminder = {
      id: Date.now(),
      title: reminderTitle,
      category: reminderCategory,
      time: reminderTime || 'Just Now',
      unread: true,
      type: 'reminder'
    };

    setNotifications([newReminder, ...notifications]);
    setShowReminderModal(false);
    setReminderTitle('');
    setReminderTime('');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  const navLinkClass = (path) => `
    flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200
    ${
      isActive(path)
        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 translate-x-0.5'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
    }
  `;

  const roleHomePath = () => getRoleHomePath(user);

  const isSuperAdmin = checkIsSuperAdmin(user);
  const isAdmin = checkIsAdmin(user) && !isSuperAdmin; // Exclusively admin for section rendering if needed, or checkIsAdmin
  const isTeacher = checkIsTeacher(user);
  const isStudent = checkIsStudent(user);
  const isCashier = checkIsCashier(user);

  return (
    <div className="min-h-screen bg-slate-50/80 flex flex-col font-sans">
      {/* Dynamic Glassmorphic Top Bar */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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

          <div className="flex items-center gap-3">
            {/* Header Notification & Reminder Bell Button */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                className="w-9 h-9 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl border border-slate-200/80 flex items-center justify-center transition-all duration-200 relative cursor-pointer"
                title="Notifications & Reminders"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-black text-[9px] rounded-full flex items-center justify-center shadow-xs animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Menu */}
              {showNotificationDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 p-4 space-y-3 animate-in fade-in zoom-in-95">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        Reminders & Alerts
                      </span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-extrabold text-[10px] rounded-full">
                          {unreadCount} New
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[10px] text-indigo-600 hover:underline font-extrabold"
                        >
                          Mark All Read
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setShowNotificationDropdown(false);
                          setShowReminderModal(true);
                        }}
                        className="px-2.5 py-1 bg-indigo-600 text-white font-bold text-[10px] rounded-lg hover:bg-indigo-700 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Set Reminder
                      </button>
                    </div>
                  </div>

                  {/* Notification Items List */}
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 space-y-1">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-2xl transition flex items-start justify-between gap-2 ${
                            n.unread ? 'bg-indigo-50/50 font-bold' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${n.type === 'fee' ? 'bg-amber-500' : n.type === 'warning' ? 'bg-rose-500' : 'bg-indigo-500'}`} />
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                {n.category}
                              </span>
                              <span className="text-[10px] text-slate-400 font-normal">• {n.time}</span>
                            </div>
                            <h4 className="text-xs text-slate-900 leading-tight">{n.title}</h4>
                          </div>

                          <button
                            onClick={() => handleDismissNotification(n.id)}
                            className="p-1 text-slate-300 hover:text-slate-600 rounded transition"
                            title="Dismiss"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-xs text-slate-400 font-medium">
                        No active notifications or reminders.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link
              to={`/profile/${user.id}`}
              className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-200/80 hover:opacity-85 transition cursor-pointer group"
              title="View My Profile"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-50 to-violet-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-sm shadow-xs group-hover:scale-105 transition-transform">
                {(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-extrabold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                  {user.full_name || user.email?.split('@')[0]}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span
                    className={`inline-block border text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${getRoleBadgeStyle(
                      user.role
                    )}`}
                  >
                    {user.role ? user.role.replace('_', ' ') : 'User'}
                  </span>
                </div>
              </div>
            </Link>

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

      {/* --- MODAL: SET NEW CUSTOM REMINDER --- */}
      {showReminderModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600" /> Set Quick Reminder / Alert
              </h3>
              <button onClick={() => setShowReminderModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReminderSubmit} className="space-y-3 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1">Reminder Title / Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Conduct Class 10 Physics Practical Test"
                  value={reminderTitle}
                  onChange={(e) => setReminderTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1">Category</label>
                  <select
                    value={reminderCategory}
                    onChange={(e) => setReminderCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                  >
                    <option value="Fee Reminder">Fee Reminder</option>
                    <option value="Exam Alert">Exam Alert</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Homework">Homework</option>
                    <option value="General">General Note</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Due Schedule</label>
                  <input
                    type="text"
                    placeholder="e.g. Today at 4:00 PM"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReminderModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

            {/* Dashboard Overview - ALWAYS FIRST OPTION */}
            <Link to={roleHomePath()} className={navLinkClass(roleHomePath())}>
              <LayoutDashboard className="w-4 h-4" /> Dashboard Overview
            </Link>

            <Link to="/academic/calendar" className={navLinkClass('/academic/calendar')}>
              <Calendar className="w-4 h-4" /> Academic Calendar
            </Link>

            <Link to="/academic/homework" className={navLinkClass('/academic/homework')}>
              <BookText className="w-4 h-4" /> Homework Management
            </Link>

            <Link to="/academic/examinations" className={navLinkClass('/academic/examinations')}>
              <Award className="w-4 h-4" /> Examination & Report Cards
            </Link>

            <Link to="/communication/center" className={navLinkClass('/communication/center')}>
              <Send className="w-4 h-4" /> Communication Desk
            </Link>

            <Link to="/transport/management" className={navLinkClass('/transport/management')}>
              <Bus className="w-4 h-4" /> Transport & Bus Fleet
            </Link>

            <Link to="/students/directory" className={navLinkClass('/students/directory')}>
              <Users className="w-4 h-4" /> Student 360° Directory
            </Link>

            <Link to="/academic/downloads" className={navLinkClass('/academic/downloads')}>
              <Download className="w-4 h-4" /> Download Center & Materials
            </Link>

            <Link to="/academic/certificates" className={navLinkClass('/academic/certificates')}>
              <FileCheck className="w-4 h-4" /> Certificates & TC Desk
            </Link>

            {/* Admin & Super Admin Exclusive Links */}
            {(isSuperAdmin || isAdmin) && (
              <>
                <Link to="/admin/dashboard" className={navLinkClass('/admin/dashboard')}>
                  <LayoutDashboard className="w-4 h-4" /> Administrative Portal
                </Link>
                <Link to="/admin/users" className={navLinkClass('/admin/users')}>
                  <Users className="w-4 h-4" /> Staff & User Directory
                </Link>
                <Link to="/admin/classes" className={navLinkClass('/admin/classes')}>
                  <Building2 className="w-4 h-4" /> Standards & Student Directory
                </Link>
                <Link to="/admin/notices" className={navLinkClass('/admin/notices')}>
                  <Megaphone className="w-4 h-4" /> Notice Board
                </Link>
                <Link to="/finance/dashboard" className={navLinkClass('/finance/dashboard')}>
                  <CreditCard className="w-4 h-4" /> Fees Desk Overview
                </Link>
                <Link to="/finance/reports" className={navLinkClass('/finance/reports')}>
                  <FileSpreadsheet className="w-4 h-4" /> Financial Audits & Reports
                </Link>
                <Link to="/admin/settings" className={navLinkClass('/admin/settings')}>
                  <Settings className="w-4 h-4" /> System Settings
                </Link>
              </>
            )}

            {/* Teacher Exclusive Suite (Visible ONLY to Teachers) */}
            {isTeacher && (
              <>
                <div className="mt-3 px-3 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Teacher Suite
                </div>
                <Link to="/teacher/dashboard" className={navLinkClass('/teacher/dashboard')}>
                  <LayoutDashboard className="w-4 h-4" /> Class Workstation
                </Link>
                <Link to="/teacher/attendance" className={navLinkClass('/teacher/attendance')}>
                  <CalendarCheck className="w-4 h-4" /> Attendance Register
                </Link>
                <Link to="/teacher/academics" className={navLinkClass('/teacher/academics')}>
                  <Award className="w-4 h-4" /> Marks & Grading
                </Link>
                <Link to="/teacher/timetable" className={navLinkClass('/teacher/timetable')}>
                  <Clock className="w-4 h-4" /> Class Schedule
                </Link>
                <Link to="/teacher/homework" className={navLinkClass('/teacher/homework')}>
                  <BookText className="w-4 h-4" /> Homework
                </Link>
              </>
            )}

            {/* Student Exclusive Portal (Visible ONLY to Students) */}
            {isStudent && (
              <>
                <div className="mt-3 px-3 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Student Portal
                </div>
                <Link to="/student/dashboard" className={navLinkClass('/student/dashboard')}>
                  <LayoutDashboard className="w-4 h-4" /> Personal Dashboard
                </Link>
                <Link to="/student/work" className={navLinkClass('/student/work')}>
                  <BookText className="w-4 h-4" /> My Work
                </Link>
                <Link to="/student/timetable" className={navLinkClass('/student/timetable')}>
                  <Clock className="w-4 h-4" /> My Timetable
                </Link>
                <Link to="/student/fees" className={navLinkClass('/student/fees')}>
                  <CreditCard className="w-4 h-4" /> Fee Account
                </Link>
              </>
            )}

            {/* Cashier Exclusive Links (Visible ONLY to Cashiers) */}
            {isCashier && (
              <>
                <div className="mt-3 px-3 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Finance & Fees Desk
                </div>
                <Link to="/finance/dashboard" className={navLinkClass('/finance/dashboard')}>
                  <CreditCard className="w-4 h-4" /> Fees Terminal
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
