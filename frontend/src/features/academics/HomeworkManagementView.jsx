import React, { useState } from 'react';
import {
  BookText,
  Filter,
  Plus,
  Calendar,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  FileText,
  Paperclip,
  Check,
  X,
  Search,
  Building2,
  GraduationCap,
  Sparkles,
  Upload
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

// Mock Initial Homework Assignments Data
const INITIAL_HOMEWORK = [
  {
    id: 1,
    className: 'Class 10',
    sectionName: 'Section A',
    subject: 'Mathematics',
    teacherName: 'Prof. Arvind Sharma',
    teacherRole: 'Senior HOD',
    teacherAvatar: '',
    title: 'Quadratic Equations & Polynomials Worksheet',
    description: 'Solve problems 1 to 25 from Exercise 4.2 in NCERT textbook. Write step-by-step solutions in class notebook.',
    assignedDate: '2026-02-05',
    dueDate: '2026-02-12',
    status: 'Active',
    submittedCount: 28,
    totalStudents: 32,
    attachmentName: 'Quadratic_Problems_Set1.pdf'
  },
  {
    id: 2,
    className: 'Class 10',
    sectionName: 'Section B',
    subject: 'Physics',
    teacherName: 'Dr. Meenakshi Sundaram',
    teacherRole: 'Physics Faculty',
    teacherAvatar: '',
    title: 'Light Reflection & Refraction Ray Diagrams',
    description: 'Draw ray diagrams for concave and convex mirrors for 6 different object locations with magnification formulas.',
    assignedDate: '2026-02-06',
    dueDate: '2026-02-14',
    status: 'Active',
    submittedCount: 20,
    totalStudents: 30,
    attachmentName: 'RayDiagrams_Guide.pdf'
  },
  {
    id: 3,
    className: 'Class 9',
    sectionName: 'Section A',
    subject: 'English Literature',
    teacherName: 'Mrs. Sunita Kapoor',
    teacherRole: 'English Lecturer',
    teacherAvatar: '',
    title: 'Essay Writing: Impact of Artificial Intelligence',
    description: 'Write an essay (350-500 words) discussing the benefits and challenges of modern AI technology in education.',
    assignedDate: '2026-02-04',
    dueDate: '2026-02-11',
    status: 'Evaluated',
    submittedCount: 35,
    totalStudents: 35,
    attachmentName: 'Essay_Format_Guidelines.pdf'
  },
  {
    id: 4,
    className: 'Class 12',
    sectionName: 'Section A',
    subject: 'Computer Science',
    teacherName: 'Mr. Rajesh Verma',
    teacherRole: 'CS & IT Teacher',
    teacherAvatar: '',
    title: 'Python SQL Connectivity & Data Structures',
    description: 'Implement a Python script connecting MySQL database with student table. Execute SELECT, INSERT, and UPDATE queries.',
    assignedDate: '2026-02-07',
    dueDate: '2026-02-16',
    status: 'Active',
    submittedCount: 15,
    totalStudents: 28,
    attachmentName: 'mysql_python_connector_lab.py'
  },
  {
    id: 5,
    className: 'Class 8',
    sectionName: 'Section C',
    subject: 'Chemistry',
    teacherName: 'Dr. Meenakshi Sundaram',
    teacherRole: 'Science Faculty',
    teacherAvatar: '',
    title: 'Chemical Reactions & Equations Balancing',
    description: 'Balance 15 chemical equations provided in class notes and identify combination, decomposition, and displacement reactions.',
    assignedDate: '2026-02-02',
    dueDate: '2026-02-09',
    status: 'Completed',
    submittedCount: 30,
    totalStudents: 30,
    attachmentName: 'Chemical_Equations.pdf'
  }
];

const TEACHERS_LIST = [
  'Prof. Arvind Sharma',
  'Dr. Meenakshi Sundaram',
  'Mrs. Sunita Kapoor',
  'Mr. Rajesh Verma',
  'Ms. Ananya Roy'
];

const CLASSES_LIST = ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
const SECTIONS_LIST = ['Section A', 'Section B', 'Section C'];
const SUBJECTS_LIST = ['Mathematics', 'Physics', 'Chemistry', 'English Literature', 'Computer Science', 'Social Studies'];

const HomeworkManagementView = () => {
  const { user } = useAuthStore();
  const isAuthorizedToAssign = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'teacher';

  const [homeworkList, setHomeworkList] = useState(INITIAL_HOMEWORK);
  
  // Filters
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');
  const [selectedTeacher, setSelectedTeacher] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');

  // New Homework Form
  const [newHomework, setNewHomework] = useState({
    className: 'Class 10',
    sectionName: 'Section A',
    subject: 'Mathematics',
    teacherName: user?.full_name || 'Prof. Arvind Sharma',
    title: '',
    description: '',
    assignedDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    attachmentName: ''
  });

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (!newHomework.title.trim() || !newHomework.dueDate) return;

    const created = {
      id: Date.now(),
      ...newHomework,
      teacherRole: 'Assigned Teacher',
      status: 'Active',
      submittedCount: 0,
      totalStudents: 30
    };

    setHomeworkList([created, ...homeworkList]);
    setShowAssignModal(false);
    setFormSuccess(`Homework "${newHomework.title}" assigned successfully to ${newHomework.className} (${newHomework.sectionName})!`);
    setNewHomework({
      className: 'Class 10',
      sectionName: 'Section A',
      subject: 'Mathematics',
      teacherName: user?.full_name || 'Prof. Arvind Sharma',
      title: '',
      description: '',
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      attachmentName: ''
    });
    setTimeout(() => setFormSuccess(''), 4000);
  };

  // Filtered Homework
  const filteredHomework = homeworkList.filter(hw => {
    const matchClass = selectedClass === 'All' || hw.className === selectedClass;
    const matchSection = selectedSection === 'All' || hw.sectionName === selectedSection;
    const matchTeacher = selectedTeacher === 'All' || hw.teacherName === selectedTeacher;
    const matchSubject = selectedSubject === 'All' || hw.subject === selectedSubject;
    const matchSearch = hw.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        hw.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        hw.teacherName.toLowerCase().includes(searchTerm.toLowerCase());

    return matchClass && matchSection && matchTeacher && matchSubject && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Banner Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/80 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl border border-teal-100">
              <BookText className="w-6 h-6" />
            </div>
            Class & Teacher-Wise Homework Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Assign, track, and evaluate class coursework, subject assignments, and teacher submissions.
          </p>
        </div>

        {isAuthorizedToAssign && (
          <button
            onClick={() => setShowAssignModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-teal-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Assign New Homework
          </button>
        )}
      </div>

      {formSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-5 h-5 text-emerald-600" />
          {formSuccess}
        </div>
      )}

      {/* Multi-Dimensional Filter Control Bar */}
      <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200/80 space-y-3">
        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700">
          <Filter className="w-4 h-4 text-teal-600" />
          <span>Filter Homework Records:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          {/* Class Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Class / Standard</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-teal-500"
            >
              <option value="All">All Classes</option>
              {CLASSES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Section Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-teal-500"
            >
              <option value="All">All Sections</option>
              {SECTIONS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Teacher Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Assigned Teacher</label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-teal-500"
            >
              <option value="All">All Teachers</option>
              {TEACHERS_LIST.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Subject Area</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-teal-500"
            >
              <option value="All">All Subjects</option>
              {SUBJECTS_LIST.map(sb => <option key={sb} value={sb}>{sb}</option>)}
            </select>
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Search Keywords</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search title, teacher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-teal-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Homework Cards Roster */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Displaying {filteredHomework.length} Assignment(s)
          </span>
        </div>

        {filteredHomework.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHomework.map((hw) => (
              <div
                key={hw.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_2px_15px_rgba(0,0,0,0.02)] space-y-4 hover:border-teal-300 transition group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Badges: Class, Section, Subject */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 text-[11px] font-extrabold flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5" /> {hw.className} ({hw.sectionName})
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 text-[11px] font-bold">
                        {hw.subject}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      hw.status === 'Active'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      {hw.status}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-sm font-black text-slate-900 leading-snug group-hover:text-teal-700 transition">
                      {hw.title}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                      {hw.description}
                    </p>
                  </div>

                  {/* Attachment Pill if available */}
                  {hw.attachmentName && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700">
                      <Paperclip className="w-3.5 h-3.5 text-teal-600" />
                      <span>{hw.attachmentName}</span>
                    </div>
                  )}
                </div>

                {/* Footer: Assigned Teacher + Submission Progress */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs font-semibold">
                  {/* Teacher Info */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                      {hw.teacherName.charAt(0)}
                    </div>
                    <div>
                      <span className="block text-xs font-extrabold text-slate-800">{hw.teacherName}</span>
                      <span className="block text-[10px] text-slate-400 font-medium">Assigned Teacher</span>
                    </div>
                  </div>

                  {/* Submission Progress & Due Date */}
                  <div className="text-right">
                    <span className="block text-xs font-extrabold text-teal-700">
                      {hw.submittedCount} / {hw.totalStudents} Submitted
                    </span>
                    <span className="block text-[10px] text-slate-400 font-bold flex items-center gap-1 justify-end mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" /> Due: {hw.dueDate}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-2">
            <BookText className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">No Homework Records Found</h4>
            <p className="text-xs text-slate-400 font-medium">Adjust your class, section, or teacher filters to view homework assignments.</p>
          </div>
        )}
      </div>

      {/* Assign Homework Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" /> Assign New Class Homework
              </h3>
              <button onClick={() => setShowAssignModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-3.5 text-xs font-semibold text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Target Class *</label>
                  <select
                    value={newHomework.className}
                    onChange={(e) => setNewHomework({ ...newHomework, className: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-teal-500"
                  >
                    {CLASSES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Section *</label>
                  <select
                    value={newHomework.sectionName}
                    onChange={(e) => setNewHomework({ ...newHomework, sectionName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-teal-500"
                  >
                    {SECTIONS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Subject *</label>
                  <select
                    value={newHomework.subject}
                    onChange={(e) => setNewHomework({ ...newHomework, subject: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-teal-500"
                  >
                    {SUBJECTS_LIST.map(sb => <option key={sb} value={sb}>{sb}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Assigned Teacher *</label>
                  <select
                    value={newHomework.teacherName}
                    onChange={(e) => setNewHomework({ ...newHomework, teacherName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-teal-500"
                  >
                    {TEACHERS_LIST.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1">Homework Title / Assignment Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 4 Trigonometry Exercises"
                  value={newHomework.title}
                  onChange={(e) => setNewHomework({ ...newHomework, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Assigned Date</label>
                  <input
                    type="date"
                    value={newHomework.assignedDate}
                    onChange={(e) => setNewHomework({ ...newHomework, assignedDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block mb-1">Submission Due Date *</label>
                  <input
                    type="date"
                    required
                    value={newHomework.dueDate}
                    onChange={(e) => setNewHomework({ ...newHomework, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Instructions & Guidelines</label>
                <textarea
                  rows={3}
                  placeholder="Specific problems to solve or guidelines..."
                  value={newHomework.description}
                  onChange={(e) => setNewHomework({ ...newHomework, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block mb-1">Attachment File Name</label>
                <input
                  type="text"
                  placeholder="e.g. Assignment_Worksheet_Set2.pdf"
                  value={newHomework.attachmentName}
                  onChange={(e) => setNewHomework({ ...newHomework, attachmentName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-teal-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition shadow-md shadow-teal-500/20 cursor-pointer"
                >
                  Assign Homework
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeworkManagementView;
