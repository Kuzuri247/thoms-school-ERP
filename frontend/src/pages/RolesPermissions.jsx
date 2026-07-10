import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckSquare, Square, Save, AlertCircle } from 'lucide-react';
import api from '../api/axios';

const availableModules = [
    { id: 'student_info', label: 'Student Information' },
    { id: 'hr', label: 'Human Resource' },
    { id: 'fees', label: 'Fees Collection' },
    { id: 'academics', label: 'Academics' },
    { id: 'alumni', label: 'Alumni' },
    { id: 'calendar', label: 'Annual Calendar' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'communicate', label: 'Communicate' },
    { id: 'download', label: 'Download Center' },
    { id: 'exam', label: 'Examinations' },
    { id: 'transport', label: 'Transport' },
    { id: 'system', label: 'System Settings' }
];

const roles = [
    { id: 'admin', label: 'Admin' },
    { id: 'teacher', label: 'Teacher' },
    { id: 'student', label: 'Student' },
    { id: 'fee_collector', label: 'Fee Collector' },
    { id: 'bus_staff', label: 'Bus Staff' },
    { id: 'accountant', label: 'Accountant' }
];

const RolesPermissions = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState(roles[0].id);
    const [permissions, setPermissions] = useState({});
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    // Initial default permissions just in case DB is empty
    const defaultPermissions = {
        admin: availableModules.map(m => m.id),
        teacher: ['student_info', 'academics', 'attendance', 'communicate', 'download', 'exam', 'calendar'],
        student: ['calendar', 'download', 'exam'],
        fee_collector: ['fees'],
        bus_staff: ['transport'],
        accountant: ['fees']
    };

    useEffect(() => {
        if (!user || user.role !== 'super_admin') {
            navigate('/unauthorized');
            return;
        }
        fetchPermissions();
    }, [user, navigate]);

    const fetchPermissions = async () => {
        try {
            const response = await api.get('/admin/settings');
            const data = response.data;
            
            let loadedPerms = { ...defaultPermissions };
            if (data.role_permissions) {
                try {
                    const parsed = JSON.parse(data.role_permissions);
                    loadedPerms = { ...loadedPerms, ...parsed };
                } catch (e) {
                    console.error('Failed to parse permissions', e);
                }
            }
            setPermissions(loadedPerms);
        } catch (error) {
            console.error('Failed to fetch permissions', error);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.post('/admin/settings', {
                settings: {
                    role_permissions: JSON.stringify(permissions)
                }
            });
            setNotification({ type: 'success', message: 'Permissions saved successfully! Reload to apply to your view.' });
        } catch (error) {
            setNotification({ type: 'error', message: 'Failed to save permissions.' });
        } finally {
            setLoading(false);
            setTimeout(() => setNotification(null), 3000);
        }
    };

    const togglePermission = (moduleId) => {
        setPermissions(prev => {
            const rolePerms = prev[selectedRole] || [];
            if (rolePerms.includes(moduleId)) {
                return { ...prev, [selectedRole]: rolePerms.filter(id => id !== moduleId) };
            } else {
                return { ...prev, [selectedRole]: [...rolePerms, moduleId] };
            }
        });
    };

    const toggleAll = () => {
        setPermissions(prev => {
            const rolePerms = prev[selectedRole] || [];
            if (rolePerms.length === availableModules.length) {
                return { ...prev, [selectedRole]: [] };
            } else {
                return { ...prev, [selectedRole]: availableModules.map(m => m.id) };
            }
        });
    };

    const currentRolePerms = permissions[selectedRole] || [];
    const allSelected = currentRolePerms.length === availableModules.length;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Roles & Permissions</h1>
                        <p className="text-sm text-slate-500 font-medium">Manage module access levels for different system roles.</p>
                    </div>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70"
                >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Permissions'}
                </button>
            </div>

            {notification && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${notification.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                    {notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckSquare className="w-5 h-5" />}
                    <span className="font-medium text-sm">{notification.message}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Roles Sidebar */}
                <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-fit">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-semibold text-slate-800">Select Role</h3>
                    </div>
                    <div className="p-2 space-y-1">
                        {roles.map(role => (
                            <button
                                key={role.id}
                                onClick={() => setSelectedRole(role.id)}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${selectedRole === role.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                                {role.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Permissions Grid */}
                <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-800">
                            Assign Permissions to <span className="text-indigo-600">{roles.find(r => r.id === selectedRole)?.label}</span>
                        </h3>
                        <button 
                            onClick={toggleAll}
                            className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            {allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                            {allSelected ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>
                    
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {availableModules.map(mod => {
                                const isChecked = currentRolePerms.includes(mod.id);
                                return (
                                    <div 
                                        key={mod.id} 
                                        onClick={() => togglePermission(mod.id)}
                                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${isChecked ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-100 bg-white hover:border-indigo-200'}`}
                                    >
                                        <div className={`flex items-center justify-center w-5 h-5 rounded ${isChecked ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-transparent'}`}>
                                            <CheckSquare className="w-4 h-4" />
                                        </div>
                                        <span className={`font-medium ${isChecked ? 'text-indigo-900' : 'text-slate-700'}`}>
                                            {mod.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RolesPermissions;
