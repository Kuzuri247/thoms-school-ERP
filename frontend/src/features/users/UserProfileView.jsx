import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useGetUserProfile } from "./useUsers";
import useAuthStore from "../../store/authStore";
import {
  getRoleBadgeStyle,
  isStaff as checkIsStaff,
} from "../../utils/roleUtils";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  MapPin,
  Hash,
  Edit3,
  Lock,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  Save,
  X,
  GraduationCap,
  Building2,
  Users,
  Award,
  MessageSquareText,
} from "lucide-react";
import { useRemarksStore } from "../../store/remarksStore";
import { MONTH_NAMES, NEGATIVE_TAGS } from "../../constants/remarksConstants";

const StudentRemarksCard = ({ remarks = [] }) => {
  if (!Array.isArray(remarks) || remarks.length === 0) {
    return (
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-400 font-medium text-center">
        No monthly class teacher remarks recorded for this student yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {remarks.map((rem) => {
        const monthLabel =
          MONTH_NAMES[(rem.month || 1) - 1] || `Month ${rem.month}`;
        let tagList = [];
        if (rem.tags) {
          if (Array.isArray(rem.tags)) {
            tagList = rem.tags;
          } else if (typeof rem.tags === "string") {
            const trimmed = rem.tags.trim();
            if (trimmed.startsWith("[")) {
              try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) tagList = parsed;
              } catch (e) {
                tagList = trimmed.split(",").map((t) => t.trim()).filter(Boolean);
              }
            } else {
              tagList = trimmed.split(",").map((t) => t.trim()).filter(Boolean);
            }
          }
        }

        return (
          <div
            key={rem.id || `${rem.month}-${rem.year}`}
            className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-2.5 text-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-indigo-100/60 pb-2">
              <div className="flex items-center gap-2 font-extrabold text-indigo-950">
                <span className="px-2.5 py-0.5 bg-indigo-600 text-white font-black text-[10px] rounded-full uppercase tracking-wider">
                  {monthLabel} {rem.year}
                </span>
                <span>Class Teacher: {rem.teacher_name || "Assigned Teacher"}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                Posted:{" "}
                {rem.updated_at
                  ? new Date(rem.updated_at).toLocaleDateString()
                  : ""}
              </span>
            </div>

            {tagList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {tagList.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                      NEGATIVE_TAGS.includes(tag)
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    🏷️ {tag}
                  </span>
                ))}
              </div>
            )}

            {rem.remark && (
              <p className="text-slate-800 font-medium leading-relaxed bg-white p-3 rounded-xl border border-indigo-100/80">
                "{rem.remark}"
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

const UserProfileView = () => {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: authUser, setUser: setAuthUser } = useAuthStore();
  const id = paramId || authUser?.id;
  const { data: apiProfile, isLoading, error } = useGetUserProfile(id);

  // Local state for editable user profile
  const [profile, setProfile] = useState(null);
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

  // Consolidated Form State
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    employee_code: "",
    designation: "",
    department: "",
    qualification: "",
    joining_date: "",
    emergency_contact: "",
    gender: "male",
    date_of_birth: "",
    address: "",
    blood_group: "",
    religion: "",
    nationality: "Indian",
    city: "",
    state: "",
    pincode: "",
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

  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Form states for password change modal
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState("");
  const [profileSuccessMessage, setProfileSuccessMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { fetchStudentRemarks, remarksByStudent } = useRemarksStore();

  useEffect(() => {
    if (apiProfile) {
      setProfile(apiProfile);
      populateFormFields(apiProfile);
      if (apiProfile.profile_type === "student" || apiProfile.role === "student") {
        const reqId = apiProfile.student_db_id || apiProfile.id;
        const opts = apiProfile.student_db_id ? {} : { by: "user_id" };
        fetchStudentRemarks(reqId, opts);
      }
    } else if (
      authUser &&
      (!paramId || String(paramId) === String(authUser.id))
    ) {
      setProfile(authUser);
      populateFormFields(authUser);
      if (authUser.profile_type === "student" || authUser.role === "student") {
        const reqId = authUser.student_db_id || authUser.id;
        const opts = authUser.student_db_id ? {} : { by: "user_id" };
        fetchStudentRemarks(reqId, opts);
      }
    } else if (error) {
      setProfile(null);
    }
  }, [apiProfile, authUser, paramId, error, fetchStudentRemarks]);


  // Escape key handler for accessible modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (editProfileModalOpen) setEditProfileModalOpen(false);
        if (changePasswordModalOpen) setChangePasswordModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editProfileModalOpen, changePasswordModalOpen]);

  const format10Digits = (val) =>
    val ? String(val).replace(/\D/g, "").slice(0, 10) : "";

  const normalizeDate = (val) => {
    if (!val) return "";
    try {
      return new Date(val).toISOString().slice(0, 10);
    } catch (e) {
      return "";
    }
  };

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const populateFormFields = (p) => {
    if (!p) return;
    setForm({
      full_name:
        p.full_name ||
        `${p.first_name || ""} ${p.last_name || ""}`.trim() ||
        "",
      email: p.email || "",
      phone: format10Digits(p.phone),
      employee_code: p.employee_code || "",
      designation: p.designation || "",
      department: p.department || "",
      qualification: p.qualification || "",
      joining_date: normalizeDate(p.joining_date),
      emergency_contact: format10Digits(
        p.emergency_contact || p.emergency_phone || p.phone,
      ),
      gender: p.gender
        ? p.gender.charAt(0).toUpperCase() + p.gender.slice(1).toLowerCase()
        : "Male",
      date_of_birth: normalizeDate(p.date_of_birth),
      address: p.address || "",
      blood_group: p.blood_group || "",
      religion: p.religion || "",
      nationality: p.nationality || "Indian",
      city: p.city || "",
      state: p.state || "",
      pincode: p.pincode || "",
      father_name: p.father_name || "",
      father_phone: format10Digits(p.father_phone),
      father_occupation: p.father_occupation || "",
      mother_name: p.mother_name || "",
      mother_phone: format10Digits(p.mother_phone),
      mother_occupation: p.mother_occupation || "",
      guardian_name: p.guardian_name || "",
      guardian_phone: format10Digits(p.guardian_phone),
      guardian_relation: p.guardian_relation || "",
    });
  };

  if (isLoading && !profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile || (error && !apiProfile)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-500">
        <User className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-700">Profile Not Found</h2>
        <p className="text-sm mt-2">
          The requested user profile does not exist or you lack permission.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-lg text-sm cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isStudent =
    profile.profile_type === "student" || profile.role === "student";
  const isStaffMember = checkIsStaff(profile);

  // Handle Save Profile updates to backend DB
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError("");
    setSubmittingProfile(true);

    try {
      const { default: api } = await import("../../api/axios");
      await api.put(`/users/${profile.id}/profile`, form);

      queryClient.invalidateQueries(["userProfile", String(profile.id)]);

      if (authUser && Number(authUser.id) === Number(profile.id)) {
        setAuthUser({
          ...authUser,
          full_name: form.full_name,
          email: form.email,
        });
      }

      setProfileSuccessMessage("Profile updated successfully!");
      setTimeout(() => setProfileSuccessMessage(""), 5000);
      setEditProfileModalOpen(false);
    } catch (err) {
      console.error("Failed to update profile in backend DB:", err);
      setProfileError(
        err.response?.data?.message || "Failed to save profile changes.",
      );
    } finally {
      setSubmittingProfile(false);
    }
  };

  // Handle Dedicated Change Password Submit
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError(
        "New password must contain at least one uppercase letter (A-Z).",
      );
      return;
    }
    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      setPasswordError(
        "New password must contain at least one special character.",
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    try {
      const { default: api } = await import("../../api/axios");
      await api.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      setChangePasswordModalOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccessMessage(
        "Password updated successfully! Please log in with your new password on your next login.",
      );
      setTimeout(() => setPasswordSuccessMessage(""), 5000);
    } catch (err) {
      setPasswordError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to change password. Please verify current password.",
      );
    }
  };

  const statusLabel = profile.staff_status || profile.status || "Not provided";
  const isStatusActive = String(statusLabel).toLowerCase() === "active";

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto pb-12">
      {/* Notifications Banners */}
      {profileSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between text-xs font-bold shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{profileSuccessMessage}</span>
          </div>
          <button
            onClick={() => setProfileSuccessMessage("")}
            className="p-1 hover:bg-emerald-100 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {passwordSuccessMessage && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-2xl flex items-center justify-between text-xs font-bold shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <span>{passwordSuccessMessage}</span>
          </div>
          <button
            onClick={() => setPasswordSuccessMessage("")}
            className="p-1 hover:bg-indigo-100 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header / Back button & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white hover:bg-slate-50 rounded-full border border-slate-200 text-slate-500 transition shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              User Profile & Identity Record
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Managing credentials for{" "}
              {profile.full_name || profile.email || "Not provided"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setProfileError("");
              setEditProfileModalOpen(true);
            }}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-600" /> Edit Profile
          </button>

          <button
            onClick={() => {
              setPasswordError("");
              setChangePasswordModalOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-xs rounded-xl hover:from-indigo-700 hover:to-violet-700 transition shadow-md shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Key className="w-3.5 h-3.5" /> Change Password
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Basic Info */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3">
              <span
                className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase border ${getRoleBadgeStyle(profile.role)}`}
              >
                {profile.role ? profile.role.replace("_", " ") : "User"}
              </span>
            </div>

            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 border-4 border-white shadow-lg flex items-center justify-center text-3xl font-extrabold text-indigo-700 mt-2 mb-4">
              {(profile.full_name || profile.email || "U")
                .charAt(0)
                .toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {profile.full_name || "Not provided"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {profile.email || "Not provided"}
            </p>
            <div className="mt-4 flex gap-2 justify-center">
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                  isStatusActive
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                Status: {statusLabel}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">
              Contact & Identity
            </h3>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs text-slate-500 font-medium">
                  Account Email / User ID
                </p>
                <p className="font-semibold text-slate-800 truncate">
                  {profile.email || "Not provided"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">
                  Primary Contact
                </p>
                <p className="font-semibold text-slate-800">
                  {profile.phone || "Not provided"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Extended Profiles */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          {/* STAFF DETAILED PROFILE CARD */}
          {isStaffMember && (
            <div className="space-y-6">
              {/* Professional & Institutional Details */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Briefcase className="w-5 h-5 text-indigo-500" /> Staff &
                  Institutional Profile
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                      Employee Code / ID
                    </p>
                    <p className="font-black text-slate-900 text-sm flex items-center gap-1.5 font-mono">
                      <Hash className="w-4 h-4 text-indigo-600" />
                      {profile.employee_code || "Not provided"}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                      Designation
                    </p>
                    <p className="font-black text-indigo-900 text-sm">
                      {profile.designation || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500 font-medium mb-1">
                      Department
                    </p>
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      {profile.department || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500 font-medium mb-1">
                      Highest Qualification
                    </p>
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-slate-400" />
                      {profile.qualification || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500 font-medium mb-1">
                      Date of Joining
                    </p>
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {profile.joining_date
                        ? new Date(profile.joining_date).toLocaleDateString()
                        : "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500 font-medium mb-1">
                      Working Status
                    </p>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {statusLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Personal Information Card for Staff */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <User className="w-5 h-5 text-teal-600" /> Personal &
                  Emergency Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
                  <div>
                    <p className="text-slate-500 font-medium mb-1">Gender</p>
                    <p className="font-bold text-slate-800 capitalize">
                      {profile.gender || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500 font-medium mb-1">
                      Date of Birth
                    </p>
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {profile.date_of_birth
                        ? new Date(profile.date_of_birth).toLocaleDateString()
                        : "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500 font-medium mb-1">
                      Emergency Contact
                    </p>
                    <p className="font-bold text-slate-800 flex items-center gap-1.5 font-mono">
                      <Phone className="w-4 h-4 text-rose-500" />
                      {profile.emergency_phone ||
                        profile.emergency_contact ||
                        profile.phone ||
                        "Not provided"}
                    </p>
                  </div>

                  <div className="sm:col-span-3">
                    <p className="text-slate-500 font-medium mb-1">
                      Residential Address
                    </p>
                    <p className="font-bold text-slate-800 flex items-start gap-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      {profile.address || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STUDENT DETAILED PROFILE CARD */}
          {isStudent && (
            <div className="space-y-6">
              {/* Academic Record Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-indigo-600" />{" "}
                    Academic & Enrollment Details
                  </h3>
                  <span className="text-[11px] font-bold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                    Enrolled Student
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                      Admission Number
                    </p>
                    <p className="font-black text-slate-900 text-sm flex items-center gap-1.5 font-mono">
                      <Hash className="w-4 h-4 text-indigo-600" />
                      {profile.admission_no || "Not provided"}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                      Roll Number
                    </p>
                    <p className="font-black text-slate-900 text-sm font-mono">
                      {profile.roll_no || "Not provided"}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                      Academic Class / Standard
                    </p>
                    <p className="font-black text-indigo-900 text-sm">
                      {profile.class_name || profile.class || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500 font-medium mb-1">
                      Date of Admission
                    </p>
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {profile.admission_date
                        ? new Date(profile.admission_date).toLocaleDateString()
                        : "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal & Residential Details Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <User className="w-5 h-5 text-emerald-600" /> Personal Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
                  <div>
                    <p className="text-slate-500 font-medium mb-1">Gender</p>
                    <p className="font-bold text-slate-800 capitalize">
                      {profile.gender || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500 font-medium mb-1">
                      Date of Birth
                    </p>
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {profile.date_of_birth
                        ? new Date(profile.date_of_birth).toLocaleDateString()
                        : "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500 font-medium mb-1">
                      Blood Group
                    </p>
                    <p className="font-extrabold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full inline-block border border-rose-100">
                      {profile.blood_group || "Not provided"}
                    </p>
                  </div>

                  <div className="sm:col-span-3">
                    <p className="text-slate-500 font-medium mb-1">
                      Residential Address
                    </p>
                    <p className="font-bold text-slate-800 flex items-start gap-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      {profile.address || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Parents & Guardian Information Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Users className="w-5 h-5 text-purple-600" /> Parents &
                  Guardian Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 space-y-2 text-xs">
                    <div className="font-black text-indigo-900 uppercase tracking-wider text-[10px]">
                      Father's Details
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Full Name</p>
                      <p className="font-extrabold text-slate-900 text-sm">
                        {profile.father_name || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">
                        Contact Phone
                      </p>
                      <p className="font-bold text-slate-800 font-mono">
                        {profile.father_phone || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-100 space-y-2 text-xs">
                    <div className="font-black text-purple-900 uppercase tracking-wider text-[10px]">
                      Mother's Details
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Full Name</p>
                      <p className="font-extrabold text-slate-900 text-sm">
                        {profile.mother_name || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">
                        Contact Phone
                      </p>
                      <p className="font-bold text-slate-800 font-mono">
                        {profile.mother_phone || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Class Teacher Remarks Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <MessageSquareText className="w-5 h-5 text-indigo-600" /> Class Teacher Monthly Remarks
                </h3>

                <StudentRemarksCard
                  remarks={
                    remarksByStudent[
                      profile.student_db_id
                        ? `student:${profile.student_db_id}`
                        : `user:${profile.id}`
                    ] || []
                  }
                />
              </div>
            </div>
          )}


        </div>
      </div>

      {/* --- EDIT PROFILE & CREDENTIALS MODAL --- */}
      {editProfileModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-profile-title"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3
                id="edit-profile-title"
                className="text-base font-extrabold text-slate-900 flex items-center gap-2"
              >
                <Edit3 className="w-5 h-5 text-indigo-600" /> Edit Profile &
                Account Information
              </h3>
              <button
                onClick={() => setEditProfileModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {profileError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl">
                {profileError}
              </div>
            )}

            <form
              onSubmit={handleSaveProfile}
              className="space-y-4 text-xs font-semibold text-slate-700"
            >
              {/* Account Credentials */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-600" /> Basic Account &
                  Login Credentials
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={form.full_name}
                      onChange={(e) =>
                        handleChange("full_name", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">
                      Email Address / User ID *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">
                      Primary Phone (10 Digits)
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="10-digit number"
                      value={form.phone}
                      onChange={(e) =>
                        handleChange(
                          "phone",
                          e.target.value.replace(/\D/g, "").slice(0, 10),
                        )
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Staff Specific Fields */}
              {isStaffMember && (
                <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100 space-y-3">
                  <h4 className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-600" /> Staff &
                    Institutional Fields
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1">Employee Code</label>
                      <input
                        type="text"
                        value={form.employee_code}
                        onChange={(e) =>
                          handleChange("employee_code", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Designation</label>
                      <input
                        type="text"
                        value={form.designation}
                        onChange={(e) =>
                          handleChange("designation", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Department</label>
                      <input
                        type="text"
                        value={form.department}
                        onChange={(e) =>
                          handleChange("department", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">
                        Highest Qualification
                      </label>
                      <input
                        type="text"
                        value={form.qualification}
                        onChange={(e) =>
                          handleChange("qualification", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Gender</label>
                      <select
                        value={
                          form.gender
                            ? form.gender.charAt(0).toUpperCase() +
                              form.gender.slice(1).toLowerCase()
                            : "Male"
                        }
                        onChange={(e) => handleChange("gender", e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={form.date_of_birth}
                        onChange={(e) =>
                          handleChange("date_of_birth", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Date of Joining</label>
                      <input
                        type="date"
                        value={form.joining_date}
                        onChange={(e) =>
                          handleChange("joining_date", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">
                        Emergency Contact Phone (10 Digits)
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="10-digit emergency contact"
                        value={form.emergency_contact}
                        onChange={(e) =>
                          handleChange(
                            "emergency_contact",
                            e.target.value.replace(/\D/g, "").slice(0, 10),
                          )
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block mb-1">Residential Address</label>
                      <input
                        type="text"
                        value={form.address}
                        onChange={(e) =>
                          handleChange("address", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Student Specific Fields */}
              {isStudent && (
                <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100 space-y-3">
                  <h4 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-emerald-600" />{" "}
                    Student Profile & Guardian Fields
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1">Blood Group</label>
                      <select
                        value={form.blood_group}
                        onChange={(e) =>
                          handleChange("blood_group", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1">Religion</label>
                      <input
                        type="text"
                        placeholder="e.g. Hindu / Christian / Muslim"
                        value={form.religion}
                        onChange={(e) =>
                          handleChange("religion", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Nationality</label>
                      <input
                        type="text"
                        placeholder="e.g. Indian"
                        value={form.nationality}
                        onChange={(e) =>
                          handleChange("nationality", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">City</label>
                      <input
                        type="text"
                        placeholder="City"
                        value={form.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">State</label>
                      <input
                        type="text"
                        placeholder="State"
                        value={form.state}
                        onChange={(e) => handleChange("state", e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Pincode</label>
                      <input
                        type="text"
                        placeholder="Pincode"
                        value={form.pincode}
                        onChange={(e) =>
                          handleChange("pincode", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Father's Name</label>
                      <input
                        type="text"
                        value={form.father_name}
                        onChange={(e) =>
                          handleChange("father_name", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">
                        Father's Contact Phone (10 Digits)
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="10-digit father contact"
                        value={form.father_phone}
                        onChange={(e) =>
                          handleChange(
                            "father_phone",
                            e.target.value.replace(/\D/g, "").slice(0, 10),
                          )
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Father's Occupation</label>
                      <input
                        type="text"
                        placeholder="Occupation"
                        value={form.father_occupation}
                        onChange={(e) =>
                          handleChange("father_occupation", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Mother's Name</label>
                      <input
                        type="text"
                        value={form.mother_name}
                        onChange={(e) =>
                          handleChange("mother_name", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">
                        Mother's Contact Phone (10 Digits)
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="10-digit mother contact"
                        value={form.mother_phone}
                        onChange={(e) =>
                          handleChange(
                            "mother_phone",
                            e.target.value.replace(/\D/g, "").slice(0, 10),
                          )
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Mother's Occupation</label>
                      <input
                        type="text"
                        placeholder="Occupation"
                        value={form.mother_occupation}
                        onChange={(e) =>
                          handleChange("mother_occupation", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block mb-1">Residential Address</label>
                      <input
                        type="text"
                        value={form.address}
                        onChange={(e) =>
                          handleChange("address", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditProfileModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProfile}
                  className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />{" "}
                  {submittingProfile ? "Saving..." : "Save All Profile Updates"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DEDICATED CHANGE PASSWORD MODAL --- */}
      {changePasswordModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="change-password-title"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3
                id="change-password-title"
                className="text-sm font-extrabold text-slate-900 flex items-center gap-2"
              >
                <Key className="w-4 h-4 text-indigo-600" /> Change Security
                Password
              </h3>
              <button
                onClick={() => setChangePasswordModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passwordError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
                {passwordError}
              </div>
            )}

            <form
              onSubmit={handleChangePasswordSubmit}
              className="space-y-3.5 text-xs font-semibold text-slate-700"
            >
              <div>
                <label className="block mb-1">Current Password *</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    required
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500 pr-10"
                  />
                  <button
                    type="button"
                    aria-label="Show password"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-1">New Password *</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    placeholder="At least 8 characters, 1 uppercase letter, 1 special character"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500 pr-10"
                  />
                  <button
                    type="button"
                    aria-label="Show password"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setChangePasswordModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-4 h-4" /> Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileView;
