import React, { useState } from 'react';
import {
  Award,
  Search,
  Filter,
  GraduationCap,
  Building2,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Printer,
  Download,
  Plus,
  X,
  Sparkles,
  TrendingUp,
  User,
  Check,
  Calendar,
  Edit3,
  BookOpen,
  Clock,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

// Initial Mock Exam Definitions (Term Master)
const INITIAL_EXAM_TERMS = [
  {
    id: 'EXAM-001',
    title: 'Mid-Term Examination 2026',
    targetClass: 'Class 10',
    startDate: '2026-03-01',
    endDate: '2026-03-12',
    totalMaxMarks: 500,
    status: 'Published'
  },
  {
    id: 'EXAM-002',
    title: 'Quarterly Unit Test 1',
    targetClass: 'Class 9',
    startDate: '2026-01-10',
    endDate: '2026-01-15',
    totalMaxMarks: 500,
    status: 'Published'
  },
  {
    id: 'EXAM-003',
    title: 'Pre-Board Examination 2026',
    targetClass: 'Class 12',
    startDate: '2026-02-15',
    endDate: '2026-02-25',
    totalMaxMarks: 500,
    status: 'Evaluation Pending'
  },
  {
    id: 'EXAM-004',
    title: 'Annual Final Examination 2026',
    targetClass: 'All Classes',
    startDate: '2026-04-05',
    endDate: '2026-04-20',
    totalMaxMarks: 500,
    status: 'Upcoming'
  }
];

// Mock Student Exam Performance Records
const INITIAL_STUDENT_EXAMS = [
  {
    id: 1,
    studentId: 'STU-1001',
    rollNo: '1001',
    studentName: 'Aarav Patel',
    className: 'Class 10',
    sectionName: 'Section A',
    examTerm: 'Mid-Term Examination 2026',
    overallGrade: 'A+',
    percentage: 92.4,
    totalObtained: 462,
    totalMax: 500,
    rank: 1,
    attendance: '96%',
    status: 'Passed with Distinction',
    marks: [
      { subject: 'Mathematics', maxMarks: 100, obtainedMarks: 98, grade: 'A+' },
      { subject: 'Physics', maxMarks: 100, obtainedMarks: 94, grade: 'A+' },
      { subject: 'Chemistry', maxMarks: 100, obtainedMarks: 89, grade: 'A' },
      { subject: 'English Literature', maxMarks: 100, obtainedMarks: 91, grade: 'A+' },
      { subject: 'Computer Science', maxMarks: 100, obtainedMarks: 90, grade: 'A+' }
    ]
  },
  {
    id: 2,
    studentId: 'STU-1002',
    rollNo: '1002',
    studentName: 'Ananya Sharma',
    className: 'Class 10',
    sectionName: 'Section A',
    examTerm: 'Mid-Term Examination 2026',
    overallGrade: 'A',
    percentage: 86.8,
    totalObtained: 434,
    totalMax: 500,
    rank: 3,
    attendance: '94%',
    status: 'Passed',
    marks: [
      { subject: 'Mathematics', maxMarks: 100, obtainedMarks: 85, grade: 'A' },
      { subject: 'Physics', maxMarks: 100, obtainedMarks: 88, grade: 'A' },
      { subject: 'Chemistry', maxMarks: 100, obtainedMarks: 82, grade: 'A' },
      { subject: 'English Literature', maxMarks: 100, obtainedMarks: 92, grade: 'A+' },
      { subject: 'Computer Science', maxMarks: 100, obtainedMarks: 87, grade: 'A' }
    ]
  },
  {
    id: 3,
    studentId: 'STU-1003',
    rollNo: '1003',
    studentName: 'Rohan Gupta',
    className: 'Class 10',
    sectionName: 'Section B',
    examTerm: 'Pre-Board Examination 2026',
    overallGrade: null, // Pending evaluation optimization
    percentage: null,
    totalObtained: null,
    totalMax: 500,
    rank: null,
    attendance: '88%',
    status: 'Marks Pending',
    marks: [
      { subject: 'Mathematics', maxMarks: 100, obtainedMarks: null, grade: null },
      { subject: 'Physics', maxMarks: 100, obtainedMarks: null, grade: null },
      { subject: 'Chemistry', maxMarks: 100, obtainedMarks: null, grade: null },
      { subject: 'English Literature', maxMarks: 100, obtainedMarks: null, grade: null },
      { subject: 'Computer Science', maxMarks: 100, obtainedMarks: null, grade: null }
    ]
  }
];

const CLASSES_LIST = ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
const SECTIONS_LIST = ['Section A', 'Section B', 'Section C'];

const ExamResultsView = () => {
  const { user } = useAuthStore();
  const isAuthorizedToEdit = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'teacher';

  const [activeTab, setActiveTab] = useState('marks_directory'); // 'marks_directory', 'exam_setup'

  const [examTerms, setExamTerms] = useState(INITIAL_EXAM_TERMS);
  const [examRecords, setExamRecords] = useState(INITIAL_STUDENT_EXAMS);
  const [selectedStudentReport, setSelectedStudentReport] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');
  const [selectedExamTerm, setSelectedExamTerm] = useState('All');

  // Modals
  const [showCreateExamModal, setShowCreateExamModal] = useState(false);
  const [showAddMarksModal, setShowAddMarksModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null); // For editing/setting marks
  const [successMessage, setSuccessMessage] = useState('');

  // Form State: Create New Exam
  const [newExamForm, setNewExamForm] = useState({
    title: '',
    targetClass: 'Class 10',
    startDate: '',
    endDate: '',
    totalMaxMarks: 500,
    status: 'Upcoming'
  });

  // Form State: Enter / Update Student Marks
  const [newEntry, setNewEntry] = useState({
    studentId: '',
    rollNo: '',
    studentName: '',
    className: 'Class 10',
    sectionName: 'Section A',
    examTerm: 'Mid-Term Examination 2026',
    math: '',
    physics: '',
    chemistry: '',
    english: '',
    cs: ''
  });

  // Handle Create New Examination
  const handleCreateExamSubmit = (e) => {
    e.preventDefault();
    if (!newExamForm.title.trim()) return;

    const createdExam = {
      id: `EXAM-${Math.floor(100 + Math.random() * 900)}`,
      title: newExamForm.title,
      targetClass: newExamForm.targetClass,
      startDate: newExamForm.startDate || '2026-03-15',
      endDate: newExamForm.endDate || '2026-03-25',
      totalMaxMarks: Number(newExamForm.totalMaxMarks) || 500,
      status: newExamForm.status
    };

    setExamTerms([...examTerms, createdExam]);
    setShowCreateExamModal(false);
    setSuccessMessage(`New Examination "${createdExam.title}" configured successfully!`);
    setNewExamForm({
      title: '',
      targetClass: 'Class 10',
      startDate: '',
      endDate: '',
      totalMaxMarks: 500,
      status: 'Upcoming'
    });
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Helper function to calculate grades
  const getGrade = (mark) => {
    if (mark === null || mark === undefined || mark === '') return 'Not Set';
    const num = Number(mark);
    if (num >= 90) return 'A+';
    if (num >= 80) return 'A';
    if (num >= 70) return 'B+';
    if (num >= 60) return 'B';
    if (num >= 50) return 'C';
    return 'F';
  };

  // Handle Add / Edit Student Marks Submit
  const handleAddMarksSubmit = (e) => {
    e.preventDefault();
    if (!newEntry.studentName.trim() || !newEntry.rollNo) return;

    const mathMark = newEntry.math !== '' ? Number(newEntry.math) : null;
    const physicsMark = newEntry.physics !== '' ? Number(newEntry.physics) : null;
    const chemistryMark = newEntry.chemistry !== '' ? Number(newEntry.chemistry) : null;
    const englishMark = newEntry.english !== '' ? Number(newEntry.english) : null;
    const csMark = newEntry.cs !== '' ? Number(newEntry.cs) : null;

    const enteredMarksList = [mathMark, physicsMark, chemistryMark, englishMark, csMark].filter(m => m !== null);

    let totalObtained = null;
    let percentage = null;
    let overallGrade = 'Not Set';
    let status = 'Marks Pending';

    if (enteredMarksList.length > 0) {
      totalObtained = enteredMarksList.reduce((acc, val) => acc + val, 0);
      const maxPossible = enteredMarksList.length * 100;
      percentage = Number(((totalObtained / maxPossible) * 100).toFixed(1));
      overallGrade = getGrade(percentage);
      status = percentage >= 50 ? 'Passed' : 'Needs Improvement';
    }

    const updatedMarks = [
      { subject: 'Mathematics', maxMarks: 100, obtainedMarks: mathMark, grade: getGrade(mathMark) },
      { subject: 'Physics', maxMarks: 100, obtainedMarks: physicsMark, grade: getGrade(physicsMark) },
      { subject: 'Chemistry', maxMarks: 100, obtainedMarks: chemistryMark, grade: getGrade(chemistryMark) },
      { subject: 'English Literature', maxMarks: 100, obtainedMarks: englishMark, grade: getGrade(englishMark) },
      { subject: 'Computer Science', maxMarks: 100, obtainedMarks: csMark, grade: getGrade(csMark) }
    ];

    if (editingStudent) {
      // Edit existing record
      const updatedRecords = examRecords.map(rec => {
        if (rec.id === editingStudent.id) {
          return {
            ...rec,
            rollNo: newEntry.rollNo,
            studentName: newEntry.studentName,
            className: newEntry.className,
            sectionName: newEntry.sectionName,
            examTerm: newEntry.examTerm,
            overallGrade,
            percentage,
            totalObtained,
            status,
            marks: updatedMarks
          };
        }
        return rec;
      });
      setExamRecords(updatedRecords);
      setSuccessMessage(`Marks updated for ${newEntry.studentName}!`);
    } else {
      // Create new student mark record
      const newRecord = {
        id: Date.now(),
        studentId: newEntry.studentId || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
        rollNo: newEntry.rollNo,
        studentName: newEntry.studentName,
        className: newEntry.className,
        sectionName: newEntry.sectionName,
        examTerm: newEntry.examTerm,
        overallGrade,
        percentage,
        totalObtained,
        totalMax: 500,
        rank: Math.floor(Math.random() * 5) + 1,
        attendance: '95%',
        status,
        marks: updatedMarks
      };
      setExamRecords([newRecord, ...examRecords]);
      setSuccessMessage(`Exam marks recorded for ${newEntry.studentName}!`);
    }

    setShowAddMarksModal(false);
    setEditingStudent(null);
    setNewEntry({
      studentId: '',
      rollNo: '',
      studentName: '',
      className: 'Class 10',
      sectionName: 'Section A',
      examTerm: 'Mid-Term Examination 2026',
      math: '',
      physics: '',
      chemistry: '',
      english: '',
      cs: ''
    });
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Open Edit Modal for a student record
  const handleOpenEditModal = (rec) => {
    setEditingStudent(rec);
    const mathObj = rec.marks.find(m => m.subject === 'Mathematics');
    const phyObj = rec.marks.find(m => m.subject === 'Physics');
    const chemObj = rec.marks.find(m => m.subject === 'Chemistry');
    const engObj = rec.marks.find(m => m.subject === 'English Literature');
    const csObj = rec.marks.find(m => m.subject === 'Computer Science');

    setNewEntry({
      studentId: rec.studentId,
      rollNo: rec.rollNo,
      studentName: rec.studentName,
      className: rec.className,
      sectionName: rec.sectionName,
      examTerm: rec.examTerm,
      math: mathObj?.obtainedMarks !== null && mathObj?.obtainedMarks !== undefined ? String(mathObj.obtainedMarks) : '',
      physics: phyObj?.obtainedMarks !== null && phyObj?.obtainedMarks !== undefined ? String(phyObj.obtainedMarks) : '',
      chemistry: chemObj?.obtainedMarks !== null && chemObj?.obtainedMarks !== undefined ? String(chemObj.obtainedMarks) : '',
      english: engObj?.obtainedMarks !== null && engObj?.obtainedMarks !== undefined ? String(engObj.obtainedMarks) : '',
      cs: csObj?.obtainedMarks !== null && csObj?.obtainedMarks !== undefined ? String(csObj.obtainedMarks) : ''
    });
    setShowAddMarksModal(true);
  };

  // Filtered Exam Records
  const filteredRecords = examRecords.filter(rec => {
    const matchClass = selectedClass === 'All' || rec.className === selectedClass;
    const matchSection = selectedSection === 'All' || rec.sectionName === selectedSection;
    const matchExam = selectedExamTerm === 'All' || rec.examTerm === selectedExamTerm;
    const matchSearch = rec.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        rec.rollNo.includes(searchTerm) ||
                        rec.studentId.toLowerCase().includes(searchTerm.toLowerCase());

    return matchClass && matchSection && matchExam && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/80 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Award className="w-6 h-6" />
            </div>
            Student Examination & Report Card Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Configure examinations, enter student marks (with graceful handling for pending marks), and generate report cards.
          </p>
        </div>

        {isAuthorizedToEdit && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowCreateExamModal(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Setup New Exam
            </button>
            <button
              onClick={() => {
                setEditingStudent(null);
                setNewEntry({
                  studentId: '',
                  rollNo: '',
                  studentName: '',
                  className: 'Class 10',
                  sectionName: 'Section A',
                  examTerm: examTerms[0]?.title || 'Mid-Term Examination 2026',
                  math: '',
                  physics: '',
                  chemistry: '',
                  english: '',
                  cs: ''
                });
                setShowAddMarksModal(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition cursor-pointer"
            >
              <Edit3 className="w-4 h-4" /> Set / Enter Student Marks
            </button>
          </div>
        )}
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          {successMessage}
        </div>
      )}

      {/* Main Tab Navigation */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-extrabold">
        <button
          onClick={() => setActiveTab('marks_directory')}
          className={`pb-2 border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'marks_directory' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" /> Student Marks & Performance Directory
        </button>
        <button
          onClick={() => setActiveTab('exam_setup')}
          className={`pb-2 border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'exam_setup' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Configured Examinations ({examTerms.length})
        </button>
      </div>

      {/* TAB 1: MARKS DIRECTORY */}
      {activeTab === 'marks_directory' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Class-wise & Student-wise Filter Control Center */}
          <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700">
              <Filter className="w-4 h-4 text-indigo-600" />
              <span>Search & Filter Student Marks:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {/* Search Input */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Student Search</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search Name / Roll / ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Class Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Filter Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                >
                  <option value="All">All Classes</option>
                  {CLASSES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Section Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Filter Section</label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                >
                  <option value="All">All Sections</option>
                  {SECTIONS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Exam Term Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Examination Term</label>
                <select
                  value={selectedExamTerm}
                  onChange={(e) => setSelectedExamTerm(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                >
                  <option value="All">All Configured Exams</option>
                  {examTerms.map(t => <option key={t.id} value={t.title}>{t.title}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Main Student Results Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Student Examination Marks ({filteredRecords.length} Records)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Roll / ID</th>
                    <th className="py-3.5 px-4">Student Name</th>
                    <th className="py-3.5 px-4">Class & Section</th>
                    <th className="py-3.5 px-4">Exam Term</th>
                    <th className="py-3.5 px-4 text-center">Marks Obtained</th>
                    <th className="py-3.5 px-4 text-center">Percentage</th>
                    <th className="py-3.5 px-4 text-center">Grade Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-900">
                          #{rec.rollNo} <span className="text-[10px] text-slate-400">({rec.studentId})</span>
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-slate-900 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                            {rec.studentName.charAt(0)}
                          </div>
                          {rec.studentName}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-700">
                          {rec.className} - {rec.sectionName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {rec.examTerm}
                        </td>
                        <td className="py-3.5 px-4 text-center font-extrabold text-slate-900">
                          {rec.totalObtained !== null && rec.totalObtained !== undefined ? (
                            `${rec.totalObtained} / ${rec.totalMax}`
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                              Marks Not Set
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {rec.percentage !== null && rec.percentage !== undefined ? (
                            <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-black text-xs border border-indigo-200">
                              {rec.percentage}%
                            </span>
                          ) : (
                            <span className="text-slate-400 font-bold text-[10px]">Pending</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {rec.overallGrade && rec.overallGrade !== 'Not Set' ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-black text-xs border border-emerald-200">
                              {rec.overallGrade}
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                              Evaluation Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right flex justify-end gap-1.5">
                          {isAuthorizedToEdit && (
                            <button
                              onClick={() => handleOpenEditModal(rec)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[11px] rounded-xl transition flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3 text-indigo-600" /> Set Marks
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedStudentReport(rec)}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-extrabold text-[11px] rounded-xl transition flex items-center gap-1 cursor-pointer"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5" /> Report Card
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400 font-medium text-xs">
                        No student exam records match your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONFIGURED EXAMINATIONS SETUP */}
      {activeTab === 'exam_setup' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Master Examination Schedule</h3>
            {isAuthorizedToEdit && (
              <button
                onClick={() => setShowCreateExamModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add New Examination
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {examTerms.map((exam) => (
              <div key={exam.id} className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full uppercase">
                      {exam.id}
                    </span>
                    <h4 className="text-sm font-black text-slate-900 mt-1">{exam.title}</h4>
                    <span className="text-xs text-slate-500 font-bold block">{exam.targetClass}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    exam.status === 'Published' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                    exam.status === 'Ongoing' ? 'bg-indigo-50 text-indigo-800 border border-indigo-200' :
                    'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {exam.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Schedule Window</span>
                    <span className="font-bold text-slate-800">{exam.startDate} to {exam.endDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Maximum Marks</span>
                    <span className="font-bold text-slate-800">{exam.totalMaxMarks} Marks</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- MODAL: CREATE NEW EXAMINATION --- */}
      {showCreateExamModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" /> Configure New Examination
              </h3>
              <button onClick={() => setShowCreateExamModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExamSubmit} className="space-y-3 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1">Exam Title / Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit Test 2 / Pre-Board 2026"
                  value={newExamForm.title}
                  onChange={(e) => setNewExamForm({ ...newExamForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Target Class *</label>
                  <select
                    value={newExamForm.targetClass}
                    onChange={(e) => setNewExamForm({ ...newExamForm, targetClass: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                  >
                    <option value="All Classes">All Classes</option>
                    {CLASSES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Total Max Marks</label>
                  <input
                    type="number"
                    value={newExamForm.totalMaxMarks}
                    onChange={(e) => setNewExamForm({ ...newExamForm, totalMaxMarks: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newExamForm.startDate}
                    onChange={(e) => setNewExamForm({ ...newExamForm, startDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1">End Date</label>
                  <input
                    type="date"
                    value={newExamForm.endDate}
                    onChange={(e) => setNewExamForm({ ...newExamForm, endDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Status</label>
                <select
                  value={newExamForm.status}
                  onChange={(e) => setNewExamForm({ ...newExamForm, status: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Evaluation Pending">Evaluation Pending</option>
                  <option value="Published">Published</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateExamModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white font-extrabold rounded-xl hover:bg-indigo-700 transition shadow-md cursor-pointer"
                >
                  Create Examination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: ENTER / EDIT STUDENT MARKS --- */}
      {showAddMarksModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-600" />
                {editingStudent ? `Update Marks for ${editingStudent.studentName}` : 'Enter New Student Marks'}
              </h3>
              <button onClick={() => setShowAddMarksModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMarksSubmit} className="space-y-3 text-xs font-semibold text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Student Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={newEntry.studentName}
                    onChange={(e) => setNewEntry({ ...newEntry, studentName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block mb-1">Roll Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1006"
                    value={newEntry.rollNo}
                    onChange={(e) => setNewEntry({ ...newEntry, rollNo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Class *</label>
                  <select
                    value={newEntry.className}
                    onChange={(e) => setNewEntry({ ...newEntry, className: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                  >
                    {CLASSES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Section *</label>
                  <select
                    value={newEntry.sectionName}
                    onChange={(e) => setNewEntry({ ...newEntry, sectionName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                  >
                    {SECTIONS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1">Exam Term *</label>
                <select
                  value={newEntry.examTerm}
                  onChange={(e) => setNewEntry({ ...newEntry, examTerm: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                >
                  {examTerms.map(t => <option key={t.id} value={t.title}>{t.title}</option>)}
                </select>
              </div>

              {/* Subject Marks Inputs */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="block text-[11px] font-extrabold text-slate-800">Subject Marks (Leave empty if Not Set)</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500">Mathematics</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Not Set"
                      value={newEntry.math}
                      onChange={(e) => setNewEntry({ ...newEntry, math: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">Physics</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Not Set"
                      value={newEntry.physics}
                      onChange={(e) => setNewEntry({ ...newEntry, physics: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">Chemistry</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Not Set"
                      value={newEntry.chemistry}
                      onChange={(e) => setNewEntry({ ...newEntry, chemistry: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">English</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Not Set"
                      value={newEntry.english}
                      onChange={(e) => setNewEntry({ ...newEntry, english: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">Comp Sci</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Not Set"
                      value={newEntry.cs}
                      onChange={(e) => setNewEntry({ ...newEntry, cs: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddMarksModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  Save Exam Marks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- REPORT CARD MODAL --- */}
      {selectedStudentReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Official Academic Report Card
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">{selectedStudentReport.studentName}</h2>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedStudentReport.className} ({selectedStudentReport.sectionName}) • Roll No: {selectedStudentReport.rollNo}
                </p>
              </div>
              <button onClick={() => setSelectedStudentReport(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Exam & Score Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Exam Term</span>
                <p className="text-xs font-black text-slate-900 leading-tight">{selectedStudentReport.examTerm}</p>
              </div>
              <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-0.5">
                <span className="text-[10px] font-bold text-indigo-500 uppercase">Aggregate Marks</span>
                <p className="text-sm font-black text-indigo-900">
                  {selectedStudentReport.totalObtained !== null ? `${selectedStudentReport.totalObtained} / ${selectedStudentReport.totalMax}` : 'Pending'}
                </p>
              </div>
              <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-0.5">
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Percentage</span>
                <p className="text-sm font-black text-emerald-900">
                  {selectedStudentReport.percentage !== null ? `${selectedStudentReport.percentage}%` : 'Pending Evaluation'}
                </p>
              </div>
              <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-0.5">
                <span className="text-[10px] font-bold text-purple-600 uppercase">Class Rank</span>
                <p className="text-sm font-black text-purple-900">
                  {selectedStudentReport.rank ? `Rank #${selectedStudentReport.rank}` : 'Unranked'}
                </p>
              </div>
            </div>

            {/* Subject Breakdown Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Subject Wise Breakdown</h4>
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Subject Name</th>
                      <th className="py-2.5 px-4 text-center">Max Marks</th>
                      <th className="py-2.5 px-4 text-center">Obtained</th>
                      <th className="py-2.5 px-4 text-right">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {selectedStudentReport.marks.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-4 font-bold text-slate-900">{m.subject}</td>
                        <td className="py-2.5 px-4 text-center font-semibold text-slate-500">{m.maxMarks}</td>
                        <td className="py-2.5 px-4 text-center font-extrabold text-slate-900">
                          {m.obtainedMarks !== null && m.obtainedMarks !== undefined ? m.obtainedMarks : (
                            <span className="text-amber-600 font-bold text-[10px]">Not Set</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <span className={`px-2 py-0.5 rounded font-extrabold text-[11px] ${
                            m.grade === 'Not Set' ? 'bg-slate-100 text-slate-500' : 'bg-indigo-50 text-indigo-700'
                          }`}>
                            {m.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => alert(`Printing report card for ${selectedStudentReport.studentName}...`)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print Report Card
              </button>
              <button
                onClick={() => alert(`Downloading PDF marksheet for ${selectedStudentReport.studentName}...`)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition shadow-md shadow-indigo-500/20 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamResultsView;
