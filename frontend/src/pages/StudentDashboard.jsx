import React, { useState, useEffect } from 'react';
import { extractYouTubeId } from '../utils/youtube';
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
  FileSpreadsheet,
  ExternalLink,
  Tv,
  Search,
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
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [elearningItems, setElearningItems] = useState([]);
  const [elearningSearch, setElearningSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Security password state
  const [currentPassword, setCurrentPassword] = useState('');
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
      const [workRes, noticesRes, feeRes, attRes, elearnRes] = await Promise.all([
        api.get('/homework/student/my-work').catch(() => ({ data: { data: [] } })),
        api.get('/notices/student-work').catch(() => ({ data: { data: [] } })),
        api.get('/payments/records/my-fees').catch(() => ({ data: { data: [] } })),
        api.get('/attendance/student/my-summary').catch(() => ({ data: { data: null } })),
        api.get('/elearning/student/my-learning').catch(() => ({ data: { data: [] } })),
      ]);

      setWorkItems(workRes.data?.data || []);
      setWorkNotices(noticesRes.data?.data || []);
      setFees(feeRes.data?.data || []);
      setAttendanceSummary(attRes.data?.data || null);
      setElearningItems(elearnRes.data?.data || []);

      // Fetch parameterless student timetable from /v1/timetable/my-class
      const ttRes = await api.get('/v1/timetable/my-class').catch(() => ({ data: { data: [] } }));
      setTimetable(ttRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load student dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!currentPassword) {
      return setError('Please enter your current password');
    }
    if (newPassword.length < 8) {
      return setError('New password must be at least 8 characters');
    }
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      const response = await api.put('/auth/change-password', { currentPassword, newPassword });
      setMessage(response.data.message || 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to update password');
    }
  };

  // Determine overall fee status badge from fee records
  const pendingAmount = fees.reduce((acc, f) => {
    const due = f.due_amount !== undefined ? Number(f.due_amount) : (Number(f.total_amount || 0) - Number(f.paid_amount || 0));
    return acc + Math.max(0, due);
  }, 0);
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
              <h3 className="text-2xl font-black text-slate-900">
                {attendanceSummary?.total_days > 0
                  ? `${Math.round((Number(attendanceSummary.present || 0) / Number(attendanceSummary.total_days)) * 100)}% Present`
                  : '100% Present'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {attendanceSummary?.total_days > 0
                  ? `${attendanceSummary.present || 0} of ${attendanceSummary.total_days} days attended this month.`
                  : 'Class attendance roll record intact.'}
              </p>
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
                <BookText className="w-5 h-5 text-indigo-600" /> My Academic Work & Homework
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
            {workItems.map((item) => {
              const isCompleted = item.status === 'completed';
              return (
                <div key={`hw-${item.homework_id || item.id}`} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                      {item.subject_name || 'Subject Work'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Due: {item.due_date ? new Date(item.due_date).toLocaleDateString() : 'N/A'}
                      </span>
                      {item.classroom_url && (
                        <a
                          href={item.classroom_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-extrabold rounded-lg transition"
                          title="Open Google Classroom to submit assignment"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Google Classroom</span>
                        </a>
                      )}
                      <button
                        onClick={async () => {
                          const newStatus = isCompleted ? 'pending' : 'completed';
                          try {
                            await api.put('/homework/status', { homework_id: item.homework_id || item.id, status: newStatus });
                            setWorkItems(prev => prev.map(w => (w.homework_id || w.id) === (item.homework_id || item.id) ? { ...w, status: newStatus } : w));
                          } catch (err) {
                            alert('Failed to update status');
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                          isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        {isCompleted ? 'Done' : 'Mark Done'}
                      </button>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                  {item.description && <p className="text-xs text-slate-600 font-medium">{item.description}</p>}
                  {item.classroom_url && (
                    <p className="text-[10px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                      💡 <span>Submit work on Google Classroom first, then click <strong>Mark Done</strong>.</span>
                    </p>
                  )}
                </div>
              );
            })}

            {workItems.length === 0 && workNotices.length === 0 && (
              <p className="text-xs text-slate-400 font-medium py-4 text-center">No pending work or coursework assigned at this time.</p>
            )}
          </div>
        </div>
      )}

      {/* --- Timetable Section (7 Periods with Recess after Period 3) --- */}
      {(currentTab === 'home' || currentTab === 'timetable') && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" /> Class Schedule & Timetable (7 Periods)
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Standard 7-period daily schedule with Recess Break after 3rd Period.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {daysOfWeek.map((day, dayIdx) => {
              const dayClasses = timetable.filter((t) => Number(t.day_of_week) === dayIdx + 1);

              // 7 Standard slots
              const defaultSlots = [
                { p: 1, label: '08:30 - 09:15' },
                { p: 2, label: '09:15 - 10:00' },
                { p: 3, label: '10:00 - 10:45' },
                // RECESS BREAK
                { p: 4, label: '11:15 - 12:00' },
                { p: 5, label: '12:00 - 12:45' },
                { p: 6, label: '12:45 - 01:30' },
                { p: 7, label: '01:30 - 02:15' },
              ];

              return (
                <div key={day} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                      {day}
                    </h4>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      7 Periods
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {defaultSlots.map((slot) => {
                      const item = dayClasses.find((t) => Number(t.period_no) === slot.p);

                      return (
                        <React.Fragment key={`slot-${slot.p}`}>
                          <div className="p-2 bg-white rounded-xl border border-slate-100 flex items-center justify-between">
                            <div>
                              <span className="text-xs font-bold text-slate-900 block">
                                P{slot.p}: {item ? item.subject_name : 'Study Period'}
                              </span>
                              {item?.teacher_name && (
                                <span className="text-[10px] text-slate-500 font-semibold block">
                                  {item.teacher_name}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 font-bold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 whitespace-nowrap">
                              {item ? `${item.start_time?.slice(0, 5)} - ${item.end_time?.slice(0, 5)}` : slot.label}
                            </span>
                          </div>

                          {/* RECESS BREAK Banner after Period 3 */}
                          {slot.p === 3 && (
                            <div className="py-1.5 px-3 bg-amber-50 border border-amber-200/80 rounded-xl text-center shadow-2xs">
                              <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">
                                ☕ Recess Break (10:45 AM - 11:15 AM)
                              </span>
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
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
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Paid / Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {fees.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-slate-400 font-medium">
                      No fee records found.
                    </td>
                  </tr>
                ) : (
                  fees.map((f, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-bold text-slate-800">{f.category_name || f.name || `Fee Record #${f.id || idx + 1}`}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {f.due_date ? new Date(f.due_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4 font-extrabold uppercase text-[10px]">
                        <span className={`px-2 py-0.5 rounded ${
                          f.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : f.status === 'PARTIAL'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {f.status || 'PENDING'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-800">
                        ₹{Number(f.paid_amount || 0).toLocaleString()} / ₹{Number(f.total_amount || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- E Learning Video Topics Section --- */}
      {currentTab === 'elearning' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Tv className="w-5 h-5 text-indigo-600" /> E Learning Video Portal
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Watch video tutorials & topic explanations shared by your subject teachers.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search topics or titles..."
                value={elearningSearch}
                onChange={(e) => setElearningSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>
          </div>

          {(() => {
            const filtered = elearningItems.filter((item) => {
              const q = elearningSearch.toLowerCase();
              return (
                (item.title || '').toLowerCase().includes(q) ||
                (item.description || '').toLowerCase().includes(q) ||
                (item.teacher_name || '').toLowerCase().includes(q)
              );
            });

            if (filtered.length === 0) {
              return (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Tv className="w-12 h-12 text-slate-200 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">No E Learning video topics found</p>
                  <p className="text-[11px] text-slate-400">
                    {elearningSearch ? 'No videos match your search query.' : 'Your teachers have not shared any E Learning video topics for your section yet.'}
                  </p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filtered.map((item) => {
                  const ytId = item.youtube_video_id || extractYouTubeId(item.youtube_url);
                  const isApprovedUrl = typeof item.youtube_url === 'string' && /^https?:\/\//i.test(item.youtube_url.trim());
                  return (
                    <div key={item.id} className="bg-slate-50 p-4 rounded-3xl border border-slate-200/80 space-y-3 flex flex-col justify-between hover:border-slate-300 transition shadow-2xs">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-100/70 px-2.5 py-0.5 rounded-full border border-indigo-200 uppercase">
                            Teacher: {item.teacher_name || 'Subject Teacher'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recently'}
                          </span>
                        </div>
                        <h3 className="text-sm font-extrabold text-slate-900 leading-tight">{item.title}</h3>
                        {item.description && (
                          <p className="text-xs text-slate-600 font-medium leading-relaxed bg-white p-2.5 rounded-xl border border-slate-100">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {ytId ? (
                        <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 mt-2 shadow-xs bg-black">
                          <iframe
                            src={`https://www.youtube.com/embed/${ytId}`}
                            title={item.title}
                            className="w-full h-full"
                            allowFullScreen
                          />
                        </div>
                      ) : isApprovedUrl ? (
                        <a
                          href={item.youtube_url.trim()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline mt-2"
                        >
                          <ExternalLink className="w-4 h-4" /> Watch Video on YouTube
                        </a>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
