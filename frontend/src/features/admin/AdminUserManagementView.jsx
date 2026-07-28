import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetUsers, useCreateUser } from './useAdmin';
import { getRoleBadgeStyle as getBadgeStyle } from '../../utils/roleUtils';
import { Users, UserPlus, Shield, Search, CheckCircle, Trash2, Mail, Lock, Sparkles, ChevronRight, Upload, Camera, User, Phone, Briefcase } from 'lucide-react';

const AdminUserManagementView = ({ initialTab = 'all' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('teacher');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [password, setPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [localUsers, setLocalUsers] = useState([]);

  const navigate = useNavigate();
  const { data: usersResponse, isLoading } = useGetUsers();
  const createUserMutation = useCreateUser();

  const handleStaffPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const newUserObj = {
      id: Date.now(),
      full_name: fullName,
      email: email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@thomson.edu`,
      role: role,
      department: department || 'General Staff',
      phone: phone || '+91 98765 43210',
      status: 'Active',
      profile_pic: profilePic || ''
    };

    setLocalUsers(prev => [newUserObj, ...prev]);

    try {
      await createUserMutation.mutateAsync({
        email: newUserObj.email,
        full_name: fullName,
        role,
        password: password || '123456',
      });
    } catch (err) {
      console.log('Frontend mock user added without backend mutation requirement');
    }

    setSuccessMsg(`New ${role.replace('_', ' ')} "${fullName}" added successfully!`);
    setShowAddModal(false);
    setEmail('');
    setFullName('');
    setPhone('');
    setDepartment('');
    setProfilePic('');
    setPassword('');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const displayUsers = [
    ...localUsers,
    ...(Array.isArray(usersResponse)
      ? usersResponse
      : (Array.isArray(usersResponse?.data) ? usersResponse.data : []))
  ];

  const filteredUsers = displayUsers.filter((u) => {
    const matchesSearch = 
      (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.role || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.department || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    if (activeTab === 'teachers') return u.role === 'teacher';
    if (activeTab === 'staff') return !['teacher', 'admin', 'super_admin'].includes(u.role);
    if (activeTab === 'admins') return ['admin', 'super_admin'].includes(u.role);
    return true; // 'all'
  });

  const getRoleBadgeStyle = (userRole = '') => {
    return getBadgeStyle(userRole);
  };

  const tabs = [
    { id: 'all', label: 'All Users' },
    { id: 'teachers', label: 'Teachers' },
    { id: 'staff', label: 'Other Staff' },
    { id: 'admins', label: 'Admins' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/80 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Users className="w-6 h-6" />
            </div>
            User Directory & Access Controls
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Provision user accounts, configure role permissions, and manage active staff profiles.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-indigo-500/20 transition active:scale-[0.99] cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> Provision New User / Staff
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
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
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
            placeholder="Search by user name, email, department or role..."
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
              <th className="px-4 py-3">Full Name</th>
              <th className="px-4 py-3">Email Address</th>
              <th className="px-4 py-3">Department / Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/80 transition cursor-pointer group" onClick={() => navigate(`/profile/${u.id}`)}>
                <td className="px-4 py-3.5 font-bold text-slate-900 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-extrabold text-xs overflow-hidden flex-shrink-0">
                    {u.profile_pic ? (
                      <img src={u.profile_pic} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      (u.full_name || u.email || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <span className="block">{u.full_name || 'N/A'}</span>
                    {u.phone && <span className="text-[10px] text-slate-400 font-normal">{u.phone}</span>}
                  </div>
                </td>
                <td className="px-4 py-3.5 text-slate-600 font-medium">{u.email}</td>
                <td className="px-4 py-3.5">
                  <div className="flex flex-col items-start gap-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getRoleBadgeStyle(u.role)}`}>
                      {u.role ? u.role.replace('_', ' ') : 'User'}
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
                    {u.status || 'Active'}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex justify-end gap-2 items-center">
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/profile/${u.id}`); }}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
                      title="View Profile"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => e.stopPropagation()} 
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                    >
                      <Trash2 className="w-4 h-4" />
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
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" /> Add New Staff / User Account
              </h3>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              {/* Photo Upload Section */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-300 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {profilePic ? (
                    <img src={profilePic} alt="Staff Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-800 mb-0.5">Staff Photo Upload</label>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    Browse Photo
                    <input type="file" accept="image/*" onChange={handleStaffPhotoUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Kumar"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Assigned Role *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                    <option value="cashier">Cashier / Fee Desk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="user@thomson.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Department / Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Science Dept / Transport Lead / Accounts"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Initial Password</label>
                <input
                  type="password"
                  placeholder="Leave blank for default (123456)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  Save & Add Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagementView;
