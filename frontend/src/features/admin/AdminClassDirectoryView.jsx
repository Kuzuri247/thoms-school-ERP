import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axios";
import {
  Search,
  GraduationCap,
  Plus,
  X,
  Check,
  UserPlus,
  User,
  Eye,
  Upload,
  Sparkles,
  Lock,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import { useAcademicsStore } from "../../store/academicsStore";
import { BUS_DISTANCE_SLABS, getBusFeeForSlab } from "../../constants/academicConstants";

const DEMO_CLASSES = [
  { class_id: 101, class_name: "Class 10", numeric_value: 10 },
  { class_id: 102, class_name: "Class 11", numeric_value: 11 },
  { class_id: 103, class_name: "Class 12", numeric_value: 12 },
];

const GRADUATED_SENTINEL_ID = "graduated";
const GRADUATED_PSEUDO_CLASS = {
  class_id: GRADUATED_SENTINEL_ID,
  class_name: "Graduated Alumni",
  numeric_value: 99,
};

const EMPTY_STUDENT_FORM = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  admission_no: "",
  roll_no: "",
  gender: "Male",
  dob: "",
  profile_pic: "",
  address: "",
  father_name: "",
  father_phone: "",
  father_occupation: "",
  mother_name: "",
  mother_phone: "",
  mother_occupation: "",
  guardian_name: "",
  guardian_phone: "",
  guardian_relation: "",
  opts_bus_service: false,
  bus_distance_slab: "0-2 KM",
  bus_quarterly_fee: 3825,
  tuition_fee: 3500,
};

const AdminClassDirectoryView = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { executeAnnualPromotion, promoting, promotionResult, error: promoError, clearPromotionStatus } = useAcademicsStore();


  const [classesData, setClassesData] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Modals visibility
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [showPasswordAuthModal, setShowPasswordAuthModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [modalLocalError, setModalLocalError] = useState("");

  // Add Class Form State
  const [newClassName, setNewClassName] = useState("");
  const [newGradeValue, setNewGradeValue] = useState("");
  const [newClassTeacher, setNewClassTeacher] = useState("");

  // Add Student Form State
  const [studentForm, setStudentForm] = useState(EMPTY_STUDENT_FORM);
  const [isSubmittingStudent, setIsSubmittingStudent] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Escape key handler for accessible modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (showAddStudentModal) setShowAddStudentModal(false);
        if (showAddClassModal) setShowAddClassModal(false);
        if (showPromotionModal) {
          if (showPasswordAuthModal) {
            setShowPasswordAuthModal(false);
          } else {
            setShowPromotionModal(false);
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAddStudentModal, showAddClassModal, showPromotionModal, showPasswordAuthModal]);

  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("openPromotion") === "true") {
      clearPromotionStatus();
      setAdminPassword("");
      setModalLocalError("");
      setShowPasswordAuthModal(false);
      setShowPromotionModal(true);

      searchParams.delete("openPromotion");
      const newSearch = searchParams.toString();
      const newUrl = location.pathname + (newSearch ? `?${newSearch}` : "") + location.hash;
      window.history.replaceState(null, "", newUrl);
    }
  }, [location]);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass.class_id);
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/classes");
      const raw = res.data?.data || [];

      const list = raw.length > 0
        ? raw
            .map((r) => ({
              class_id: r.class_id,
              class_name: r.class_name,
              numeric_value: r.numeric_value,
            }))
            .sort((a, b) => a.numeric_value - b.numeric_value)
        : DEMO_CLASSES;

      setClassesData(list);
      const savedClassId = sessionStorage.getItem("selectedClassId");
      if (savedClassId === GRADUATED_SENTINEL_ID) {
        setSelectedClass(GRADUATED_PSEUDO_CLASS);
      } else {
        const foundSaved = savedClassId
          ? list.find((c) => String(c.class_id) === String(savedClassId))
          : null;
        setSelectedClass(foundSaved || list[0]);
      }
    } catch (err) {
      console.error("Failed to fetch classes:", err);
      setClassesData(DEMO_CLASSES);
      setSelectedClass(DEMO_CLASSES[0]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (classId) => {
    try {
      const endpoint = String(classId) === GRADUATED_SENTINEL_ID ? "/admin/graduates" : `/admin/classes/${classId}/students`;
      const res = await api.get(endpoint);
      const apiStudents = res.data?.data || [];
      setStudents(apiStudents);
    } catch (err) {
      console.error("Failed to fetch class students:", err);
      setStudents([]);
    }
  };

  // Add Class Handler
  const handleAddClassFrontend = (e) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const newId = Date.now();
    const createdClass = {
      class_id: newId,
      class_name: newClassName.trim(),
      numeric_value: parseInt(newGradeValue) || classesData.length + 1,
      class_teacher: newClassTeacher.trim() || undefined,
    };

    setClassesData((prev) => [...prev, createdClass]);
    setSelectedClass(createdClass);
    sessionStorage.setItem("selectedClassId", String(createdClass.class_id));
    setShowAddClassModal(false);

    // Reset Form
    setNewClassName("");
    setNewGradeValue("");
    setNewClassTeacher("");
    setFormSuccess("Class added locally (preview mode)");
    setTimeout(() => setFormSuccess(""), 3000);
  };


  // Add Student Handler
  const handleAddStudentFrontend = async (e) => {
    e.preventDefault();
    if (!studentForm.first_name.trim() || isSubmittingStudent) return;

    if (!studentForm.email || !studentForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentForm.email.trim())) {
      setFormError("Please enter a valid primary student email address.");
      return;
    }

    if (studentForm.phone && studentForm.phone.trim().length !== 10) {
      setFormError("Student phone number must be strictly 10 digits.");
      return;
    }

    if (studentForm.father_phone && studentForm.father_phone.trim().length !== 10) {
      setFormError("Father phone number must be strictly 10 digits.");
      return;
    }

    if (studentForm.mother_phone && studentForm.mother_phone.trim().length !== 10) {
      setFormError("Mother phone number must be strictly 10 digits.");
      return;
    }

    if (studentForm.guardian_phone && studentForm.guardian_phone.trim().length !== 10) {
      setFormError("Guardian phone number must be strictly 10 digits.");
      return;
    }

    const chosenClassId = studentForm.class_id || selectedClass?.class_id;

    try {
      setIsSubmittingStudent(true);
      setFormError("");

      const res = await api.post("/admin/students", {
        ...studentForm,
        class_id: chosenClassId,
      });

      const rawData = res.data?.data;
      if (rawData) {
        const newStuData = {
          ...rawData,
          first_name: studentForm.first_name.trim(),
          last_name: studentForm.last_name ? studentForm.last_name.trim() : "",
          full_name: `${studentForm.first_name.trim()} ${studentForm.last_name ? studentForm.last_name.trim() : ""}`.trim(),
          email: studentForm.email.trim(),
          phone: rawData.phone || studentForm.phone || "",
          father_name: rawData.father_name || (studentForm.father_name ? studentForm.father_name.trim() : ""),
          father_occupation: rawData.father_occupation || (studentForm.father_occupation ? studentForm.father_occupation.trim() : ""),
          status: "active",
        };

        const targetClass =
          classesData.find((c) => String(c.class_id) === String(chosenClassId)) ||
          selectedClass;

        if (targetClass && targetClass.class_id !== selectedClass?.class_id) {
          setSelectedClass(targetClass);
          sessionStorage.setItem("selectedClassId", String(targetClass.class_id));
        }

        setStudents((prev) => [newStuData, ...prev]);
      }

      setShowAddStudentModal(false);
      setStudentForm(EMPTY_STUDENT_FORM);
      setFormSuccess("Student added successfully to database!");
      setTimeout(() => setFormSuccess(""), 3500);
    } catch (err) {
      console.error("Failed to add student:", err);
      setFormError(err.response?.data?.message || "Failed to add student.");
    } finally {
      setIsSubmittingStudent(false);
    }
  };

  const handleToggleStudentStatus = async (student) => {
    const currentStatus = (student.status || "active").toLowerCase();
    if (["graduated", "left", "transferred"].includes(currentStatus)) {
      return;
    }

    const targetUserId = student.user_id || student.id;
    const nextStatus = currentStatus === "active" ? "inactive" : "active";

    try {
      await api.put(`/admin/users/${targetUserId}`, { status: nextStatus });
      setStudents((prev) =>
        prev.map((s) => {
          const isMatch =
            (student.student_id && String(s.student_id) === String(student.student_id)) ||
            (student.user_id && String(s.user_id) === String(student.user_id)) ||
            (student.id && String(s.id) === String(student.id));

          return isMatch ? { ...s, status: nextStatus } : s;
        })
      );
      setFormSuccess(`Student status for "${student.first_name} ${student.last_name || ''}" updated to ${nextStatus.toUpperCase()}.`);
      setTimeout(() => setFormSuccess(""), 3500);
    } catch (err) {
      console.error("Failed to toggle student status:", err);
      setFormError(err.response?.data?.message || "Failed to update student status.");
      setTimeout(() => setFormError(""), 3500);
    }
  };

  const goToProfile = (s) => {
    if (selectedClass) {
      sessionStorage.setItem("selectedClassId", String(selectedClass.class_id));
    }
    navigate(`/profile/${s.user_id || s.student_id}`);
  };

  const filteredStudents = students.filter((s) => {
    const term = searchTerm.toLowerCase();
    const fullName = `${s.first_name || ""} ${s.last_name || ""}`.toLowerCase();
    const rollNoStr = String(s.roll_no || "").toLowerCase();
    return (
      fullName.includes(term) ||
      rollNoStr.includes(term) ||
      (s.admission_no || "").toLowerCase().includes(term) ||
      (s.email || "").toLowerCase().includes(term)
    );
  });



  const handleExecutePromotion = async () => {
    if (!adminPassword.trim()) {
      setModalLocalError("Administrator password is required to authorize annual grade advancement.");
      return;
    }
    setModalLocalError("");
    const res = await executeAnnualPromotion(adminPassword);
    if (res?.success) {
      setShowPromotionModal(false);
      setShowPasswordAuthModal(false);
      setAdminPassword("");
      fetchClasses();
    } else if (!res?.skipped) {
      setModalLocalError(res?.error || "Authorization failed.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/80 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shadow-xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            Standards & Student Directory
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage academic standards and student profiles.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {(user?.role === "super_admin" || user?.role === "admin") && (
            <>
              <button
                onClick={() => {
                  clearPromotionStatus();
                  setAdminPassword("");
                  setModalLocalError("");
                  setShowPasswordAuthModal(false);
                  setShowPromotionModal(true);
                }}
                disabled={promoting}
                className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-indigo-500/20 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                {promoting ? "Promoting..." : "Run Annual Promotion"}
              </button>
              <button
                onClick={() => {
                  const isGraduated =
                    selectedClass?.class_id === GRADUATED_SENTINEL_ID ||
                    selectedClass?.class_id === GRADUATED_PSEUDO_CLASS.class_id;
                  const initialClassId =
                    (!isGraduated && selectedClass?.class_id) ||
                    classesData[0]?.class_id ||
                    "";
                  setStudentForm({
                    ...EMPTY_STUDENT_FORM,
                    class_id: initialClassId,
                  });
                  setFormError("");
                  setShowAddStudentModal(true);
                }}
                className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-emerald-500/20 transition cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                Add Student
              </button>
            </>
          )}
        </div>
      </div>

      {promotionResult && (
        <div className="p-3.5 bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold rounded-2xl flex items-center justify-between gap-2 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>
              {typeof promotionResult === "string"
                ? promotionResult
                : promotionResult.message || "Annual promotion completed successfully!"}
            </span>
          </div>
          <button onClick={clearPromotionStatus} className="text-indigo-400 hover:text-indigo-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {promoError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl flex items-center justify-between gap-2 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <X className="w-4 h-4 text-rose-600" />
            <span>{promoError}</span>
          </div>
          <button onClick={clearPromotionStatus} className="text-rose-400 hover:text-rose-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {formSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-xs animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          {formSuccess}
        </div>
      )}

      {formError && !showAddStudentModal && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <X className="w-4 h-4 text-rose-600" />
            <span>{formError}</span>
          </div>
          <button onClick={() => setFormError("")} className="text-rose-400 hover:text-rose-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}



      {/* Grid: Class Standard Selector & Roster Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Academic Standards Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
              Academic Standards
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {classesData.length} Classes
            </span>
          </div>

          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1 custom-scrollbar">
            {classesData.map((cls) => {
              const isSelected = selectedClass?.class_id === cls.class_id;
              return (
                <div
                  key={cls.class_id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select ${cls.class_name}`}
                  onClick={() => {
                    setSelectedClass(cls);
                    sessionStorage.setItem(
                      "selectedClassId",
                      String(cls.class_id),
                    );
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedClass(cls);
                      sessionStorage.setItem(
                        "selectedClassId",
                        String(cls.class_id),
                      );
                    }
                  }}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all outline-none ${
                    isSelected
                      ? "bg-indigo-50/90 border-indigo-300 shadow-xs ring-2 ring-indigo-500/20"
                      : "bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs focus:ring-2 focus:ring-indigo-500/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4
                      className={`font-black text-sm ${isSelected ? "text-indigo-900" : "text-slate-800"}`}
                    >
                      {cls.class_name}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      Grade {cls.numeric_value}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Graduated Alumni Selector */}
          <div className="pt-2 border-t border-slate-200/80">
            <div
              role="button"
              tabIndex={0}
              aria-label="Select Graduated Alumni"
              onClick={() => {
                setSelectedClass(GRADUATED_PSEUDO_CLASS);
                sessionStorage.setItem("selectedClassId", GRADUATED_SENTINEL_ID);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedClass(GRADUATED_PSEUDO_CLASS);
                  sessionStorage.setItem("selectedClassId", GRADUATED_SENTINEL_ID);
                }
              }}
              className={`p-3.5 rounded-2xl border transition text-left cursor-pointer flex items-center justify-between ${
                selectedClass?.class_id === GRADUATED_SENTINEL_ID
                  ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white border-amber-600 shadow-md shadow-amber-500/20"
                  : "bg-amber-50/60 hover:bg-amber-100/60 border-amber-200/80 text-amber-950"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${selectedClass?.class_id === GRADUATED_SENTINEL_ID ? "bg-white/20 text-white" : "bg-amber-200/60 text-amber-800"}`}>
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black block">Graduated Alumni</span>
                  <span className={`text-[10px] font-bold block ${selectedClass?.class_id === GRADUATED_SENTINEL_ID ? "text-amber-100" : "text-amber-700"}`}>
                    Passed Out Batch Records
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Class Student Roster & Teacher Info */}
        <div className="lg:col-span-3 space-y-4">
          {/* Active Class Header Card */}
          <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {selectedClass?.class_name || "Select a Class"}
                </h2>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  Enrolled Students:{" "}
                  <span className="text-slate-800 font-bold">
                    {students.length}
                  </span>
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative flex items-center w-full md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search student or roll no..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs transition-all"
                />
              </div>
            </div>
          </div>

          {/* Student Roster Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-xs">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3">Admission & Roll</th>
                  <th className="px-4 py-3">Parent / Guardian</th>
                  <th className="px-4 py-3">Contact Email & Phone</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Profile View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-8 text-center text-slate-400 text-xs font-medium"
                    >
                      No students found for this class.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr
                      key={s.student_id}
                      className="hover:bg-slate-50/80 transition cursor-pointer"
                      onClick={() => goToProfile(s)}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              s.profile_pic ||
                              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
                            }
                            alt={s.first_name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-2xs"
                          />
                          <div>
                            <div className="font-extrabold text-slate-900 text-xs">
                              {s.first_name} {s.last_name}
                            </div>
                            <div className="text-[10px] font-semibold text-slate-400">
                              Roll {s.roll_no || "—"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                          {s.gender || "Male"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-mono font-bold text-xs text-slate-800">
                          {s.admission_no || "—"}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          Roll No: {s.roll_no || "—"}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-xs">
                        <div className="font-extrabold text-slate-800">
                          {s.father_name || s.guardian_name || "Not provided"}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {s.father_occupation || "Parent"}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-xs">
                        <div className="font-medium text-slate-700">
                          {s.email || "Not provided"}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {s.phone || "Not provided"}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        {(() => {
                          const stLower = (s.status || "active").toLowerCase();
                          const isFixedLifecycle = ["graduated", "left", "transferred"].includes(stLower);

                          return (
                            <button
                              disabled={isFixedLifecycle}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStudentStatus(s);
                              }}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold border transition ${
                                isFixedLifecycle
                                  ? "bg-amber-50 text-amber-700 border-amber-200 cursor-default opacity-85"
                                  : stLower === "inactive"
                                    ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-emerald-50 hover:text-emerald-700 hover:scale-105 active:scale-95 cursor-pointer"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-rose-50 hover:text-rose-700 hover:scale-105 active:scale-95 cursor-pointer"
                              }`}
                              title={isFixedLifecycle ? `Lifecycle status: ${stLower.toUpperCase()} (Fixed)` : `Current status: ${stLower.toUpperCase()}. Click to switch to ${stLower === "active" ? "INACTIVE" : "ACTIVE"}`}
                            >
                              {stLower === 'active' ? (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              ) : null}
                              {stLower}
                            </button>
                          );
                        })()}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            goToProfile(s);
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition flex items-center gap-1 text-xs font-bold ml-auto cursor-pointer"
                          title="View Full Student Profile"
                        >
                          <Eye className="w-4 h-4 text-indigo-600" />
                          <span>View Profile</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Class Modal */}
      {showAddClassModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-class-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="add-class-title" className="text-base font-black text-slate-900">
                    Add Academic Class / Standard
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-400">
                    Configure grade standard name and numeric value
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddClassModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddClassFrontend} autoComplete="off" className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Class / Standard Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Class 11 or Grade 11"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Grade (Numeric)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 11"
                  value={newGradeValue}
                  onChange={(e) => setNewGradeValue(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Assigned Class Teacher Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Sharma (Mathematics HOD)"
                  value={newClassTeacher}
                  onChange={(e) => setNewClassTeacher(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
                >
                  Save Class Standard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-student-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="add-student-title" className="text-base font-black text-slate-900">
                    Add New Student Profile
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-400">
                    Complete student enrollment form with parent & guardian
                    details
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleAddStudentFrontend}
              autoComplete="off"
              className="space-y-4 text-xs font-semibold text-slate-700"
            >
              {/* Section 1: Basic & Academic Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 border-b border-indigo-50 pb-1">
                  1. Basic & Academic Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block mb-1">
                      Target Class / Standard *
                    </label>
                    <select
                      value={
                        studentForm.class_id || selectedClass?.class_id || ""
                      }
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          class_id: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-bold text-slate-800"
                    >
                      {classesData.map((c) => (
                        <option key={c.class_id} value={c.class_id}>
                          {c.class_name} (Grade {c.numeric_value})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1">First Name *</label>
                    <input
                      type="text"
                      placeholder="Aarav"
                      value={studentForm.first_name}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          first_name: e.target.value.replace(/[^\p{L}\p{M}\s'\.-]/gu, ""),
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Last Name *</label>
                    <input
                      type="text"
                      placeholder="Sharma"
                      value={studentForm.last_name}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          last_name: e.target.value.replace(/[^\p{L}\p{M}\s'\.-]/gu, ""),
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Student Primary Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="aarav.sharma@thomson.edu"
                      value={studentForm.email}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Contact Phone (10 Digits)</label>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="9876543210"
                      value={studentForm.phone}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Admission No</label>
                    <input
                      type="text"
                      placeholder="TS-2026-003"
                      value={studentForm.admission_no}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          admission_no: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Roll No (Digits Only)</label>
                    <input
                      type="text"
                      placeholder="103"
                      value={studentForm.roll_no}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          roll_no: e.target.value.replace(/\D/g, ""),
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Gender *</label>
                    <select
                      value={studentForm.gender || "Male"}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          gender: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-semibold cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Residential Address Details */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 border-b border-indigo-50 pb-1">
                  2. Residential Address Details
                </h4>
                <div>
                  <div className="sm:col-span-2">
                    <label className="block mb-1">Full Permanent Address</label>
                    <textarea
                      rows="2"
                      placeholder="House No. 14, Ring Road, City"
                      value={studentForm.address}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          address: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Father, Mother & Guardian Details */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 border-b border-indigo-50 pb-1">
                  3. Parents & Guardian Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block mb-1">Father's Name</label>
                    <input
                      type="text"
                      placeholder="Ramesh Sharma"
                      value={studentForm.father_name}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          father_name: e.target.value.replace(/[^\p{L}\p{M}\s'\.-]/gu, ""),
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Father Phone (10 Digits)</label>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="9876543210"
                      value={studentForm.father_phone}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          father_phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Father Occupation</label>
                    <input
                      type="text"
                      placeholder="Business Executive"
                      value={studentForm.father_occupation}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          father_occupation: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Mother's Name</label>
                    <input
                      type="text"
                      placeholder="Sunita Sharma"
                      value={studentForm.mother_name}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          mother_name: e.target.value.replace(/[^\p{L}\p{M}\s'\.-]/gu, ""),
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Mother Phone (10 Digits)</label>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="9876543210"
                      value={studentForm.mother_phone}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          mother_phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Mother Occupation</label>
                    <input
                      type="text"
                      placeholder="Homemaker / Teacher"
                      value={studentForm.mother_occupation}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          mother_occupation: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Guardian Name</label>
                    <input
                      type="text"
                      placeholder="Vikram Sharma"
                      value={studentForm.guardian_name}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          guardian_name: e.target.value.replace(/[^\p{L}\p{M}\s'\.-]/gu, ""),
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Guardian Phone (10 Digits)</label>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="9876543210"
                      value={studentForm.guardian_phone}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          guardian_phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Relationship</label>
                    <input
                      type="text"
                      placeholder="Uncle / Grandfather"
                      value={studentForm.guardian_relation}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          guardian_relation: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Transport Service & Fee Setup */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 border-b border-indigo-50 pb-1 flex items-center justify-between">
                  <span>4. Transport Service & Fee Setup</span>
                  <span className="text-[10px] text-slate-400 font-normal">Optional School Bus Service</span>
                </h4>

                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <input
                    type="checkbox"
                    id="opts_bus_service_cb"
                    checked={studentForm.opts_bus_service || false}
                    onChange={(e) =>
                      setStudentForm({
                        ...studentForm,
                        opts_bus_service: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="opts_bus_service_cb" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Opt-in for School Transport / Bus Service
                  </label>
                </div>

                {studentForm.opts_bus_service && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl animate-fadeIn">
                    <div>
                      <label className="block mb-1 font-bold text-slate-700">Distance Slab (KM)</label>
                      <select
                        value={studentForm.bus_distance_slab || "0-2 KM"}
                        onChange={(e) => {
                          const selectedSlab = e.target.value;
                          const fee = getBusFeeForSlab ? getBusFeeForSlab(selectedSlab) : 3825;
                          setStudentForm({
                            ...studentForm,
                            bus_distance_slab: selectedSlab,
                            bus_quarterly_fee: fee,
                          });
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold text-slate-800"
                      >
                        {BUS_DISTANCE_SLABS.map((s) => (
                          <option key={s.slab} value={s.slab}>
                            {s.slab} (₹{s.quarterlyFee.toLocaleString()}/quarter)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 font-bold text-slate-700">Quarterly Bus Fee (₹)</label>
                      <input
                        type="number"
                        value={studentForm.bus_quarterly_fee || 3825}
                        onChange={(e) =>
                          setStudentForm({
                            ...studentForm,
                            bus_quarterly_fee: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold text-indigo-700"
                      />
                    </div>
                  </div>
                )}
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                  {formError}
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingStudent}
                  className={`px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition ${isSubmittingStudent ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  {isSubmittingStudent ? "Saving..." : "Save Student Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detailed Annual Promotion Info Modal (Step 1) */}
      {showPromotionModal && !showPasswordAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="annual-promotion-title"
            className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden space-y-0"
          >
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white relative">
              <button
                onClick={() => setShowPromotionModal(false)}
                className="absolute right-5 top-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-500/30 rounded-2xl border border-indigo-400/30 shadow-inner">
                  <Sparkles className="w-6 h-6 text-indigo-300" />
                </div>
                <div>
                  <h2
                    id="annual-promotion-title"
                    className="text-lg font-black tracking-tight text-white"
                  >
                    Annual Grade Advancement (Promotion)
                  </h2>
                  <p className="text-xs font-semibold text-indigo-200 mt-0.5">
                    School-wide Academic Session Rollover & Progression
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body / Detailed Effects Overview */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar bg-slate-50/50">
              <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold rounded-2xl flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-extrabold block">Annual Execution Notice:</span>
                  Grade promotion is executed <span className="underline">once per academic year</span> at session rollover. Review the detailed effects below before authorizing.
                </div>
              </div>

              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                Action Impacts & System Effects
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                  <div className="flex items-center gap-2 text-indigo-600 font-extrabold">
                    <GraduationCap className="w-4 h-4" />
                    <span>Standard Progression</span>
                  </div>
                  <p className="text-slate-600 text-[11px] font-medium leading-relaxed">
                    All active students advance to the next standard (e.g. LKG → UKG, Class 1 → Class 2 ... Class 11 → Class 12).
                  </p>
                </div>

                <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                  <div className="flex items-center gap-2 text-amber-600 font-extrabold">
                    <Check className="w-4 h-4" />
                    <span>Class 12 Graduation</span>
                  </div>
                  <p className="text-slate-600 text-[11px] font-medium leading-relaxed">
                    Outcoming Class 12 batch students are marked as <span className="font-bold text-slate-800">'graduated'</span> and unlinked to Alumni records.
                  </p>
                </div>


                <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                  <div className="flex items-center gap-2 text-blue-600 font-extrabold">
                    <Sparkles className="w-4 h-4" />
                    <span>Session Activation</span>
                  </div>
                  <p className="text-slate-600 text-[11px] font-medium leading-relaxed">
                    The new target academic session is activated as current across timetables, attendance registers, and marksheets.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-slate-200/80 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowPromotionModal(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setAdminPassword("");
                  setModalLocalError("");
                  setShowPasswordAuthModal(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl shadow-md hover:shadow-indigo-500/20 transition cursor-pointer"
              >
                <span>Proceed to Authorize Advancement</span>
                <Lock className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Authorization Prompt Modal (Step 2) */}
      {showPromotionModal && showPasswordAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="password-auth-title"
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden space-y-0"
          >
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative">
              <button
                onClick={() => {
                  setShowPasswordAuthModal(false);
                  setAdminPassword("");
                  setModalLocalError("");
                }}
                className="absolute right-5 top-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-500/30 rounded-2xl border border-indigo-400/30 shadow-inner">
                  <Lock className="w-6 h-6 text-indigo-300" />
                </div>
                <div>
                  <h2
                    id="password-auth-title"
                    className="text-base font-black tracking-tight text-white"
                  >
                    Administrator Authorization
                  </h2>
                  <p className="text-xs font-semibold text-indigo-200 mt-0.5">
                    Security Lock • School-Wide Grade Advancement
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body / Password Input */}
            <div className="p-6 space-y-4 bg-slate-50/50">
              <div className="p-3 bg-indigo-50 border border-indigo-200/80 rounded-2xl text-indigo-900 text-xs font-semibold flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span>Enter your administrator password to authorize execution.</span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                  Admin Password
                </label>
                <div className="relative flex items-center">
                  <input
                    type="password"
                    autoComplete="new-password"
                    autoFocus
                    placeholder="Enter your login password..."
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      setModalLocalError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !promoting) {
                        e.preventDefault();
                        handleExecutePromotion();
                      }
                    }}
                    className="w-full px-4 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-xs transition-all"
                  />
                </div>
              </div>

              {(modalLocalError || promoError) && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
                  <X className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{modalLocalError || promoError}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-slate-200/80 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowPasswordAuthModal(false);
                  setAdminPassword("");
                  setModalLocalError("");
                }}
                disabled={promoting}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Back to Review
              </button>
              <button
                onClick={handleExecutePromotion}
                disabled={!adminPassword.trim() || promoting}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl shadow-md hover:shadow-indigo-500/20 transition cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                {promoting ? "Authorizing & Executing..." : "Confirm & Execute Advancement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClassDirectoryView;
