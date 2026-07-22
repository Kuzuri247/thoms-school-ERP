import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import api from '../api/axios';
import {
  BookOpen,
  Users,
  CheckCircle,
  FileSpreadsheet,
  Award,
  CalendarDays,
  Clock,
  Plus,
  Send,
  Calendar as CalendarIcon,
  BookText,
  Save,
  Check,
  AlertCircle
} from 'lucide-react';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TeacherDashboard = ({ activeTab: initialActiveTab = 'overview' }) => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState(initialActiveTab); // overview, timetable, attendance, homework, exams

  useEffect(() => {
    setActiveTab(initialActiveTab);
  }, [initialActiveTab]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [attendanceCalendar, setAttendanceCalendar] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [savingAttendance, setSavingAttendance] = useState(false);

  // Homework state
  const [homeworkList, setHomeworkList] = useState([]);
  const [homeworkForm, setHomeworkForm] = useState({
    title: '',
    description: '',
    due_date: '',
  });
  const [assigningHomework, setAssigningHomework] = useState(false);

  // Exam Marks state
  const [selectedExam, setSelectedExam] = useState('1'); // Exam ID 1 (Mid Term)
  const [marksData, setMarksData] = useState({}); // { student_id: mark }
  const [savingMarks, setSavingMarks] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTeacherClasses();
    fetchTeacherTimetable();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchClassStudents(selectedClass.id || selectedClass.section_id);
      if (selectedClass.is_class_teacher && selectedClass.section_id) {
        fetchAttendanceCalendar(selectedClass.section_id);
      }
      if (selectedClass.section_id) {
        fetchSectionHomework(selectedClass.section_id);
      }
    }
  }, [selectedClass]);

  const fetchTeacherClasses = async () => {
    try {
      const res = await api.get('/teacher/classes');
      const data = res.data?.data || [];
      setClasses(data);
      if (data.length > 0) {
        setSelectedClass(data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch teacher classes:', err);
    }
  };

  const fetchClassStudents = async (classId) => {
    try {
      const res = await api.get(`/teacher/classes/${classId}/students`);
      const data = res.data?.data || [];
      setStudents(data);
      
      // Initialize attendance records default to 'present'
      const initAtt = {};
      data.forEach(s => { initAtt[s.id] = 'present'; });
      setAttendanceRecords(initAtt);

      // Initialize marks
      const initMarks = {};
      data.forEach(s => { initMarks[s.id] = s.englishMark || 80; });
      setMarksData(initMarks);
    } catch (err) {
      console.error('Failed to fetch class students:', err);
    }
  };

  const fetchTeacherTimetable = async () => {
    try {
      const res = await api.get('/teacher/my-timetable');
      setTimetable(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch timetable:', err);
    }
  };

  const fetchAttendanceCalendar = async (sectionId) => {
    try {
      const res = await api.get(`/attendance/calendar/${sectionId}`);
      setAttendanceCalendar(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch attendance calendar:', err);
    }
  };

  const fetchSectionHomework = async (sectionId) => {
    try {
      const res = await api.get(`/homework/section/${sectionId}`);
      setHomeworkList(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch homework:', err);
    }
  };

  const handleMarkAttendance = async () => {
    if (!selectedClass?.section_id || !selectedClass?.is_class_teacher) {
      alert('You can only mark attendance for your assigned homeroom section.');
      return;
    }
    try {
      setSavingAttendance(true);
      const records = Object.entries(attendanceRecords).map(([student_id, status]) => ({
        student_id: Number(student_id),
        status,
      }));

      await api.post('/attendance/mark', {
        section_id: selectedClass.section_id,
        date: attendanceDate,
        records,
      });

      setMessage('Attendance saved successfully!');
      setTimeout(() => setMessage(''), 3000);
      fetchAttendanceCalendar(selectedClass.section_id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleAssignHomework = async (e) => {
    e.preventDefault();
    if (!selectedClass?.section_id || !homeworkForm.title || !homeworkForm.due_date) return;
    try {
      setAssigningHomework(true);
      await api.post('/homework', {
        section_id: selectedClass.section_id,
        subject_id: selectedClass.subject_id,
        title: homeworkForm.title,
        description: homeworkForm.description,
        due_date: homeworkForm.due_date,
      });

      setMessage('Homework assigned successfully!');
      setTimeout(() => setMessage(''), 3000);
      setHomeworkForm({ title: '', description: '', due_date: '' });
      fetchSectionHomework(selectedClass.section_id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign homework');
    } finally {
      setAssigningHomework(false);
    }
  };

  const handleSaveMarks = async () => {
    if (!selectedClass?.subject_id) {
      alert('Subject ID is missing for this class.');
      return;
    }
    try {
      setSavingMarks(true);
      const entries = Object.entries(marksData).map(([student_id, marks_obtained]) => ({
        student_id: Number(student_id),
        marks_obtained: Number(marks_obtained),
        max_marks: 100,
      }));

      await api.post(`/marks/exam/${selectedExam}/subject/${selectedClass.subject_id}/bulk`, {
        entries,
      });

      setMessage('Exam marks saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save marks');
    } finally {
      setSavingMarks(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-800 p-8 rounded-3xl shadow-lg text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight mb-1">Teacher Workstation</h1>
            <p className="text-teal-100 font-medium text-sm">
              Welcome back, <span className="font-bold text-white">{user?.full_name || user?.email?.split('@')[0]}</span>.
            </p>
          </div>
        </div>

        {message && (
          <div className="bg-white/20 backdrop-blur-md border border-white/40 px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-300" /> {message}
          </div>
        )}
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Class & Section Selector Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-extrabold text-slate-800 text-base uppercase tracking-wider px-1">My Assigned Classes</h3>
          {classes.length === 0 ? (
            <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-400 font-medium">
              No assigned classes found.
            </div>
          ) : (
            classes.map((cls, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedClass(cls)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedClass?.name === cls.name
                    ? 'bg-teal-50 border-teal-300 shadow-sm ring-2 ring-teal-500/20'
                    : 'bg-white border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className={`font-black text-sm ${selectedClass?.name === cls.name ? 'text-teal-900' : 'text-slate-800'}`}>
                    {cls.name}
                  </h4>
                  {cls.is_class_teacher && (
                    <span className="text-[9px] font-extrabold bg-teal-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Homeroom
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1 text-xs font-medium mt-2">
                  <span className={selectedClass?.name === cls.name ? 'text-teal-700 font-semibold' : 'text-slate-500'}>
                    Subject: {cls.subject}
                  </span>
                  <span className="text-slate-400 text-[11px]">Role: {cls.role}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Workstation Content Tabs */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-100 bg-slate-50/70 overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: BookOpen },
                { id: 'timetable', label: 'My Timetable', icon: Clock },
                { id: 'attendance', label: 'Attendance', icon: CalendarDays },
                { id: 'homework', label: 'Homework', icon: BookText },
                { id: 'exams', label: 'Exam Marks', icon: Award },
              ].map((tab) => {
                const IconComp = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 min-w-[120px] py-3.5 px-4 text-xs font-extrabold transition-all flex items-center justify-center gap-2 border-b-2 ${
                      activeTab === tab.id
                        ? 'text-teal-700 bg-white border-teal-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 border-transparent'
                    }`}
                  >
                    <IconComp className="w-4 h-4" /> {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="p-6">
              {/* --- Overview Tab --- */}
              {activeTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-xl font-black text-slate-900">{selectedClass?.name || 'Class Overview'}</h2>
                      <p className="text-xs font-semibold text-slate-500 mt-1">
                        Managing {selectedClass?.subject || 'Subject'} for this section. Total {students.length} students enrolled.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-100 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-teal-700">Enrolled Students</span>
                      <h3 className="text-2xl font-black text-slate-900">{students.length}</h3>
                    </div>
                    <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-amber-700">Assigned Subject</span>
                      <h3 className="text-lg font-black text-slate-900">{selectedClass?.subject || 'N/A'}</h3>
                    </div>
                    <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-purple-700">Class Role</span>
                      <h3 className="text-lg font-black text-slate-900">{selectedClass?.role || 'Subject Teacher'}</h3>
                    </div>
                  </div>

                  {/* Student Directory Table Preview */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-extrabold text-slate-900">Student Roll</h3>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-4">Roll / Admission No</th>
                            <th className="py-2.5 px-4">Student Name</th>
                            <th className="py-2.5 px-4 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {students.map((s) => (
                            <tr key={s.id} className="hover:bg-slate-50/60">
                              <td className="py-2.5 px-4 font-mono font-bold text-slate-700">{s.roll}</td>
                              <td className="py-2.5 px-4 font-bold text-slate-900">{s.name}</td>
                              <td className="py-2.5 px-4 text-right">
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Active
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* --- Timetable Tab --- */}
              {activeTab === 'timetable' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-slate-900">Personal Weekly Timetable</h2>
                      <p className="text-xs font-semibold text-slate-500 mt-1">Your teaching schedule across all classes.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {daysOfWeek.map((day, dayIdx) => {
                      const dayClasses = timetable.filter((t) => Number(t.day_of_week) === dayIdx + 1);
                      return (
                        <div key={day} className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3">
                          <h4 className="font-extrabold text-xs text-teal-800 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center justify-between">
                            <span>{day}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">{dayClasses.length} Periods</span>
                          </h4>
                          {dayClasses.length === 0 ? (
                            <p className="text-xs text-slate-400 font-medium italic">No periods assigned</p>
                          ) : (
                            <div className="space-y-2">
                              {dayClasses.map((item, idx) => (
                                <div key={idx} className="p-3 bg-white rounded-xl border border-slate-100 shadow-2xs space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-extrabold text-slate-900">
                                      Period {item.period_no}: {item.subject_name}
                                    </span>
                                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                                      {item.class_name} - {item.section_name}
                                    </span>
                                  </div>
                                  <p className="text-[11px] font-mono text-slate-500">
                                    {item.start_time} - {item.end_time}
                                  </p>
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

              {/* --- Attendance Tab --- */}
              {activeTab === 'attendance' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-slate-900">Attendance Register & Calendar</h2>
                      <p className="text-xs font-semibold text-slate-500 mt-1">
                        Daily roll-call & presence percentage history for {selectedClass?.name}.
                      </p>
                    </div>
                    {selectedClass?.is_class_teacher ? (
                      <button
                        onClick={handleMarkAttendance}
                        disabled={savingAttendance}
                        className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {savingAttendance ? 'Saving Roll...' : 'Submit Attendance'}
                      </button>
                    ) : (
                      <div className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                        Homeroom Teacher Only
                      </div>
                    )}
                  </div>

                  {selectedClass?.is_class_teacher ? (
                    <>
                      {/* Attendance Date Selector */}
                      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                        <div className="flex items-center gap-3">
                          <CalendarIcon className="w-5 h-5 text-teal-600" />
                          <label className="text-xs font-bold text-slate-700">Date:</label>
                          <input
                            type="date"
                            value={attendanceDate}
                            onChange={(e) => setAttendanceDate(e.target.value)}
                            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                          />
                        </div>
                      </div>

                      {/* Attendance Form Sheet */}
                      <div className="overflow-x-auto rounded-2xl border border-slate-200">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                            <tr>
                              <th className="py-3 px-4">Roll No</th>
                              <th className="py-3 px-4">Student Name</th>
                              <th className="py-3 px-4 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {students.map((s) => (
                              <tr key={s.id} className="hover:bg-slate-50/60">
                                <td className="py-3 px-4 font-mono font-bold text-slate-700">{s.roll}</td>
                                <td className="py-3 px-4 font-bold text-slate-900">{s.name}</td>
                                <td className="py-3 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {['present', 'absent', 'late'].map((st) => (
                                      <button
                                        key={st}
                                        type="button"
                                        onClick={() => setAttendanceRecords({ ...attendanceRecords, [s.id]: st })}
                                        className={`px-3 py-1 text-[11px] font-extrabold uppercase rounded-lg border transition ${
                                          attendanceRecords[s.id] === st
                                            ? st === 'present'
                                              ? 'bg-emerald-600 text-white border-emerald-600'
                                              : st === 'absent'
                                              ? 'bg-rose-600 text-white border-rose-600'
                                              : 'bg-amber-500 text-white border-amber-500'
                                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                                        }`}
                                      >
                                        {st.charAt(0).toUpperCase()}
                                      </button>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Attendance Calendar History View */}
                      <div className="space-y-3 pt-4">
                        <h3 className="text-sm font-extrabold text-slate-900">Attendance Calendar & Percentage Summary</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                          {attendanceCalendar.length === 0 ? (
                            <p className="text-xs text-slate-400 font-medium italic col-span-full">No historical records available.</p>
                          ) : (
                            attendanceCalendar.map((row, idx) => (
                              <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                                <div className="flex items-center justify-between text-xs font-extrabold text-slate-800">
                                  <span>{row.date}</span>
                                  <span className={`px-2 py-0.5 rounded text-[10px] ${
                                    row.present_percentage >= 75 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                  }`}>
                                    {row.present_percentage}% Present
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                                  <span>Present: {row.present_count}</span>
                                  <span>Absent: {row.absent_count}</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-8 text-center bg-amber-50/40 rounded-3xl border border-amber-200 space-y-2">
                      <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
                      <h4 className="text-base font-bold text-amber-900">Subject Teacher View</h4>
                      <p className="text-xs text-amber-700 font-medium">
                        Attendance marking and daily roll percentages are restricted to the homeroom Class Teacher.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* --- Homework Tab --- */}
              {activeTab === 'homework' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-xl font-black text-slate-900">Assign Homework / Coursework</h2>
                      <p className="text-xs font-semibold text-slate-500 mt-1">
                        Attach assignments to {selectedClass?.name} ({selectedClass?.subject}).
                      </p>
                    </div>
                  </div>

                  {/* Assign Homework Form */}
                  <form onSubmit={handleAssignHomework} className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Homework Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Read Chapter 5 and answer exercises 1-10"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-teal-500"
                        value={homeworkForm.title}
                        onChange={(e) => setHomeworkForm({ ...homeworkForm, title: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Due Date *</label>
                        <input
                          type="date"
                          required
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-teal-500"
                          value={homeworkForm.due_date}
                          onChange={(e) => setHomeworkForm({ ...homeworkForm, due_date: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Instructions / Description</label>
                        <input
                          type="text"
                          placeholder="Optional extra guidelines"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-teal-500"
                          value={homeworkForm.description}
                          onChange={(e) => setHomeworkForm({ ...homeworkForm, description: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={assigningHomework}
                        className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        {assigningHomework ? 'Assigning...' : 'Assign Work'}
                      </button>
                    </div>
                  </form>

                  {/* Assigned Homework List */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-extrabold text-slate-900">Recently Assigned Work</h3>
                    <div className="space-y-3">
                      {homeworkList.length === 0 ? (
                        <p className="text-xs text-slate-400 font-medium italic">No homework assigned yet for this section.</p>
                      ) : (
                        homeworkList.map((hw) => (
                          <div key={hw.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900">{hw.title}</span>
                              <span className="text-[10px] font-extrabold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                                Due: {hw.due_date ? new Date(hw.due_date).toLocaleDateString() : 'N/A'}
                              </span>
                            </div>
                            {hw.description && <p className="text-xs text-slate-600 font-medium">{hw.description}</p>}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* --- Exam Marks Spreadsheet Tab --- */}
              {activeTab === 'exams' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-4">
                    <div>
                      <h2 className="text-xl font-black text-slate-900">Spreadsheet Exam Marks Entry</h2>
                      <p className="text-xs font-semibold text-slate-500 mt-1">
                        Bulk enter and update marks for {selectedClass?.name} ({selectedClass?.subject}).
                      </p>
                    </div>
                    <button
                      onClick={handleSaveMarks}
                      disabled={savingMarks}
                      className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {savingMarks ? 'Saving Marks...' : 'Save Marks Spreadsheet'}
                    </button>
                  </div>

                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                      <span>Select Exam:</span>
                      <select
                        value={selectedExam}
                        onChange={(e) => setSelectedExam(e.target.value)}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl outline-none"
                      >
                        <option value="1">Mid Term Examination</option>
                        <option value="2">Final Examination</option>
                      </select>
                    </div>
                  </div>

                  {/* Responsive Spreadsheet Table */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">Roll / Admission No</th>
                          <th className="py-3 px-4">Student Name</th>
                          <th className="py-3 px-4 text-right">{selectedClass?.subject || 'Subject'} Marks (Max 100)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {students.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50/60">
                            <td className="py-3 px-4 font-mono font-bold text-slate-700">{s.roll}</td>
                            <td className="py-3 px-4 font-bold text-slate-900">{s.name}</td>
                            <td className="py-3 px-4 text-right">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={marksData[s.id] ?? ''}
                                onChange={(e) => setMarksData({ ...marksData, [s.id]: e.target.value })}
                                className="w-24 px-3 py-1.5 text-right font-extrabold text-xs text-teal-700 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-teal-500 outline-none"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
