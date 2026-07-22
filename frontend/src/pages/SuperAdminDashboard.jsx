import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../api/axios';
import {
  Users,
  GraduationCap,
  Building2,
  Banknote,
  CreditCard,
  UserPlus,
  Settings,
  Bell,
  Activity,
  Plus,
  Clock,
  Bus,
  Shield,
  FileText,
  X,
  Send,
  Megaphone
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass, trend }) => (
  <div className="bg-white p-6 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center justify-between group hover:-translate-y-1 transition-all duration-300">
    <div className="flex items-center gap-4">
      <div className={`p-4 rounded-2xl ${colorClass} group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-black text-slate-900">{value}</p>
      </div>
    </div>
    {trend && (
      <div className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-full">
        {trend}
      </div>
    )}
  </div>
);

const QuickAccessCard = ({ title, icon: Icon, colorClass, onClick, desc }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-start p-5 rounded-3xl border border-slate-100 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${colorClass}`}
  >
    <div className="p-3 rounded-xl bg-white/40 mb-4 shadow-sm backdrop-blur-md">
      <Icon className="w-6 h-6" />
    </div>
    <h4 className="font-bold text-slate-900 text-base">{title}</h4>
    <p className="text-xs font-medium opacity-70 mt-1">{desc}</p>
  </button>
);

const SuperAdminDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_students: 0,
    total_teachers: 0,
    total_admins: 0,
    total_staff: 0,
    total_revenue: null,
  });
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    notice_type: 'general',
    type: 'global',
    target_role: '',
  });
  const [postingNotice, setPostingNotice] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, noticesRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/notices'),
      ]);
      if (statsRes.data?.data) {
        setStats(statsRes.data.data);
      }
      if (noticesRes.data?.data) {
        setNotices(noticesRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    if (!newNotice.title || !newNotice.content) return;
    try {
      setPostingNotice(true);
      await api.post('/notices', newNotice);
      setShowNoticeModal(false);
      setNewNotice({ title: '', content: '', notice_type: 'general', type: 'global', target_role: '' });
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post notice');
    } finally {
      setPostingNotice(false);
    }
  };

  if (!user) return null;
  const isSuperAdmin = user.role === 'super_admin';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 rounded-3xl p-8 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black mb-1">Welcome back, {user.full_name || user.email?.split('@')[0]} 👋</h1>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-white/10 border border-white/20">
              {isSuperAdmin ? 'Super Admin' : 'Admin'}
            </span>
          </div>
          <p className="text-indigo-200 font-medium text-sm mt-1">Here is live platform status and statistics for Thomson School.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNoticeModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-2xl font-bold text-sm transition-colors shadow-lg flex items-center gap-2 border border-indigo-400/30"
          >
            <Bell className="w-4 h-4" /> Post Notice
          </button>
          <button
            onClick={() => navigate('/admin/users')}
            className="bg-white text-indigo-900 px-5 py-3 rounded-2xl font-bold text-sm hover:bg-indigo-50 transition-colors shadow-lg flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" /> User Directory
          </button>
        </div>
      </div>

      {/* Top Real Stats Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${isSuperAdmin ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-6`}>
        <StatCard title="Total Students" value={stats.total_students} trend="+Active" icon={GraduationCap} colorClass="bg-indigo-50 text-indigo-600" />
        <StatCard title="Total Teachers" value={stats.total_teachers} trend="+Active" icon={Building2} colorClass="bg-amber-50 text-amber-600" />
        <StatCard title="Total Admins" value={stats.total_admins} trend="+Active" icon={Shield} colorClass="bg-purple-50 text-purple-600" />
        <StatCard title="Non-Teaching Staff" value={stats.total_staff} trend="+Active" icon={Users} colorClass="bg-cyan-50 text-cyan-600" />
        
        {/* Crucial Guard: Total Revenue / Collection Stat Card (SUPER_ADMIN ONLY) */}
        {isSuperAdmin && (
          <StatCard
            title="Total Collection"
            value={stats.total_revenue !== null ? `₹${stats.total_revenue.toLocaleString('en-IN')}` : '₹0'}
            trend="Super Admin Only"
            icon={Banknote}
            colorClass="bg-emerald-50 text-emerald-600"
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Quick Access & ERP Workspaces */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-slate-100 space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" /> ERP Administrative Workspaces
              </h2>
              <p className="text-slate-500 text-xs mt-1">Direct navigation to administrative management tools.</p>
            </div>

            <div className="space-y-6">
              {/* User & Academic Operations */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Administrative Operations</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <QuickAccessCard
                    onClick={() => navigate('/admin/users')}
                    title="User Directory" desc="Manage Accounts & Roles"
                    icon={Users} colorClass="bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                  />
                  <QuickAccessCard
                    onClick={() => navigate('/admin/classes')}
                    title="Class Directory" desc="Standards & Enrolled Roster"
                    icon={GraduationCap} colorClass="bg-purple-50 text-purple-700 hover:bg-purple-100"
                  />
                  <QuickAccessCard
                    onClick={() => navigate('/finance/dashboard')}
                    title="Fees Desk" desc="Fees Collection & Overview"
                    icon={CreditCard} colorClass="bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notice Board Section */}
          <div className="bg-white p-8 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-indigo-600" /> Active Global Notices
                </h2>
                <p className="text-slate-500 text-xs mt-1">Official announcements published to the portal notice board.</p>
              </div>
              <button
                onClick={() => setShowNoticeModal(true)}
                className="px-4 py-2 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-xl hover:bg-indigo-100 transition"
              >
                + New Notice
              </button>
            </div>

            <div className="space-y-4">
              {notices.length === 0 ? (
                <p className="text-sm font-medium text-slate-400 py-4 text-center">No active global notices found.</p>
              ) : (
                notices.slice(0, 5).map((notice) => (
                  <div key={notice.id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                        {notice.notice_type || 'General'}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {notice.publish_date ? new Date(notice.publish_date).toLocaleDateString() : 'Today'}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{notice.title}</h4>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">{notice.content}</p>
                    {notice.published_by_name && (
                      <p className="text-[10px] font-semibold text-slate-400">Published by: {notice.published_by_name}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Platform Audit & Quick Summary */}
        <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-black text-slate-900">System Overview</h2>
          </div>
          <div className="p-6 flex-1 space-y-6">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Access Control</h4>
              <p className="text-xs font-semibold text-slate-700">Strict Role-Based Access Control (RBAC) is enabled.</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {['super_admin', 'admin', 'cashier', 'teacher', 'student', 'busstaff'].map((r) => (
                  <span key={r} className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {r}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">Fee Integrity Protection</h4>
              <p className="text-xs font-medium text-emerald-700">
                Aggregate financial sum collections are restricted exclusively to Super Admins. Cashiers access single student balances.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Post Notice Modal */}
      {showNoticeModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-indigo-600" /> Create New Notice
              </h3>
              <button onClick={() => setShowNoticeModal(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Notice Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Exhibition Announcement"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-500"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Notice Category</label>
                  <select
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-500"
                    value={newNotice.notice_type}
                    onChange={(e) => setNewNotice({ ...newNotice, notice_type: e.target.value })}
                  >
                    <option value="general">General</option>
                    <option value="academic">Academic</option>
                    <option value="fee">Fee</option>
                    <option value="exam">Exam</option>
                    <option value="holiday">Holiday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Notice Type</label>
                  <select
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-500"
                    value={newNotice.type}
                    onChange={(e) => setNewNotice({ ...newNotice, type: e.target.value })}
                  >
                    <option value="global">Global (All Users)</option>
                    <option value="work">Work / Academic Task</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Target Role (Optional)</label>
                <select
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-500"
                  value={newNotice.target_role}
                  onChange={(e) => setNewNotice({ ...newNotice, target_role: e.target.value })}
                >
                  <option value="">All Roles</option>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="cashier">Cashier</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Notice Content</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Type the full announcement content here..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-500"
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNoticeModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={postingNotice}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  {postingNotice ? 'Publishing...' : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
