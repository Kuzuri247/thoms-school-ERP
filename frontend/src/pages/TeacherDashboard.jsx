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
  Clock,
  BookText,
  BookOpen,
  Plus,
  Trash2,
  ExternalLink,
  Tv,
  Video,
  Play,
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

  const tomorrowObj = new Date(localNow);
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const minDueDateStr = `${tomorrowObj.getFullYear()}-${String(tomorrowObj.getMonth() + 1).padStart(2, "0")}-${String(tomorrowObj.getDate()).padStart(2, "0")}`;

  const maxDueDateObj = new Date(localNow);
  maxDueDateObj.setMonth(maxDueDateObj.getMonth() + 4);
  const maxDueDateStr = `${maxDueDateObj.getFullYear()}-${String(maxDueDateObj.getMonth() + 1).padStart(2, "0")}-${String(maxDueDateObj.getDate()).padStart(2, "0")}`;

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

  // Teacher Homework State
  const [teacherHomeworks, setTeacherHomeworks] = useState([]);
  const [loadingHomeworks, setLoadingHomeworks] = useState(false);
  const [newHwTitle, setNewHwTitle] = useState("");
  const [newHwDesc, setNewHwDesc] = useState("");
  const [newHwDueDate, setNewHwDueDate] = useState("");
  const [newHwClassroomUrl, setNewHwClassroomUrl] = useState("");
  const [postingHw, setPostingHw] = useState(false);
  const [hwMessage, setHwMessage] = useState("");

  // Teacher E-Learning State
  const [elearningMaterials, setElearningMaterials] = useState([]);
  const [loadingElearning, setLoadingElearning] = useState(false);
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newVideoDesc, setNewVideoDesc] = useState("");
  const [newYoutubeUrl, setNewYoutubeUrl] = useState("");
  const [postingVideo, setPostingVideo] = useState(false);
  const [elearningMessage, setElearningMessage] = useState("");

  useEffect(() => {
    fetchTeacherClasses();
    fetchTeacherTimetable();
    fetchTeacherHomeworks();
    fetchTeacherElearning();
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

  const fetchTeacherHomeworks = async () => {
    try {
      setLoadingHomeworks(true);
      const res = await api.get("/homework/teacher");
      setTeacherHomeworks(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch teacher homeworks:", err);
    } finally {
      setLoadingHomeworks(false);
    }
  };

  const handlePostHomework = async (e) => {
    e.preventDefault();
    if (!selectedClass) {
      alert("Please select a target class to assign homework.");
      return;
    }
    if (!newHwTitle || !newHwDueDate) {
      alert("Title and Due Date are required.");
      return;
    }

    if (newHwDueDate < minDueDateStr) {
      alert(`Homework due date must be at least 1 day ahead from today (tomorrow, ${minDueDateStr}, or later).`);
      return;
    }

    if (newHwDueDate > maxDueDateStr) {
      alert(`Homework due date cannot be more than 4 months in advance (up to ${maxDueDateStr}).`);
      return;
    }

    try {
      setPostingHw(true);
      await api.post("/homework", {
        section_id: selectedClass.section_id,
        subject_id: selectedClass.subject_id,
        title: newHwTitle,
        description: newHwDesc,
        classroom_url: newHwClassroomUrl,
        due_date: newHwDueDate,
      });

      setHwMessage("Homework assigned successfully!");
      setNewHwTitle("");
      setNewHwDesc("");
      setNewHwDueDate("");
      setNewHwClassroomUrl("");
      fetchTeacherHomeworks();
      setTimeout(() => setHwMessage(""), 4000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign homework.");
    } finally {
      setPostingHw(false);
    }
  };

  const fetchTeacherElearning = async () => {
    try {
      setLoadingElearning(true);
      const res = await api.get("/elearning/teacher");
      setElearningMaterials(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch E Learning materials:", err);
    } finally {
      setLoadingElearning(false);
    }
  };

  const handlePostElearning = async (e) => {
    e.preventDefault();
    setElearningMessage("");
    if (!selectedClass?.section_id) {
      alert("Please select an assigned target class section.");
      return;
    }
    if (!newVideoTitle.trim() || !newYoutubeUrl.trim()) {
      alert("Title and YouTube Video link are required.");
      return;
    }

    try {
      setPostingVideo(true);
      await api.post("/elearning", {
        section_id: selectedClass.section_id,
        title: newVideoTitle.trim(),
        description: newVideoDesc.trim(),
        youtube_url: newYoutubeUrl.trim(),
      });
      setElearningMessage("E Learning video shared successfully!");
      setNewVideoTitle("");
      setNewVideoDesc("");
      setNewYoutubeUrl("");
      setTimeout(() => setElearningMessage(""), 4000);
      fetchTeacherElearning();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to share E Learning video.");
    } finally {
      setPostingVideo(false);
    }
  };

  const handleDeleteElearning = async (id) => {
    if (!window.confirm("Are you sure you want to delete this E Learning video?")) return;
    try {
      await api.delete(`/elearning/${id}`);
      setElearningMaterials((prev) => prev.filter((item) => item.id !== id));
      setElearningMessage("Video deleted successfully.");
      setTimeout(() => setElearningMessage(""), 4000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete video.");
    }
  };

  const extractYTId = (url) => {
    if (!url) return null;
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return m ? m[1] : null;
  };

  const handleDeleteHomework = async (id) => {
    if (!window.confirm("Are you sure you want to delete this homework?")) return;
    try {
      await api.delete(`/homework/${id}`);
      setTeacherHomeworks((prev) => prev.filter((h) => h.id !== id));
      setHwMessage("Homework deleted successfully.");
      setTimeout(() => setHwMessage(""), 4000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete homework.");
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
          <h3 className="font-extrabold text-slate-800 text-base uppercase tracking-wider px-1 flex items-center justify-between">
            <span>My Assigned Classes</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {(activeTab === "attendance" ? classes.filter(c => c.is_class_teacher) : classes).length}
            </span>
          </h3>
          {(activeTab === "attendance" ? classes.filter(c => c.is_class_teacher) : classes).length === 0 ? (
            <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-400 font-medium">
              {activeTab === "attendance"
                ? "No homeroom class assigned to your account. Attendance registration is reserved for Class Teachers."
                : "No assigned classes found."}
            </div>
          ) : (
            (activeTab === "attendance" ? classes.filter(c => c.is_class_teacher) : classes).map((cls) => (
              <div
                key={cls.section_id || cls.id || cls.name}
                onClick={() => setSelectedClass(cls)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedClass?.name === cls.name
                    ? "bg-teal-50 border-teal-300 shadow-xs ring-2 ring-teal-500/20"
                    : "bg-white border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <h4
                    className={`font-black text-sm ${selectedClass?.name === cls.name ? "text-teal-900" : "text-slate-800"}`}
                  >
                    {cls.name}
                  </h4>
                  {cls.is_class_teacher ? (
                    <span className="text-[9px] font-extrabold bg-teal-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Homeroom
                    </span>
                  ) : (
                    <span className="text-[9px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Subject Teacher
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
                  <span className="text-slate-500 text-[11px] font-bold">
                    Role: {cls.is_class_teacher ? "Class Teacher (Homeroom)" : `Subject Teacher (${cls.subject})`}
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



              {activeTab === "timetable" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-teal-600" /> My Teaching Schedule (7 Periods)
                      </h2>
                      <p className="text-xs font-semibold text-slate-500 mt-1">
                        Weekly teaching timetable with 7 periods daily and Recess Break after 3rd period.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {daysOfWeek.map((day, dayIdx) => {
                      const dayClasses = timetable.filter((t) => Number(t.day_of_week) === dayIdx + 1);

                      const defaultSlots = [
                        { p: 1, label: "08:30 - 09:15" },
                        { p: 2, label: "09:15 - 10:00" },
                        { p: 3, label: "10:00 - 10:45" },
                        // RECESS BREAK
                        { p: 4, label: "11:15 - 12:00" },
                        { p: 5, label: "12:00 - 12:45" },
                        { p: 6, label: "12:45 - 01:30" },
                        { p: 7, label: "01:30 - 02:15" },
                      ];

                      return (
                        <div key={day} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                            <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                              {day}
                            </h4>
                            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                              7 Periods
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            {defaultSlots.map((slot) => {
                              const item = dayClasses.find((t) => Number(t.period_no) === slot.p);

                              return (
                                <React.Fragment key={`t-slot-${slot.p}`}>
                                  <div className="p-2 bg-white rounded-xl border border-slate-100 flex items-center justify-between">
                                    <div>
                                      <span className="text-xs font-bold text-slate-900 block">
                                        P{slot.p}: {item ? `${item.class_name} ${item.section_name}` : "Free Period"}
                                      </span>
                                      {item?.subject_name && (
                                        <span className="text-[10px] text-teal-700 font-semibold block">
                                          {item.subject_name}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-500 font-bold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                      {item ? `${item.start_time?.slice(0, 5)} - ${item.end_time?.slice(0, 5)}` : slot.label}
                                    </span>
                                  </div>

                                  {/* RECESS BREAK Banner after Period 3 */}
                                  {slot.p === 3 && (
                                    <div className="py-1.5 px-3 bg-amber-50 border border-amber-200/80 rounded-xl text-center shadow-2xs">
                                      <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">
                                        ☕ Recess Break (10:45 AM - 11:15 AM)
                                      </span>
                                    </div>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === "homework" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-4">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <BookText className="w-5 h-5 text-teal-600" /> Class Homework Workstation
                      </h2>
                      <p className="text-xs font-semibold text-slate-500 mt-1">
                        Post homework for homeroom classes and subject teaching classes.
                      </p>
                    </div>
                  </div>

                  {hwMessage && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" /> {hwMessage}
                    </div>
                  )}

                  {/* Create Homework Form */}
                  <form onSubmit={handlePostHomework} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-teal-600" /> Assign New Homework
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Target Class & Subject</label>
                        <select
                          value={selectedClass ? `${selectedClass.id}-${selectedClass.section_id}` : ""}
                          onChange={(e) => {
                            const [cId, sId] = e.target.value.split("-");
                            const found = classes.find(c => String(c.id) === cId && String(c.section_id) === sId);
                            if (found) setSelectedClass(found);
                          }}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                        >
                          {classes.map((cls) => (
                            <option key={`${cls.id}-${cls.section_id}`} value={`${cls.id}-${cls.section_id}`}>
                              {cls.name} ({cls.subject} - {cls.role})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Due Date</label>
                        <input
                          type="date"
                          required
                          min={minDueDateStr}
                          max={maxDueDateStr}
                          value={newHwDueDate}
                          onChange={(e) => setNewHwDueDate(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                        />
                        <span className="text-[10px] text-slate-500 font-semibold block mt-1">
                          Allowed: Tomorrow ({minDueDateStr}) up to 4 months ahead ({maxDueDateStr})
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Homework Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Chapter 4 Practice Problems & Worksheet"
                        value={newHwTitle}
                        onChange={(e) => setNewHwTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Instructions / Description</label>
                      <textarea
                        rows="3"
                        placeholder="Detail the problems, page numbers, or submission requirements..."
                        value={newHwDesc}
                        onChange={(e) => setNewHwDesc(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1">
                        Google Classroom Link <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="url"
                        placeholder="e.g. https://classroom.google.com/c/MzkxOTk2MTQ0Njky"
                        value={newHwClassroomUrl}
                        onChange={(e) => setNewHwClassroomUrl(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={postingHw}
                        className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                      >
                        <Save className="w-4 h-4" /> {postingHw ? "Assigning..." : "Publish Homework"}
                      </button>
                    </div>
                  </form>

                  {/* List of Posted Homeworks */}
                  <div className="space-y-4 pt-2">
                    <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                      My Assigned Homework History
                    </h3>

                    {loadingHomeworks ? (
                      <p className="text-xs text-slate-400 font-medium text-center py-4">Loading homework assignments...</p>
                    ) : teacherHomeworks.length === 0 ? (
                      <p className="text-xs text-slate-400 font-medium text-center py-4">You have not posted any homework assignments yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {teacherHomeworks.map((hw) => {
                          const pct = hw.total_students > 0 ? Math.round(((hw.completed_count || 0) / hw.total_students) * 100) : 0;
                          return (
                            <div key={hw.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="text-[10px] font-extrabold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100 uppercase">
                                    {hw.class_name} {hw.section_name} • {hw.subject_name || "General"}
                                  </span>
                                  <h4 className="text-sm font-bold text-slate-900 mt-1">{hw.title}</h4>
                                </div>
                                <button
                                  onClick={() => handleDeleteHomework(hw.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                                  title="Delete Homework"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              {hw.description && <p className="text-xs text-slate-600 font-medium line-clamp-2">{hw.description}</p>}

                              {hw.classroom_url && (
                                <a
                                  href={hw.classroom_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition"
                                >
                                  <span>Google Classroom</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}

                              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-2 border-t border-slate-100">
                                <span>Due: {hw.due_date ? new Date(hw.due_date).toLocaleDateString() : "N/A"}</span>
                                <span className="font-bold text-teal-700">
                                  {hw.completed_count || 0}/{hw.total_students || 0} Done ({pct}%)
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "elearning" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <Tv className="w-5 h-5 text-indigo-600" /> E Learning Video Portal
                      </h2>
                      <p className="text-xs font-semibold text-slate-500 mt-1">
                        Share YouTube learning video topics directly with students in your assigned classes.
                      </p>
                    </div>
                  </div>

                  {elearningMessage && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" /> {elearningMessage}
                    </div>
                  )}

                  {/* Share Video Form */}
                  <form onSubmit={handlePostElearning} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-indigo-600" /> Share New E Learning Video Topic
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Target Assigned Class</label>
                        <select
                          value={selectedClass?.section_id || ""}
                          onChange={(e) => {
                            const found = classes.find((c) => String(c.section_id) === String(e.target.value));
                            if (found) setSelectedClass(found);
                          }}
                          className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                        >
                          <option value="">-- Select Class --</option>
                          {classes.map((cls) => (
                            <option key={cls.section_id || cls.name} value={cls.section_id}>
                              {cls.name} ({cls.subject})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Topic / Video Title *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., Photosynthesis Mechanism & Light Reactions"
                          value={newVideoTitle}
                          onChange={(e) => setNewVideoTitle(e.target.value)}
                          className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">YouTube Link / URL *</label>
                      <input
                        type="url"
                        required
                        placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                        value={newYoutubeUrl}
                        onChange={(e) => setNewYoutubeUrl(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                      />
                    </div>

                    {extractYTId(newYoutubeUrl) && (
                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                        <span className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider block">Live Video Preview</span>
                        <div className="aspect-video w-full max-w-sm rounded-lg overflow-hidden border border-slate-200">
                          <iframe
                            src={`https://www.youtube.com/embed/${extractYTId(newYoutubeUrl)}`}
                            title="Preview"
                            className="w-full h-full"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Topic Notes / Instructions (Optional)</label>
                      <textarea
                        rows={2}
                        placeholder="Watch lines 02:15 to 08:30 carefully for tomorrow's discussion..."
                        value={newVideoDesc}
                        onChange={(e) => setNewVideoDesc(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 resize-none"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={postingVideo}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Video className="w-4 h-4" /> {postingVideo ? "Sharing..." : "Publish E Learning Video"}
                      </button>
                    </div>
                  </form>

                  {/* List of Posted Videos */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                      My Shared E Learning Topics ({elearningMaterials.length})
                    </h3>

                    {loadingElearning ? (
                      <p className="text-xs text-slate-400 font-medium text-center py-4">Loading shared video topics...</p>
                    ) : elearningMaterials.length === 0 ? (
                      <p className="text-xs text-slate-400 font-medium text-center py-4">You have not shared any E Learning video topics yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {elearningMaterials.map((mat) => {
                          const ytId = mat.youtube_video_id || extractYTId(mat.youtube_url);
                          return (
                            <div key={mat.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase">
                                    {mat.class_name} {mat.section_name}
                                  </span>
                                  <button
                                    onClick={() => handleDeleteElearning(mat.id)}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                                    title="Delete Video Topic"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                <h4 className="text-sm font-extrabold text-slate-900 leading-tight">{mat.title}</h4>
                                {mat.description && <p className="text-xs text-slate-600 font-medium line-clamp-2">{mat.description}</p>}
                              </div>

                              {ytId ? (
                                <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-200 mt-2">
                                  <iframe
                                    src={`https://www.youtube.com/embed/${ytId}`}
                                    title={mat.title}
                                    className="w-full h-full"
                                    allowFullScreen
                                  />
                                </div>
                              ) : (
                                <a
                                  href={mat.youtube_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline mt-2"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" /> Watch on YouTube
                                </a>
                              )}

                              <div className="text-[10px] text-slate-400 font-semibold pt-2 border-t border-slate-100">
                                Posted on: {new Date(mat.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
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
    </div>
  );
};

export default TeacherDashboard;
