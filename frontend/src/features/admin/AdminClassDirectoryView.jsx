import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import {
  BookOpen,
  Users,
  ChevronRight,
  Search,
  GraduationCap,
  Building2,
  Plus,
  X,
  Check,
  Shield,
  UserPlus,
  Phone,
  Mail,
  Home,
  Award,
  User,
  Image as ImageIcon,
  Filter,
  Layers,
  Briefcase,
  Heart,
  Eye,
  Upload,
  Camera,
} from "lucide-react";
import useAuthStore from "../../store/authStore";

const AdminClassDirectoryView = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [classesData, setClassesData] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Modals visibility
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(null);
  const [showAddClassModal, setShowAddClassModal] = useState(false);

  // Add Class Form State
  const [newClassName, setNewClassName] = useState("");
  const [newGradeValue, setNewGradeValue] = useState("");
  const [newClassTeacher, setNewClassTeacher] = useState("");

  // Add Student Form State (Pure Frontend Design Ready)
  const [studentForm, setStudentForm] = useState({
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
    previous_school: "",
    father_name: "",
    father_phone: "",
    father_occupation: "",
    mother_name: "",
    mother_phone: "",
    mother_occupation: "",
    guardian_name: "",
    guardian_phone: "",
    guardian_relation: "",
  });

  const [formSuccess, setFormSuccess] = useState("");

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

      // Each row is a single class — no section grouping needed
      const list = raw
        .map((r) => ({
          class_id: r.class_id,
          class_name: r.class_name,
          numeric_value: r.numeric_value,
        }))
        .sort((a, b) => a.numeric_value - b.numeric_value);

      const savedClassId = sessionStorage.getItem("selectedClassId");

      // Fallback demo classes if DB is empty
      if (list.length === 0) {
        const demoList = [
          { class_id: 101, class_name: "Class 10", numeric_value: 10 },
          { class_id: 102, class_name: "Class 11", numeric_value: 11 },
          { class_id: 103, class_name: "Class 12", numeric_value: 12 },
        ];
        setClassesData(demoList);
        const foundSaved = savedClassId
          ? demoList.find((c) => String(c.class_id) === String(savedClassId))
          : null;
        setSelectedClass(foundSaved || demoList[0]);
      } else {
        setClassesData(list);
        const foundSaved = savedClassId
          ? list.find((c) => String(c.class_id) === String(savedClassId))
          : null;
        setSelectedClass(foundSaved || list[0]);
      }
    } catch (err) {
      console.error("Failed to fetch classes:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (classId) => {
    try {
      const res = await api.get(`/admin/classes/${classId}/students`);
      const apiStudents = res.data?.data || [];

      if (apiStudents.length > 0) {
        setStudents(apiStudents);
      } else {
        // Enriched Frontend Mock Data with all requested details
        setStudents([
          {
            student_id: 1,
            user_id: 11,
            admission_no: "TS-2026-001",
            roll_no: "101",
            first_name: "Aarav",
            last_name: "Sharma",
            email: "student@thomson.edu",
            phone: "+91 98765 43210",
            profile_pic:
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
            address: "14/B Heritage Park, MG Road, New Delhi",
            previous_school: "St. Xavier Convent High School",
            father_name: "Vikram Sharma",
            father_phone: "+91 98111 22334",
            father_occupation: "Senior Software Engineer",
            mother_name: "Priyanka Sharma",
            mother_phone: "+91 98111 22335",
            mother_occupation: "Architect",
            guardian_name: "Ramesh Sharma (Grandfather)",
            guardian_phone: "+91 98111 00000",
            guardian_relation: "Grandfather",
          },
          {
            student_id: 2,
            user_id: 12,
            admission_no: "TS-2026-002",
            roll_no: "102",
            first_name: "Ananya",
            last_name: "Patel",
            section_name: "A",
            email: "ananya.p@thomson.edu",
            phone: "+91 98989 12345",
            profile_pic:
              "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200",
            address: "702 Lakeview Apartments, Civil Lines",
            previous_school: "Delhi Public School",
            father_name: "Rajesh Patel",
            father_phone: "+91 99000 11223",
            father_occupation: "Business Owner",
            mother_name: "Sunita Patel",
            mother_phone: "+91 99000 11224",
            mother_occupation: "Doctor (Pediatrician)",
            guardian_name: "Rajesh Patel",
            guardian_phone: "+91 99000 11223",
            guardian_relation: "Father",
          },
        ]);
      }
    } catch (err) {
      console.error("Failed to fetch class students:", err);
    }
  };

  // Add Class Handler (Frontend Only State Update)
  const handleAddClassFrontend = (e) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const newId = Date.now();
    const createdClass = {
      class_id: newId,
      class_name: newClassName.trim(),
      numeric_value: parseInt(newGradeValue) || classesData.length + 1,
    };

    setClassesData((prev) => [...prev, createdClass]);
    setSelectedClass(createdClass);
    setShowAddClassModal(false);

    // Reset Form
    setNewClassName("");
    setNewGradeValue("");
    setNewClassTeacher("");
    setFormSuccess("Class added successfully!");
    setTimeout(() => setFormSuccess(""), 3000);
  };

  // Handle profile image file upload
  const handleProfilePicUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit. Please choose a smaller image.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setStudentForm((prev) => ({ ...prev, profile_pic: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Add Student Handler (Frontend Only State Update)
  const handleAddStudentFrontend = (e) => {
    e.preventDefault();
    if (!studentForm.first_name.trim()) return;

    const chosenClassId = studentForm.class_id || selectedClass?.class_id;

    const targetClass =
      classesData.find((c) => String(c.class_id) === String(chosenClassId)) ||
      selectedClass;
    if (targetClass) {
      setSelectedClass(targetClass);
    }

    const newStu = {
      student_id: Date.now(),
      user_id: Date.now(),
      class_id: chosenClassId,
      admission_no:
        studentForm.admission_no ||
        `TS-2026-${Math.floor(100 + Math.random() * 900)}`,
      roll_no: studentForm.roll_no || `${students.length + 101}`,
      first_name: studentForm.first_name,
      last_name: studentForm.last_name,
      email:
        studentForm.email ||
        `${studentForm.first_name.toLowerCase()}@student.thomson.edu`,
      phone: studentForm.phone || "+91 99999 88888",
      profile_pic:
        studentForm.profile_pic ||
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
      address: studentForm.address || "Address provided on record",
      previous_school: studentForm.previous_school || "N/A",
      father_name: studentForm.father_name || "Father Name",
      father_phone: studentForm.father_phone || "N/A",
      father_occupation: studentForm.father_occupation || "N/A",
      mother_name: studentForm.mother_name || "Mother Name",
      mother_phone: studentForm.mother_phone || "N/A",
      mother_occupation: studentForm.mother_occupation || "N/A",
      guardian_name:
        studentForm.guardian_name || studentForm.father_name || "Guardian",
      guardian_phone:
        studentForm.guardian_phone || studentForm.father_phone || "N/A",
      guardian_relation: studentForm.guardian_relation || "Parent",
    };

    setStudents((prev) => [newStu, ...prev]);
    setShowAddStudentModal(false);

    // Reset Form
    setStudentForm({
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
      previous_school: "",
      father_name: "",
      father_phone: "",
      father_occupation: "",
      mother_name: "",
      mother_phone: "",
      mother_occupation: "",
      guardian_name: "",
      guardian_phone: "",
      guardian_relation: "",
    });

    setFormSuccess("Student added to roster successfully!");
    setTimeout(() => setFormSuccess(""), 3000);
  };

  const filteredStudents = students.filter((s) => {
    const term = searchTerm.toLowerCase();
    const fullName = `${s.first_name || ""} ${s.last_name || ""}`.toLowerCase();
    return (
      fullName.includes(term) ||
      (s.admission_no || "").toLowerCase().includes(term) ||
      (s.email || "").toLowerCase().includes(term)
    );
  });

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
            Manage academic standards, assigned class teachers, and student
            profiles.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {(user?.role === "super_admin" || user?.role === "admin") && (
            <button
              onClick={() => {
                const initialClassId =
                  selectedClass?.class_id || classesData[0]?.class_id || "";
                setStudentForm((prev) => ({
                  ...prev,
                  class_id: initialClassId,
                }));
                setShowAddStudentModal(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-emerald-500/20 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Add Student
            </button>
          )}
        </div>
      </div>

      {formSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-xs animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          {formSuccess}
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
                  onClick={() => {
                    setSelectedClass(cls);
                    sessionStorage.setItem(
                      "selectedClassId",
                      String(cls.class_id),
                    );
                  }}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-indigo-50/90 border-indigo-300 shadow-xs ring-2 ring-indigo-500/20"
                      : "bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs"
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
                    {filteredStudents.length}
                  </span>
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search student or roll no..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Student Roster Table */}
          {
            /* Student Roster Table */
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-xs">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Admission & Roll</th>
                    <th className="px-4 py-3">Parent / Guardian</th>
                    <th className="px-4 py-3">Contact Email & Phone</th>
                    <th className="px-4 py-3 text-right">Profile View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
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
                        onClick={() => {
                          if (selectedClass)
                            sessionStorage.setItem(
                              "selectedClassId",
                              String(selectedClass.class_id),
                            );
                          navigate(`/profile/${s.user_id || s.student_id}`);
                        }}
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
                          <div className="font-mono font-bold text-xs text-slate-800">
                            {s.admission_no}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            Roll No: {s.roll_no}
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-xs">
                          <div className="font-extrabold text-slate-800">
                            {s.father_name || s.guardian_name || "N/A"}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            {s.father_occupation || "Parent"}
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-xs">
                          <div className="font-medium text-slate-700">
                            {s.email || "N/A"}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500">
                            {s.phone || "N/A"}
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (selectedClass)
                                sessionStorage.setItem(
                                  "selectedClassId",
                                  String(selectedClass.class_id),
                                );
                              navigate(`/profile/${s.user_id || s.student_id}`);
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition flex items-center gap-1 text-xs font-bold ml-auto"
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
          }
        </div>
      </div>

      {/* Add Class Modal (Pure Frontend) */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Add Academic Class / Standard
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-400">
                    Configure grade standard name and numeric value
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddClassModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddClassFrontend} className="space-y-4">
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
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
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

      {/* Add Student Modal (Pure Frontend Design Ready) */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
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
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleAddStudentFrontend}
              className="space-y-4 text-xs font-semibold text-slate-700"
            >
              {/* Section 1: Basic & Academic Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 border-b border-indigo-50 pb-1">
                  1. Basic & Academic Information
                </h4>

                {/* Profile Photo Upload Widget */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-16 h-16 rounded-2xl bg-white border border-slate-300 shadow-xs overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {studentForm.profile_pic ? (
                      <img
                        src={studentForm.profile_pic}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-slate-400" />
                    )}
                    <div className="absolute bottom-0 inset-x-0 bg-slate-900/70 text-white text-[8px] py-0.5 text-center font-bold tracking-wider uppercase">
                      PHOTO
                    </div>
                  </div>

                  <div className="flex-1 space-y-1 text-center sm:text-left">
                    <label className="block text-xs font-bold text-slate-900">
                      Student Profile Photo
                    </label>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Upload student photo file from your computer or enter
                      image URL.
                    </p>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                      <label className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        Browse & Upload Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePicUpload}
                          className="hidden"
                        />
                      </label>

                      {studentForm.profile_pic && (
                        <button
                          type="button"
                          onClick={() =>
                            setStudentForm((prev) => ({
                              ...prev,
                              profile_pic: "",
                            }))
                          }
                          className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>

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
                      placeholder="e.g. Aarav"
                      value={studentForm.first_name}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          first_name: e.target.value,
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
                      placeholder="e.g. Sharma"
                      value={studentForm.last_name}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          last_name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Student Email</label>
                    <input
                      type="email"
                      placeholder="e.g. student@thomson.edu"
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
                    <label className="block mb-1">Contact Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. +91 98765 43210"
                      value={studentForm.phone}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Admission No</label>
                    <input
                      type="text"
                      placeholder="e.g. TS-2026-003"
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
                    <label className="block mb-1">Roll No</label>
                    <input
                      type="text"
                      placeholder="e.g. 103"
                      value={studentForm.roll_no}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          roll_no: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Address & Previous School */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 border-b border-indigo-50 pb-1">
                  2. Residential & Previous School Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1">Profile Picture URL</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={studentForm.profile_pic}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          profile_pic: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Previous School Name</label>
                    <input
                      type="text"
                      placeholder="e.g. St. Convent Academy"
                      value={studentForm.previous_school}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          previous_school: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block mb-1">Full Permanent Address</label>
                    <textarea
                      rows="2"
                      placeholder="Enter house no, street, city and pin code..."
                      value={studentForm.address}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          address: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
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
                      placeholder="Father full name"
                      value={studentForm.father_name}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          father_name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Father Phone</label>
                    <input
                      type="text"
                      placeholder="+91..."
                      value={studentForm.father_phone}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          father_phone: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Father Occupation</label>
                    <input
                      type="text"
                      placeholder="Occupation"
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
                      placeholder="Mother full name"
                      value={studentForm.mother_name}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          mother_name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Mother Phone</label>
                    <input
                      type="text"
                      placeholder="+91..."
                      value={studentForm.mother_phone}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          mother_phone: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Mother Occupation</label>
                    <input
                      type="text"
                      placeholder="Occupation"
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
                      placeholder="Guardian name"
                      value={studentForm.guardian_name}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          guardian_name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Guardian Phone</label>
                    <input
                      type="text"
                      placeholder="+91..."
                      value={studentForm.guardian_phone}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          guardian_phone: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Relationship</label>
                    <input
                      type="text"
                      placeholder="e.g. Uncle / Grandfather"
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

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
                >
                  Save Student Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Student Modal (Pure Frontend Design Ready) */}
    </div>
  );
};

export default AdminClassDirectoryView;
