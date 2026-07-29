import React, { useState, useEffect } from "react";
import useAuthStore from "../store/authStore";
import api from "../api/axios";
import {
  CheckCircle,
  FileSpreadsheet,
  Plus,
  Send,
  Calendar as CalendarIcon,
  Save,
  Check,
  AlertCircle,
  Lock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const TeacherDashboard = ({ activeTab: initialActiveTab = "overview" }) => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState(initialActiveTab); // overview, timetable, attendance, homework, exams

  useEffect(() => {
    setActiveTab(initialActiveTab);
  }, [initialActiveTab]);
  const todayStr = new Date().toISOString().split("T")[0];
  const isSunday = new Date().getDay() === 0;

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [attendanceCalendar, setAttendanceCalendar] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(todayStr);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [attendanceFilterTab, setAttendanceFilterTab] = useState("all"); // 'all', 'present', 'absent'
  const [attendanceSubmittedToday, setAttendanceSubmittedToday] =
    useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);

  // Attendance Calendar Month & Year State
  const [calMonth, setCalMonth] = useState(new Date().getMonth() + 1);
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  // Exam Marks state
  const [selectedExam, setSelectedExam] = useState("1"); // Exam ID 1 (Mid Term)
  const [marksData, setMarksData] = useState({}); // { student_id: mark }
  const [savingMarks, setSavingMarks] = useState(false);
  const [message, setMessage] = useState("");

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
    }
  }, [selectedClass]);

  const fetchTeacherClasses = async () => {
    try {
      const res = await api.get("/teacher/classes");
      const data = res.data?.data || [];
      setClasses(data);
      if (data.length > 0) {
        setSelectedClass(data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch teacher classes:", err);
    }
  };

  const fetchClassStudents = async (classId) => {
    try {
      const res = await api.get(`/teacher/classes/${classId}/students`);
      const data = res.data?.data || [];
      setStudents(data);

      const initAtt = {};
      data.forEach((s) => {
        initAtt[s.id] = "present";
      });
      let isMarked = false;

      // Fetch today's saved attendance from DB if available
      try {
        const attRes = await api.get(
          `/attendance/section/${classId}/date/${todayStr}`,
        );
        if (
          attRes.data?.data &&
          Array.isArray(attRes.data.data) &&
          attRes.data.data.length > 0
        ) {
          const hasStatus = attRes.data.data.some((r) => r.status != null);
          if (hasStatus) {
            isMarked = true;
            attRes.data.data.forEach((r) => {
              if (r.status) {
                initAtt[r.student_id] =
                  r.status.toLowerCase() === "absent" ? "absent" : "present";
              }
            });
          }
        }
      } catch (attErr) {
        // Fall back
      }

      setAttendanceRecords(initAtt);
      setAttendanceSubmittedToday(isMarked);

      // Initialize marks
      const initMarks = {};
      data.forEach((s) => {
        initMarks[s.id] = "";
      });
      setMarksData(initMarks);
    } catch (err) {
      console.error("Failed to fetch class students:", err);
    }
  };

  const fetchTeacherTimetable = async () => {
    try {
      const res = await api.get("/teacher/my-timetable");
      setTimetable(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch timetable:", err);
    }
  };

  const fetchAttendanceCalendar = async (
    sectionId,
    month = calMonth,
    year = calYear,
  ) => {
    try {
      const res = await api.get(`/attendance/calendar/${sectionId}`, {
        params: { month, year },
      });
      setAttendanceCalendar(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch attendance calendar:", err);
    }
  };

  const handlePrevMonth = () => {
    if (calMonth === 1) {
      const targetM = 12;
      const targetY = calYear - 1;
      setCalMonth(targetM);
      setCalYear(targetY);
      if (selectedClass?.section_id)
        fetchAttendanceCalendar(selectedClass.section_id, targetM, targetY);
    } else {
      const targetM = calMonth - 1;
      setCalMonth(targetM);
      if (selectedClass?.section_id)
        fetchAttendanceCalendar(selectedClass.section_id, targetM, calYear);
    }
  };

  const handleNextMonth = () => {
    if (calMonth === 12) {
      const targetM = 1;
      const targetY = calYear + 1;
      setCalMonth(targetM);
      setCalYear(targetY);
      if (selectedClass?.section_id)
        fetchAttendanceCalendar(selectedClass.section_id, targetM, targetY);
    } else {
      const targetM = calMonth + 1;
      setCalMonth(targetM);
      if (selectedClass?.section_id)
        fetchAttendanceCalendar(selectedClass.section_id, targetM, calYear);
    }
  };

  const handleMarkAttendance = async () => {
    if (!selectedClass?.section_id || !selectedClass?.is_class_teacher) {
      alert("You can only mark attendance for your assigned homeroom section.");
      return;
    }
    if (isSunday) {
      alert("Attendance cannot be marked on Sundays.");
      return;
    }
    if (attendanceSubmittedToday) {
      alert("Attendance for today has already been submitted and locked.");
      return;
    }
    try {
      setSavingAttendance(true);
      const records = Object.entries(attendanceRecords).map(
        ([student_id, status]) => ({
          student_id: Number(student_id),
          status: status === "absent" ? "absent" : "present",
        }),
      );

      await api.post("/attendance/mark", {
        section_id: selectedClass.section_id,
        date: todayStr,
        records,
      });

      setMessage("Today's Attendance saved and locked successfully!");
      setAttendanceSubmittedToday(true);
      setTimeout(() => setMessage(""), 4000);
      fetchAttendanceCalendar(selectedClass.section_id);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save attendance");
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleSaveMarks = async () => {
    if (!selectedClass?.subject_id) {
      alert("Subject ID is missing for this class.");
      return;
    }
    try {
      setSavingMarks(true);
      const entries = Object.entries(marksData).map(
        ([student_id, marks_obtained]) => ({
          student_id: Number(student_id),
          marks_obtained: Number(marks_obtained),
          max_marks: 100,
        }),
      );

      await api.post(
        `/marks/exam/${selectedExam}/subject/${selectedClass.subject_id}/bulk`,
        {
          entries,
        },
      );

      setMessage("Exam marks saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save marks");
    } finally {
      setSavingMarks(false);
    }
  };

  // Attendance Metrics & Filtering (Strictly Present vs Absent)
  const totalStudentsCount = students.length;
  const presentStudentsList = students.filter(
    (s) => attendanceRecords[s.id] === "present",
  );
  const absentStudentsList = students.filter(
    (s) => attendanceRecords[s.id] === "absent",
  );
  const presentCount = presentStudentsList.length;
  const absentCount = absentStudentsList.length;
  const presentPercentage =
    totalStudentsCount > 0
      ? Math.round((presentCount / totalStudentsCount) * 100)
      : 0;

  const filteredStudentsForAttendance = students.filter((s) => {
    if (attendanceFilterTab === "present")
      return attendanceRecords[s.id] === "present";
    if (attendanceFilterTab === "absent")
      return attendanceRecords[s.id] === "absent";
    return true;
  });

  // Monthly Attendance Calendar Grid Computation
  const daysInMonth = new Date(calYear, calMonth, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth - 1, 1).getDay();
  const calendarDataMap = {};
  (attendanceCalendar || []).forEach((r) => {
    if (r.date) calendarDataMap[r.date] = r;
  });

  return (
    <div className="space-y-6 pb-12">
      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" /> {message}
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Class & Section Selector Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-extrabold text-slate-800 text-base uppercase tracking-wider px-1">
            My Assigned Classes
          </h3>
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
                    ? "bg-teal-50 border-teal-300 shadow-sm ring-2 ring-teal-500/20"
                    : "bg-white border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4
                    className={`font-black text-sm ${selectedClass?.name === cls.name ? "text-teal-900" : "text-slate-800"}`}
                  >
                    {cls.name}
                  </h4>
                  {cls.is_class_teacher && (
                    <span className="text-[9px] font-extrabold bg-teal-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Homeroom
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1 text-xs font-medium mt-2">
                  <span
                    className={
                      selectedClass?.name === cls.name
                        ? "text-teal-700 font-semibold"
                        : "text-slate-500"
                    }
                  >
                    Subject: {cls.subject}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Role: {cls.role}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Workstation Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="p-6">
              {/* --- Overview Tab --- */}
              {activeTab === "overview" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-xl font-black text-slate-900">
                        {selectedClass?.name || "Class Overview"}
                      </h2>
                      <p className="text-xs font-semibold text-slate-500 mt-1">
                        Managing {selectedClass?.subject || "Subject"} for this
                        section. Total {students.length} students enrolled.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-100 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-teal-700">
                        Enrolled Students
                      </span>
                      <h3 className="text-2xl font-black text-slate-900">
                        {students.length}
                      </h3>
                    </div>
                    <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-amber-700">
                        Assigned Subject
                      </span>
                      <h3 className="text-lg font-black text-slate-900">
                        {selectedClass?.subject || "N/A"}
                      </h3>
                    </div>
                    <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-purple-700">
                        Class Role
                      </span>
                      <h3 className="text-lg font-black text-slate-900">
                        {selectedClass?.role || "Subject Teacher"}
                      </h3>
                    </div>
                  </div>

                  {/* Student Directory Table Preview */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Student Roll
                    </h3>
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
                              <td className="py-2.5 px-4 font-mono font-bold text-slate-700">
                                {s.roll}
                              </td>
                              <td className="py-2.5 px-4 font-bold text-slate-900">
                                {s.name}
                              </td>
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
              {activeTab === "timetable" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-slate-900">
                        Personal Weekly Timetable
                      </h2>
                      <p className="text-xs font-semibold text-slate-500 mt-1">
                        Your teaching schedule across all classes.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {daysOfWeek.map((day, dayIdx) => {
                      const dayClasses = timetable.filter(
                        (t) => Number(t.day_of_week) === dayIdx + 1,
                      );
                      return (
                        <div
                          key={day}
                          className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3"
                        >
                          <h4 className="font-extrabold text-xs text-teal-800 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center justify-between">
                            <span>{day}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              {dayClasses.length} Periods
                            </span>
                          </h4>
                          {dayClasses.length === 0 ? (
                            <p className="text-xs text-slate-400 font-medium italic">
                              No periods assigned
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {dayClasses.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="p-3 bg-white rounded-xl border border-slate-100 shadow-2xs space-y-1"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-extrabold text-slate-900">
                                      Period {item.period_no}:{" "}
                                      {item.subject_name}
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
              {activeTab === "attendance" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-slate-900">
                        Attendance Register & Roll Call
                      </h2>
                      <p className="text-xs font-semibold text-slate-500 mt-1">
                        Daily roll-call & attendance percentage breakdown for{" "}
                        {selectedClass?.name}.
                      </p>
                    </div>
                    {selectedClass?.is_class_teacher ? (
                      <button
                        onClick={handleMarkAttendance}
                        disabled={
                          savingAttendance ||
                          attendanceSubmittedToday ||
                          isSunday
                        }
                        className={`px-5 py-2.5 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 ${
                          attendanceSubmittedToday || isSunday
                            ? "bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed"
                            : "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20 cursor-pointer"
                        }`}
                      >
                        {attendanceSubmittedToday ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600" />{" "}
                            Attendance Submitted
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            {savingAttendance
                              ? "Saving Roll..."
                              : "Submit Today's Attendance"}
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                        Homeroom Teacher Only
                      </div>
                    )}
                  </div>

                  {selectedClass?.is_class_teacher ? (
                    <>
                      {/* Date Restriction Banner (Locked to Current Day) */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200/80 gap-3">
                        <div className="flex items-center gap-3">
                          <CalendarIcon className="w-5 h-5 text-teal-600" />
                          <label className="text-xs font-bold text-slate-700">
                            Attendance Date:
                          </label>
                          <input
                            type="date"
                            value={todayStr}
                            min={todayStr}
                            max={todayStr}
                            disabled
                            className="px-3 py-1.5 bg-slate-200/80 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-not-allowed"
                            title="Attendance can only be marked for the current day"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-extrabold rounded-xl flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />{" "}
                            Current Day Only ({todayStr})
                          </span>
                        </div>
                      </div>

                      {/* Total Present Percentage KPI & Statistics Banner */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200/80 flex items-center justify-between shadow-xs">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider">
                              Today's Present Rate
                            </span>
                            <div className="text-2xl font-black text-emerald-900 mt-0.5">
                              {presentPercentage}%
                            </div>
                            <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                              {presentCount} of {totalStudentsCount} Students
                              Present
                            </p>
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-emerald-500/20">
                            {presentPercentage}%
                          </div>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-emerald-50/60 to-slate-50 rounded-2xl border border-emerald-100 flex items-center justify-between shadow-xs">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider">
                              Present Students
                            </span>
                            <div className="text-2xl font-black text-slate-900 mt-0.5">
                              {presentCount}
                            </div>
                            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                              Students Marked Present
                            </p>
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                            <Check className="w-5 h-5" />
                          </div>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-rose-50/60 to-slate-50 rounded-2xl border border-rose-100 flex items-center justify-between shadow-xs">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase text-rose-700 tracking-wider">
                              Absent Students
                            </span>
                            <div className="text-2xl font-black text-slate-900 mt-0.5">
                              {absentCount}
                            </div>
                            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                              Students Marked Absent
                            </p>
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm">
                            <AlertCircle className="w-5 h-5" />
                          </div>
                        </div>
                      </div>

                      {/* Sub-tabs for Present and Absent Students & Batch Controls */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 pt-2">
                        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setAttendanceFilterTab("all")}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                              attendanceFilterTab === "all"
                                ? "bg-white text-slate-900 shadow-xs"
                                : "text-slate-500 hover:text-slate-900"
                            }`}
                          >
                            All Students ({totalStudentsCount})
                          </button>
                          <button
                            type="button"
                            onClick={() => setAttendanceFilterTab("present")}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                              attendanceFilterTab === "present"
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "text-slate-500 hover:text-slate-900"
                            }`}
                          >
                            Present Students ({presentCount})
                          </button>
                          <button
                            type="button"
                            onClick={() => setAttendanceFilterTab("absent")}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                              attendanceFilterTab === "absent"
                                ? "bg-rose-600 text-white shadow-xs"
                                : "text-slate-500 hover:text-slate-900"
                            }`}
                          >
                            Absent Students ({absentCount})
                          </button>
                        </div>

                        {/* Quick Batch Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={attendanceSubmittedToday || isSunday}
                            onClick={() => {
                              const nextRecs = {};
                              students.forEach(
                                (s) => (nextRecs[s.id] = "present"),
                              );
                              setAttendanceRecords(nextRecs);
                            }}
                            className={`px-3 py-1.5 font-bold text-xs rounded-xl border transition ${
                              attendanceSubmittedToday || isSunday
                                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 cursor-pointer"
                            }`}
                          >
                            Mark All Present
                          </button>
                          <button
                            type="button"
                            disabled={attendanceSubmittedToday || isSunday}
                            onClick={() => {
                              const nextRecs = {};
                              students.forEach(
                                (s) => (nextRecs[s.id] = "absent"),
                              );
                              setAttendanceRecords(nextRecs);
                            }}
                            className={`px-3 py-1.5 font-bold text-xs rounded-xl border transition ${
                              attendanceSubmittedToday || isSunday
                                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                : "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 cursor-pointer"
                            }`}
                          >
                            Mark All Absent
                          </button>
                        </div>
                      </div>

                      {/* Attendance Table Filtered View */}
                      <div className="overflow-x-auto rounded-2xl border border-slate-200">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                            <tr>
                              <th className="py-3 px-4">Roll No</th>
                              <th className="py-3 px-4">Student Name</th>
                              <th className="py-3 px-4 text-right">
                                Status (Present / Absent)
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredStudentsForAttendance.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={3}
                                  className="py-8 text-center text-slate-400 font-medium italic"
                                >
                                  {attendanceFilterTab === "present"
                                    ? "No students marked present for today."
                                    : attendanceFilterTab === "absent"
                                      ? "No students marked absent for today."
                                      : "No students found for this section."}
                                </td>
                              </tr>
                            ) : (
                              filteredStudentsForAttendance.map((s) => (
                                <tr
                                  key={s.id}
                                  className="hover:bg-slate-50/60 transition"
                                >
                                  <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                                    {s.roll}
                                  </td>
                                  <td className="py-3.5 px-4 font-bold text-slate-900">
                                    {s.name}
                                  </td>
                                  <td className="py-3.5 px-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      {[
                                        {
                                          key: "present",
                                          label: "Present",
                                          activeClass:
                                            "bg-emerald-600 text-white border-emerald-600 shadow-xs",
                                        },
                                        {
                                          key: "absent",
                                          label: "Absent",
                                          activeClass:
                                            "bg-rose-600 text-white border-rose-600 shadow-xs",
                                        },
                                      ].map((st) => (
                                        <button
                                          key={st.key}
                                          type="button"
                                          disabled={
                                            attendanceSubmittedToday || isSunday
                                          }
                                          onClick={() =>
                                            setAttendanceRecords({
                                              ...attendanceRecords,
                                              [s.id]: st.key,
                                            })
                                          }
                                          className={`px-3 py-1 text-[11px] font-extrabold uppercase rounded-lg border transition ${
                                            attendanceSubmittedToday || isSunday
                                              ? attendanceRecords[s.id] ===
                                                st.key
                                                ? st.key === "present"
                                                  ? "bg-emerald-100 text-emerald-800 border-emerald-200 cursor-not-allowed"
                                                  : "bg-rose-100 text-rose-800 border-rose-200 cursor-not-allowed"
                                                : "bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed"
                                              : attendanceRecords[s.id] ===
                                                  st.key
                                                ? st.activeClass +
                                                  " cursor-pointer"
                                                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100 cursor-pointer"
                                          }`}
                                        >
                                          {st.label}
                                        </button>
                                      ))}
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* --- Interactive Monthly Attendance Calendar View at Bottom --- */}
                      <div className="space-y-3 pt-6 border-t border-slate-100">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-extrabold text-slate-900">
                              Monthly Attendance Calendar
                            </h3>
                          </div>

                          {/* Month Navigator */}
                          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                            <button
                              type="button"
                              onClick={handlePrevMonth}
                              className="p-1 text-slate-600 hover:bg-white rounded-lg transition cursor-pointer"
                              title="Previous Month"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-xs font-black text-slate-800 min-w-[110px] text-center">
                              {monthNames[calMonth - 1]} {calYear}
                            </span>
                            <button
                              type="button"
                              onClick={handleNextMonth}
                              className="p-1 text-slate-600 hover:bg-white rounded-lg transition cursor-pointer"
                              title="Next Month"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                          {/* Weekday Headers */}
                          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center font-extrabold text-[10px] uppercase tracking-wider text-slate-500 py-2.5">
                            <div className="text-rose-500">Sun (Off)</div>
                            <div>Mon</div>
                            <div>Tue</div>
                            <div>Wed</div>
                            <div>Thu</div>
                            <div>Fri</div>
                            <div>Sat</div>
                          </div>

                          {/* Month Days Grid */}
                          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
                            {/* Blank Padding Days */}
                            {Array.from({ length: firstDayOfWeek }).map(
                              (_, idx) => (
                                <div
                                  key={`empty-${idx}`}
                                  className="h-20 bg-slate-50/40 p-1.5"
                                />
                              ),
                            )}

                            {/* Month Days 1..daysInMonth */}
                            {Array.from({ length: daysInMonth }).map(
                              (_, dayIdx) => {
                                const dayNum = dayIdx + 1;
                                const dateStr = `${calYear}-${String(calMonth).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                                const dayOfWeek = new Date(
                                  calYear,
                                  calMonth - 1,
                                  dayNum,
                                ).getDay();
                                const isSun = dayOfWeek === 0;
                                const record = calendarDataMap[dateStr];
                                const isToday = dateStr === todayStr;

                                return (
                                  <div
                                    key={dateStr}
                                    className={`h-22 p-2 flex flex-col justify-between transition ${
                                      isSun
                                        ? "bg-slate-100/60 border-slate-200 cursor-not-allowed"
                                        : isToday
                                          ? "bg-teal-50/40 ring-1 ring-teal-500/30"
                                          : "hover:bg-slate-50/80"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span
                                        className={`text-xs font-black ${
                                          isSun
                                            ? "text-slate-400"
                                            : isToday
                                              ? "text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded-md"
                                              : "text-slate-800"
                                        }`}
                                      >
                                        {dayNum}
                                      </span>
                                      {isToday && (
                                        <span className="text-[9px] font-bold uppercase text-teal-600 bg-teal-50 px-1 rounded">
                                          Today
                                        </span>
                                      )}
                                    </div>

                                    {isSun ? (
                                      <div className="text-[10px] font-bold text-slate-400 italic text-center my-auto">
                                        Sunday (Off)
                                      </div>
                                    ) : record ? (
                                      <div className="space-y-1">
                                        <span
                                          className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black w-full text-center ${
                                            record.present_percentage >= 75
                                              ? "bg-emerald-100 text-emerald-800"
                                              : "bg-rose-100 text-rose-800"
                                          }`}
                                        >
                                          {record.present_percentage}% Present
                                        </span>
                                        <div className="text-[9px] font-semibold text-slate-500 flex justify-between px-0.5">
                                          <span>P: {record.present_count}</span>
                                          <span>A: {record.absent_count}</span>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="text-[9px] font-semibold text-slate-400 italic text-center my-auto">
                                        {dateStr <= todayStr
                                          ? "Unmarked"
                                          : "Upcoming"}
                                      </div>
                                    )}
                                  </div>
                                );
                              },
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-8 text-center bg-amber-50/40 rounded-3xl border border-amber-200 space-y-2">
                      <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
                      <h4 className="text-base font-bold text-amber-900">
                        Subject Teacher View
                      </h4>
                      <p className="text-xs text-amber-700 font-medium">
                        Attendance marking and daily roll percentages are
                        restricted to the homeroom Class Teacher.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* --- Exam Marks Tab --- */}
              {activeTab === "exams" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-4">
                    <div>
                      <h2 className="text-xl font-black text-slate-900">
                        Spreadsheet Exam Marks Entry
                      </h2>
                      <p className="text-xs font-semibold text-slate-500 mt-1">
                        Bulk enter and update marks for {selectedClass?.name} (
                        {selectedClass?.subject}).
                      </p>
                    </div>
                    <button
                      onClick={handleSaveMarks}
                      disabled={savingMarks}
                      className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {savingMarks
                        ? "Saving Marks..."
                        : "Save Marks Spreadsheet"}
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
                          <th className="py-3 px-4 text-right">
                            {selectedClass?.subject || "Subject"} Marks (Max
                            100)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {students.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50/60">
                            <td className="py-3 px-4 font-mono font-bold text-slate-700">
                              {s.roll}
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-900">
                              {s.name}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={marksData[s.id] ?? ""}
                                onChange={(e) =>
                                  setMarksData({
                                    ...marksData,
                                    [s.id]: e.target.value,
                                  })
                                }
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
