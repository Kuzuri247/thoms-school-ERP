import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Lock, FileSpreadsheet, CheckCircle, AlertCircle, Key, User, CalendarDays, Award, BookOpen, Clock, ArrowRight, Bell, BookText, X, Bus, MapPin, UserCheck } from 'lucide-react';
import api from '../api/axios';

const months = ['apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar'];
const monthLabels = ['April', 'May', 'June', 'July', 'August', 'Sept', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'March'];

import { useGetNotices } from '../features/notices/useNotices';
import { useFeeHistory } from '../features/fees/useFees';
import { useGetMarks, useGetTimetable } from '../features/academics/useAcademics';
import { useGetStudentTransport } from '../features/transport/useTransport';

const StudentDashboard = ({ activeTab = 'home' }) => {
    const { user } = useContext(AuthContext);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [feeData, setFeeData] = useState([]);
    const [showPopup, setShowPopup] = useState(true);
    const [attendanceMonth, setAttendanceMonth] = useState('All');
    const [resultExam, setResultExam] = useState('Half-Yearly Examination');
    const [calendarMonth, setCalendarMonth] = useState('All');

    const { data: noticesData } = useGetNotices();
    const notices = noticesData?.data || [];
    
    const studentId = user?.student_id;
    const classId = user?.class_id;

    const { data: feesData } = useFeeHistory(studentId);
    const { data: marksData } = useGetMarks(studentId);
    const { data: timetableData } = useGetTimetable(classId);
    const { data: transportData } = useGetStudentTransport(studentId);

    const pendingFeesAmount = feesData?.data?.filter(f => f.status !== 'PAID').reduce((sum, f) => sum + Number(f.total_amount), 0) || 0;
    const busStatus = transportData?.data ? 'Active' : 'Inactive';
    const hasTransport = !!transportData?.data;

    useEffect(() => {
        // If feeData needed local state for some reason, we can set it here.
    }, [user]);

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

    const calculateTotal = (row) => months.reduce((sum, month) => sum + (Number(row[month]) || 0), 0);

    const getMonthColor = (idx) => {
        if (idx < 3) return 'bg-rose-50/40 text-rose-700';
        if (idx < 6) return 'bg-amber-50/40 text-amber-700';
        if (idx < 9) return 'bg-emerald-50/40 text-emerald-700';
        return 'bg-sky-50/40 text-sky-700';
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 rounded-3xl shadow-lg text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight mb-1">Student Portal</h1>
                        <div className="flex items-center gap-3 text-indigo-100 font-medium">
                            <p>Welcome back, <span className="font-bold text-white">{user?.email || 'Student'}</span>.</p>
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-300"></span>
                            <p>Class: <span className="font-bold text-white">{user?.class || '10th Grade'}</span></p>
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-300"></span>
                            <div className="flex items-center gap-1.5">
                                <span className={`w-2.5 h-2.5 rounded-full ${user?.house === 'Red' ? 'bg-red-400' : user?.house === 'Green' ? 'bg-emerald-400' : user?.house === 'Yellow' ? 'bg-yellow-400' : 'bg-blue-400'}`}></span>
                                <span>{user?.house || 'Blue'} House</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Display everything on home, otherwise display specific tabs */}
            
            {(activeTab === 'home' || activeTab === 'notices') && (
            <div className="mt-6">
                {/* Important Notices Section */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <Bell className="w-5 h-5 text-rose-500" />
                        Notice Board
                    </h2>
                    <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{notices.length} New</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {notices.map(notice => (
                        <div key={notice.id} className="p-5 bg-white rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg transition-shadow relative overflow-hidden group">
                            <div className={`absolute top-0 left-0 w-1 h-full ${notice.priority === 'High' ? 'bg-rose-500' : 'bg-indigo-500'}`}></div>
                            <div className="flex justify-between items-start mb-3">
                                <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded shadow-sm bg-sky-50 text-sky-600`}>{notice.target_audience}</span>
                                <span className="text-xs font-bold text-slate-400">{new Date(notice.publish_date).toLocaleDateString()}</span>
                            </div>
                            <h3 className="font-bold text-slate-800 text-sm mb-2 group-hover:text-indigo-600 transition-colors">{notice.title}</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">{notice.content}</p>
                        </div>
                    ))}
                </div>
            </div>
            )}

            {activeTab === 'home' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle className="w-5 h-5" /></div>
                            <h3 className="text-sm font-bold text-slate-500">Attendance</h3>
                        </div>
                        <p className="text-2xl font-black text-slate-800">85%</p>
                    </div>
                    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-fuchsia-50 text-fuchsia-600 rounded-lg"><Award className="w-5 h-5" /></div>
                            <h3 className="text-sm font-bold text-slate-500">Last Exam</h3>
                        </div>
                        <p className="text-2xl font-black text-slate-800">A1 Grade</p>
                    </div>
                    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><FileSpreadsheet className="w-5 h-5" /></div>
                            <h3 className="text-sm font-bold text-slate-500">Pending Fees</h3>
                        </div>
                        <p className="text-2xl font-black text-slate-800">₹{pendingFeesAmount}</p>
                    </div>
                    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-teal-50 text-teal-600 rounded-lg"><Bus className="w-5 h-5" /></div>
                            <h3 className="text-sm font-bold text-slate-500">Bus Status</h3>
                        </div>
                        <p className="text-2xl font-black text-slate-800">{busStatus}</p>
                    </div>
                </div>
            )}
            
            {activeTab === 'settings' && (
                <div className="mt-6 max-w-xl mx-auto">
                    {/* Security Settings (Change Password) */}
                    <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                                <Key className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">Security Settings</h2>
                        </div>
                        
                        {message && (
                            <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                <span className="font-bold text-sm">{message}</span>
                            </div>
                        )}
                        {error && (
                            <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span className="font-bold text-sm">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">New Password</label>
                                <input 
                                    type="password"
                                    required
                                    minLength={6}
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-inner"
                                    placeholder="Min 6 characters"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Confirm Password</label>
                                <input 
                                    type="password"
                                    required
                                    minLength={6}
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-inner"
                                    placeholder="Re-type password"
                                />
                            </div>
                            <button 
                                type="submit"
                                className="w-full mt-2 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors shadow-sm"
                            >
                                Update Password
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {activeTab === 'fees' && (
                <div className="mt-6">
                    {/* Fee Structure Display */}
                    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 bg-white flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                                <FileSpreadsheet className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-extrabold text-slate-800 text-lg tracking-tight">My Fee Structure</h2>
                                <p className="text-xs font-medium text-slate-500">Academic Year {new Date().getFullYear()}-{new Date().getFullYear()+1}</p>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto custom-scrollbar p-2">
                            <table className="w-full text-left border-collapse min-w-[900px]">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="py-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest sticky left-0 bg-white z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Fee Component</th>
                                        {monthLabels.map((month, idx) => (
                                            <th key={month} className={`py-3 px-3 text-[10px] font-extrabold uppercase tracking-widest text-center ${getMonthColor(idx)} rounded-t-lg mx-0.5`}>
                                                {month}
                                            </th>
                                        ))}
                                        <th className="py-3 px-4 text-[10px] font-black text-white uppercase tracking-widest text-right bg-slate-900 rounded-tl-lg">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(feesData?.data || []).map(row => (
                                        <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-3 px-4 text-xs font-bold text-slate-800 sticky left-0 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] z-10">{row.category_name || `Fee ${row.id}`}</td>
                                            {months.map((month, mIdx) => (
                                                <td key={month} className={`py-3 px-3 text-xs font-bold text-center ${row.amount > 0 ? getMonthColor(mIdx) : 'text-slate-300 bg-slate-50/30'}`}>
                                                    {mIdx === 0 ? `₹${row.total_amount}` : '-'}
                                                </td>
                                            ))}
                                            <td className="py-3 px-4 text-xs font-black text-white text-right bg-slate-800 border-l border-slate-700">₹{row.total_amount}</td>
                                        </tr>
                                    ))}
                                    {/* Grand Total Row */}
                                    <tr className="border-t-2 border-slate-900">
                                        <td className="py-4 px-4 text-sm font-black text-slate-900 sticky left-0 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] z-10 uppercase tracking-widest">Grand Total</td>
                                        {months.map((month, mIdx) => {
                                            const monthTotal = feeData.reduce((sum, row) => sum + (Number(row[month]) || 0), 0);
                                            return (
                                                <td key={month} className={`py-4 px-3 text-xs font-black text-center ${monthTotal > 0 ? 'text-slate-900 bg-slate-100/80' : 'text-slate-400 bg-slate-50'}`}>
                                                    {monthTotal > 0 ? `₹${monthTotal}` : '-'}
                                                </td>
                                            );
                                        })}
                                        <td className="py-4 px-4 text-sm font-black text-emerald-400 text-right bg-slate-900">
                                            ₹{feeData.reduce((sum, row) => sum + calculateTotal(row), 0)}
                                        </td>
                                    </tr>
                                    {/* Status Row */}
                                    <tr className="border-t border-slate-200 bg-slate-50">
                                        <td className="py-3 px-4 text-[10px] font-black text-slate-500 sticky left-0 bg-slate-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] z-10 uppercase tracking-widest rounded-bl-lg">Status</td>
                                        {months.map((month) => {
                                            const status = dummyPaymentStatus[month];
                                            let colorClass = '';
                                            if (status === 'Paid') colorClass = 'bg-emerald-100 text-emerald-700 border-emerald-200';
                                            else if (status === 'Pending') colorClass = 'bg-rose-100 text-rose-700 border-rose-200';
                                            else colorClass = 'bg-slate-200 text-slate-500 border-slate-300';

                                            return (
                                                <td key={month} className="py-3 px-1 text-center bg-slate-50 border-r border-slate-100">
                                                    <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded border shadow-sm ${colorClass}`}>
                                                        {status}
                                                    </span>
                                                </td>
                                            );
                                        })}
                                        <td className="bg-slate-900 rounded-br-lg border-l border-slate-800"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'attendance' && (
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 mt-6">
                {/* Attendance Overview */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
                        <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">My Attendance Overview</h2>
                        <p className="text-xs font-medium text-slate-500">Current Academic Term</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Overall Radial Chart */}
                    <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <div className="relative w-40 h-40 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <path
                                    className="text-slate-200"
                                    strokeWidth="3"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                    className="text-sky-500 drop-shadow-md"
                                    strokeDasharray="92, 100"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center justify-center">
                                <span className="text-3xl font-black text-slate-800">92%</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Overall</span>
                            </div>
                        </div>
                        <div className="flex gap-6 mt-6 w-full px-4">
                            <div className="flex-1 text-center">
                                <div className="text-lg font-black text-emerald-500">99</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Present</div>
                            </div>
                            <div className="w-px bg-slate-200"></div>
                            <div className="flex-1 text-center">
                                <div className="text-lg font-black text-rose-500">9</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Absent</div>
                            </div>
                        </div>
                    </div>

                    {/* Monthly Linear Bars */}
                    <div className="lg:col-span-2 space-y-4 flex flex-col justify-center">
                        <div className="flex justify-end mb-2">
                            <select 
                                value={attendanceMonth}
                                onChange={(e) => setAttendanceMonth(e.target.value)}
                                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-sky-500/20"
                            >
                                <option value="All">All Months</option>
                                <option value="April">April</option>
                                <option value="May">May</option>
                                <option value="June">June</option>
                                <option value="July">July</option>
                                <option value="August">August</option>
                            </select>
                        </div>
                        {[]
                            .filter(stat => attendanceMonth === 'All' || stat.month === attendanceMonth).map((stat, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-20 text-xs font-bold text-slate-600 uppercase tracking-widest text-right">
                                    {stat.month}
                                </div>
                                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                                    {stat.label ? (
                                        <div className="h-full w-full bg-amber-300 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-white/20 stripe-pattern"></div>
                                        </div>
                                    ) : (
                                        <div className={`h-full rounded-full transition-all duration-1000 ${stat.percent >= 90 ? 'bg-emerald-500' : stat.percent >= 80 ? 'bg-amber-400' : 'bg-rose-500'}`} style={{ width: `${stat.percent}%` }}></div>
                                    )}
                                </div>
                                <div className="w-24 text-right">
                                    {stat.label ? (
                                        <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded uppercase tracking-wider">{stat.label}</span>
                                    ) : (
                                        <span className="text-xs font-black text-slate-700">{stat.percent}% <span className="text-slate-400 text-[10px] font-bold">({stat.present}/{stat.total})</span></span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            )}

            {(activeTab === 'results' || activeTab === 'calendar') && (
            <div className={`grid grid-cols-1 gap-6 mt-6`}>
                {/* Results and Academic Calendar Row */}
                
                {activeTab === 'results' && (
                <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60">
                    {/* Academic Results Section */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-fuchsia-50 text-fuchsia-600 rounded-xl">
                                <Award className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Academic Results</h2>
                                <p className="text-xs font-medium text-slate-500">Detailed examination scores</p>
                            </div>
                        </div>
                        <select 
                            value={resultExam}
                            onChange={(e) => setResultExam(e.target.value)}
                            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-fuchsia-500/20"
                        >
                            <option value="Quarterly Examination">Quarterly Exam</option>
                            <option value="Half-Yearly Examination">Half-Yearly Exam</option>
                            <option value="Pre-Board Examination">Pre-Board Exam</option>
                        </select>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="flex justify-between items-center p-4 bg-slate-50 border-b border-slate-200">
                                <h3 className="font-bold text-slate-800">{resultExam}</h3>
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-xs font-black tracking-widest uppercase shadow-sm">Published</span>
                            </div>
                            
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-100/50">
                                            <th className="py-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200">Subject</th>
                                            <th className="py-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 text-center">Theory</th>
                                            <th className="py-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 text-center">Practical</th>
                                            <th className="py-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 text-center">Total</th>
                                            <th className="py-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 text-right">Grade</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {(marksData?.data || []).map((sub, i) => {
                                            const total = sub.marks_obtained;
                                            const maxTotal = sub.max_marks || 100;
                                            return (
                                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                    <td className="py-3 px-4 text-xs font-bold text-slate-700">{sub.subject_name}</td>
                                                    <td className="py-3 px-4 text-xs font-medium text-slate-600 text-center">{total}/{maxTotal}</td>
                                                    <td className="py-3 px-4 text-xs font-medium text-slate-600 text-center">-</td>
                                                    <td className="py-3 px-4 text-xs font-black text-slate-800 text-center">{total}/{maxTotal}</td>
                                                    <td className="py-3 px-4 text-xs font-black text-fuchsia-600 text-right">{sub.grade || 'A'}</td>
                                                </tr>
                                            );
                                        })}
                                        <tr className="bg-slate-50 border-t-2 border-slate-200">
                                            <td colSpan="3" className="py-4 px-4 text-xs font-black text-slate-800 uppercase tracking-widest text-right">Overall Percentage</td>
                                            <td colSpan="2" className="py-4 px-4 text-sm font-black text-fuchsia-600 text-right">
                                                {marksData?.data?.length ? (marksData.data.reduce((sum, s) => sum + Number(s.marks_obtained), 0) / (marksData.data.length * 100) * 100).toFixed(1) + '%' : 'N/A'}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <button className="w-full py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                            Download Report Card (PDF)
                        </button>
                    </div>
                </div>
                )}

                {activeTab === 'calendar' && (
                <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60">
                    {/* Academic Calendar Section */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Academic Calendar</h2>
                                <p className="text-xs font-medium text-slate-500">Upcoming events & holidays</p>
                            </div>
                        </div>
                        <select 
                            value={calendarMonth}
                            onChange={(e) => setCalendarMonth(e.target.value)}
                            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20"
                        >
                            <option value="All">All Months</option>
                            <option value="Oct">October</option>
                            <option value="Nov">November</option>
                            <option value="Dec">December</option>
                            <option value="Jan">January</option>
                        </select>
                    </div>

                    <div className="space-y-4">
                        {[]
                        .filter(event => calendarMonth === 'All' || event.month === calendarMonth)
                        .map((event, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors group">
                                <div className="w-14 h-14 rounded-xl bg-orange-50 text-orange-600 flex flex-col items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                    <span className="text-sm font-black leading-none">{event.date}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest mt-1">{event.month}</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-slate-800">{event.title}</h3>
                                    <div className="flex items-center gap-1.5 mt-1 text-slate-500">
                                        {event.icon}
                                        <span className="text-xs font-medium">{event.type}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                )}
            </div>
            )}

            {activeTab === 'homework' && (
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 mt-6">
                {/* Homework Section */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                            <BookText className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Daily Homework</h2>
                            <p className="text-xs font-medium text-slate-500">Latest assignments pushed by teachers</p>
                        </div>
                    </div>
                </div>
                
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                    {[].map((hw, i) => (
                        <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 group-hover:bg-indigo-500 group-hover:text-white text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors z-10">
                                <BookText className="w-4 h-4" />
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">{hw.subject}</span>
                                    <span className="text-[10px] font-bold text-slate-400">{hw.date}</span>
                                </div>
                                <h3 className="font-bold text-slate-800 text-sm mb-1">{hw.title}</h3>
                                <p className="text-xs font-medium text-slate-500 mb-3">{hw.desc}</p>
                                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">By: {hw.teacher}</span>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${hw.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                        {hw.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            )}

            {activeTab === 'transport' && (
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 mt-6">
                {/* Transport & Bus Section */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
                            <Bus className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">My School Bus</h2>
                            <p className="text-xs font-medium text-slate-500">Route, driver details, and attendance</p>
                        </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-xs font-black tracking-widest uppercase shadow-sm">Active</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Bus Route Details */}
                    {hasTransport ? (
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-4">
                            <MapPin className="w-5 h-5 text-teal-500" />
                            <h3 className="font-bold text-slate-800 text-sm">Route #{transportData?.data?.route_id}: {transportData?.data?.route_name}</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-medium text-slate-500">Pickup Point:</span>
                                <span className="font-bold text-slate-800">{transportData?.data?.stop_name}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-medium text-slate-500">Pickup Time (Morning):</span>
                                <span className="font-bold text-teal-600">{transportData?.data?.pickup_time}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-medium text-slate-500">Drop Time (Afternoon):</span>
                                <span className="font-bold text-orange-600">{transportData?.data?.drop_time}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200">
                                <span className="font-medium text-slate-500">Driver Name:</span>
                                <span className="font-bold text-slate-800">{transportData?.data?.driver_name || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-medium text-slate-500">Bus No:</span>
                                <span className="font-bold text-slate-800">{transportData?.data?.bus_no || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                    ) : (
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                        <p className="text-slate-500 font-bold">You are not opted-in for school transport.</p>
                    </div>
                    )}

                    {/* Bus Attendance / Live Tracking */}
                    <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
                            <UserCheck className="w-5 h-5 text-indigo-500" />
                            <h3 className="font-bold text-slate-800 text-sm">Recent Bus Attendance</h3>
                        </div>
                        
                        <div className="grid grid-cols-5 gap-2">
                            {[].map((day, idx) => (
                                <div key={idx} className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">{day.date}</span>
                                    
                                    <div className="w-full space-y-1">
                                        <div className={`w-full py-1 text-[9px] font-black uppercase tracking-widest rounded ${day.morning === 'Present' ? 'bg-emerald-100 text-emerald-700' : day.morning === 'Absent' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-500'}`}>
                                            M: {day.morning.substring(0, 3)}
                                        </div>
                                        <div className={`w-full py-1 text-[9px] font-black uppercase tracking-widest rounded ${day.evening === 'Present' ? 'bg-emerald-100 text-emerald-700' : day.evening === 'Absent' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-500'}`}>
                                            E: {day.evening.substring(0, 3)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            )}

            {/* School Announcements Popup */}
            {/* {showPopup && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500 to-purple-600"></div>
                        <button onClick={() => setShowPopup(false)} className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-black/10 hover:bg-black/20 rounded-xl transition-colors backdrop-blur-md z-10">
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="relative pt-16 px-6 pb-6 text-center">
                            <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-5 border-4 border-white relative z-10 -mt-10">
                                <Bell className="w-10 h-10 text-indigo-500" />
                                <span className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 border-2 border-white rounded-full"></span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">School Announcement!</h3>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 text-left">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="px-2 py-1 bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-widest rounded shadow-sm">{dummyNotices[0].type}</span>
                                    <span className="text-xs font-bold text-slate-400">{dummyNotices[0].date}</span>
                                </div>
                                <h4 className="font-bold text-slate-800 text-sm mb-1">{dummyNotices[0].title}</h4>
                                <p className="text-slate-500 font-medium text-xs leading-relaxed">
                                    {dummyNotices[0].desc}
                                </p>
                            </div>
                            <button 
                                onClick={() => setShowPopup(false)}
                                className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors shadow-sm"
                            >
                                Acknowledge & Continue
                            </button>
                        </div>
                    </div>
                </div>
            )} */}
        </div>
    );
};

export default StudentDashboard;
