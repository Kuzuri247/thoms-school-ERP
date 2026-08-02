import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import api from "../api/axios";
import Noticeboard from "../features/noticeboard/Noticeboard";
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
  Megaphone,
  Calendar,
} from "lucide-react";

const StatCard = ({ title, value, icon: Icon, colorClass, trend }) => (
  <div className="bg-white p-5 rounded-2xl shadow-2xs border border-slate-200/80 flex items-center justify-between group hover:border-slate-300 transition-all duration-200">
    <div className="flex items-center gap-3.5">
      <div className={`p-3 rounded-xl ${colorClass} border border-slate-100`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
          {title}
        </h3>
        <p className="text-2xl font-black text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
    {trend && (
      <div className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
        {trend}
      </div>
    )}
  </div>
);

const QuickAccessCard = ({ title, icon: Icon, colorClass, onClick, desc }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-start p-4 rounded-2xl border border-slate-200/80 bg-white text-left transition-all duration-200 hover:border-slate-300 hover:shadow-xs cursor-pointer ${colorClass}`}
  >
    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 mb-3">
      <Icon className="w-5 h-5 text-slate-800" />
    </div>
    <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
    <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1">
      {desc}
    </p>
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
    title: "",
    content: "",
    notice_type: "general",
    type: "global",
    target_role: "",
  });
  const [postingNotice, setPostingNotice] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes] = await Promise.all([api.get("/admin/stats")]);
      if (statsRes.data?.data) {
        setStats(statsRes.data.data);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;
  const isSuperAdmin = user.role === "super_admin";

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800 border border-slate-700 rounded-2xl p-6 text-white shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1">
              Welcome back, {user.full_name || user.email?.split("@")[0]}{" "}
            </h1>
          </div>
          <p className="text-slate-300 font-normal text-xs mt-1">
            Live platform status, administrative workspaces, and school
            statistics.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => navigate("/academic/calendar")}
            className="bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-100 px-3.5 py-2 rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" /> Academic Calendar
          </button>
          <button
            onClick={() => navigate("/admin/classes")}
            className="bg-white hover:bg-slate-100 text-slate-900 px-3.5 py-2 rounded-xl font-bold text-xs transition shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <GraduationCap className="w-3.5 h-3.5" /> Student Directory
          </button>
          <button
            onClick={() => navigate("/admin/users")}
            className="bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-100 px-3.5 py-2 rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" /> Staff Directory
          </button>
        </div>
      </div>

      {/* Top Real Stats Cards (Removed +Active badges & Total Collection card as requested) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats.total_students}
          icon={GraduationCap}
          colorClass="bg-blue-50 text-blue-700"
        />
        <StatCard
          title="Total Teachers"
          value={stats.total_teachers}
          icon={Building2}
          colorClass="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          title="Total Admins"
          value={stats.total_admins}
          icon={Shield}
          colorClass="bg-slate-100 text-slate-800"
        />
        <StatCard
          title="Non-Teaching Staff"
          value={stats.total_staff}
          icon={Users}
          colorClass="bg-amber-50 text-amber-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Quick Access & ERP Workspaces */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-slate-100 space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" /> ERP
                Administrative Workspaces
              </h2>
              <p className="text-slate-500 text-xs mt-1">
                Direct navigation to administrative management tools.
              </p>
            </div>

            <div className="space-y-6">
              {/* User & Academic Operations */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Administrative Operations
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <QuickAccessCard
                    onClick={() => navigate("/admin/users")}
                    title="User Directory"
                    desc="Manage Accounts & Roles"
                    icon={Users}
                    colorClass="bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                  />
                  <QuickAccessCard
                    onClick={() => navigate("/admin/classes")}
                    title="Standards & Student Directory"
                    desc="Classes, Sections & Student Roster"
                    icon={GraduationCap}
                    colorClass="bg-purple-50 text-purple-700 hover:bg-purple-100 shadow-xs"
                  />
                  <QuickAccessCard
                    onClick={() => navigate("/finance/dashboard")}
                    title="Fees Desk"
                    desc="Fees Collection & Overview"
                    icon={CreditCard}
                    colorClass="bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notice Board Section */}
          <Noticeboard />
        </div>

        {/* Right Column: Platform Audit & Quick Summary */}
        <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-black text-slate-900">
              System Overview
            </h2>
          </div>
          <div className="p-6 flex-1 space-y-6">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Access Control
              </h4>
              <p className="text-xs font-semibold text-slate-700">
                Strict Role-Based Access Control (RBAC) is enabled.
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {["super_admin", "admin", "cashier", "teacher", "student"].map(
                  (r) => (
                    <span
                      key={r}
                      className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100"
                    >
                      {r}
                    </span>
                  ),
                )}
              </div>
            </div>

            <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Fee Integrity Protection
              </h4>
              <p className="text-xs font-medium text-emerald-700">
                Aggregate financial sum collections are restricted exclusively
                to Super Admins. Cashiers access single student balances.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
