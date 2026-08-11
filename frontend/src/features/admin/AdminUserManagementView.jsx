import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGetUsers, useCreateUser, useUpdateUser, useDeleteUser } from "./useAdmin";
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
  Briefcase,
  Calendar,
  Building,
  Phone,
  Mail,
  Award,
  BookOpen,
} from "lucide-react";
import api from "../../api/axios";
import useAuthStore from "../../store/authStore";

const AdminUserManagementView = ({ initialTab = "all" }) => {
  const { user: currentUser } = useAuthStore();
  const updateUserMutation = useUpdateUser();
  const [pendingToggleIds, setPendingToggleIds] = useState(new Set());
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null); // null = Step 1 (Role selector), 'admin' | 'teacher' | 'cashier' | 'staff' = Step 2 (Form)

  const [searchTerm, setSearchTerm] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("Administration");
  const [designation, setDesignation] = useState("");
  const [qualification, setQualification] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("Male");

  // Teacher Specific Form Fields
  const [teacherAssignmentType, setTeacherAssignmentType] = useState("class_teacher"); // 'class_teacher' | 'subject_teacher'
  const [targetClassId, setTargetClassId] = useState("");
  const [subjectName, setSubjectName] = useState("Mathematics");
  const [classesWithTeachers, setClassesWithTeachers] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const navigate = useNavigate();
  const {
    data: usersResponse,
    isLoading,
    refetch: refetchUsers,
  } = useGetUsers();
  const createUserMutation = useCreateUser();
  const deleteUserMutation = useDeleteUser();

  useEffect(() => {
    if (showAddModal) {
      fetchClassesWithTeachers();
    }
  }, [showAddModal]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showAddModal) {
        setShowAddModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
    setDepartment("Administration");
    setDesignation("");
    setQualification("");
    setJoiningDate("");
    setDob("");
    setAddress("");
    setEmergencyContact("");
    setPassword("");
    setGender("Male");
    setTeacherAssignmentType("class_teacher");
    setSubjectName("Mathematics");
    setErrorMsg("");
    setShowAddModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (isCreating) return;

    if (!fullName.trim()) {
      setErrorMsg("Full name is required.");
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg("Please enter a valid primary email address.");
      return;
    }

    if (!phone.trim() || phone.trim().length !== 10) {
      setErrorMsg("Contact phone number must be strictly 10 digits.");
      return;
    }

    if (emergencyContact.trim() && emergencyContact.trim().length !== 10) {
      setErrorMsg("Emergency contact phone number must be strictly 10 digits.");
      return;
    }

    if (selectedRole === "teacher" && (!targetClassId || !String(targetClassId).trim())) {
      setErrorMsg("Target class selection is required for teacher assignment.");
      return;
    }

    try {
      setIsCreating(true);
      setErrorMsg("");

      const payload = {
        email: email.trim(),
        full_name: fullName.trim(),
        role: selectedRole,
        phone: phone.trim(),
        gender: gender || "Male",
        department:
          department.trim() ||
          (selectedRole === "teacher"
            ? "Academics"
            : selectedRole === "cashier"
              ? "Accounts"
              : "Administration"),
        designation: designation.trim() || undefined,
        qualification: qualification.trim() || undefined,
        joining_date: joiningDate || undefined,
        dob: dob || undefined,
        address: address.trim() || undefined,
        emergency_contact: emergencyContact.trim() || undefined,
        password: password.trim() || undefined,
        is_class_teacher:
          selectedRole === "teacher"
            ? teacherAssignmentType === "class_teacher"
            : false,
        class_id: selectedRole === "teacher" ? targetClassId : null,
        subject_name: selectedRole === "teacher" ? subjectName : null,
      };

      await createUserMutation.mutateAsync(payload);

      setSuccessMsg(
        `New ${selectedRole.replace("_", " ")} "${fullName}" provisioned successfully!`,
      );
      setShowAddModal(false);
      setSelectedRole(null);
      refetchUsers?.();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      console.error("Failed to provision staff member:", err);
      setErrorMsg(err.response?.data?.message || "Failed to provision staff member.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteStaff = async (id, name) => {
    try {
      await deleteUserMutation.mutateAsync(id);
      setSuccessMsg(`Staff record "${name}" deleted successfully.`);
      setDeleteConfirmId(null);
      refetchUsers?.();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      console.error("Failed to delete staff member:", err);
      setErrorMsg(err.response?.data?.message || "Failed to delete staff member.");
      setDeleteConfirmId(null);
    }
  };

  const handleToggleStatus = async (user) => {
    if (pendingToggleIds.has(user.id)) return;

    const currentStatus = (user.status || "active").toLowerCase();
    const nextStatus = currentStatus === "active" ? "inactive" : "active";

    setPendingToggleIds((prev) => new Set(prev).add(user.id));
    try {
      await updateUserMutation.mutateAsync({ id: user.id, status: nextStatus });
      setSuccessMsg(`Status for "${user.full_name || user.email}" updated to ${nextStatus.toUpperCase()}.`);
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      console.error("Failed to toggle user status:", err);
      setErrorMsg(err.response?.data?.message || "Failed to update user status.");
      setTimeout(() => setErrorMsg(""), 3500);
    } finally {
      setPendingToggleIds((prev) => {
        const next = new Set(prev);
        next.delete(user.id);
        return next;
      });
    }
  };

  const displayUsers = Array.isArray(usersResponse)
    ? usersResponse
    : Array.isArray(usersResponse?.data)
      ? usersResponse.data
      : [];

  const filteredUsers = displayUsers.filter((u) => {
    if (u.role === "student") return false;

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (u.full_name || "").toLowerCase().includes(term) ||
      (u.email || "").toLowerCase().includes(term) ||
      (u.employee_code || "").toLowerCase().includes(term) ||
      (u.role || "").toLowerCase().includes(term) ||
      (u.department || "").toLowerCase().includes(term) ||
      (u.designation || "").toLowerCase().includes(term);

    if (!matchesSearch) return false;

    if (activeTab === "teachers") return u.role === "teacher";
    if (activeTab === "cashiers") return u.role === "cashier";
    if (activeTab === "admins") return ["admin", "super_admin"].includes(u.role);
    return true;
  });

  const getRoleBadgeStyle = (userRole = "") => {
    return getBadgeStyle(userRole);
  };

  const tabs = [
    { id: "all", label: "All Staff" },
    { id: "teachers", label: "Teachers" },
    { id: "cashiers", label: "Fee Cashiers" },
    { id: "admins", label: "School Admins" },
  ];

  const totalStaff = displayUsers.filter((u) => u.role !== "student").length;
  const teacherCount = displayUsers.filter((u) => u.role === "teacher").length;
  const adminCount = displayUsers.filter((u) => ["admin", "super_admin"].includes(u.role)).length;
  const cashierCount = displayUsers.filter((u) => u.role === "cashier").length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/80 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shadow-xs">
              <Users className="w-6 h-6" />
            </div>
            Staff Directory & Role Assignments
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Provision user accounts for Teachers, Admins, Accounts & Operations Desk with complete profile details.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-indigo-500/20 transition active:scale-[0.99] cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> Provision New Staff Member
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <X className="w-5 h-5 text-rose-600 flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
              Total Staff
            </span>
            <span className="text-lg font-black text-slate-900">{totalStaff}</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase text-indigo-500 block tracking-wider">
              Teachers
            </span>
            <span className="text-lg font-black text-slate-900">{teacherCount}</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-violet-50 text-violet-600 rounded-xl">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase text-violet-500 block tracking-wider">
              Admins
            </span>
            <span className="text-lg font-black text-slate-900">{adminCount}</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase text-emerald-600 block tracking-wider">
              Fee Cashiers
            </span>
            <span className="text-lg font-black text-slate-900">{cashierCount}</span>
          </div>
        </div>
      </div>

      {/* Control Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-slate-50/90 p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative flex items-center flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, email, employee code, department or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs transition-all"
          />
        </div>
      </div>

      {/* Modern Staff Table View */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200/80">
            <tr>
              <th className="px-4 py-3.5">Staff Member & Code</th>
              <th className="px-4 py-3.5">Primary Contact</th>
              <th className="px-4 py-3.5">Assigned Role & Dept</th>
              <th className="px-4 py-3.5">Classes Taught / Teaching Scope</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {isLoading ? (
              <tr>
                <td colSpan="6" className="px-4 py-12 text-center text-slate-400 text-xs font-medium">
                  Loading staff roster...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-12 text-center text-slate-400 text-xs font-medium">
                  No staff members match the selected filter.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const isTeacher = u.role === "teacher";
                const isAdmin = ["admin", "super_admin"].includes(u.role);
                const avatarBg = isTeacher
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                  : isAdmin
                    ? "bg-violet-50 text-violet-700 border-violet-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200";

                return (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/80 transition cursor-pointer group"
                    onClick={() => navigate(`/profile/${u.id}`)}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-2xl ${avatarBg} border flex items-center justify-center font-black text-xs shrink-0 shadow-2xs`}>
                          {(u.full_name || u.email || "S").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                            {u.full_name || "N/A"}
                            {u.employee_code && (
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                {u.employee_code}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-semibold capitalize block mt-0.5">
                            {u.gender || "Male"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {u.email}
                      </div>
                      {u.phone && (
                        <div className="text-[11px] font-mono font-bold text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          {u.phone}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getRoleBadgeStyle(u.role)}`}>
                          {u.role ? u.role.replace("_", " ") : "User"}
                        </span>
                        {u.department && (
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <Building className="w-3 h-3 text-slate-400" />
                            {u.department}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {isTeacher ? (
                        <div className="space-y-1">
                          {u.homeroom_class ? (
                            <div>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-indigo-100 text-indigo-900 border border-indigo-200 inline-flex items-center gap-1 shadow-2xs">
                                <Sparkles className="w-3 h-3 text-indigo-600 shrink-0" />
                                Class Teacher ({u.homeroom_class})
                              </span>
                              {u.subject_classes && (
                                <span className="text-[10px] font-bold text-slate-500 block mt-1">
                                  Other Classes: {u.subject_classes}
                                </span>
                              )}
                            </div>
                          ) : u.subject_classes || u.assigned_classes ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200 inline-flex items-center gap-1">
                              <BookOpen className="w-3 h-3 text-slate-500 shrink-0" />
                              {u.subject_classes || u.assigned_classes}
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium text-slate-400 italic">
                              No classes assigned
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 inline-block">
                          Non-Teaching Staff
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      {(() => {
                        const statusVal = (u.status || "active").toLowerCase();
                        const isStatusActive = statusVal === "active";
                        const isStatusSuspended = statusVal === "suspended" || statusVal === "inactive";
                        const isStatusOnLeave = statusVal === "on_leave";

                        const badgeBgClass = isStatusActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
                          : isStatusSuspended
                          ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                          : isStatusOnLeave
                          ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                          : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200";

                        const dotClass = isStatusActive
                          ? "bg-emerald-500 animate-pulse"
                          : isStatusSuspended
                          ? "bg-rose-500"
                          : isStatusOnLeave
                          ? "bg-amber-500"
                          : "bg-slate-400";

                        return (
                          <button
                            disabled={pendingToggleIds.has(u.id)}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatus(u);
                            }}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold border transition hover:scale-105 active:scale-95 cursor-pointer ${badgeBgClass} ${pendingToggleIds.has(u.id) ? "opacity-50 cursor-not-allowed" : ""}`}
                            title={`Current status: ${statusVal.toUpperCase()}. Click to switch to ${isStatusActive ? "INACTIVE" : "ACTIVE"}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                            {statusVal}
                          </button>
                        );
                      })()}
                    </td>

                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-1.5 items-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/profile/${u.id}`);
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition cursor-pointer"
                          title="View Profile"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        {String(u.id) !== String(currentUser?.id) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId({ id: u.id, name: u.full_name || u.email });
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                            title="Delete Staff Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Staff Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-extrabold text-slate-900">Confirm Staff Deletion</h3>
            </div>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              Are you sure you want to delete the staff account for <strong>{deleteConfirmId.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteStaff(deleteConfirmId.id, deleteConfirmId.name)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-rose-500/20 cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Provision User & Add Staff Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 border border-slate-200 animate-in fade-in zoom-in-95 my-8">
            {/* STEP 1: SELECT STAFF ROLE */}
            {selectedRole === null ? (
              <div className="space-y-5">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-600" /> Select Staff Role to Provision
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Select the specific operational role to open its detailed provisioning form.
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
                      setDesignation("Academic Teacher");
                    }}
                    className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition flex flex-col items-start text-left space-y-3 cursor-pointer group"
                  >
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 group-hover:scale-105 transition">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">Academic Teacher</h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-1">
                        Instructors assigned to Homeroom Class Teacher or Subject Teacher roles.
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
                      setDesignation("School Administrator");
                    }}
                    className="p-5 rounded-2xl border border-slate-200 hover:border-violet-500 hover:bg-violet-50/50 transition flex flex-col items-start text-left space-y-3 cursor-pointer group"
                  >
                    <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl border border-violet-100 group-hover:scale-105 transition">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">School Admin</h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-1">
                        Operational leadership with full roster, security & administrative oversight.
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-violet-100 text-violet-800 rounded-full text-[10px] font-extrabold uppercase">
                      Select Admin
                    </span>
                  </button>

                  {/* Option 3: Cashier */}
                  <button
                    onClick={() => {
                      setSelectedRole("cashier");
                      setDepartment("Accounts & Finance");
                      setDesignation("Accounts Executive");
                    }}
                    className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition flex flex-col items-start text-left space-y-3 cursor-pointer group"
                  >
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 group-hover:scale-105 transition">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">Fee Cashier / Accounts</h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-1">
                        Billing desk staff managing student fee collection & financial receipts.
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-extrabold uppercase">
                      Select Cashier
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              /* STEP 2: DETAILED ROLE PROVISIONING FORM */
              <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1 custom-scrollbar">
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
                        Fill out the complete profile & credential details below.
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

                <form onSubmit={handleCreate} autoComplete="off" className="space-y-4 text-xs font-semibold text-slate-700">
                  {/* Section 1: Basic Credentials */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 border-b border-indigo-50 pb-1">
                      1. Basic Account Credentials
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Rajesh Kumar"
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
                          Primary Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="rajesh.kumar@thomson.edu"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Contact Phone (10 Digits) *
                        </label>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          placeholder="9876543210"
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
                          Gender *
                        </label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white cursor-pointer"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Professional & Employment Info */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 border-b border-indigo-50 pb-1">
                      2. Employment & Professional Information
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Department *
                        </label>
                        <select
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white cursor-pointer"
                        >
                          <option value="Administration">Administration</option>
                          <option value="Academics">Academics</option>
                          <option value="Accounts & Finance">Accounts & Finance</option>
                          <option value="IT & Systems">IT & Systems</option>
                          <option value="Facilities & Operations">Facilities & Operations</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Designation / Job Title
                        </label>
                        <input
                          type="text"
                          placeholder="Senior Administrator"
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Highest Qualification
                        </label>
                        <input
                          type="text"
                          placeholder="MBA (Finance)"
                          value={qualification}
                          onChange={(e) => setQualification(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Joining Date
                        </label>
                        <input
                          type="date"
                          value={joiningDate}
                          onChange={(e) => setJoiningDate(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Personal & Emergency Details */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 border-b border-indigo-50 pb-1">
                      3. Personal & Emergency Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Emergency Contact Phone (10 Digits)
                        </label>
                        <input
                          type="tel"
                          maxLength={10}
                          placeholder="9876543210"
                          value={emergencyContact}
                          onChange={(e) =>
                            setEmergencyContact(
                              e.target.value.replace(/\D/g, "").slice(0, 10),
                            )
                          }
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Permanent Address
                        </label>
                        <textarea
                          rows="2"
                          placeholder="House No. 12, Main Street, City"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SPECIALIZED TEACHER PROVISIONING SECTION */}
                  {selectedRole === "teacher" && (
                    <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4 mt-2">
                      <h4 className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-indigo-600" /> Academic Teaching Assignment
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
                          <option value="Mathematics">Mathematics</option>
                          <option value="Science">Science (Physics & Chemistry)</option>
                          <option value="English">English Literature & Grammar</option>
                          <option value="Social Studies">Social Studies (History & Civics)</option>
                          <option value="Computer Science">Computer Science & IT</option>
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
                                . Provisioning this new teacher will automatically switch{" "}
                                <strong className="text-slate-900">
                                  {currentClassInfo.class_teacher_name}
                                </strong>{" "}
                                to a <strong>Subject Teacher</strong> for this class and assign{" "}
                                <strong className="text-slate-900">
                                  {fullName || "this teacher"}
                                </strong>{" "}
                                as sole Class Teacher.
                              </p>
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Initial Security Password
                    </label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      placeholder="Leave blank for auto-generated password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                      {errorMsg}
                    </div>
                  )}

                  <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedRole(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating}
                      className={`px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-indigo-500/20 ${
                        isCreating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                      }`}
                    >
                      {isCreating ? "Provisioning..." : `Save & Provision ${selectedRole.toUpperCase()}`}
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
