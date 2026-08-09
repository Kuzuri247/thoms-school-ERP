import React, { useState, useEffect } from "react";
import { extractYouTubeId } from "../utils/youtube";
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
  Lock,
  Unlock,
  ShieldAlert,
  Layers,
  UserCheck,
} from "lucide-react";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const STANDARD_PERIOD_TIMES = {
  1: { start_time: "08:30", end_time: "09:15" },
  2: { start_time: "09:15", end_time: "10:00" },
  3: { start_time: "10:00", end_time: "10:45" },
  4: { start_time: "11:15", end_time: "12:00" },
  5: { start_time: "12:00", end_time: "12:45" },
  6: { start_time: "12:45", end_time: "13:30" },
  7: { start_time: "13:30", end_time: "14:15" },
};
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

function useModalFocus(isOpen, onClose) {
  const modalRef = React.useRef(null);
  const triggerRef = React.useRef(null);
  const onCloseRef = React.useRef(onClose);

  React.useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  React.useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
      setTimeout(() => {
        if (modalRef.current) {
          const focusable = modalRef.current.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length) {
            focusable[0].focus();
          } else {
            modalRef.current.focus();
          }
        }
      }, 0);

      const handleKeyDown = (e) => {
        if (e.key === "Escape" && onCloseRef.current) {
          onCloseRef.current();
          return;
        }
        if (e.key === "Tab" && modalRef.current) {
          const focusable = Array.from(
            modalRef.current.querySelectorAll(
              'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
          );
          if (focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        if (triggerRef.current && typeof triggerRef.current.focus === "function") {
          triggerRef.current.focus();
        }
      };
    }
  }, [isOpen]);

  return modalRef;
}

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

  // Refined Timetable Feature State
  const [assignedTtClasses, setAssignedTtClasses] = useState([]);
  const [selectedTtClass, setSelectedTtClass] = useState(null);
  const [classTimetable, setClassTimetable] = useState([]);
  const [mySchedule, setMySchedule] = useState([]);
  const [isClassTeacherForTt, setIsClassTeacherForTt] = useState(false);
  const [timetableTabMode, setTimetableTabMode] = useState("class"); // 'class' | 'my-schedule'
  const [allSubjects, setAllSubjects] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [showTtModal, setShowTtModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);

  const ttModalRef = useModalFocus(showTtModal, () => setShowTtModal(false));
  const confirmAttendanceModalRef = useModalFocus(showConfirmAttendanceModal, () => setShowConfirmAttendanceModal(false));
  const [ttFormData, setTtFormData] = useState({
    day_of_week: "Monday",
    period_number: 1,
    start_time: "08:30",
    end_time: "09:15",
    subject_id: "",
    teacher_id: "",
    is_break: false,
  });
  const [ttMessage, setTtMessage] = useState(null);
  const [ttError, setTtError] = useState(null);
  const [savingTtSlot, setSavingTtSlot] = useState(false);

  useEffect(() => {
    fetchTeacherClasses();
    fetchTeacherTimetable();
    fetchTeacherHomeworks();
    fetchTeacherElearning();
    fetchAssignedTtClasses();
    fetchMySchedule();
  }, []);

  useEffect(() => {
    if (selectedTtClass) {
      fetchClassTimetable(selectedTtClass.class_id, selectedTtClass.section_id);
      fetchTtMetadata(selectedTtClass.class_id);
    }
  }, [selectedTtClass]);

  const fetchAssignedTtClasses = async () => {
    try {
      const res = await api.get("/v1/timetable/assigned-classes");
      const data = res.data?.data || [];
      setAssignedTtClasses(data);
      if (data.length > 0) {
        setSelectedTtClass(data[0]);
      } else {
        fetchTtMetadata(null);
      }
    } catch (err) {
      console.error("Failed to fetch assigned timetable classes:", err);
    }
  };

  const fetchClassTimetable = async (classId, sectionId) => {
    if (!classId || !sectionId) return;
    setTtError(null);
    setClassTimetable([]);
    setIsClassTeacherForTt(false);
    try {
      const res = await api.get(`/v1/timetable/class/${classId}/section/${sectionId}`);
      setClassTimetable(res.data?.data || []);
      setIsClassTeacherForTt(res.data?.is_class_teacher || false);
    } catch (err) {
      console.error("Failed to fetch section timetable:", err);
      setClassTimetable([]);
      setIsClassTeacherForTt(false);
      setTtError(err.response?.data?.message || "Failed to fetch section timetable");
    }
  };

  const fetchMySchedule = async () => {
    try {
      const res = await api.get("/v1/timetable/my-schedule");
      setMySchedule(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch my schedule:", err);
    }
  };

  const fetchTtMetadata = async (classId = null) => {
    try {
      const subUrl = classId ? `/v1/timetable/subjects?class_id=${classId}` : "/v1/timetable/subjects";
      const [subRes, teachRes] = await Promise.all([
        api.get(subUrl).catch(() => ({ data: { data: [] } })),
        api.get("/v1/timetable/teachers").catch(() => ({ data: { data: [] } })),
      ]);
      setAllSubjects(subRes.data?.data || []);
      setAllTeachers(teachRes.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch timetable metadata:", err);
    }
  };

  // Bidirectional Subject & Teacher Filtering for Timetable Editor Modal
  const selectedTeacher = allTeachers.find((t) => String(t.id) === String(ttFormData.teacher_id));
  const selectedSubject = allSubjects.find((s) => String(s.id) === String(ttFormData.subject_id));

  const filteredSubjects = React.useMemo(() => {
    if (!selectedTeacher || !selectedTeacher.subject_ids || selectedTeacher.subject_ids.length === 0) {
      return allSubjects;
    }
    return allSubjects.filter((sub) => {
      const nameMatch = selectedTeacher.subject_names?.includes(sub.name.trim().toLowerCase());
      const idMatch = selectedTeacher.subject_ids?.includes(sub.id);
      return idMatch || nameMatch;
    });
  }, [allSubjects, selectedTeacher]);

  const filteredTeachers = React.useMemo(() => {
    if (!selectedSubject) {
      return allTeachers;
    }
    const subjName = selectedSubject.name.trim().toLowerCase();
    return allTeachers.filter((t) => {
      if (!t.subject_ids || t.subject_ids.length === 0) return true;
      const nameMatch = t.subject_names?.includes(subjName);
      const idMatch = t.subject_ids?.includes(selectedSubject.id);
      return idMatch || nameMatch;
    });
  }, [allTeachers, selectedSubject]);

  const handleTeacherChange = (e) => {
    const newTeacherId = e.target.value;
    const tObj = allTeachers.find((t) => String(t.id) === String(newTeacherId));
    let nextSubjId = ttFormData.subject_id;

    if (tObj && tObj.subject_ids && tObj.subject_ids.length > 0) {
      const currentSubj = allSubjects.find((s) => String(s.id) === String(ttFormData.subject_id));
      const isValid = currentSubj && (tObj.subject_ids.includes(currentSubj.id) || tObj.subject_names?.includes(currentSubj.name.trim().toLowerCase()));
      if (!isValid) {
        const firstMatch = allSubjects.find((s) => tObj.subject_ids.includes(s.id) || tObj.subject_names?.includes(s.name.trim().toLowerCase()));
        nextSubjId = firstMatch ? firstMatch.id : "";
      }
    }

    setTtFormData({ ...ttFormData, teacher_id: newTeacherId, subject_id: nextSubjId });
  };

  const handleSubjectChange = (e) => {
    const newSubjId = e.target.value;
    const sObj = allSubjects.find((s) => String(s.id) === String(newSubjId));
    let nextTeacherId = ttFormData.teacher_id;

    if (sObj) {
      const sName = sObj.name.trim().toLowerCase();
      const currentTeacher = allTeachers.find((t) => String(t.id) === String(ttFormData.teacher_id));
      if (currentTeacher && currentTeacher.subject_ids && currentTeacher.subject_ids.length > 0) {
        const isQualified = currentTeacher.subject_ids.includes(sObj.id) || currentTeacher.subject_names?.includes(sName);
        if (!isQualified) {
          const qualifiedTeacher = allTeachers.find((t) => t.subject_ids?.includes(sObj.id) || t.subject_names?.includes(sName));
          nextTeacherId = qualifiedTeacher ? qualifiedTeacher.id : "";
        }
      }
    }

    setTtFormData({ ...ttFormData, subject_id: newSubjId, teacher_id: nextTeacherId });
  };

  const handleOpenTtModal = (slot = null, defaultDay = "Monday", defaultPeriod = 1) => {
    setTtError(null);
    setTtMessage(null);
    const pNum = Number(slot?.period_number || slot?.period_no || defaultPeriod || 1);
    const pTimes = STANDARD_PERIOD_TIMES[pNum] || { start_time: "08:30", end_time: "09:15" };

    if (slot) {
      setEditingSlot(slot);
      const dayName = daysOfWeek[slot.day_of_week - 1] || defaultDay || "Monday";
      setTtFormData({
        day_of_week: dayName,
        period_number: pNum,
        start_time: pTimes.start_time,
        end_time: pTimes.end_time,
        subject_id: slot.subject_id || "",
        teacher_id: slot.teacher_id || slot.teacher_user_id || user?.id || "",
        is_break: Boolean(slot.is_break),
      });
    } else {
      setEditingSlot(null);
      setTtFormData({
        day_of_week: defaultDay,
        period_number: pNum,
        start_time: pTimes.start_time,
        end_time: pTimes.end_time,
        subject_id: "",
        teacher_id: user?.id || "",
        is_break: false,
      });
    }
    setShowTtModal(true);
  };

  const handleSaveTtSlot = async (e) => {
    e.preventDefault();
    if (!selectedTtClass) return;

    if (!ttFormData.is_break && !ttFormData.subject_id) {
      setTtError("Please select a subject for non-break periods");
      setSavingTtSlot(false);
      return;
    }

    setSavingTtSlot(true);
    setTtError(null);
    setTtMessage(null);

    const pNum = Number(ttFormData.period_number || 1);
    const pTimes = STANDARD_PERIOD_TIMES[pNum] || { start_time: "08:30", end_time: "09:15" };

    try {
      const payload = {
        class_id: selectedTtClass.class_id,
        section_id: selectedTtClass.section_id,
        day_of_week: ttFormData.day_of_week,
        periods: [
          {
            period_number: pNum,
            start_time: pTimes.start_time,
            end_time: pTimes.end_time,
            subject_id: ttFormData.is_break ? null : (ttFormData.subject_id || null),
            teacher_id: ttFormData.is_break ? null : (ttFormData.teacher_id || null),
            is_break: ttFormData.is_break,
          },
        ],
      };

      const res = await api.post("/v1/timetable/upsert", payload);
      if (res.data?.success) {
        setTtMessage("Slot saved successfully!");
        setShowTtModal(false);
        fetchClassTimetable(selectedTtClass.class_id, selectedTtClass.section_id);
        fetchMySchedule();
      } else {
        setTtError(res.data?.message || "Failed to save timetable slot");
      }
    } catch (err) {
      setTtError(err.response?.data?.message || "Failed to save timetable slot");
    } finally {
      setSavingTtSlot(false);
    }
  };

  const handleDeleteTtSlot = async (periodId) => {
    if (!selectedTtClass) return;
    if (!window.confirm("Are you sure you want to remove this timetable slot?")) return;
    try {
      const res = await api.delete(`/v1/timetable/period/${periodId}`);
      if (res.data?.success) {
        setShowTtModal(false);
        fetchClassTimetable(selectedTtClass.class_id, selectedTtClass.section_id);
        fetchMySchedule();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete period slot");
    }
  };

  useEffect(() => {
    if (selectedClass) {
      fetchClassStudents(selectedClass.id, selectedClass.section_id);
      if (selectedClass.is_class_teacher && selectedClass.section_id) {
        fetchAttendanceCalendar(selectedClass.section_id);
      }
    }
  }, [selectedClass]);

  useEffect(() => {
    if (activeTab === "attendance" && classes.length > 0) {
      const homeroomClasses = classes.filter((c) => c.is_class_teacher);
      if (homeroomClasses.length > 0 && (!selectedClass || !selectedClass.is_class_teacher)) {
        setSelectedClass(homeroomClasses[0]);
      }
    }
  }, [activeTab, classes]);

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

  const visibleClasses = activeTab === "attendance" ? classes.filter((c) => c.is_class_teacher) : classes;

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
              {visibleClasses.length}
            </span>
          </h3>
          {visibleClasses.length === 0 ? (
            <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-400 font-medium">
              {activeTab === "attendance"
                ? "No homeroom class assigned to your account. Attendance registration is reserved for Class Teachers."
                : "No assigned classes found."}
            </div>
          ) : (
                visibleClasses.map((cls) => (
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
                  {ttMessage && (
                    <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-2xl text-xs font-bold text-teal-800 flex items-center justify-between shadow-2xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 shrink-0 text-teal-600" /> {ttMessage}
                      </div>
                      <button type="button" onClick={() => setTtMessage(null)} className="text-teal-600 hover:text-teal-800 p-0.5">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {/* Top Control Bar */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-teal-600" /> Timetable & Teaching Workstation
                        </h2>
                        <p className="text-xs font-semibold text-slate-500 mt-1">
                          Manage homeroom class timetables or view subject teaching schedules.
                        </p>
                      </div>

                      {/* View Mode Toggle */}
                      <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80 self-start md:self-auto">
                        <button
                          type="button"
                          onClick={() => setTimetableTabMode("class")}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                            timetableTabMode === "class"
                              ? "bg-white text-teal-700 shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Class Schedule
                        </button>
                        <button
                          type="button"
                          onClick={() => setTimetableTabMode("my-schedule")}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                            timetableTabMode === "my-schedule"
                              ? "bg-white text-teal-700 shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          My Teaching Load
                        </button>
                      </div>
                    </div>

                    {/* Class Selector & RBAC Status Header */}
                    {timetableTabMode === "class" && (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <label htmlFor="assigned-tt-class-select" className="text-xs font-extrabold text-slate-700 whitespace-nowrap">
                            Select Class:
                          </label>
                          <select
                            id="assigned-tt-class-select"
                            value={selectedTtClass ? `${selectedTtClass.class_id}_${selectedTtClass.section_id}` : ""}
                            onChange={(e) => {
                              const [cId, sId] = e.target.value.split("_");
                              const found = assignedTtClasses.find(
                                (item) => String(item.class_id) === cId && String(item.section_id) === sId
                              );
                              if (found) setSelectedTtClass(found);
                            }}
                            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                          >
                            {assignedTtClasses.map((c) => (
                              <option key={`tt-cls-${c.class_id}-${c.section_id}`} value={`${c.class_id}_${c.section_id}`}>
                                {c.name} {c.is_class_teacher ? "★ Homeroom" : ""}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* RBAC Badge */}
                          {isClassTeacherForTt ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold text-teal-800 bg-teal-50 border border-teal-200">
                              <Unlock className="w-3.5 h-3.5 text-teal-600" /> Class Teacher (Full Edit Control)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold text-slate-600 bg-slate-100 border border-slate-200">
                              <Lock className="w-3.5 h-3.5 text-slate-500" /> Read-Only: Subject Class
                            </span>
                          )}

                          {/* Add / Edit Period Button for Class Teacher */}
                          {isClassTeacherForTt && (
                            <button
                              type="button"
                              onClick={() => handleOpenTtModal(null)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black shadow-xs transition-all"
                            >
                              <Plus className="w-4 h-4" /> Add / Upsert Period
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {ttError && !showTtModal && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                        {ttError}
                      </div>
                    )}
                  </div>

                  {/* Mode 1: Class Timetable Grid */}
                  {timetableTabMode === "class" && (
                    assignedTtClasses.length === 0 ? (
                      <div className="p-8 bg-slate-50 border border-slate-200/80 rounded-2xl text-center text-slate-500 font-semibold text-xs">
                        No assigned classes available for timetable viewing.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {daysOfWeek.map((day, dayIdx) => {
                          const dayNum = dayIdx + 1;
                          const daySlots = classTimetable.filter((t) => Number(t.day_of_week) === dayNum);

                          const defaultPeriods = [1, 2, 3, 4, 5, 6, 7];

                          return (
                            <div key={day} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
                              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                                <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                                  {day}
                                </h4>
                                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                                  7 Periods
                                </span>
                              </div>

                              <div className="space-y-2">
                                {defaultPeriods.map((periodNum) => {
                                  const item = daySlots.find((t) => Number(t.period_no) === periodNum || Number(t.period_number) === periodNum);

                                  return (
                                    <React.Fragment key={`slot-${dayNum}-${periodNum}`}>
                                      <div
                                        role={isClassTeacherForTt ? "button" : undefined}
                                        tabIndex={isClassTeacherForTt ? 0 : undefined}
                                        aria-label={`Period ${periodNum} ${item?.subject_name || (item?.is_break ? "Free Period" : "Not Scheduled")}`}
                                        onKeyDown={(e) => {
                                          if (isClassTeacherForTt && (e.key === "Enter" || e.key === " ")) {
                                            e.preventDefault();
                                            handleOpenTtModal(item, day, periodNum);
                                          }
                                        }}
                                        className={`relative group p-2.5 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                                          isClassTeacherForTt ? "cursor-pointer" : ""
                                        } ${
                                          item?.is_break
                                            ? "bg-amber-50/70 border-amber-200"
                                            : item
                                            ? "bg-white border-slate-200 shadow-2xs hover:border-teal-300"
                                            : "bg-slate-100/60 border-dashed border-slate-200 hover:border-slate-300"
                                        }`}
                                        onClick={() => {
                                          if (isClassTeacherForTt) handleOpenTtModal(item, day, periodNum);
                                        }}
                                      >
                                        {/* Top Row: Period & Subject on Left, Time on Right */}
                                        <div className="flex items-center justify-between gap-2">
                                          <div className="min-w-0 flex-1 truncate">
                                            <span className="text-xs font-black text-slate-900 mr-1">
                                              P{periodNum}:
                                            </span>
                                            {item?.is_break ? (
                                              <span className="text-xs font-black text-amber-800">
                                                Free Period
                                              </span>
                                            ) : item ? (
                                              <span className="text-xs font-black text-teal-800">
                                                {item.subject_name || "General"}
                                              </span>
                                            ) : (
                                              <span className="text-xs font-semibold text-slate-400 italic">
                                                Not Scheduled
                                              </span>
                                            )}
                                          </div>

                                          <span className="text-[10px] font-mono text-slate-600 font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 whitespace-nowrap shrink-0">
                                            {item?.start_time && item?.end_time
                                              ? `${item.start_time.slice(0, 5)} - ${item.end_time.slice(0, 5)}`
                                              : `${STANDARD_PERIOD_TIMES[periodNum]?.start_time} - ${STANDARD_PERIOD_TIMES[periodNum]?.end_time}`}
                                          </span>
                                        </div>

                                        {/* Bottom Row: Teacher Name */}
                                        {item && !item.is_break && item.teacher_name && (
                                          <div className="mt-1 pt-1 border-t border-slate-100/80">
                                            <span className="text-[10px] text-slate-600 font-semibold block truncate">
                                              {item.teacher_name}
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      {/* Recess Banner after Period 3 */}
                                      {periodNum === 3 && (
                                        <div className="py-1 px-2.5 bg-amber-100/70 border border-amber-200 rounded-lg text-center">
                                          <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider">
                                            Recess Break (10:45 AM - 11:15 AM)
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
                    )
                  )}

                  {/* Mode 2: My Teaching Load View */}
                  {timetableTabMode === "my-schedule" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {daysOfWeek.map((day, dayIdx) => {
                        const dayNum = dayIdx + 1;
                        const teacherSlots = mySchedule.filter((t) => Number(t.day_of_week) === dayNum);

                        return (
                          <div key={`my-sched-${day}`} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                                {day}
                              </h4>
                              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                                {teacherSlots.length} Classes Assigned
                              </span>
                            </div>

                            <div className="space-y-1.5">
                              {teacherSlots.length === 0 ? (
                                <div className="p-3 text-center text-xs font-semibold text-slate-400 italic bg-white rounded-xl border border-slate-100">
                                  No classes assigned on {day}
                                </div>
                              ) : (
                                teacherSlots.map((item) => (
                                  <div key={`tslot-${item.id}`} className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs">
                                    <div>
                                      <span className="text-xs font-black text-slate-900 block">
                                        P{item.period_no}: {item.class_name} - {item.section_name}
                                      </span>
                                      <span className="text-[10px] font-bold text-teal-700 block">
                                        {item.subject_name || "General"}
                                      </span>
                                    </div>
                                    <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                      {item.start_time?.slice(0, 5)} - {item.end_time?.slice(0, 5)}
                                    </span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Slot Builder Upsert Modal for Class Teacher */}
                  {showTtModal && (
                    <div
                      ref={ttModalRef}
                      tabIndex={-1}
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="tt-modal-title"
                      onKeyDown={(e) => {
                        if (e.key === "Escape") setShowTtModal(false);
                      }}
                      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
                    >
                      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <h3 id="tt-modal-title" className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-teal-600" />
                            {editingSlot ? "Edit Period Slot" : "Add / Upsert Period Slot"}
                          </h3>
                          <button
                            type="button"
                            onClick={() => setShowTtModal(false)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        {ttError && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-700 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" /> {ttError}
                          </div>
                        )}
                        {ttMessage && (
                          <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl text-xs font-bold text-teal-800 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 shrink-0 text-teal-600" /> {ttMessage}
                          </div>
                        )}

                        <form onSubmit={handleSaveTtSlot} className="space-y-4 text-xs">
                          {/* Read-Only Period & Time Info */}
                          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between shadow-2xs">
                            <span className="text-sm font-black text-slate-900">
                              Period {ttFormData.period_number}
                            </span>
                            <span className="text-xs font-mono font-black text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-xl">
                              {STANDARD_PERIOD_TIMES[ttFormData.period_number]?.start_time} - {STANDARD_PERIOD_TIMES[ttFormData.period_number]?.end_time}
                            </span>
                          </div>

                          <div>
                            <label className="font-extrabold text-slate-700 block mb-1">Day of Week</label>
                            <select
                              value={ttFormData.day_of_week}
                              onChange={(e) => setTtFormData({ ...ttFormData, day_of_week: e.target.value })}
                              disabled={Boolean(editingSlot)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {daysOfWeek.map((d) => (
                                <option key={`opt-${d}`} value={d}>{d}</option>
                              ))}
                            </select>
                          </div>

                          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between">
                            <div>
                              <span className="font-extrabold text-amber-900 block">Mark as Free Period</span>
                              <span className="text-[10px] text-amber-700 font-medium">Mark period as free period without subject assignment</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={ttFormData.is_break}
                              onChange={(e) => setTtFormData({ ...ttFormData, is_break: e.target.checked })}
                              className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                            />
                          </div>

                          {!ttFormData.is_break && (
                            <>
                              <div>
                                <label className="font-extrabold text-slate-700 block mb-1">Assigned Teacher</label>
                                <select
                                  value={ttFormData.teacher_id}
                                  onChange={handleTeacherChange}
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                >
                                  <option value="">Select Teacher</option>
                                  {filteredTeachers.map((t) => (
                                    <option key={`t-opt-${t.id}`} value={t.id}>{t.full_name} ({t.email})</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="font-extrabold text-slate-700 block mb-1">Subject</label>
                                <select
                                  value={ttFormData.subject_id}
                                  onChange={handleSubjectChange}
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                >
                                  <option value="">Select Subject</option>
                                  {filteredSubjects.map((sub) => (
                                    <option key={`sub-opt-${sub.id}`} value={sub.id}>{sub.name}</option>
                                  ))}
                                </select>
                              </div>
                            </>
                          )}

                          <div className="flex items-center justify-end gap-2 pt-2">
                            {editingSlot && (
                              <button
                                type="button"
                                onClick={() => handleDeleteTtSlot(editingSlot.id)}
                                className="mr-auto px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setShowTtModal(false)}
                              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={savingTtSlot}
                              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl shadow-xs disabled:opacity-50"
                            >
                              {savingTtSlot ? "Saving..." : "Save Slot"}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
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

                    {extractYouTubeId(newYoutubeUrl) && (
                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                        <span className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider block">Live Video Preview</span>
                        <div className="aspect-video w-full max-w-sm rounded-lg overflow-hidden border border-slate-200">
                          <iframe
                            src={`https://www.youtube.com/embed/${extractYouTubeId(newYoutubeUrl)}`}
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
                          const ytId = mat.youtube_video_id || extractYouTubeId(mat.youtube_url);
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
            ref={confirmAttendanceModalRef}
            tabIndex={-1}
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
