import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { 
    ShieldAlert, LayoutDashboard, Users, GraduationCap, Network, Banknote, BookOpen, Clock, CalendarDays, Key, Trash2, Home, HelpCircle, Tags, Users2, UserCheck, Globe, DollarSign, Layers, FileCode2, Receipt, MonitorPlay, Shield, Database, Languages, Puzzle, LogOut, Search, Bell, Settings, ChevronDown, ChevronRight, Menu, X, BookText, Building2, UserX, Star, Briefcase, CalendarCheck, FileSpreadsheet, CalendarPlus, Building, Zap, Tag, Percent, ArrowRightCircle, Book, Grid, CheckSquare, PersonStanding, Megaphone, Mail, MessageSquare, List, UploadCloud, Video, FileType, BookOpenCheck, Bus, MapPin, Truck, Map, UserMinus, Award, Settings2, CreditCard, Calendar
} from 'lucide-react';

const Layout = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [studentsMenuOpen, setStudentsMenuOpen] = useState(false);
    const [hrMenuOpen, setHrMenuOpen] = useState(false);
    const [feesMenuOpen, setFeesMenuOpen] = useState(false);
    const [academicsMenuOpen, setAcademicsMenuOpen] = useState(false);
    const [alumniMenuOpen, setAlumniMenuOpen] = useState(false);
    const [calendarMenuOpen, setCalendarMenuOpen] = useState(false);
    const [attendanceMenuOpen, setAttendanceMenuOpen] = useState(false);
    const [communicateMenuOpen, setCommunicateMenuOpen] = useState(false);
    const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
    const [examMenuOpen, setExamMenuOpen] = useState(false);
    const [transportMenuOpen, setTransportMenuOpen] = useState(false);
    const [systemMenuOpen, setSystemMenuOpen] = useState(false);

    const [permissions, setPermissions] = useState(null);

    useEffect(() => {
        if (!user) return;
        const fetchPerms = async () => {
            try {
                const response = await api.get('/auth/permissions');
                const data = response.data;
                if (data.role_permissions) {
                    setPermissions(JSON.parse(data.role_permissions));
                } else {
                    setPermissions({});
                }
            } catch (e) {
                console.error('Failed to fetch permissions', e);
            }
        };
        fetchPerms();
    }, [user]);

    const r = user?.role;
    
    // Default fallback if permissions haven't loaded or aren't set
    const defaultPerms = {
        admin: ['student_info', 'hr', 'fees', 'academics', 'alumni', 'calendar', 'attendance', 'communicate', 'download', 'exam', 'transport', 'system'],
        super_admin: ['student_info', 'hr', 'fees', 'academics', 'alumni', 'calendar', 'attendance', 'communicate', 'download', 'exam', 'transport', 'system'],
        teacher: ['student_info', 'academics', 'attendance', 'communicate', 'download', 'exam', 'calendar'],
        student: ['calendar', 'download', 'exam'],
        fee_collector: ['fees'],
        bus_staff: ['transport'],
        accountant: ['fees']
    };

    const rolePerms = permissions ? (permissions[r] || []) : (defaultPerms[r] || []);
    
    const canSeeStudentInfo = rolePerms.includes('student_info');
    const canSeeHR = rolePerms.includes('hr');
    const canSeeFees = rolePerms.includes('fees');
    const canSeeAcademics = rolePerms.includes('academics');
    const canSeeAlumni = rolePerms.includes('alumni');
    const canSeeCalendar = rolePerms.includes('calendar');
    const canSeeAttendance = rolePerms.includes('attendance');
    const canSeeCommunicate = rolePerms.includes('communicate');
    const canSeeDownload = rolePerms.includes('download');
    const canSeeExam = rolePerms.includes('exam');
    const canSeeTransport = rolePerms.includes('transport');
    const canSeeSystem = rolePerms.includes('system') || r === 'super_admin';

    if (!user) {
        navigate('/');
        return null;
    }

    const isActive = (path) => location.pathname === path;

    const studentLinks = [
        { path: '/student/details', label: 'Student Details', icon: <Users className="w-4 h-4" /> },
        { path: '/student/admission', label: 'Student Admission', icon: <UserCheck className="w-4 h-4" /> },
        { path: '/student/online-admission', label: 'Online Admission', icon: <Globe className="w-4 h-4" /> },
        { path: '/student/disabled', label: 'Disabled Students', icon: <UserMinus className="w-4 h-4" /> },
        { path: '/student/multi-class', label: 'Multi Class Student', icon: <Users2 className="w-4 h-4" /> },
        { path: '/student/bulk-delete', label: 'Bulk Delete', icon: <Trash2 className="w-4 h-4" /> },
        { path: '/student/categories', label: 'Student Categories', icon: <Tags className="w-4 h-4" /> },
        { path: '/student/house', label: 'Student House', icon: <Home className="w-4 h-4" /> },
        { path: '/student/disable-reason', label: 'Disable Reason', icon: <HelpCircle className="w-4 h-4" /> },
    ];

    const hrLinks = [
        { path: '/hr/staff-directory', label: 'Staff Directory', icon: <Building2 className="w-4 h-4" /> },
        { path: '/hr/staff-attendance', label: 'Staff Attendance', icon: <CalendarCheck className="w-4 h-4" /> },
        { path: '/hr/payroll', label: 'Payroll', icon: <FileSpreadsheet className="w-4 h-4" /> },
        { path: '/hr/approve-leave-request', label: 'Approve Leave Request', icon: <CalendarPlus className="w-4 h-4" /> },
        { path: '/hr/apply-leave', label: 'Apply Leave', icon: <CalendarPlus className="w-4 h-4" /> },
        { path: '/hr/leave-type', label: 'Leave Type', icon: <Tags className="w-4 h-4" /> },
        { path: '/hr/teachers-rating', label: 'Teachers Rating', icon: <Star className="w-4 h-4" /> },
        { path: '/hr/department', label: 'Department', icon: <Building className="w-4 h-4" /> },
        { path: '/hr/designation', label: 'Designation', icon: <Briefcase className="w-4 h-4" /> },
        { path: '/hr/disabled-staff', label: 'Disabled Staff', icon: <UserX className="w-4 h-4" /> },
    ];

    const feesLinks = [
        { path: '/fees/collect', label: 'Collect Fees', icon: <CreditCard className="w-4 h-4" /> },
        { path: '/fees/sheet', label: 'Class Fee Sheet', icon: <FileSpreadsheet className="w-4 h-4" /> },
        { path: '/fees/offline-bank', label: 'Offline Bank Payments', icon: <Building className="w-4 h-4" /> },
        { path: '/fees/search-payment', label: 'Search Fees Payment', icon: <Search className="w-4 h-4" /> },
        { path: '/fees/search-due', label: 'Search Due Fees', icon: <Search className="w-4 h-4" /> },
        { path: '/fees/master', label: 'Fees Master', icon: <Settings2 className="w-4 h-4" /> },
        { path: '/fees/quick', label: 'Quick Fees', icon: <Zap className="w-4 h-4" /> },
        { path: '/fees/group', label: 'Fees Group', icon: <Layers className="w-4 h-4" /> },
        { path: '/fees/type', label: 'Fees Type', icon: <Tag className="w-4 h-4" /> },
        { path: '/fees/discount', label: 'Fees Discount', icon: <Percent className="w-4 h-4" /> },
        { path: '/fees/carry-forward', label: 'Fees Carry Forward', icon: <ArrowRightCircle className="w-4 h-4" /> },
        { path: '/fees/reminder', label: 'Fees Reminder', icon: <Bell className="w-4 h-4" /> },
    ];

    const academicsLinks = [
        { path: '/academics/class-timetable', label: 'Class Timetable', icon: <Clock className="w-4 h-4" /> },
        { path: '/academics/teachers-timetable', label: 'Teachers Timetable', icon: <Clock className="w-4 h-4" /> },
        { path: '/academics/assign-teacher', label: 'Assign Class Teacher', icon: <UserCheck className="w-4 h-4" /> },
        { path: '/academics/promote', label: 'Promote Students', icon: <ArrowRightCircle className="w-4 h-4" /> },
        { path: '/academics/subject-group', label: 'Subject Group', icon: <Layers className="w-4 h-4" /> },
        { path: '/academics/subjects', label: 'Subjects', icon: <Book className="w-4 h-4" /> },
        { path: '/academics/class', label: 'Class', icon: <Building className="w-4 h-4" /> },
        { path: '/academics/sections', label: 'Sections', icon: <Grid className="w-4 h-4" /> },
    ];

    const alumniLinks = [
        { path: '/alumni/manage', label: 'Manage Alumni', icon: <Users2 className="w-4 h-4" /> },
        { path: '/alumni/events', label: 'Events', icon: <CalendarDays className="w-4 h-4" /> },
    ];

    const calendarLinks = [
        { path: '/calendar/annual', label: 'Annual Calendar', icon: <Calendar className="w-4 h-4" /> },
        { path: '/calendar/holiday-type', label: 'Holiday Type', icon: <Tag className="w-4 h-4" /> },
    ];

    const attendanceLinks = [
        { path: '/attendance/student', label: 'Student Attendance', icon: <CheckSquare className="w-4 h-4" /> },
        { path: '/attendance/approve-leave', label: 'Approve Leave', icon: <CalendarPlus className="w-4 h-4" /> },
        { path: '/attendance/by-date', label: 'Attendance By Date', icon: <CalendarDays className="w-4 h-4" /> },
    ];

    const communicateLinks = [
        { path: '/communicate/notice-board', label: 'Notice Board', icon: <List className="w-4 h-4" /> },
        { path: '/communicate/send-email', label: 'Send Email', icon: <Mail className="w-4 h-4" /> },
        { path: '/communicate/send-sms', label: 'Send SMS', icon: <MessageSquare className="w-4 h-4" /> },
        { path: '/communicate/log', label: 'Email / SMS Log', icon: <List className="w-4 h-4" /> },
        { path: '/communicate/schedule-log', label: 'Schedule Email SMS Log', icon: <Clock className="w-4 h-4" /> },
        { path: '/communicate/login-credentials', label: 'Login Credentials Send', icon: <Shield className="w-4 h-4" /> },
        { path: '/communicate/email-template', label: 'Email Template', icon: <FileCode2 className="w-4 h-4" /> },
        { path: '/communicate/sms-template', label: 'SMS Template', icon: <FileCode2 className="w-4 h-4" /> },
    ];

    const downloadLinks = [
        { path: '/download/upload', label: 'Upload/Share Content', icon: <UploadCloud className="w-4 h-4" /> },
        { path: '/download/share-list', label: 'Content Share List', icon: <List className="w-4 h-4" /> },
        { path: '/download/video-tutorial', label: 'Video Tutorial', icon: <Video className="w-4 h-4" /> },
        { path: '/download/content-type', label: 'Content Type', icon: <FileType className="w-4 h-4" /> },
    ];

    const examLinks = [
        { path: '/examinations/group', label: 'Exam Group', icon: <Layers className="w-4 h-4" /> },
        { path: '/examinations/schedule', label: 'Exam Schedule', icon: <CalendarDays className="w-4 h-4" /> },
        { path: '/examinations/result', label: 'Exam Result', icon: <BookOpenCheck className="w-4 h-4" /> },
    ];

    const transportLinks = [
        { path: '/transport/fees-master', label: 'Fees Master', icon: <Settings2 className="w-4 h-4" /> },
        { path: '/transport/pickup-point', label: 'Pickup Point', icon: <MapPin className="w-4 h-4" /> },
        { path: '/transport/routes', label: 'Routes', icon: <Map className="w-4 h-4" /> },
        { path: '/transport/vehicles', label: 'Vehicles', icon: <Truck className="w-4 h-4" /> },
        { path: '/transport/assign-vehicle', label: 'Assign Vehicle', icon: <Bus className="w-4 h-4" /> },
        { path: '/transport/route-pickup', label: 'Route Pickup Point', icon: <MapPin className="w-4 h-4" /> },
        { path: '/transport/student-transport', label: 'Student Transport', icon: <Users className="w-4 h-4" /> },
        { path: '/transport/student-fees', label: 'Student Transport Fees', icon: <Banknote className="w-4 h-4" /> },
    ];

    const systemLinks = [
        { path: '/settings/general', label: 'General Setting', icon: <Settings2 className="w-4 h-4" /> },
        { path: '/settings/session', label: 'Session Setting', icon: <Clock className="w-4 h-4" /> },
        { path: '/settings/notification', label: 'Notification Setting', icon: <Bell className="w-4 h-4" /> },
        { path: '/settings/whatsapp', label: 'Whatsapp Messaging', icon: <MessageSquare className="w-4 h-4" /> },
        { path: '/settings/sms', label: 'SMS Setting', icon: <MessageSquare className="w-4 h-4" /> },
        { path: '/settings', label: 'Email Setting', icon: <Mail className="w-4 h-4" /> }, // Points to existing settings
        { path: '/settings/payment-methods', label: 'Payment Methods', icon: <CreditCard className="w-4 h-4" /> },
        { path: '/settings/print-header', label: 'Print Header Footer', icon: <FileCode2 className="w-4 h-4" /> },
        { path: '/settings/thermal-print', label: 'Thermal Print', icon: <Receipt className="w-4 h-4" /> },
        { path: '/settings/front-cms', label: 'Front CMS Setting', icon: <MonitorPlay className="w-4 h-4" /> },
        { path: '/settings/roles', label: 'Roles Permissions', icon: <Shield className="w-4 h-4" /> },
        { path: '/settings/backup', label: 'Backup Restore', icon: <Database className="w-4 h-4" /> },
        { path: '/settings/languages', label: 'Languages', icon: <Languages className="w-4 h-4" /> },
        { path: '/settings/currency', label: 'Currency', icon: <DollarSign className="w-4 h-4" /> },
        { path: '/settings/addons', label: 'Addons', icon: <Puzzle className="w-4 h-4" /> },
        { path: '/settings/users', label: 'Users', icon: <Users className="w-4 h-4" /> },
        { path: '/settings/modules', label: 'Modules', icon: <Layers className="w-4 h-4" /> },
        { path: '/settings/custom-fields', label: 'Custom Fields', icon: <FileCode2 className="w-4 h-4" /> },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 bg-white border-r border-slate-200 w-64 transition-transform transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:block z-20 flex flex-col`}>
                <div className="h-16 flex items-center gap-2 px-6 border-b border-slate-200">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ShieldAlert className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-xl text-slate-900 tracking-tight truncate">Thoms ERP</span>
                </div>
                
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
                    {user.role === 'super_admin' && (
                        <Link 
                            to="/dashboard" 
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive('/dashboard') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                            <LayoutDashboard className="w-5 h-5" />
                            Dashboard
                        </Link>
                    )}
                    {user.role === 'student' && (
                        <div className="space-y-1">
                            <Link 
                                to="/student-dashboard" 
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive('/student-dashboard') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                                <LayoutDashboard className="w-5 h-5" />
                                My Portal
                            </Link>
                            <Link 
                                to="/student/fees" 
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive('/student/fees') ? 'bg-amber-50 text-amber-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                                <Banknote className="w-5 h-5 text-amber-500" />
                                Fee Structure
                            </Link>
                            <Link 
                                to="/student/attendance" 
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive('/student/attendance') ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                                <CalendarDays className="w-5 h-5 text-sky-500" />
                                Attendance
                            </Link>
                            <Link 
                                to="/student/results" 
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive('/student/results') ? 'bg-fuchsia-50 text-fuchsia-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                                <Award className="w-5 h-5 text-fuchsia-500" />
                                Results
                            </Link>
                            <Link 
                                to="/student/calendar" 
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive('/student/calendar') ? 'bg-orange-50 text-orange-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                                <BookOpen className="w-5 h-5 text-orange-500" />
                                Calendar
                            </Link>
                            <Link 
                                to="/student/homework" 
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive('/student/homework') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                                <BookText className="w-5 h-5 text-indigo-500" />
                                Homework
                            </Link>
                            <Link 
                                to="/student/transport" 
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive('/student/transport') ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                                <Bus className="w-5 h-5 text-teal-500" />
                                Transport
                            </Link>
                            <Link 
                                to="/student/timetable" 
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive('/student/timetable') ? 'bg-amber-50 text-amber-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                                <CalendarDays className="w-5 h-5 text-amber-500" />
                                Timetable
                            </Link>
                            <Link 
                                to="/student/notices" 
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive('/student/notices') ? 'bg-rose-50 text-rose-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                                <Bell className="w-5 h-5 text-rose-500" />
                                Notice Board
                            </Link>
                            <Link 
                                to="/student/settings" 
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive('/student/settings') ? 'bg-slate-200 text-slate-800' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                                <Key className="w-5 h-5 text-slate-400" />
                                Security Settings
                            </Link>
                        </div>
                    )}

                    {/* Student Information Menu */}
                    {canSeeStudentInfo && (
                        <div className="pt-2">
                        <button 
                            onClick={() => setStudentsMenuOpen(!studentsMenuOpen)}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <GraduationCap className="w-5 h-5 text-indigo-600" />
                                <span>Student Information</span>
                            </div>
                            {studentsMenuOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        </button>
                        
                        {studentsMenuOpen && (
                            <div className="mt-1 ml-4 pl-4 border-l border-slate-200 space-y-1">
                                {studentLinks.map((link) => (
                                    <Link 
                                        key={link.path}
                                        to={link.path}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive(link.path) ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'}`}
                                    >
                                        <span className={isActive(link.path) ? 'text-indigo-600' : 'text-slate-400'}>
                                            {link.icon}
                                        </span>
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                    )}

                    {/* Human Resource Menu */}
                    {canSeeHR && (
                        <div className="pt-2">
                        <button 
                            onClick={() => setHrMenuOpen(!hrMenuOpen)}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Network className="w-5 h-5 text-emerald-600" />
                                <span>Human Resource</span>
                            </div>
                            {hrMenuOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        </button>
                        
                        {hrMenuOpen && (
                            <div className="mt-1 ml-4 pl-4 border-l border-slate-200 space-y-1">
                                {hrLinks.map((link) => (
                                    <Link 
                                        key={link.path}
                                        to={link.path}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive(link.path) ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'}`}
                                    >
                                        <span className={isActive(link.path) ? 'text-emerald-600' : 'text-slate-400'}>
                                            {link.icon}
                                        </span>
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                    )}

                    {/* Fees Collection Menu */}
                    {canSeeFees && (
                        <div className="pt-2">
                        <button 
                            onClick={() => setFeesMenuOpen(!feesMenuOpen)}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Banknote className="w-5 h-5 text-amber-600" />
                                <span>Fees Collection</span>
                            </div>
                            {feesMenuOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        </button>
                        
                        {feesMenuOpen && (
                            <div className="mt-1 ml-4 pl-4 border-l border-slate-200 space-y-1">
                                {feesLinks.map((link) => (
                                    <Link 
                                        key={link.path}
                                        to={link.path}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive(link.path) ? 'bg-amber-50 text-amber-700 font-medium' : 'text-slate-600 hover:text-amber-600 hover:bg-slate-50'}`}
                                    >
                                        <span className={isActive(link.path) ? 'text-amber-600' : 'text-slate-400'}>
                                            {link.icon}
                                        </span>
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                    )}

                    {/* Academics Menu */}
                    {canSeeAcademics && (
                        <div className="pt-2">
                        <button 
                            onClick={() => setAcademicsMenuOpen(!academicsMenuOpen)}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <BookOpen className="w-5 h-5 text-sky-600" />
                                <span>Academics</span>
                            </div>
                            {academicsMenuOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        </button>
                        
                        {academicsMenuOpen && (
                            <div className="mt-1 ml-4 pl-4 border-l border-slate-200 space-y-1">
                                {academicsLinks.map((link) => (
                                    <Link 
                                        key={link.path}
                                        to={link.path}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive(link.path) ? 'bg-sky-50 text-sky-700 font-medium' : 'text-slate-600 hover:text-sky-600 hover:bg-slate-50'}`}
                                    >
                                        <span className={isActive(link.path) ? 'text-sky-600' : 'text-slate-400'}>
                                            {link.icon}
                                        </span>
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                    )}

                    {/* Alumni Menu */}
                    {canSeeAlumni && (
                        <div className="pt-2">
                        <button 
                            onClick={() => setAlumniMenuOpen(!alumniMenuOpen)}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <PersonStanding className="w-5 h-5 text-rose-600" />
                                <span>Alumni</span>
                            </div>
                            {alumniMenuOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        </button>
                        
                        {alumniMenuOpen && (
                            <div className="mt-1 ml-4 pl-4 border-l border-slate-200 space-y-1">
                                {alumniLinks.map((link) => (
                                    <Link 
                                        key={link.path}
                                        to={link.path}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive(link.path) ? 'bg-rose-50 text-rose-700 font-medium' : 'text-slate-600 hover:text-rose-600 hover:bg-slate-50'}`}
                                    >
                                        <span className={isActive(link.path) ? 'text-rose-600' : 'text-slate-400'}>
                                            {link.icon}
                                        </span>
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                    )}

                    {/* Annual Calendar Menu */}
                    {canSeeCalendar && (
                        <div className="pt-2">
                        <button 
                            onClick={() => setCalendarMenuOpen(!calendarMenuOpen)}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-fuchsia-600" />
                                <span>Annual Calendar</span>
                            </div>
                            {calendarMenuOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        </button>
                        
                        {calendarMenuOpen && (
                            <div className="mt-1 ml-4 pl-4 border-l border-slate-200 space-y-1">
                                {calendarLinks.map((link) => (
                                    <Link 
                                        key={link.path}
                                        to={link.path}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive(link.path) ? 'bg-fuchsia-50 text-fuchsia-700 font-medium' : 'text-slate-600 hover:text-fuchsia-600 hover:bg-slate-50'}`}
                                    >
                                        <span className={isActive(link.path) ? 'text-fuchsia-600' : 'text-slate-400'}>
                                            {link.icon}
                                        </span>
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                    )}

                    {/* Attendance Menu */}
                    {canSeeAttendance && (
                        <div className="pt-2">
                        <button 
                            onClick={() => setAttendanceMenuOpen(!attendanceMenuOpen)}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <CheckSquare className="w-5 h-5 text-teal-600" />
                                <span>Attendance</span>
                            </div>
                            {attendanceMenuOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        </button>
                        
                        {attendanceMenuOpen && (
                            <div className="mt-1 ml-4 pl-4 border-l border-slate-200 space-y-1">
                                {attendanceLinks.map((link) => (
                                    <Link 
                                        key={link.path}
                                        to={link.path}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive(link.path) ? 'bg-teal-50 text-teal-700 font-medium' : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'}`}
                                    >
                                        <span className={isActive(link.path) ? 'text-teal-600' : 'text-slate-400'}>
                                            {link.icon}
                                        </span>
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                    )}

                    {/* Communicate Menu */}
                    {canSeeCommunicate && (
                        <div className="pt-2">
                        <button 
                            onClick={() => setCommunicateMenuOpen(!communicateMenuOpen)}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Megaphone className="w-5 h-5 text-purple-600" />
                                <span>Communicate</span>
                            </div>
                            {communicateMenuOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        </button>
                        
                        {communicateMenuOpen && (
                            <div className="mt-1 ml-4 pl-4 border-l border-slate-200 space-y-1">
                                {communicateLinks.map((link) => (
                                    <Link 
                                        key={link.path}
                                        to={link.path}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive(link.path) ? 'bg-purple-50 text-purple-700 font-medium' : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'}`}
                                    >
                                        <span className={isActive(link.path) ? 'text-purple-600' : 'text-slate-400'}>
                                            {link.icon}
                                        </span>
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                    )}

                    {/* Download Center Menu */}
                    {canSeeDownload && (
                        <div className="pt-2">
                        <button 
                            onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <UploadCloud className="w-5 h-5 text-cyan-600" />
                                <span>Download Center</span>
                            </div>
                            {downloadMenuOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        </button>
                        
                        {downloadMenuOpen && (
                            <div className="mt-1 ml-4 pl-4 border-l border-slate-200 space-y-1">
                                {downloadLinks.map((link) => (
                                    <Link 
                                        key={link.path}
                                        to={link.path}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive(link.path) ? 'bg-cyan-50 text-cyan-700 font-medium' : 'text-slate-600 hover:text-cyan-600 hover:bg-slate-50'}`}
                                    >
                                        <span className={isActive(link.path) ? 'text-cyan-600' : 'text-slate-400'}>
                                            {link.icon}
                                        </span>
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                    )}

                    {/* Examinations Menu */}
                    {canSeeExam && (
                        <div className="pt-2">
                        <button 
                            onClick={() => setExamMenuOpen(!examMenuOpen)}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <BookOpenCheck className="w-5 h-5 text-orange-600" />
                                <span>Examinations</span>
                            </div>
                            {examMenuOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        </button>
                        
                        {examMenuOpen && (
                            <div className="mt-1 ml-4 pl-4 border-l border-slate-200 space-y-1">
                                {examLinks.map((link) => (
                                    <Link 
                                        key={link.path}
                                        to={link.path}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive(link.path) ? 'bg-orange-50 text-orange-700 font-medium' : 'text-slate-600 hover:text-orange-600 hover:bg-slate-50'}`}
                                    >
                                        <span className={isActive(link.path) ? 'text-orange-600' : 'text-slate-400'}>
                                            {link.icon}
                                        </span>
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                    )}

                    {/* Transport Menu */}
                    {canSeeTransport && (
                        <div className="pt-2">
                        <button 
                            onClick={() => setTransportMenuOpen(!transportMenuOpen)}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Bus className="w-5 h-5 text-yellow-600" />
                                <span>Transport</span>
                            </div>
                            {transportMenuOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        </button>
                        
                        {transportMenuOpen && (
                            <div className="mt-1 ml-4 pl-4 border-l border-slate-200 space-y-1">
                                {transportLinks.map((link) => (
                                    <Link 
                                        key={link.path}
                                        to={link.path}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive(link.path) ? 'bg-yellow-50 text-yellow-700 font-medium' : 'text-slate-600 hover:text-yellow-600 hover:bg-slate-50'}`}
                                    >
                                        <span className={isActive(link.path) ? 'text-yellow-600' : 'text-slate-400'}>
                                            {link.icon}
                                        </span>
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                    )}

                    {/* System Setting Menu */}
                    {canSeeSystem && (
                        <div className="pt-2 pb-4 border-b border-slate-100">
                            <button 
                                onClick={() => setSystemMenuOpen(!systemMenuOpen)}
                                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Settings className="w-5 h-5 text-slate-600" />
                                    <span>System Setting</span>
                                </div>
                                {systemMenuOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                            </button>
                            
                            {systemMenuOpen && (
                                <div className="mt-1 ml-4 pl-4 border-l border-slate-200 space-y-1">
                                    {systemLinks.map((link) => (
                                        <Link 
                                            key={link.path}
                                            to={link.path}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive(link.path) ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                                        >
                                            <span className={isActive(link.path) ? 'text-slate-900' : 'text-slate-400'}>
                                                {link.icon}
                                            </span>
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </aside>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 z-10 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10">
                    <button 
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    
                    <div className="flex-1 max-w-xl px-4 hidden md:flex">
                        <div className="relative w-full group">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Global search for students, staff, or settings..." 
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors hidden sm:block">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                        </button>
                        
                        <div className="hidden md:flex items-center gap-3 border-l border-slate-200 pl-4 ml-2">
                            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                                {user.email.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col text-left mr-2">
                                <span className="text-sm font-bold text-slate-900">{user.email.split('@')[0]}</span>
                                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">{user.role.replace('_', ' ')}</span>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => { logout(); navigate('/'); }} 
                            className="flex items-center justify-center w-10 h-10 text-slate-400 hover:text-white hover:bg-red-500 rounded-xl transition-all hover:shadow-lg hover:shadow-red-500/20"
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
