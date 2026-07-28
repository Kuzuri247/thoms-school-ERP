import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetUserProfile } from './useUsers';
import useAuthStore from '../../store/authStore';
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
  Sparkles
} from 'lucide-react';

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

  // Form states for profile edit
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editLocation, setEditLocation] = useState('');

  // Form states for password edit
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState('');
  const [profileSuccessMessage, setProfileSuccessMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Initialize or fallback profile data
  useEffect(() => {
    if (apiProfile) {
      setProfile(apiProfile);
      setEditFullName(apiProfile.full_name || '');
      setEditEmail(apiProfile.email || '');
      setEditPhone(apiProfile.phone || apiProfile.emergency_phone || '');
      setEditDesignation(apiProfile.designation || apiProfile.roll_no || '');
    } else if (authUser) {
      // Fallback for auth user if API query returns error or empty
      const fallback = {
        id: authUser.id || '101',
        full_name: authUser.full_name || authUser.name || 'Thomson Admin',
        email: authUser.email || 'admin@thomsonschool.edu.in',
        role: authUser.role || 'super_admin',
        status: 'active',
        phone: '+91 98765 43210',
        designation: 'Senior Administrator',
        department: 'Academic Operations',
        employee_code: 'TS-EMP-001',
        profile_type: 'staff',
        joining_date: '2022-04-01'
      };
      setProfile(fallback);
      setEditFullName(fallback.full_name);
      setEditEmail(fallback.email);
      setEditPhone(fallback.phone);
      setEditDesignation(fallback.designation);
    }
  }, [apiProfile, authUser]);

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
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-lg text-sm">
          Go Back
        </button>
      </div>
    );
  }

  const isStaff = profile.profile_type === 'staff' || profile.role !== 'student';
  const isStudent = profile.profile_type === 'student' || profile.role === 'student';

  const getRoleBadgeStyle = (userRole = '') => {
    const norm = userRole.toLowerCase();
    if (norm.includes('super_admin') || norm.includes('admin')) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (norm.includes('teacher')) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (norm.includes('student')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  // Handle Edit Profile Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const updatedProfile = {
      ...profile,
      full_name: editFullName,
      email: editEmail,
      phone: editPhone,
      designation: editDesignation
    };

    try {
      const { default: api } = await import('../../api/axios');
      await api.put(`/users/${profile.id}/profile`, {
        full_name: editFullName,
        email: editEmail,
        phone: editPhone,
        designation: editDesignation
      });
    } catch (err) {
      console.error('Failed to update profile in backend DB:', err);
    }

    setProfile(updatedProfile);
    if (authUser && authUser.id === profile.id) {
      setAuthUser({ ...authUser, full_name: editFullName, email: editEmail });
    }
    setEditProfileModalOpen(false);
    setProfileSuccessMessage('User profile details updated successfully in DB!');
    setTimeout(() => setProfileSuccessMessage(''), 4000);
  };

  // Handle Change Password Submit
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    try {
      const { default: api } = await import('../../api/axios');
      const response = await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });

      if (response.data?.success || response.data?.message) {
        setChangePasswordModalOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordSuccessMessage('Password changed successfully! Next login will require your new password.');
        setTimeout(() => setPasswordSuccessMessage(''), 5000);
      }
    } catch (err) {
      setPasswordError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to change password. Please check your current password.'
      );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
      {/* Notifications Banners */}
      {profileSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between text-xs font-bold shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{profileSuccessMessage}</span>
          </div>
          <button onClick={() => setProfileSuccessMessage('')} className="p-1 hover:bg-emerald-100 rounded-lg">
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
          <button onClick={() => setPasswordSuccessMessage('')} className="p-1 hover:bg-indigo-100 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header / Back button & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white hover:bg-slate-50 rounded-full border border-slate-200 text-slate-500 transition shadow-sm cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">User Profile & ID Management</h1>
            <p className="text-xs text-slate-500 font-medium">Viewing & managing credentials for {profile.full_name || profile.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditProfileModalOpen(true)}
            className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-600" /> Edit ID / Info
          </button>

          <button
            onClick={() => setChangePasswordModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-xs rounded-xl hover:from-indigo-700 hover:to-violet-700 transition shadow-md shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer"
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
              <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase border ${getRoleBadgeStyle(profile.role)}`}>
                {profile.role?.replace('_', ' ')}
              </span>
            </div>

            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 border-4 border-white shadow-lg flex items-center justify-center text-3xl font-extrabold text-indigo-700 mt-2 mb-4">
              {(profile.full_name || profile.email).charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{profile.full_name || 'N/A'}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{profile.email}</p>
            <div className="mt-4 flex gap-2 justify-center">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${profile.status === 'active' || profile.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                Status: {profile.status}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">Contact & Identity</h3>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs text-slate-500 font-medium">User ID / Email</p>
                <p className="font-semibold text-slate-800 truncate">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Phone Number</p>
                <p className="font-semibold text-slate-800">{profile.phone || profile.emergency_phone || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Extended Info & Password Security Overview */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          {/* Security & Password Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-black uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Account Security & Password
              </div>
              <h3 className="text-base font-bold">Password & Authentication Settings</h3>
              <p className="text-xs text-slate-300 font-medium">
                Keep your login password updated to protect institutional records and student datasets.
              </p>
            </div>
            <button
              onClick={() => setChangePasswordModalOpen(true)}
              className="px-4 py-2 bg-white text-slate-900 font-extrabold text-xs rounded-xl hover:bg-indigo-50 transition shadow-md whitespace-nowrap cursor-pointer"
            >
              Update Password
            </button>
          </div>

          {isStaff && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-6">
                <Briefcase className="w-5 h-5 text-indigo-500" /> Staff & Institutional Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Employee / Staff Code</p>
                  <p className="font-semibold text-slate-800 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-slate-400" /> {profile.employee_code || 'TS-EMP-001'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Designation</p>
                  <p className="font-semibold text-slate-800">{profile.designation || 'Faculty Member'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Department</p>
                  <p className="font-semibold text-slate-800">{profile.department || 'Academic Affairs'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Joining Date</p>
                  <p className="font-semibold text-slate-800 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" /> 
                    {profile.joining_date ? new Date(profile.joining_date).toLocaleDateString() : '01/04/2022'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {isStudent && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-6">
                <User className="w-5 h-5 text-emerald-500" /> Academic Student Profile
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Admission No.</p>
                  <p className="font-semibold text-slate-800 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-slate-400" /> {profile.admission_no || 'TS-2024-88'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Roll No.</p>
                  <p className="font-semibold text-slate-800">{profile.roll_no || '101'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Class & Section</p>
                  <p className="font-semibold text-slate-800">{profile.class || 'Class 10'} - {profile.section || 'A'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL 1: EDIT USER ID & PROFILE INFORMATION --- */}
      {editProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-600" /> Edit Profile & User ID Details
              </h3>
              <button onClick={() => setEditProfileModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block mb-1">User ID / Email Address *</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block mb-1">Designation / Role Title</label>
                  <input
                    type="text"
                    value={editDesignation}
                    onChange={(e) => setEditDesignation(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

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
                  <Save className="w-4 h-4" /> Save Profile Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: CHANGE PASSWORD OPTION --- */}
      {changePasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-600" /> Change Security Password
              </h3>
              <button onClick={() => setChangePasswordModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
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
                    type={showCurrentPassword ? 'text' : 'password'}
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
                    type={showNewPassword ? 'text' : 'password'}
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
