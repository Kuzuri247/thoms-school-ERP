import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  GraduationCap,
  CalendarCheck,
  AlertTriangle,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  Plus,
  CheckCircle2,
  X,
  Award,
  BookOpen,
  MessageSquare,
  Eye,
  ShieldAlert
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

// Mock Comprehensive Student Master Records
const INITIAL_STUDENTS = [
  {
    id: 'STU-1001',
    rollNo: '1001',
    name: 'Aarav Sharma',
    class: 'Class 10',
    section: 'A',
    gender: 'Male',
    dob: '2010-05-14',
    bloodGroup: 'O+',
    fatherName: 'Rajesh Sharma',
    motherName: 'Sunita Sharma',
    phone: '+91 98765 12345',
    email: 'aarav.sharma@example.com',
    address: '45-B Green Avenue, Civil Lines',
    admissionDate: '2020-04-10',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    classTeacher: 'Mrs. Sunita Verma',

    // Detailed Attendance
    attendance: {
      totalWorkingDays: 180,
      daysPresent: 172,
      daysAbsent: 8,
      percentage: '95.5%',
      monthlySummary: [
        { month: 'April', present: 22, total: 22 },
        { month: 'May', present: 20, total: 20 },
        { month: 'July', present: 24, total: 25 },
        { month: 'August', present: 21, total: 23 },
        { month: 'September', present: 22, total: 22 },
        { month: 'October', present: 20, total: 22 },
        { month: 'November', present: 22, total: 23 },
        { month: 'December', present: 21, total: 23 }
      ]
    },

    // Complaints & Remarks by Teacher
    teacherComplaints: [
      {
        id: 1,
        date: '2026-02-02',
        teacherName: 'Mr. Vikram Singh (Physics)',
        category: 'Discipline',
        severity: 'Medium',
        remark: 'Student was caught using mobile device during laboratory experiment session.',
        status: 'Action Taken'
      },
      {
        id: 2,
        date: '2026-01-18',
        teacherName: 'Mrs. Sunita Verma (Maths)',
        category: 'Homework Non-Submission',
        severity: 'Low',
        remark: 'Failed to submit Mathematics Assignment #4 on time.',
        status: 'Resolved'
      }
    ],

    // Exam Summary
    academicMarks: {
      term: 'Mid-Term 2026',
      totalScore: '462 / 500',
      percentage: '92.4%',
      grade: 'A+'
    }
  },
  {
    id: 'STU-1002',
    rollNo: '1002',
    name: 'Ananya Verma',
    class: 'Class 10',
    section: 'A',
    gender: 'Female',
    dob: '2010-08-22',
    bloodGroup: 'B+',
    fatherName: 'Ramesh Verma',
    motherName: 'Anita Verma',
    phone: '+91 98765 67890',
    email: 'ananya.verma@example.com',
    address: '88 Urban Estate Phase 1',
    admissionDate: '2021-04-12',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    classTeacher: 'Mrs. Sunita Verma',

    attendance: {
      totalWorkingDays: 180,
      daysPresent: 178,
      daysAbsent: 2,
      percentage: '98.8%',
      monthlySummary: [
        { month: 'April', present: 22, total: 22 },
        { month: 'May', present: 20, total: 20 },
        { month: 'July', present: 25, total: 25 },
        { month: 'August', present: 23, total: 23 },
        { month: 'September', present: 22, total: 22 }
      ]
    },

    teacherComplaints: [],

    academicMarks: {
      term: 'Mid-Term 2026',
      totalScore: '478 / 500',
      percentage: '95.6%',
      grade: 'A+'
    }
  },
  {
    id: 'STU-9001',
    rollNo: '9001',
    name: 'Rohan Gupta',
    class: 'Class 9',
    section: 'B',
    gender: 'Male',
    dob: '2011-03-10',
    bloodGroup: 'A+',
    fatherName: 'Sanjay Gupta',
    motherName: 'Meena Gupta',
    phone: '+91 98765 44444',
    email: 'rohan.gupta@example.com',
    address: '12 Model Town Main Market',
    admissionDate: '2022-04-05',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    classTeacher: 'Mr. Vikram Singh',

    attendance: {
      totalWorkingDays: 180,
      daysPresent: 152,
      daysAbsent: 28,
      percentage: '84.4%',
      monthlySummary: [
        { month: 'April', present: 18, total: 22 },
        { month: 'May', present: 16, total: 20 },
        { month: 'July', present: 20, total: 25 }
      ]
    },

    teacherComplaints: [
      {
        id: 3,
        date: '2026-02-05',
        teacherName: 'Mr. Vikram Singh',
        category: 'Frequent Late Arrival',
        severity: 'Medium',
        remark: 'Student consistently arrives 20 minutes late for 1st period class.',
        status: 'Open'
      }
    ],

    academicMarks: {
      term: 'Mid-Term 2026',
      totalScore: '380 / 500',
      percentage: '76.0%',
      grade: 'B+'
    }
  }
];

const StudentInformationView = () => {
  const { user } = useAuthStore();
  const [students, setStudents] = useState(INITIAL_STUDENTS);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');

  // Selected Student Profile Modal State
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [profileModalTab, setProfileModalTab] = useState('overview'); // 'overview', 'attendance', 'complaints', 'academics'

  // File New Complaint Modal State
  const [showAddComplaintModal, setShowAddComplaintModal] = useState(false);
  const [newComplaint, setNewComplaint] = useState({
    category: 'Discipline',
    severity: 'Medium',
    remark: ''
  });

  const [notificationMsg, setNotificationMsg] = useState('');

  // Filtered Students
  const filteredStudents = students.filter(st => {
    const matchesSearch =
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.rollNo.includes(searchQuery) ||
      st.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.fatherName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClass = selectedClass === 'All' || st.class === selectedClass;
    const matchesSection = selectedSection === 'All' || st.section === selectedSection;

    return matchesSearch && matchesClass && matchesSection;
  });

  // File Complaint Handler
  const handleAddComplaintSubmit = (e) => {
    e.preventDefault();
    if (!selectedStudent || !newComplaint.remark) return;

    const complaintObj = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      teacherName: user?.full_name || 'Staff Member',
      category: newComplaint.category,
      severity: newComplaint.severity,
      remark: newComplaint.remark,
      status: 'Open'
    };

    const updatedList = students.map(st => {
      if (st.id === selectedStudent.id) {
        return {
          ...st,
          teacherComplaints: [complaintObj, ...st.teacherComplaints]
        };
      }
      return st;
    });

    setStudents(updatedList);
    setSelectedStudent({
      ...selectedStudent,
      teacherComplaints: [complaintObj, ...selectedStudent.teacherComplaints]
    });

    setShowAddComplaintModal(false);
    setNewComplaint({ category: 'Discipline', severity: 'Medium', remark: '' });
    setNotificationMsg(`Teacher remark/complaint recorded for ${selectedStudent.name}!`);
    setTimeout(() => setNotificationMsg(''), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/80 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Users className="w-6 h-6" />
            </div>
            Student 360° Information Directory
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Class-wise student search, guardian details, month-wise attendance logs, and teacher complaint histories.
          </p>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          {notificationMsg}
        </div>
      )}

      {/* Control Bar: Class, Section & Name Filters */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by Name, Roll No, Father..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 outline-none focus:border-indigo-500"
            />
          </div>

          {/* Class Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500">Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 outline-none"
            >
              <option value="All">All Classes</option>
              <option value="Class 8">Class 8</option>
              <option value="Class 9">Class 9</option>
              <option value="Class 10">Class 10</option>
              <option value="Class 11">Class 11</option>
              <option value="Class 12">Class 12</option>
            </select>
          </div>

          {/* Section Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500">Section:</span>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 outline-none"
            >
              <option value="All">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>
        </div>

        <span className="text-xs font-black text-slate-500">
          Showing {filteredStudents.length} Students
        </span>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((st) => (
          <div
            key={st.id}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-4 hover:border-indigo-300 transition"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <img src={st.avatar} alt={st.name} className="w-12 h-12 rounded-2xl object-cover border border-slate-200" />
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">{st.name}</h3>
                  <span className="text-[11px] font-bold text-slate-500">
                    Roll No: <span className="text-slate-800 font-mono">{st.rollNo}</span> • {st.class} ({st.section})
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-black text-[10px] rounded-lg border border-indigo-100">
                {st.id}
              </span>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
              <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Attendance Rate</span>
                <span className="text-xs font-black text-emerald-600">{st.attendance.percentage}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Teacher Remarks</span>
                <span className={`text-xs font-black ${st.teacherComplaints.length > 0 ? 'text-amber-600' : 'text-slate-600'}`}>
                  {st.teacherComplaints.length} Logged
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Father: <strong>{st.fatherName}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono text-slate-700">{st.phone}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedStudent(st);
                setProfileModalTab('overview');
              }}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4" /> View Full 360° Profile
            </button>
          </div>
        ))}
      </div>

      {/* --- COMPREHENSIVE STUDENT PROFILE MODAL --- */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-5 border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div className="flex items-center gap-4">
                <img src={selectedStudent.avatar} alt={selectedStudent.name} className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-xs" />
                <div>
                  <h2 className="text-lg font-black text-slate-900">{selectedStudent.name}</h2>
                  <p className="text-xs text-slate-500 font-bold">
                    Roll No: <span className="text-indigo-600 font-mono">{selectedStudent.rollNo}</span> • {selectedStudent.class} ({selectedStudent.section}) • ID: {selectedStudent.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Navigation Tabs */}
            <div className="flex border-b border-slate-200 gap-6 text-xs font-extrabold">
              <button
                onClick={() => setProfileModalTab('overview')}
                className={`pb-2 border-b-2 cursor-pointer ${profileModalTab === 'overview' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                Personal & Guardian Info
              </button>
              <button
                onClick={() => setProfileModalTab('attendance')}
                className={`pb-2 border-b-2 cursor-pointer ${profileModalTab === 'attendance' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                Attendance Detailed Log ({selectedStudent.attendance.percentage})
              </button>
              <button
                onClick={() => setProfileModalTab('complaints')}
                className={`pb-2 border-b-2 cursor-pointer ${profileModalTab === 'complaints' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                Teacher Complaints & Remarks ({selectedStudent.teacherComplaints.length})
              </button>
            </div>

            {/* TAB 1: OVERVIEW & GUARDIAN */}
            {profileModalTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-700 animate-in fade-in">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <h3 className="font-black text-slate-900 uppercase text-[10px] tracking-wider text-indigo-600">Student Particulars</h3>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Gender</span>
                    <span className="font-bold text-slate-900">{selectedStudent.gender}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Date of Birth</span>
                    <span className="font-bold text-slate-900">{selectedStudent.dob}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Blood Group</span>
                    <span className="font-bold text-slate-900">{selectedStudent.bloodGroup}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Admission Date</span>
                    <span className="font-bold text-slate-900">{selectedStudent.admissionDate}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <h3 className="font-black text-slate-900 uppercase text-[10px] tracking-wider text-indigo-600">Guardian & Contact Details</h3>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Father's Name</span>
                    <span className="font-bold text-slate-900">{selectedStudent.fatherName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Mother's Name</span>
                    <span className="font-bold text-slate-900">{selectedStudent.motherName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Emergency Phone</span>
                    <span className="font-bold font-mono text-indigo-700">{selectedStudent.phone}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Residential Address</span>
                    <span className="font-bold text-slate-900 text-right">{selectedStudent.address}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DETAILED ATTENDANCE */}
            {profileModalTab === 'attendance' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase block">Total Present</span>
                    <span className="text-lg font-black text-emerald-800">{selectedStudent.attendance.daysPresent} Days</span>
                  </div>
                  <div className="p-3 bg-red-50 rounded-2xl border border-red-200">
                    <span className="text-[10px] font-bold text-red-700 uppercase block">Total Absent</span>
                    <span className="text-lg font-black text-red-800">{selectedStudent.attendance.daysAbsent} Days</span>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-200">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase block">Overall Attendance</span>
                    <span className="text-lg font-black text-indigo-800">{selectedStudent.attendance.percentage}</span>
                  </div>
                </div>

                <h3 className="text-xs font-black text-slate-900 uppercase">Month-by-Month Attendance Breakdown</h3>
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-4">Month</th>
                        <th className="py-2.5 px-4">Days Present</th>
                        <th className="py-2.5 px-4">Total Working Days</th>
                        <th className="py-2.5 px-4 text-right">Monthly % Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white font-semibold">
                      {selectedStudent.attendance.monthlySummary.map((m, idx) => {
                        const pct = ((m.present / m.total) * 100).toFixed(1);
                        return (
                          <tr key={idx}>
                            <td className="py-2.5 px-4 font-bold text-slate-900">{m.month}</td>
                            <td className="py-2.5 px-4 text-emerald-700 font-black">{m.present} Days</td>
                            <td className="py-2.5 px-4 text-slate-600">{m.total} Days</td>
                            <td className="py-2.5 px-4 text-right font-black text-indigo-700">{pct}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: TEACHER COMPLAINTS & REMARKS */}
            {profileModalTab === 'complaints' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black text-slate-900 uppercase">Teacher Feedback & Discipline Log</h3>
                  <button
                    onClick={() => setShowAddComplaintModal(true)}
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> File Teacher Complaint / Remark
                  </button>
                </div>

                {selectedStudent.teacherComplaints.length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs font-bold text-slate-500 border border-slate-200">
                    No disciplinary complaints or negative teacher remarks recorded for {selectedStudent.name}.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedStudent.teacherComplaints.map((c) => (
                      <div key={c.id} className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-xs text-slate-900 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-amber-500" /> {c.category}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{c.date}</span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          "{c.remark}"
                        </p>
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 pt-1">
                          <span>Reported By: <strong>{c.teacherName}</strong></span>
                          <span className={`px-2 py-0.5 rounded ${c.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            Status: {c.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: File Teacher Complaint */}
      {showAddComplaintModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" /> Record Teacher Complaint / Disciplinary Remark
              </h3>
              <button onClick={() => setShowAddComplaintModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddComplaintSubmit} className="space-y-3 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1">Complaint Category *</label>
                <select
                  value={newComplaint.category}
                  onChange={(e) => setNewComplaint({ ...newComplaint, category: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                >
                  <option value="Discipline">Discipline Violation</option>
                  <option value="Homework Non-Submission">Homework Non-Submission</option>
                  <option value="Frequent Late Arrival">Frequent Late Arrival</option>
                  <option value="Academic Misconduct">Academic Misconduct</option>
                  <option value="Classroom Disruption">Classroom Disruption</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">Severity Level</label>
                <select
                  value={newComplaint.severity}
                  onChange={(e) => setNewComplaint({ ...newComplaint, severity: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                >
                  <option value="Low">Low (Informational)</option>
                  <option value="Medium">Medium (Requires Warning)</option>
                  <option value="High">High (Parent Escalation)</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">Detailed Teacher Remark / Observation *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe the incident or observation..."
                  value={newComplaint.remark}
                  onChange={(e) => setNewComplaint({ ...newComplaint, remark: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddComplaintModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 text-white font-extrabold rounded-xl hover:bg-red-700 transition shadow-md cursor-pointer"
                >
                  File Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentInformationView;
