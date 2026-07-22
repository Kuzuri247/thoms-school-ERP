import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import api from '../api/axios';
import {
  User,
  CalendarDays,
  Award,
  BookOpen,
  Clock,
  Bell,
  BookText,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Bus,
  Key,
  Lock,
  FileSpreadsheet
} from 'lucide-react';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const StudentDashboard = ({ activeTab = 'home' }) => {
  const { user } = useAuthStore();
  const [currentTab, setCurrentTab] = useState(activeTab); // home, work, timetable, fees, settings

  useEffect(() => {
    setCurrentTab(activeTab);
  }, [activeTab]);
  const [workItems, setWorkItems] = useState([]);
  const [workNotices, setWorkNotices] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Security password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const [workRes, noticesRes, feeRes] = await Promise.all([
        api.get('/homework/student/my-work').catch(() => ({ data: { data: [] } })),
        api.get('/notices/student-work').catch(() => ({ data: { data: [] } })),
        api.get(`/payments/history/${user?.id || 1}`).catch(() => ({ data: { data: [] } })),
      ]);

      setWorkItems(workRes.data?.data || []);
      setWorkNotices(noticesRes.data?.data || []);
      setFees(feeRes.data?.data || []);

      // If user has a class, fetch class timetable
      if (user?.class_id || user?.section_id) {
        const ttRes = await api.get(`/timetable/class/${user.class_id || user.section_id}`).catch(() => ({ data: { data: [] } }));
        setTimetable(ttRes.data?.data || []);
      }
    } catch (err) {
      console.error('Failed to load student dashboard data:', err);
    } fontFinally: {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      const response = await api.put('/auth/change-password', { newPassword });
      setMessage(response.data.message || 'Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update password');
    }
  };

  // Determine overall fee status badge
  const pendingAmount = fees.filter(f => f.status !== 'PAID' && f.status !== 'captured').reduce((acc, f) => acc + (f.amount || 0), 0);
  const feeStatusBadge = pendingAmount === 0 ? 'PAID' : pendingAmount > 5000 ? 'OVERDUE' : 'PENDING';

  return (
    <div className="space-y-6 pb-12">
      {/* Brand Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 p-8 rounded-3xl shadow-lg text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight mb-1">Student Portal</h1>
            <div className="flex items-center gap-3 text-indigo-100 font-medium text-xs sm:text-sm">
              <p>Welcome back, <span className="font-bold text-white">{user?.full_name || user?.email?.split('@')[0]}</span>.</p>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-300"></span>
              <p>Role: <span className="font-bold text-white">Student</span></p>
            </div>
          </div>
        </div>

        {/* Quick Nav Badges */}
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentTab('home')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${currentTab === 'home' ? 'bg-white text-indigo-900' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setCurrentTab('work')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${currentTab === 'work' ? 'bg-white text-indigo-900' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            My Work
          </button>
          <button
            onClick={() => setCurrentTab('fees')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${currentTab === 'fees' ? 'bg-white text-indigo-900' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            Fee Status
          </button>
        </div>
      </div>

      {/* --- Home / Overview Section --- */}
      {currentTab === 'home' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Fees Status Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fee Account Status</span>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                  feeStatusBadge === 'PAID'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : feeStatusBadge === 'OVERDUE'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {feeStatusBadge}
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                {pendingAmount === 0 ? 'Clear (₹0 Due)' : `₹${pendingAmount.toLocaleString()}`}
              </h3>
              <p className="text-xs text-slate-500 font-medium">Updated fee status and transaction record.</p>
            </div>

            {/* Assigned Work Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Work</span>
                <BookText className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">{workItems.length + workNotices.length} Tasks</h3>
              <p className="text-xs text-slate-500 font-medium">Homework tasks & academic notices assigned.</p>
            </div>

            {/* Attendance Summary Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance Status</span>
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Good Standing</h3>
              <p className="text-xs text-slate-500 font-medium">Class attendance roll record intact.</p>
            </div>
          </div>
        </div>
      )}

      {/* --- Work Section (Homework & Work Notices) --- */}
      {(currentTab === 'home' || currentTab === 'work') && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <BookText className="w-5 h-5 text-indigo-600" /> My Academic Work & Coursework
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Assignments given by your class teacher and subject teachers.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Work Notices */}
            {workNotices.map((notice) => (
              <div key={`notice-${notice.id}`} className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-600 text-white">
                    Work Notice
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {notice.publish_date ? new Date(notice.publish_date).toLocaleDateString() : 'Active'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{notice.title}</h4>
                <p className="text-xs text-slate-600 font-medium">{notice.content}</p>
              </div>
            ))}

            {/* Assigned Homework Items */}
            {workItems.map((item) => (
              <div key={`hw-${item.homework_id || item.id}`} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600">{item.subject_name || 'Subject Work'}</span>
                  <span className="text-[11px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Due: {item.due_date ? new Date(item.due_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                {item.description && <p className="text-xs text-slate-600 font-medium">{item.description}</p>}
              </div>
            ))}

            {workItems.length === 0 && workNotices.length === 0 && (
              <p className="text-xs text-slate-400 font-medium py-4 text-center">No pending work or coursework assigned at this time.</p>
            )}
          </div>
        </div>
      )}

      {/* --- Timetable Section --- */}
      {(currentTab === 'home' || currentTab === 'timetable') && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" /> Class Schedule & Timetable
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {daysOfWeek.map((day, dayIdx) => {
              const dayClasses = timetable.filter((t) => Number(t.day_of_week) === dayIdx + 1);
              return (
                <div key={day} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1">
                    {day}
                  </h4>
                  {dayClasses.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No scheduled periods</p>
                  ) : (
                    <div className="space-y-1.5">
                      {dayClasses.map((item, idx) => (
                        <div key={idx} className="p-2.5 bg-white rounded-xl border border-slate-100 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">
                            P{item.period_no}: {item.subject_name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {item.start_time} - {item.end_time}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- Fees Status & Transactions Section --- */}
      {(currentTab === 'home' || currentTab === 'fees') && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" /> Fee Status & Recent Transactions
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">Your fee account balance and payment history.</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
              feeStatusBadge === 'PAID'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : feeStatusBadge === 'OVERDUE'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              Status: {feeStatusBadge}
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Transaction / Receipt No</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {fees.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-slate-400 font-medium">
                      No recent transaction history recorded.
                    </td>
                  </tr>
                ) : (
                  fees.map((f, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{f.razorpay_payment_id || `TXN-${f.id || idx}`}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {f.captured_at ? new Date(f.captured_at).toLocaleDateString() : 'Recent'}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-700">{f.method || 'Card / UPI'}</td>
                      <td className="py-3 px-4 text-right font-black text-emerald-600">
                        +₹{((f.amount_paise || 0) / 100).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
