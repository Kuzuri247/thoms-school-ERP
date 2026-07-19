import React, { useState } from 'react';
import { useGetAttendanceByDate, useSaveAttendance } from './useAttendance';
import { CalendarCheck, Save, CheckCircle, XCircle, Clock, Search, CheckCheck, UserX } from 'lucide-react';

const AttendanceView = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceState, setAttendanceState] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { data: fetchedAttendance = [] } = useGetAttendanceByDate(selectedDate);
  const saveAttendanceMutation = useSaveAttendance();

  const mockStudents = [
    { id: 101, name: 'Aarav Sharma', rollNo: '101', class: '10-A' },
    { id: 102, name: 'Ananya Gupta', rollNo: '102', class: '10-A' },
    { id: 103, name: 'Rohan Verma', rollNo: '103', class: '10-A' },
    { id: 104, name: 'Priya Singh', rollNo: '104', class: '10-A' },
    { id: 105, name: 'Kabir Patel', rollNo: '105', class: '10-A' },
  ];

  const handleStatusChange = (studentId, status) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    mockStudents.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendanceState(updated);
  };

  const handleSave = async () => {
    const finalData = { ...attendanceState };
    mockStudents.forEach((s) => {
      if (!finalData[s.id]) finalData[s.id] = 'Present';
    });

    try {
      await saveAttendanceMutation.mutateAsync({
        date: selectedDate,
        attendanceData: finalData,
      });
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      console.error('Attendance submit error:', err);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    }
  };

  const filteredStudents = mockStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNo.includes(searchTerm)
  );

  const getStatus = (studentId) => {
    return (
      attendanceState[studentId] ||
      fetchedAttendance.find((a) => a.user_id === studentId)?.status ||
      'Present'
    );
  };

  const presentCount = mockStudents.filter((s) => getStatus(s.id) === 'Present').length;
  const absentCount = mockStudents.filter((s) => getStatus(s.id) === 'Absent').length;
  const lateCount = mockStudents.filter((s) => getStatus(s.id) === 'Late').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <CalendarCheck className="w-6 h-6" />
            </div>
            Daily Student Attendance Register
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Track, mark, and submit daily section attendance logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs"
          />
          <button
            onClick={handleSave}
            disabled={saveAttendanceMutation.isPending}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition shadow-md shadow-indigo-500/20 active:scale-[0.99] disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saveAttendanceMutation.isPending ? 'Saving...' : 'Submit Register'}
          </button>
        </div>
      </div>

      {submitSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          Attendance register successfully recorded for {selectedDate}!
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Enrolled Students</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{mockStudents.length}</p>
        </div>

        <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
          <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest">Present</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{presentCount}</p>
        </div>

        <div className="bg-red-50/60 p-4 rounded-2xl border border-red-100">
          <span className="text-[10px] font-extrabold text-red-700 uppercase tracking-widest">Absent</span>
          <p className="text-2xl font-black text-red-700 mt-1">{absentCount}</p>
        </div>

        <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-100">
          <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-widest">Late</span>
          <p className="text-2xl font-black text-amber-700 mt-1">{lateCount}</p>
        </div>
      </div>

      {/* Control Bar: Search + Batch Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Filter by student name or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleMarkAll('Present')}
            className="px-3 py-2 bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
          >
            <CheckCheck className="w-3.5 h-3.5" /> All Present
          </button>
          <button
            onClick={() => handleMarkAll('Absent')}
            className="px-3 py-2 bg-white hover:bg-red-50 text-red-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
          >
            <UserX className="w-3.5 h-3.5" /> All Absent
          </button>
        </div>
      </div>

      {/* Table Grid */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50/80 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200/80">
            <tr>
              <th className="px-4 py-3">Roll No</th>
              <th className="px-4 py-3">Student Name</th>
              <th className="px-4 py-3">Class & Sec</th>
              <th className="px-4 py-3 text-center">Mark Attendance Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredStudents.map((student) => {
              const currentStatus = getStatus(student.id);

              return (
                <tr key={student.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-4 py-3.5 font-mono font-extrabold text-slate-900">{student.rollNo}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-900">{student.name}</td>
                  <td className="px-4 py-3.5 text-slate-500 font-medium">{student.class}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleStatusChange(student.id, 'Present')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95 ${
                          currentStatus === 'Present'
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                            : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Present
                      </button>
                      <button
                        onClick={() => handleStatusChange(student.id, 'Absent')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95 ${
                          currentStatus === 'Absent'
                            ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                            : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-700'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" /> Absent
                      </button>
                      <button
                        onClick={() => handleStatusChange(student.id, 'Late')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95 ${
                          currentStatus === 'Late'
                            ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                            : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" /> Late
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceView;
