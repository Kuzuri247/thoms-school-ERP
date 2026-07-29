import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom";
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
  AlertCircle,
  User,
} from "lucide-react";
import useAuthStore from "../store/authStore";
import {
  isSuperAdmin as checkIsSuperAdmin,
  isAdmin as checkIsAdmin,
  isTeacher as checkIsTeacher,
  isStudent as checkIsStudent,
  isCashier as checkIsCashier,
  getRoleHomePath,
  getRoleBadgeStyle,
  normalizeRole,
} from "../utils/roleUtils";

const Layout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Notification & Admin Message States
  const [notifications, setNotifications] = useState([]);
  const [readNoticeIds, setReadNoticeIds] = useState(new Set());
  const [dismissedNoticeIds, setDismissedNoticeIds] = useState(new Set());
  const [showNotificationDropdown, setShowNotificationDropdown] =
    useState(false);
  const [showAdminMsgModal, setShowAdminMsgModal] = useState(false);
  const [adminMsgSubject, setAdminMsgSubject] = useState("");
  const [adminMsgContent, setAdminMsgContent] = useState("");
  const [adminMsgSuccess, setAdminMsgSuccess] = useState("");
  const [adminMsgError, setAdminMsgError] = useState("");
  const subjectInputRef = useRef(null);

  const fetchNotices = React.useCallback(() => {
    import("../api/axios").then(({ default: api }) => {
      api
        .get("/notices")
        .then((res) => {
          if (res.data?.data && Array.isArray(res.data.data)) {
            setNotifications((prev) => {
              const prevMap = new Map(prev.map((item) => [String(item.id), item]));
              return res.data.data
                .map((n, idx) => {
                  const idStr = String(n.id || `notice-${idx}`);
                  const prevItem = prevMap.get(idStr);
                  const isReadLocally = readNoticeIds.has(idStr);
                  const isRead = isReadLocally || (n.is_read !== undefined ? Boolean(n.is_read) : (prevItem ? !prevItem.unread : idx >= 3));

                  return {
                    id: n.id || `notice-${idx}`,
                    title: n.title,
                    category:
                      n.notice_type === "exam" ? "Academic Calendar" : "Notice Board",
                    time: n.publish_date ? n.publish_date.split("T")[0] : "Recent",
                    unread: !isRead,
                    type: n.notice_type === "exam" ? "calendar" : "notice",
                  };
                })
                .filter((item) => !dismissedNoticeIds.has(String(item.id)));
            });
          }
        })
        .catch((err) => {
          console.error("Failed to fetch notices:", err);
        });
    });
  }, [readNoticeIds, dismissedNoticeIds]);

  // Fetch Live Notices on Mount or User Change
  React.useEffect(() => {
    fetchNotices();
  }, [fetchNotices, user?.id]);

  // Re-fetch Live Notices when Dropdown opens
  React.useEffect(() => {
    if (showNotificationDropdown) {
      fetchNotices();
    }
  }, [showNotificationDropdown, fetchNotices]);

  // Focus modal input and listen for Escape key
  useEffect(() => {
    if (showAdminMsgModal) {
      subjectInputRef.current?.focus();
      const handleKeyDown = (e) => {
        if (e.key === "Escape") setShowAdminMsgModal(false);
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [showAdminMsgModal]);

  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotificationDropdown(false);
      }
    };
    if (showNotificationDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotificationDropdown]);

  if (!user || !normalizeRole(user.role)) {
    return null;
  }

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllRead = () => {
    const allIds = new Set(notifications.map((n) => String(n.id)));
    setReadNoticeIds((prev) => new Set([...prev, ...allIds]));
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const handleDismissNotification = (id) => {
    setDismissedNoticeIds((prev) => new Set(prev).add(String(id)));
    setNotifications((prev) => prev.filter((n) => String(n.id) !== String(id)));
  };

  const handleNotificationClick = (n) => {
    setReadNoticeIds((prev) => new Set(prev).add(String(n.id)));
    setNotifications(
      notifications.map((item) =>
        item.id === n.id ? { ...item, unread: false } : item
      )
    );
    setShowNotificationDropdown(false);
    const targetDate = (n.time && n.time.match(/^\d{4}-\d{2}-\d{2}$/)) 
      ? n.time 
      : new Date().toISOString().split("T")[0];

    navigate("/academic/calendar", {
      state: {
        selectedDate: targetDate,
        noticeId: n.id,
        noticeTitle: n.title,
      },
    });
  };

  const handleSendAdminMessage = async (e) => {
    e.preventDefault();
    if (!adminMsgSubject.trim() || !adminMsgContent.trim()) return;
    setAdminMsgError("");

    try {
      const { default: api } = await import("../api/axios");
      const res = await api.post("/notices", {
        title: adminMsgSubject,
        content: adminMsgContent,
        notice_type: "general",
        type: "global",
        is_published: 1,
        publish_date: new Date().toISOString().split("T")[0],
      });

      if (res.data?.success) {
        fetchNotices();
        setAdminMsgSuccess(
          "Official School Notice broadcasted to all users successfully!",
        );
        setAdminMsgSubject("");
        setAdminMsgContent("");
        setShowAdminMsgModal(false);
        setTimeout(() => setAdminMsgSuccess(""), 4000);
      } else {
        setAdminMsgError(res.data?.message || "Failed to broadcast notice.");
      }
    } catch (err) {
      setAdminMsgError(
        err.response?.data?.message || "Failed to broadcast notice. Please try again."
      );
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isActive = (path) => {
    if (path === "/profile") {
      return (
        location.pathname === "/profile" ||
        location.pathname.startsWith("/profile/")
      );
    }
    if (path === "/admin/classes") {
      return location.pathname.startsWith("/admin/classes");
    }
    return (
      location.pathname === path ||
      (path !== "/" && location.pathname.startsWith(path))
    );
  };

  const navLinkClass = (path) => `
    flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200
    ${
      isActive(path)
        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 translate-x-0.5"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
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
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
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
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() =>
                  setShowNotificationDropdown(!showNotificationDropdown)
                }
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
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900 tracking-wider">
                        Notifications
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
                          className="text-[10px] text-indigo-600 hover:underline font-extrabold cursor-pointer"
                        >
                          Mark All Read
                        </button>
                      )}
                      {(isAdmin || isSuperAdmin) && (
                        <button
                          onClick={() => {
                            setShowNotificationDropdown(false);
                            setShowAdminMsgModal(true);
                          }}
                          className="px-2.5 py-1 bg-indigo-600 text-white font-bold text-[10px] rounded-lg hover:bg-indigo-700 transition flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <Megaphone className="w-3 h-3" /> Post 
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Notification Items List */}
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 space-y-1 custom-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleNotificationClick(n)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleNotificationClick(n);
                            }
                          }}
                          className={`p-2.5 rounded-2xl transition flex items-start justify-between gap-2 cursor-pointer ${
                            n.unread
                              ? "bg-indigo-50/50 font-bold hover:bg-indigo-100/60"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              {n.type === "calendar" ? (
                                <Calendar className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                              ) : (
                                <Megaphone className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                              )}
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                                {n.category}
                              </span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                • {n.time}
                              </span>
                            </div>
                            <h4 className="text-xs text-slate-900 leading-tight">
                              {n.title}
                            </h4>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDismissNotification(n.id);
                            }}
                            className="p-1 text-slate-300 hover:text-slate-600 rounded transition cursor-pointer"
                            title="Dismiss"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-xs text-slate-400 font-medium">
                        No active notices or calendar updates.
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
                {(user.full_name || user.email || "U").charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-extrabold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                  {user.full_name || user.email?.split("@")[0]}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span
                    className={`inline-block border text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${getRoleBadgeStyle(
                      user.role,
                    )}`}
                  >
                    {user.role ? user.role.replace("_", " ") : "User"}
                  </span>
                </div>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="w-9 h-9 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100 flex items-center justify-center transition-all duration-200 cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {adminMsgSuccess && (
        <div className="fixed top-20 right-6 z-50 p-4 bg-emerald-600 text-white font-extrabold text-xs rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <Check className="w-5 h-5 text-white" />
          {adminMsgSuccess}
        </div>
      )}

      {adminMsgError && (
        <div className="fixed top-20 right-6 z-50 p-4 bg-rose-600 text-white font-extrabold text-xs rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="w-5 h-5 text-white" />
          {adminMsgError}
        </div>
      )}

      {/* --- MODAL: CUSTOM MESSAGE FOR ADMIN --- */}
      {showAdminMsgModal && (
        <div
          onClick={() => setShowAdminMsgModal(false)}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Broadcast Official School Notice
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-400">
                    Post an official announcement that will be reflected for all
                    users
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAdminMsgModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleSendAdminMessage}
              className="space-y-3.5 text-xs font-semibold text-slate-700"
            >
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Notice Subject / Title *
                </label>
                <input
                  ref={subjectInputRef}
                  type="text"
                  required
                  placeholder="e.g. Mid-Term Schedule Update / Holiday Notice"
                  value={adminMsgSubject}
                  onChange={(e) => setAdminMsgSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Notice Details / Content *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type the official announcement details to be broadcasted..."
                  value={adminMsgContent}
                  onChange={(e) => setAdminMsgContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition resize-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdminMsgModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Broadcast Notice
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
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        >
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs flex flex-col gap-1 h-full overflow-y-auto custom-scrollbar">
            {/* Admin & Super Admin Dashboard Overview */}
            {(isSuperAdmin || isAdmin) && (
              <Link
                to={roleHomePath()}
                className={navLinkClass(roleHomePath())}
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard Overview
              </Link>
            )}

            <Link
              to="/profile"
              className={navLinkClass("/profile")}
            >
              <User className="w-4 h-4" /> My Profile & Security
            </Link>

            <Link
              to="/academic/calendar"
              className={navLinkClass("/academic/calendar")}
            >
              <Calendar className="w-4 h-4" /> Academic Calendar
            </Link>

            {/* <Link
              to="/academic/examinations"
              className={navLinkClass("/academic/examinations")}
            >
              <Award className="w-4 h-4" /> Examination Section
            </Link> */}

            {/* Admin & Super Admin Exclusive Links */}
            {(isSuperAdmin || isAdmin) && (
              <>
                <Link
                  to="/communication/center"
                  className={navLinkClass("/communication/center")}
                >
                  <Send className="w-4 h-4" /> Communication Desk
                </Link>
                <Link
                  to="/transport/management"
                  className={navLinkClass("/transport/management")}
                >
                  <Bus className="w-4 h-4" /> Transport & Bus Fleet
                </Link>
                <Link
                  to="/admin/users"
                  className={navLinkClass("/admin/users")}
                >
                  <Users className="w-4 h-4" /> Staff section
                </Link>
                <Link
                  to="/admin/classes"
                  className={navLinkClass("/admin/classes")}
                >
                  <Building2 className="w-4 h-4" /> Student section
                </Link>
                <Link
                  to="/admin/notices"
                  className={navLinkClass("/admin/notices")}
                >
                  <Megaphone className="w-4 h-4" /> Notice Board
                </Link>
                <Link
                  to="/finance/dashboard"
                  className={navLinkClass("/finance/dashboard")}
                >
                  <CreditCard className="w-4 h-4" /> Fees Desk Overview
                </Link>
                <Link
                  to="/finance/reports"
                  className={navLinkClass("/finance/reports")}
                >
                  <FileSpreadsheet className="w-4 h-4" /> Financial Audits &
                  Reports
                </Link>
                <Link
                  to="/admin/settings"
                  className={navLinkClass("/admin/settings")}
                >
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
                <Link
                  to="/teacher/dashboard"
                  className={navLinkClass("/teacher/dashboard")}
                >
                  <LayoutDashboard className="w-4 h-4" /> Class Workstation
                </Link>
                <Link
                  to="/teacher/attendance"
                  className={navLinkClass("/teacher/attendance")}
                >
                  <CalendarCheck className="w-4 h-4" /> Attendance Register
                </Link>
                <Link
                  to="/teacher/academics"
                  className={navLinkClass("/teacher/academics")}
                >
                  <Award className="w-4 h-4" /> Marks & Grading
                </Link>
                <Link
                  to="/teacher/timetable"
                  className={navLinkClass("/teacher/timetable")}
                >
                  <Clock className="w-4 h-4" /> Class Schedule
                </Link>
              </>
            )}

            {/* Student Exclusive Portal (Visible ONLY to Students) */}
            {isStudent && (
              <>
                <div className="mt-3 px-3 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Student Portal
                </div>
                <Link
                  to="/student/dashboard"
                  className={navLinkClass("/student/dashboard")}
                >
                  <LayoutDashboard className="w-4 h-4" /> Personal Dashboard
                </Link>
                <Link
                  to="/student/work"
                  className={navLinkClass("/student/work")}
                >
                  <BookText className="w-4 h-4" /> My Work
                </Link>
                <Link
                  to="/student/timetable"
                  className={navLinkClass("/student/timetable")}
                >
                  <Clock className="w-4 h-4" /> My Timetable
                </Link>
                <Link
                  to="/student/fees"
                  className={navLinkClass("/student/fees")}
                >
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
                <Link
                  to="/finance/dashboard"
                  className={navLinkClass("/finance/dashboard")}
                >
                  <CreditCard className="w-4 h-4" /> Fees Terminal
                </Link>
              </>
            )}
          </div>
        </aside>

        {/* Dynamic Route Content */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs h-full animate-in fade-in duration-200">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
