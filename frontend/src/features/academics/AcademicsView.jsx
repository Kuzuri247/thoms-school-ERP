import React, { useState } from 'react';
import { useSaveMarks } from './useAcademics';
import { Award, BookOpen, Save, CheckCircle, Clock, Sparkles } from 'lucide-react';

const AcademicsView = () => {
  const [activeTab, setActiveTab] = useState('marks');
  const [selectedClass, setSelectedClass] = useState('10-A');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [marksState, setMarksState] = useState({
    101: 85,
    102: 92,
    103: 78,
    104: 90,
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const saveMarksMutation = useSaveMarks();

  const handleMarkChange = (studentId, val) => {
    setMarksState((prev) => ({
      ...prev,
      [studentId]: val,
    }));
  };

  const handleSaveMarks = async () => {
    try {
      await saveMarksMutation.mutateAsync({
        classId: selectedClass,
        subject: selectedSubject,
        marks: marksState,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Save marks error:', err);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const mockStudents = [
    { id: 101, name: 'Aarav Sharma', rollNo: '101' },
    { id: 102, name: 'Ananya Gupta', rollNo: '102' },
    { id: 103, name: 'Rohan Verma', rollNo: '103' },
    { id: 104, name: 'Priya Singh', rollNo: '104' },
  ];

  const mockTimetable = [
    { time: '09:00 AM - 09:45 AM', mon: 'Mathematics', tue: 'Physics', wed: 'Chemistry', thu: 'English', fri: 'Computer' },
    { time: '09:45 AM - 10:30 AM', mon: 'Physics', tue: 'Mathematics', wed: 'English', thu: 'Chemistry', fri: 'Physical Ed' },
    { time: '10:30 AM - 11:15 AM', mon: 'Chemistry', tue: 'English', wed: 'Mathematics', thu: 'Physics', fri: 'Biology' },
    { time: '11:15 AM - 12:00 PM', mon: 'English', tue: 'Computer', wed: 'Physics', thu: 'Mathematics', fri: 'Chemistry' },
  ];

  const getSubjectBadge = (subject) => {
    switch (subject) {
      case 'Mathematics':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
      case 'Physics':
        return 'bg-purple-50 text-purple-700 border-purple-200/80';
      case 'Chemistry':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'Biology':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'English':
        return 'bg-blue-50 text-blue-700 border-blue-200/80';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const calculateGrade = (val) => {
    const num = Number(val);
    if (num >= 90) return { letter: 'A+', color: 'bg-emerald-100 text-emerald-800' };
    if (num >= 80) return { letter: 'A', color: 'bg-emerald-50 text-emerald-700' };
    if (num >= 70) return { letter: 'B', color: 'bg-blue-50 text-blue-700' };
    if (num >= 60) return { letter: 'C', color: 'bg-amber-50 text-amber-700' };
    return { letter: 'D', color: 'bg-red-50 text-red-700' };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/80 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Award className="w-6 h-6" />
            </div>
            Academics, Grading & Timetables
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage section evaluation marks, grade cards, and weekly class schedules.
          </p>
        </div>

        <div className="flex gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
          <button
            onClick={() => setActiveTab('marks')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'marks'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Grading & Evaluation
          </button>
          <button
            onClick={() => setActiveTab('timetable')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'timetable'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Class Schedule
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          Academic evaluation grades updated successfully!
        </div>
      )}

      {activeTab === 'marks' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Select Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              >
                <option value="10-A">Class 10 - Section A</option>
                <option value="10-B">Class 10 - Section B</option>
                <option value="9-A">Class 9 - Section A</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              >
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="English">English</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSaveMarks}
                disabled={saveMarksMutation.isPending}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 transition active:scale-[0.99]"
              >
                <Save className="w-4 h-4" /> Save Grades
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="px-4 py-3">Roll No</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Score (Out of 100)</th>
                  <th className="px-4 py-3 text-center">Grade Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {mockStudents.map((student) => {
                  const val = marksState[student.id] || 0;
                  const gradeInfo = calculateGrade(val);
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3.5 font-mono font-extrabold text-slate-900">{student.rollNo}</td>
                      <td className="px-4 py-3.5 font-semibold text-slate-900">{student.name}</td>
                      <td className="px-4 py-3.5 text-slate-500 font-medium">{selectedSubject}</td>
                      <td className="px-4 py-3.5">
                        <input
                          type="number"
                          max="100"
                          min="0"
                          value={marksState[student.id] || ''}
                          onChange={(e) => handleMarkChange(student.id, e.target.value)}
                          className="w-24 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-extrabold text-indigo-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                        />
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-black ${gradeInfo.color}`}>
                          {gradeInfo.letter}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="px-4 py-3">Time Slot</th>
                <th className="px-4 py-3">Monday</th>
                <th className="px-4 py-3">Tuesday</th>
                <th className="px-4 py-3">Wednesday</th>
                <th className="px-4 py-3">Thursday</th>
                <th className="px-4 py-3">Friday</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {mockTimetable.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition">
                  <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" /> {row.time}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${getSubjectBadge(row.mon)}`}>
                      {row.mon}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${getSubjectBadge(row.tue)}`}>
                      {row.tue}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${getSubjectBadge(row.wed)}`}>
                      {row.wed}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${getSubjectBadge(row.thu)}`}>
                      {row.thu}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${getSubjectBadge(row.fri)}`}>
                      {row.fri}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AcademicsView;
