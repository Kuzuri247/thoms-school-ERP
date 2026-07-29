import React, { useState, useEffect } from "react";
import useAuthStore from "../store/authStore";
import api from "../api/axios";
import {
  CheckCircle,
  Calendar as CalendarIcon,
  Save,
  Check,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Edit3,
  X,
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

  const localNow = new Date();
  const todayStr = `${localNow.getFullYear()}-${String(localNow.getMonth() + 1).padStart(2, "0")}-${String(localNow.getDate()).padStart(2, "0")}`;
  const isSunday = localNow.getDay() === 0;

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [attendanceCalendar, setAttendanceCalendar] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [attendanceFilterTab, setAttendanceFilterTab] = useState("all"); // 'all', 'present', 'absent'
  const [attendanceSubmittedToday, setAttendanceSubmittedToday] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [showConfirmAttendanceModal, setShowConfirmAttendanceModal] = useState(false);

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
      fetchClassStudents(selectedClass.id, selectedClass.section_id);
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

  const fetchClassStudents = async (classId, sectionId) => {
    try {
      const targetSectionId = sectionId || classId;
      const res = await api.get(`/teacher/classes/${targetSectionId}/students`);
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
          `/attendance/section/${targetSectionId}/date/${todayStr}`,
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

  const shiftMonth = (offset) => {
    let newM = calMonth + offset;
    let newY = calYear;
    if (newM > 12) {
      newM = 1;
      newY += 1;
    } else if (newM < 1) {
      newM = 12;
      newY -= 1;
    }
    setCalMonth(newM);
    setCalYear(newY);
    if (selectedClass?.section_id) {
      fetchAttendanceCalendar(selectedClass.section_id, newM, newY);
    }
  };

  const handleConfirmMarkAttendance = async () => {
    if (!selectedClass?.section_id || !selectedClass?.is_class_teacher) {
      alert("You can only mark attendance for your assigned homeroom section.");
      return;
    }
    if (isSunday) {
      alert("Attendance cannot be marked on Sundays.");
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
      setShowConfirmAttendanceModal(false);
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
      const entries = Object.entries(marksData)
        .filter(([_, val]) => val !== "" && val !== null && val !== undefined)
        .map(([student_id, val]) => {
          const clamped = Math.max(0, Math.min(100, Number(val) || 0));
          return {
            student_id: Number(student_id),
            marks_obtained: clamped,
            max_marks: 100,
          };
        });

      await api.post(
        `/marks/exam/${selectedExam}/subject/${selectedClass.subject_id}/bulk`,
        {
          exam_id: Number(selectedExam),
          subject_id: Number(selectedClass.subject_id),
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

  const totalStudentsCount = students.length;
  const presentStudentsList = students.filter(
    (s) => attendanceRecords[s.id] === "present",
  );
  const presentCount = presentStudentsList.length;
  const absentCount = totalStudentsCount - presentCount;
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-extrabold text-slate-800 text-base uppercase tracking-wider px-1">
            My Assigned Classes
          </h3>
          {classes.length === 0 ? (
            <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-400 font-medium">
              No assigned classes found.
            </div>
          ) : (
            classes.map((cls) => (
              <div
                key={cls.section_id || cls.id || cls.name}
                onClick={() => setSelectedClass(cls)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedClass?.name === cls.name
                    ? "bg-teal-50 border-teal-300 shadow-xs ring-2 ring-teal-500/20"
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

        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden">
            <div className="p-6">
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
                </div>
              )}

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
                      <div className="flex items-center gap-2">
                        {attendanceSubmittedToday ? (
                          <>
                            <span className="px-3 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
                              <Check className="w-4 h-4 text-emerald-600" /> Attendance Submitted Today
                            </span>
                            <button
                              onClick={() => setAttendanceSubmittedToday(false)}
                              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-teal-600" /> Amend Attendance
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setShowConfirmAttendanceModal(true)}
                            disabled={savingAttendance || isSunday}
                            className={`px-5 py-2.5 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 ${
                              isSunday
                                ? "bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed"
                                : "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20 cursor-pointer"
                            }`}
                          >
                            <Save className="w-4 h-4" /> Submit Today's Attendance
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                        Homeroom Teacher Only
                      </div>
                    )}
                  </div>

                  {selectedClass?.is_class_teacher ? (
                    <>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200/80 gap-3">
                        <div className="flex items-center gap-3">
                          <CalendarIcon className="w-5 h-5 text-teal-600" />
                          <label className="text-xs font-bold text-slate-700">
                            Attendance Date:
                          </label>
                          <input
                            type="date"
                            value={todayStr}
                            disabled
                            className="px-3 py-1.5 bg-slate-200/80 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-not-allowed"
                            title="Attendance can only be marked for the current day"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider">
                              Today's Present Rate
                            </span>
                            <div className="text-2xl font-black text-emerald-900 mt-0.5">
                              {presentPercentage}%
                            </div>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                            P
                          </div>
                        </div>

                        <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider">
                              Total Present
                            </span>
                            <div className="text-xl font-extrabold text-emerald-900 mt-0.5">
                              {presentCount} Students
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase text-rose-700 tracking-wider">
                              Total Absent
                            </span>
                            <div className="text-xl font-extrabold text-rose-900 mt-0.5">
                              {absentCount} Students
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <h3 className="text-sm font-extrabold text-slate-900">
                            Roll Call Roster
                          </h3>
                          <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs font-bold">
                            <button
                              onClick={() => setAttendanceFilterTab("all")}
                              className={`px-3 py-1 rounded-lg transition ${attendanceFilterTab === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"}`}
                            >
                              All ({students.length})
                            </button>
                            <button
                              onClick={() => setAttendanceFilterTab("present")}
                              className={`px-3 py-1 rounded-lg transition ${attendanceFilterTab === "present" ? "bg-emerald-600 text-white shadow-2xs" : "text-slate-500"}`}
                            >
                              Present ({presentCount})
                            </button>
                            <button
                              onClick={() => setAttendanceFilterTab("absent")}
                              className={`px-3 py-1 rounded-lg transition ${attendanceFilterTab === "absent" ? "bg-rose-600 text-white shadow-2xs" : "text-slate-500"}`}
                            >
                              Absent ({absentCount})
                            </button>
                          </div>
                        </div>

                        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-2xs">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50/80 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                              <tr>
                                <th className="py-3 px-4">Roll</th>
                                <th className="py-3 px-4">Student Name</th>
                                <th className="py-3 px-4 text-center">Mark Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                              {filteredStudentsForAttendance.length === 0 ? (
                                <tr>
                                  <td
                                    colSpan="3"
                                    className="py-6 text-center text-slate-400 font-medium"
                                  >
                                    No students match the filter.
                                  </td>
                                </tr>
                              ) : (
                                filteredStudentsForAttendance.map((s) => (
                                  <tr key={s.id} className="hover:bg-slate-50/60">
                                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                                      {s.roll}
                                    </td>
                                    <td className="py-3 px-4 font-extrabold text-slate-900">
                                      {s.name}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                      <div className="inline-flex bg-slate-100 p-1 rounded-xl gap-1">
                                        {[
                                          {
                                            key: "present",
                                            label: "Present",
                                            activeClass: "bg-emerald-600 text-white font-extrabold shadow-2xs",
                                          },
                                          {
                                            key: "absent",
                                            label: "Absent",
                                            activeClass: "bg-rose-600 text-white font-extrabold shadow-2xs",
                                          },
                                        ].map((st) => (
                                          <button
                                            key={st.key}
                                            disabled={attendanceSubmittedToday}
                                            onClick={() =>
                                              setAttendanceRecords({
                                                ...attendanceRecords,
                                                [s.id]: st.key,
                                              })
                                            }
                                            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                                              attendanceRecords[s.id] === st.key
                                                ? st.activeClass
                                                : "bg-white text-slate-500 hover:bg-slate-50 cursor-pointer"
                                            } ${attendanceSubmittedToday ? "opacity-70 cursor-not-allowed" : ""}`}
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
                      </div>

                      <div className="space-y-3 pt-6 border-t border-slate-100">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-extrabold text-slate-900">
                              Monthly Attendance Calendar
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                            <button
                              type="button"
                              onClick={() => shiftMonth(-1)}
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
                              onClick={() => shiftMonth(1)}
                              className="p-1 text-slate-600 hover:bg-white rounded-lg transition cursor-pointer"
                              title="Next Month"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center font-extrabold text-[10px] uppercase tracking-wider text-slate-500 py-2.5">
                            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                          </div>
                          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
                            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                              <div key={`empty-${idx}`} className="h-22 bg-slate-50/40 p-1.5" />
                            ))}
                            {Array.from({ length: daysInMonth }).map((_, dayIdx) => {
                              const dayNum = dayIdx + 1;
                              const dateStr = `${calYear}-${String(calMonth).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                              const record = calendarDataMap[dateStr];
                              return (
                                <div key={dateStr} className="h-22 p-2 flex flex-col justify-between">
                                  <span className="text-xs font-black text-slate-800">{dayNum}</span>
                                  {record && (
                                    <span className="text-[9px] font-bold text-teal-700 bg-teal-50 px-1 rounded">
                                      {record.present_percentage}%
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              )}

              {activeTab === "exams" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-4">
                    <div>
                      <h2 className="text-xl font-black text-slate-900">
                        Spreadsheet Exam Marks Entry
                      </h2>
                    </div>
                    <button
                      onClick={handleSaveMarks}
                      disabled={savingMarks}
                      className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      {savingMarks ? "Saving Marks..." : "Save Marks Spreadsheet"}
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">Roll</th>
                          <th className="py-3 px-4">Student Name</th>
                          <th className="py-3 px-4 text-right">Marks (0-100)</th>
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
                                value={marksData[s.id] ?? ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === "") {
                                    setMarksData({ ...marksData, [s.id]: "" });
                                  } else {
                                    const num = Math.max(0, Math.min(100, Number(val)));
                                    setMarksData({ ...marksData, [s.id]: num });
                                  }
                                }}
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

      {showConfirmAttendanceModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-teal-600" /> Confirm Today's Attendance
              </h3>
              <button
                onClick={() => setShowConfirmAttendanceModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs font-semibold text-slate-700">
              <p>Review the summary for <strong>{selectedClass?.name}</strong> on <strong>{todayStr}</strong>:</p>
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-center p-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="text-[10px] font-extrabold uppercase text-emerald-700 block">Present</span>
                  <span className="text-xl font-black text-emerald-900">{presentCount}</span>
                </div>
                <div className="text-center p-2 bg-rose-50 border border-rose-200 rounded-xl">
                  <span className="text-[10px] font-extrabold uppercase text-rose-700 block">Absent</span>
                  <span className="text-xl font-black text-rose-900">{absentCount}</span>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowConfirmAttendanceModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmMarkAttendance}
                disabled={savingAttendance}
                className="px-5 py-2 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition shadow-md flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <Save className="w-4 h-4" /> {savingAttendance ? "Saving..." : "Confirm & Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
