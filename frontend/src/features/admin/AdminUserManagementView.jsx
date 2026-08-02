import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGetUsers, useCreateUser } from "./useAdmin";
import { getRoleBadgeStyle as getBadgeStyle } from "../../utils/roleUtils";
import {
  Users,
  UserPlus,
  Shield,
  Search,
  CheckCircle,
  Trash2,
  Lock,
  Sparkles,
  ChevronRight,
  User,
  GraduationCap,
  CreditCard,
  ArrowLeft,
  AlertTriangle,
  X,
  BookOpen,
} from "lucide-react";
import api from "../../api/axios";

const AdminUserManagementView = ({ initialTab = "all" }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null); // null = Step 1 (Role selector), 'admin' | 'teacher' | 'cashier' = Step 2 (Form)

  const [searchTerm, setSearchTerm] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");

  // Teacher Specific Form Fields
  const [teacherAssignmentType, setTeacherAssignmentType] =
    useState("class_teacher"); // 'class_teacher' | 'subject_teacher'
  const [targetClassId, setTargetClassId] = useState("");
  const [subjectName, setSubjectName] = useState("General");
  const [classesWithTeachers, setClassesWithTeachers] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  const [successMsg, setSuccessMsg] = useState("");

  const navigate = useNavigate();
  const {
    data: usersResponse,
    isLoading,
    refetch: refetchUsers,
  } = useGetUsers();
  const createUserMutation = useCreateUser();

  useEffect(() => {
    if (showAddModal) {
      fetchClassesWithTeachers();
    }
  }, [showAddModal]);

  const fetchClassesWithTeachers = async () => {
    try {
      setLoadingClasses(true);
      const res = await api.get("/admin/classes-with-teachers");
      const data = res.data?.data || [];
      setClassesWithTeachers(data);
      if (data.length > 0 && !targetClassId) {
        setTargetClassId(String(data[0].class_id));
      }
    } catch (err) {
      console.error("Failed to fetch classes with teachers:", err);
    } finally {
      setLoadingClasses(false);
    }
  };

  const currentClassInfo = classesWithTeachers.find(
    (c) => String(c.class_id) === String(targetClassId),
  );

  const handleOpenModal = () => {
    setSelectedRole(null);
    setEmail("");
    setFullName("");
    setPhone("");
    setDepartment("");
    setPassword("");
    setTeacherAssignmentType("class_teacher");
    setSubjectName("General");
    setShowAddModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    try {
      const payload = {
        email: email.trim(),
        full_name: fullName.trim(),
        role: selectedRole,
        phone: phone.trim(),
        department:
          department.trim() ||
          (selectedRole === "teacher"
            ? "Academics"
            : selectedRole === "cashier"
              ? "Accounts"
              : "Administration"),
        password: password || undefined,
        is_class_teacher:
          selectedRole === "teacher"
            ? teacherAssignmentType === "class_teacher"
            : false,
        class_id: selectedRole === "teacher" ? targetClassId : null,
        subject_name: selectedRole === "teacher" ? subjectName : null,
      };

      if (createUserMutation?.mutateAsync) {
        await createUserMutation.mutateAsync(payload);
      } else {
        await api.post("/admin/users", payload);
      }

      setSuccessMsg(
        `New ${selectedRole.replace("_", " ")} "${fullName}" provisioned successfully!`,
      );
      setShowAddModal(false);
      setSelectedRole(null);
      refetchUsers?.();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to provision staff member.");
    }
  };

  const displayUsers = Array.isArray(usersResponse)
    ? usersResponse
    : Array.isArray(usersResponse?.data)
      ? usersResponse.data
      : [];

  const filteredUsers = displayUsers.filter((u) => {
    if (u.role === "student") return false;

    const matchesSearch =
      (u.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.role || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.department || "").toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "teachers") return u.role === "teacher";
    if (activeTab === "staff")
      return !["teacher", "admin", "super_admin"].includes(u.role);
    if (activeTab === "admins")
      return ["admin", "super_admin"].includes(u.role);
    return true;
  });

  const getRoleBadgeStyle = (userRole = "") => {
    return getBadgeStyle(userRole);
  };

  const tabs = [
    { id: "all", label: "All Staff" },
    { id: "teachers", label: "Teachers" },
    { id: "staff", label: "Cashiers & Support" },
    { id: "admins", label: "Admins" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/80 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
            <div className="p-2 bg-slate-100 text-slate-800 rounded-xl border border-slate-200">
              <Users className="w-6 h-6" />
            </div>
            Staff Directory & Role Assignments
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Provision user accounts for Teachers, Admins, and Cashiers with
            detailed academic role assignments.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs transition active:scale-[0.99] cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> Provision New Staff / User
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {/* Control Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80">
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, email, department or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200/80">
            <tr>
              <th className="px-4 py-3">Staff Name</th>
              <th className="px-4 py-3">Email Address</th>
              <th className="px-4 py-3">Assigned Role & Dept</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredUsers.map((u) => (
              <tr
                key={u.id}
                className="hover:bg-slate-50/80 transition cursor-pointer group"
                onClick={() => navigate(`/profile/${u.id}`)}
              >
                <td className="px-4 py-3.5 font-bold text-slate-900 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-extrabold text-xs overflow-hidden flex-shrink-0">
                    {(u.full_name || u.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="block">{u.full_name || "N/A"}</span>
                    {u.phone && (
                      <span className="text-[10px] text-slate-400 font-normal">
                        {u.phone}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3.5 text-slate-600 font-medium">
                  {u.email}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex flex-col items-start gap-1">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getRoleBadgeStyle(u.role)}`}
                    >
                      {u.role ? u.role.replace("_", " ") : "User"}
                    </span>
                    {u.department && (
                      <span className="text-[10px] font-bold text-slate-400">
                        {u.department}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100/80 text-emerald-800 border border-emerald-200/60">
                    {u.status || "Active"}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex justify-end gap-2 items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/profile/${u.id}`);
                      }}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
                      title="View Profile"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Provision User & Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 border border-slate-200 animate-in fade-in zoom-in-95 my-8">
            {/* STEP 1: SELECT STAFF ROLE */}
            {selectedRole === null ? (
              <div className="space-y-5">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-600" /> Choose
                      Staff Role to Provision
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Select the specific operational role to open its dedicated
                      assignment form.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Option 1: Teacher */}
                  <button
                    onClick={() => {
                      setSelectedRole("teacher");
                      setDepartment("Academics");
                    }}
                    className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition flex flex-col items-center text-center space-y-3 cursor-pointer group"
                  >
                    <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 group-hover:scale-105 transition">
                      <GraduationCap className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        Teacher
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-1">
                        Academic instructor for Homeroom Class Teacher or
                        Subject Teacher roles.
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-[10px] font-extrabold uppercase">
                      Select Teacher
                    </span>
                  </button>

                  {/* Option 2: Admin */}
                  <button
                    onClick={() => {
                      setSelectedRole("admin");
                      setDepartment("Administration");
                    }}
                    className="p-5 rounded-2xl border border-slate-200 hover:border-slate-900 hover:bg-slate-50 transition flex flex-col items-center text-center space-y-3 cursor-pointer group"
                  >
                    <div className="p-3.5 bg-slate-100 text-slate-800 rounded-2xl border border-slate-200 group-hover:scale-105 transition">
                      <Shield className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        School Admin
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-1">
                        Full operational oversight, roster management &
                        administrative access.
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-[10px] font-extrabold uppercase">
                      Select Admin
                    </span>
                  </button>

                  {/* Option 3: Cashier */}
                  <button
                    onClick={() => {
                      setSelectedRole("cashier");
                      setDepartment("Accounts");
                    }}
                    className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition flex flex-col items-center text-center space-y-3 cursor-pointer group"
                  >
                    <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 group-hover:scale-105 transition">
                      <CreditCard className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        Fee Cashier
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-1">
                        Accounts desk staff responsible for fee collection &
                        receipt issuance.
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-extrabold uppercase">
                      Select Cashier
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              /* STEP 2: ROLE SPECIFIC DETAILS FORM */
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRole(null)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                      title="Back to Role Selection"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        Provision New {selectedRole.toUpperCase()} Account
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Fill out the specific credential & assignment details
                        below.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreate} className="space-y-4">
                  {/* Basic Account Credentials */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Rajesh Kumar"
                        value={fullName}
                        onChange={(e) =>
                          setFullName(
                            e.target.value.replace(/[^\p{L}\p{M}\s'\.-]/gu, ""),
                          )
                        }
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Contact Phone (10 Digits)
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="e.g. 9876543210"
                        value={phone}
                        onChange={(e) =>
                          setPhone(
                            e.target.value.replace(/\D/g, "").slice(0, 10),
                          )
                        }
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="user@thomson.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* SPECIALIZED TEACHER PROVISIONING SECTION */}
                  {selectedRole === "teacher" && (
                    <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4">
                      <h4 className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-indigo-600" />{" "}
                        Academic Teaching Assignment
                      </h4>

                      {/* Taught Subject */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Primary Taught Subject *
                        </label>
                        <select
                          value={subjectName}
                          onChange={(e) => setSubjectName(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                        >
                          <option value="General">
                            General / All Subjects
                          </option>
                          <option value="Mathematics">Mathematics</option>
                          <option value="Science">
                            Science (Physics & Chemistry)
                          </option>
                          <option value="English">
                            English Literature & Grammar
                          </option>
                          <option value="Social Studies">
                            Social Studies (History & Civics)
                          </option>
                          <option value="Computer Science">
                            Computer Science & IT
                          </option>
                          <option value="Hindi">Hindi Literature</option>
                        </select>
                      </div>

                      {/* Assignment Type Selector */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                          Teaching Role Assignment *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <label
                            className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition ${
                              teacherAssignmentType === "class_teacher"
                                ? "bg-white border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs"
                                : "bg-slate-50 border-slate-200 text-slate-600"
                            }`}
                          >
                            <input
                              type="radio"
                              name="teacherAssignmentType"
                              value="class_teacher"
                              checked={teacherAssignmentType === "class_teacher"}
                              onChange={() => setTeacherAssignmentType("class_teacher")}
                              className="sr-only"
                            />
                            <span className="font-extrabold text-xs text-indigo-900">
                              Class Teacher (Homeroom)
                            </span>
                            <span className="text-[10px] text-slate-500 mt-1">
                              In-charge & mentor of a grade section
                            </span>
                          </label>

                          <label
                            className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition ${
                              teacherAssignmentType === "subject_teacher"
                                ? "bg-white border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs"
                                : "bg-slate-50 border-slate-200 text-slate-600"
                            }`}
                          >
                            <input
                              type="radio"
                              name="teacherAssignmentType"
                              value="subject_teacher"
                              checked={teacherAssignmentType === "subject_teacher"}
                              onChange={() => setTeacherAssignmentType("subject_teacher")}
                              className="sr-only"
                            />
                            <span className="font-extrabold text-xs text-slate-900">
                              Subject Teacher Only
                            </span>
                            <span className="text-[10px] text-slate-500 mt-1">
                              Teaches subject across multiple classes
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Select Target Class */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Target Assigned Class Standard *
                        </label>
                        <select
                          value={targetClassId}
                          onChange={(e) => setTargetClassId(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                        >
                          {classesWithTeachers.map((c) => (
                            <option key={c.class_id} value={c.class_id}>
                              {c.class_name} Standard{" "}
                              {c.class_teacher_name
                                ? `(Current Class Teacher: ${c.class_teacher_name})`
                                : "(No Class Teacher)"}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Class Teacher Switching Banner */}
                      {teacherAssignmentType === "class_teacher" &&
                        currentClassInfo?.class_teacher_name && (
                          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in">
                            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="font-extrabold block text-amber-950">
                                Homeroom Replacement Notice
                              </span>
                              <p className="text-[11px] leading-relaxed mt-0.5 text-amber-800">
                                <strong className="text-slate-900">
                                  {currentClassInfo.class_teacher_name}
                                </strong>{" "}
                                is currently the Class Teacher of{" "}
                                <strong className="text-slate-900">
                                  {currentClassInfo.class_name}
                                </strong>
                                . Provisioning this new teacher will
                                automatically switch{" "}
                                <strong className="text-slate-900">
                                  {currentClassInfo.class_teacher_name}
                                </strong>{" "}
                                to a <strong>Subject Teacher</strong> for this
                                class and assign{" "}
                                <strong className="text-slate-900">
                                  {fullName || "this teacher"}
                                </strong>{" "}
                                as the sole Class Teacher.
                              </p>
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Initial Security Password
                    </label>
                    <input
                      type="password"
                      placeholder="Leave blank to auto-generate secure temporary password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedRole(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-indigo-500/20 cursor-pointer"
                    >
                      Save & Provision {selectedRole.toUpperCase()}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagementView;
