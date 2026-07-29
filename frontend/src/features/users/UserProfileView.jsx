import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetUserProfile } from "./useUsers";
import useAuthStore from "../../store/authStore";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  MapPin,
  Hash,
  Activity,
  Edit3,
  Lock,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  Save,
  X,
  Sparkles,
  GraduationCap,
  Building2,
  Users,
  Award,
  BookOpen,
} from "lucide-react";

const UserProfileView = () => {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const { user: authUser, setUser: setAuthUser } = useAuthStore();
  const id = paramId || authUser?.id;
  const { data: apiProfile, isLoading, error } = useGetUserProfile(id);

  // Local state for editable user profile
  const [profile, setProfile] = useState(null);
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

  // Base Form States
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [newPasswordInline, setNewPasswordInline] = useState("");

  // Staff Extended Form States
  const [editEmployeeCode, setEditEmployeeCode] = useState("");
  const [editDesignation, setEditDesignation] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [editQualification, setEditQualification] = useState("");
  const [editJoiningDate, setEditJoiningDate] = useState("");
  const [editEmergencyContact, setEditEmergencyContact] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editDob, setEditDob] = useState("");
  const [editAddress, setEditAddress] = useState("");

  // Student Extended Form States
  const [editBloodGroup, setEditBloodGroup] = useState("");
  const [editReligion, setEditReligion] = useState("");
  const [editNationality, setEditNationality] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editPincode, setEditPincode] = useState("");
  const [editPreviousSchool, setEditPreviousSchool] = useState("");
  const [editFatherName, setEditFatherName] = useState("");
  const [editFatherPhone, setEditFatherPhone] = useState("");
  const [editFatherOccupation, setEditFatherOccupation] = useState("");
  const [editMotherName, setEditMotherName] = useState("");
  const [editMotherPhone, setEditMotherPhone] = useState("");
  const [editMotherOccupation, setEditMotherOccupation] = useState("");

  // Form states for password change modal
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState("");
  const [profileSuccessMessage, setProfileSuccessMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (apiProfile) {
      setProfile(apiProfile);
      populateFormFields(apiProfile);
    } else if (authUser) {
      const fallback = {
        id: authUser.id || "101",
        full_name: authUser.full_name || authUser.name || "Thomson User",
        email: authUser.email || "user@thomsonschool.edu.in",
        role: authUser.role || "teacher",
        status: "active",
        phone: "+91 98765 43210",
        designation: "Faculty Member",
        department: "Academic Affairs",
        employee_code: "TS-EMP-001",
        profile_type: authUser.role === "student" ? "student" : "staff",
        qualification: "Master of Science",
        joining_date: "2022-04-01",
        gender: "Male",
        address: "14 Heritage Avenue, Civil Lines",
      };
      setProfile(fallback);
      populateFormFields(fallback);
    }
  }, [apiProfile, authUser]);

  const format10Digits = (val) => (val ? String(val).replace(/\D/g, "").slice(0, 10) : "");

  const populateFormFields = (p) => {
    setEditFullName(p.full_name || `${p.first_name || ""} ${p.last_name || ""}`.trim() || "");
    setEditEmail(p.email || "");
    setEditPhone(format10Digits(p.phone));
    setEditEmployeeCode(p.employee_code || "");
    setEditDesignation(p.designation || "");
    setEditDepartment(p.department || "");
    setEditQualification(p.qualification || "");
    setEditJoiningDate(p.joining_date ? p.joining_date.split("T")[0] : "");
    setEditEmergencyContact(format10Digits(p.emergency_contact || p.emergency_phone || p.phone));
    setEditGender(p.gender || "male");
    setEditDob(p.date_of_birth ? p.date_of_birth.split("T")[0] : "");
    setEditAddress(p.address || "");
    setEditBloodGroup(p.blood_group || "");
    setEditReligion(p.religion || "");
    setEditNationality(p.nationality || "Indian");
    setEditCity(p.city || "");
    setEditState(p.state || "");
    setEditPincode(p.pincode || "");
    setEditPreviousSchool(p.previous_school || "");
    setEditFatherName(p.father_name || "");
    setEditFatherPhone(format10Digits(p.father_phone));
    setEditFatherOccupation(p.father_occupation || "");
    setEditMotherName(p.mother_name || "");
    setEditMotherPhone(format10Digits(p.mother_phone));
    setEditMotherOccupation(p.mother_occupation || "");
  };

  if (isLoading && !profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-500">
        <User className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-700">Profile Not Found</h2>
        <p className="text-sm mt-2">The requested user profile does not exist or you lack permission.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-lg text-sm"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isStudent = profile.profile_type === "student" || profile.role === "student";
  const isStaff = !isStudent;

  const getRoleBadgeStyle = (userRole = "") => {
    const norm = userRole.toLowerCase();
    if (norm.includes("super_admin") || norm.includes("admin"))
      return "bg-purple-100 text-purple-700 border-purple-200";
    if (norm.includes("teacher"))
      return "bg-amber-100 text-amber-700 border-amber-200";
    if (norm.includes("student"))
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  // Handle Save Profile updates to backend DB
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    const payload = {
      full_name: editFullName,
      email: editEmail,
      phone: editPhone,
      // Staff fields
      employee_code: editEmployeeCode,
      designation: editDesignation,
      department: editDepartment,
      qualification: editQualification,
      joining_date: editJoiningDate || undefined,
      emergency_contact: editEmergencyContact,
      gender: editGender,
      date_of_birth: editDob || undefined,
      address: editAddress,
      // Student fields
      blood_group: editBloodGroup,
      religion: editReligion,
      nationality: editNationality,
      city: editCity,
      state: editState,
      pincode: editPincode,
      previous_school: editPreviousSchool,
      father_name: editFatherName,
      father_phone: editFatherPhone,
      father_occupation: editFatherOccupation,
      mother_name: editMotherName,
      mother_phone: editMotherPhone,
      mother_occupation: editMotherOccupation,
    };

    try {
      const { default: api } = await import("../../api/axios");
      await api.put(`/users/${profile.id}/profile`, payload);

      const updated = { ...profile, ...payload };
      setProfile(updated);

      if (authUser && Number(authUser.id) === Number(profile.id)) {
        setAuthUser({ ...authUser, full_name: editFullName, email: editEmail });
      }

      setProfileSuccessMessage("Profile information updated successfully!");
      setTimeout(() => setProfileSuccessMessage(""), 5000);
    } catch (err) {
      console.error("Failed to update profile in backend DB:", err);
      alert(err.response?.data?.message || "Failed to save profile changes.");
    } finally {
      setEditProfileModalOpen(false);
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
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError("New password must contain at least one uppercase letter (A-Z).");
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      setPasswordError("New password must contain at least one special character (e.g. !@#$%).");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    try {
      const { default: api } = await import("../../api/axios");
      const response = await api.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      if (response.data?.success || response.data?.message) {
        setChangePasswordModalOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordSuccessMessage(
          "Password updated and saved into database! Next login will require your new password.",
        );
        setTimeout(() => setPasswordSuccessMessage(""), 5000);
      }
    } catch (err) {
      setPasswordError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to change password. Please verify current password.",
      );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto pb-12">
      {/* Notifications Banners */}
      {profileSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between text-xs font-bold shadow-sm animate-in fade-in">
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
        <div className="p-4 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-2xl flex items-center justify-between text-xs font-bold shadow-sm animate-in fade-in">
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
            className="p-2 bg-white hover:bg-slate-50 rounded-full border border-slate-200 text-slate-500 transition shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              User Profile & Identity Record
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Managing credentials for {profile.full_name || profile.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditProfileModalOpen(true)}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-600" /> Edit Profile
          </button>

          <button
            onClick={() => setChangePasswordModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-xs rounded-xl hover:from-indigo-700 hover:to-violet-700 transition shadow-md shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Key className="w-3.5 h-3.5" /> Change Password
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Basic Info */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3">
              <span
                className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase border ${getRoleBadgeStyle(profile.role)}`}
              >
                {profile.role?.replace("_", " ")}
              </span>
            </div>

            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 border-4 border-white shadow-lg flex items-center justify-center text-3xl font-extrabold text-indigo-700 mt-2 mb-4">
              {(profile.full_name || profile.email).charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {profile.full_name || "N/A"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{profile.email}</p>
            <div className="mt-4 flex gap-2 justify-center">
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold border ${profile.status === "active" || profile.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}
              >
                Status: {profile.status}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">
              Contact & Identity
            </h3>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs text-slate-500 font-medium">Account Email / User ID</p>
                <p className="font-semibold text-slate-800 truncate">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Primary Contact</p>
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
          {isStaff && (
            <div className="space-y-6">
              {/* Professional & Institutional Details */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Briefcase className="w-5 h-5 text-indigo-500" /> Staff & Institutional Profile
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                      Employee Code / ID
                    </p>
                    <p className="font-black text-slate-900 text-sm flex items-center gap-1.5 font-mono">
                      <Hash className="w-4 h-4 text-indigo-600" />
                      {profile.employee_code || `TS-EMP-${String(profile.id).padStart(3, "0")}`}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                      Designation
                    </p>
                    <p className="font-black text-indigo-900 text-sm">
                      {profile.designation || "Faculty Member"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500 font-medium mb-1">Department</p>
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      {profile.department || "Academic Affairs"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500 font-medium mb-1">Highest Qualification</p>
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-slate-400" />
                      {profile.qualification || "Post Graduate Degree"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500 font-medium mb-1">Date of Joining</p>
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {profile.joining_date
                        ? new Date(profile.joining_date).toLocaleDateString()
                        : "01/04/2022"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500 font-medium mb-1">Working Status</p>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {profile.staff_status || profile.status || "Active Service"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Personal Information Card for Staff */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <User className="w-5 h-5 text-teal-600" /> Personal & Emergency Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
                  <div>
                    <p className="text-slate-500 font-medium mb-1">Gender</p>
                    <p className="font-bold text-slate-800 capitalize">
                      {profile.gender || "Male"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500 font-medium mb-1">Date of Birth</p>
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {profile.date_of_birth
                        ? new Date(profile.date_of_birth).toLocaleDateString()
                        : "Not specified"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500 font-medium mb-1">Emergency Contact</p>
                    <p className="font-bold text-slate-800 flex items-center gap-1.5 font-mono">
                      <Phone className="w-4 h-4 text-rose-500" />
                      {profile.emergency_phone || profile.emergency_contact || profile.phone || "Not provided"}
                    </p>
                  </div>

                  <div className="sm:col-span-3">
                    <p className="text-slate-500 font-medium mb-1">Residential Address</p>
                    <p className="font-bold text-slate-800 flex items-start gap-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      {profile.address || "Faculty Quarters, Thomson Campus"}
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
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-indigo-600" /> Academic & Enrollment Details
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
                      {profile.admission_no || `TS-2026-${String(profile.id).padStart(3, "0")}`}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                      Roll Number
                    </p>
                    <p className="font-black text-slate-900 text-sm font-mono">
                      {profile.roll_no || "101"}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                      Academic Class / Standard
                    </p>
                    <p className="font-black text-indigo-900 text-sm">
                      {profile.class_name || profile.class || "Class 10"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500 font-medium mb-1">Date of Admission</p>
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {profile.admission_date
                        ? new Date(profile.admission_date).toLocaleDateString()
                        : "01/04/2026"}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-slate-500 font-medium mb-1">Previous School Attended</p>
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      {profile.previous_school || "St. Xavier Convent High School"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal & Residential Details Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <User className="w-5 h-5 text-emerald-600" /> Personal Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
                  <div>
                    <p className="text-slate-500 font-medium mb-1">Gender</p>
                    <p className="font-bold text-slate-800 capitalize">
                      {profile.gender || "Male"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500 font-medium mb-1">Date of Birth</p>
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {profile.date_of_birth
                        ? new Date(profile.date_of_birth).toLocaleDateString()
                        : "15/08/2010"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500 font-medium mb-1">Blood Group</p>
                    <p className="font-extrabold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full inline-block border border-rose-100">
                      {profile.blood_group || "O+"}
                    </p>
                  </div>

                  <div className="sm:col-span-3">
                    <p className="text-slate-500 font-medium mb-1">Residential Address</p>
                    <p className="font-bold text-slate-800 flex items-start gap-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      {profile.address || "14/B Heritage Park, MG Road, New Delhi"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Parents & Guardian Information Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Users className="w-5 h-5 text-purple-600" /> Parents & Guardian Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 space-y-2 text-xs">
                    <div className="font-black text-indigo-900 uppercase tracking-wider text-[10px]">
                      Father's Details
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Full Name</p>
                      <p className="font-extrabold text-slate-900 text-sm">
                        {profile.father_name || "Vikram Sharma"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Contact Phone</p>
                      <p className="font-bold text-slate-800 font-mono">
                        {profile.father_phone || "+91 98111 22334"}
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
                        {profile.mother_name || "Priyanka Sharma"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Contact Phone</p>
                      <p className="font-bold text-slate-800 font-mono">
                        {profile.mother_phone || "+91 98111 22335"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- EDIT PROFILE & CREDENTIALS MODAL --- */}
      {editProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600" /> Edit Profile & Account Information
              </h3>
              <button
                onClick={() => setEditProfileModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-semibold text-slate-700">
              {/* Account Credentials */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-600" /> Basic Account & Login Credentials
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Email Address / User ID *</label>
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Primary Phone (10 Digits)</label>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="10-digit number"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Staff Specific Fields */}
              {isStaff && (
                <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100 space-y-3">
                  <h4 className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-600" /> Staff & Institutional Fields
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1">Employee Code</label>
                      <input
                        type="text"
                        value={editEmployeeCode}
                        onChange={(e) => setEditEmployeeCode(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Designation</label>
                      <input
                        type="text"
                        value={editDesignation}
                        onChange={(e) => setEditDesignation(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Department</label>
                      <input
                        type="text"
                        value={editDepartment}
                        onChange={(e) => setEditDepartment(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Highest Qualification</label>
                      <input
                        type="text"
                        value={editQualification}
                        onChange={(e) => setEditQualification(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Emergency Contact Phone (10 Digits)</label>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="10-digit emergency contact"
                        value={editEmergencyContact}
                        onChange={(e) => setEditEmergencyContact(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Residential Address</label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
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
                    <GraduationCap className="w-4 h-4 text-emerald-600" /> Student Profile & Guardian Fields
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1">Blood Group</label>
                      <select
                        value={editBloodGroup}
                        onChange={(e) => setEditBloodGroup(e.target.value)}
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
                      <label className="block mb-1">Father's Name</label>
                      <input
                        type="text"
                        value={editFatherName}
                        onChange={(e) => setEditFatherName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Father's Contact Phone (10 Digits)</label>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="10-digit father contact"
                        value={editFatherPhone}
                        onChange={(e) => setEditFatherPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Mother's Name</label>
                      <input
                        type="text"
                        value={editMotherName}
                        onChange={(e) => setEditMotherName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Mother's Contact Phone (10 Digits)</label>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="10-digit mother contact"
                        value={editMotherPhone}
                        onChange={(e) => setEditMotherPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block mb-1">Residential Address</label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
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
                  className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save All Profile Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DEDICATED CHANGE PASSWORD MODAL --- */}
      {changePasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-600" /> Change Security Password
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

            <form onSubmit={handleChangePasswordSubmit} className="space-y-3.5 text-xs font-semibold text-slate-700">
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
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-1">New Password *</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
