import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users as UsersIcon, UserPlus, Trash2, Mail, Lock, Edit2, X, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../api/axios';

const Users = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ email: '', password: '', role: 'admin', class_name: '', section: '' });
    const [loading, setLoading] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        if (user && user.role === 'super_admin') {
            fetchUsers();
        } else if (user) {
            navigate('/unauthorized');
        } else {
            navigate('/');
        }
    }, [user, navigate]);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        let payload = { ...newUser };
        if ((payload.role === 'student' || payload.role === 'teacher') && !payload.password) {
            payload.password = payload.role === 'student' ? 'student123' : 'teacher123';
        }
        try {
            await api.post('/admin/users', payload);
            fetchUsers();
            setNewUser({ email: '', password: '', role: 'admin', class_name: '', section: '' });
            setNotification({ type: 'success', message: 'User created successfully!' });
        } catch (error) {
            setNotification({ type: 'error', message: 'Failed to create user. Email might already exist.' });
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        try {
            await api.delete(`/admin/users/${id}`);
            fetchUsers();
            setDeleteConfirm(null);
            setNotification({ type: 'success', message: 'User deleted successfully!' });
        } catch (error) {
            setNotification({ type: 'error', message: 'Failed to delete user.' });
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        let updatePayload = { role: editUser.role, password: editUser.password || undefined, class_name: editUser.class_name, section: editUser.section };
        if ((editUser.role === 'student' || editUser.role === 'teacher') && !editUser.password) {
            updatePayload.password = editUser.role === 'student' ? 'student123' : 'teacher123';
        }
        try {
            await api.put(`/admin/users/${editUser.id}`, updatePayload);
            fetchUsers();
            setEditUser(null);
            setNotification({ type: 'success', message: 'User updated successfully!' });
        } catch (error) {
            setNotification({ type: 'error', message: 'Failed to update user.' });
        } finally {
            setEditLoading(false);
        }
    };

    const getRoleBadge = (role) => {
        const styles = {
            super_admin: 'bg-red-50 text-red-700 border-red-200',
            admin: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            teacher: 'bg-amber-50 text-amber-700 border-amber-200',
            student: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            fee_collector: 'bg-teal-50 text-teal-700 border-teal-200',
            bus_staff: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            accountant: 'bg-cyan-50 text-cyan-700 border-cyan-200'
        };
        const defaultStyle = 'bg-slate-50 text-slate-700 border-slate-200';
        return `px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[role] || defaultStyle}`;
    };

    if (!user) return null;

    return (
        <>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Add User Section */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <UserPlus className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900">Add New User</h2>
                    </div>
                    
                    <form onSubmit={handleCreateUser} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                </div>
                                <input 
                                    type="email" 
                                    value={newUser.email} 
                                    onChange={e => setNewUser({...newUser, email: e.target.value})} 
                                    required 
                                    className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                    placeholder="user@school.com"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="w-4 h-4 text-slate-400" />
                                </div>
                                <input 
                                    type="password" 
                                    value={newUser.password} 
                                    onChange={e => setNewUser({...newUser, password: e.target.value})} 
                                    required={newUser.role !== 'student' && newUser.role !== 'teacher'} 
                                    className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                    placeholder={(newUser.role === 'student' || newUser.role === 'teacher') ? `Auto-generated (${newUser.role}123)` : '••••••••'}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                            <select 
                                value={newUser.role} 
                                onChange={e => setNewUser({...newUser, role: e.target.value})}
                                className="block w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                            >
                                <option value="admin">Admin</option>
                                <option value="teacher">Teacher</option>
                                <option value="student">Student</option>
                                <option value="fee_collector">Fee Collector</option>
                                <option value="bus_staff">Bus Staff</option>
                                <option value="accountant">Accountant</option>
                                <option value="super_admin">Super Admin</option>
                            </select>
                        </div>
                        {newUser.role === 'student' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                                    <input 
                                        type="text" 
                                        value={newUser.class_name} 
                                        onChange={e => setNewUser({...newUser, class_name: e.target.value})} 
                                        className="block w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="e.g. 10th"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Section</label>
                                    <input 
                                        type="text" 
                                        value={newUser.section} 
                                        onChange={e => setNewUser({...newUser, section: e.target.value})} 
                                        className="block w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="e.g. A"
                                    />
                                </div>
                            </div>
                        )}
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full mt-2 py-2.5 px-4 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70 flex justify-center items-center"
                        >
                            {loading ? 'Creating...' : 'Create User'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Manage Users Section */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-50 text-slate-600 rounded-lg">
                                <UsersIcon className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-semibold text-slate-900">System Users</h2>
                        </div>
                        <div className="text-sm text-slate-500 font-medium">
                            Total: {users.length}
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                                                    {u.email.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-slate-900">{u.email}</div>
                                                    <div className="text-xs text-slate-500">
                                                        ID: {u.id} {u.role === 'student' && u.class_name ? `• ${u.class_name}-${u.section || ''}` : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={getRoleBadge(u.role)}>
                                                {u.role.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            {user.id !== u.id && (
                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        onClick={() => setEditUser({ id: u.id, email: u.email, role: u.role, password: '' })}
                                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        title="Edit User"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => setDeleteConfirm(u.id)} 
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="py-8 text-center text-sm text-slate-500">
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>

            {/* Edit User Modal */}
            {editUser && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-bold text-slate-800">Edit User ({editUser.email})</h3>
                            <button onClick={() => setEditUser(null)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleUpdateUser} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                    <select 
                                        value={editUser.role} 
                                        onChange={e => setEditUser({...editUser, role: e.target.value})}
                                        className="block w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-slate-50 focus:bg-white"
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="teacher">Teacher</option>
                                        <option value="student">Student</option>
                                        <option value="fee_collector">Fee Collector</option>
                                        <option value="bus_staff">Bus Staff</option>
                                        <option value="accountant">Accountant</option>
                                        <option value="super_admin">Super Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">New Password (Optional)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <input 
                                            type="password" 
                                            value={editUser.password} 
                                            onChange={e => setEditUser({...editUser, password: e.target.value})} 
                                            className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-slate-50 focus:bg-white"
                                            placeholder={(editUser.role === 'student' || editUser.role === 'teacher') ? `Leave blank to set to "${editUser.role}123"` : 'Leave blank to keep current'}
                                        />
                                    </div>
                                    {editUser.role === 'student' && (
                                        <div className="grid grid-cols-2 gap-4 mb-4 mt-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Class</label>
                                                <input 
                                                    type="text" 
                                                    value={editUser.class_name || ''} 
                                                    onChange={e => setEditUser({...editUser, class_name: e.target.value})} 
                                                    className="block w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-slate-50 focus:bg-white"
                                                    placeholder="e.g. 10th"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Section</label>
                                                <input 
                                                    type="text" 
                                                    value={editUser.section || ''} 
                                                    onChange={e => setEditUser({...editUser, section: e.target.value})} 
                                                    className="block w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-slate-50 focus:bg-white"
                                                    placeholder="e.g. A"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <div className="mb-6">
                                        <p className="text-xs text-slate-400 mt-1.5">If you set a new password, it will override the existing one.</p>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <button 
                                        type="submit" 
                                        disabled={editLoading}
                                        className="w-full py-3.5 px-4 bg-indigo-600 text-white text-sm font-bold rounded-2xl hover:bg-indigo-700 shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5 transition-all disabled:opacity-70 flex justify-center items-center"
                                    >
                                        {editLoading ? 'Updating...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Modal */}
            {notification && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col p-6 items-center text-center">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${notification.type === 'error' ? 'bg-red-100 text-red-500' : 'bg-emerald-100 text-emerald-500'}`}>
                            {notification.type === 'error' ? <AlertTriangle className="w-8 h-8" /> : <CheckCircle className="w-8 h-8" />}
                        </div>
                        <h3 className="font-bold text-xl text-slate-800 mb-2">
                            {notification.type === 'error' ? 'Oops! Action Failed' : 'Success!'}
                        </h3>
                        <p className="text-slate-500 font-medium mb-8">{notification.message}</p>
                        <button 
                            onClick={() => setNotification(null)} 
                            className={`w-full py-3.5 px-4 text-white text-sm font-bold rounded-2xl transition-all shadow-sm ${notification.type === 'error' ? 'bg-red-500 hover:bg-red-600 shadow-[0_4px_14px_0_rgba(239,68,68,0.39)]' : 'bg-emerald-500 hover:bg-emerald-600 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)]'}`}
                        >
                            {notification.type === 'error' ? 'Try Again' : 'Awesome'}
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col p-6 items-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-500 flex items-center justify-center mb-4">
                            <Trash2 className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-xl text-slate-800 mb-2">Delete User?</h3>
                        <p className="text-slate-500 font-medium mb-8">This action cannot be undone. Are you absolutely sure you want to proceed?</p>
                        <div className="flex gap-3 w-full">
                            <button 
                                onClick={() => setDeleteConfirm(null)} 
                                className="flex-1 bg-slate-100 text-slate-600 font-bold py-3.5 rounded-2xl hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => handleDeleteUser(deleteConfirm)} 
                                className="flex-1 bg-red-500 text-white font-bold py-3.5 rounded-2xl hover:bg-red-600 shadow-[0_4px_14px_0_rgba(239,68,68,0.39)] hover:-translate-y-0.5 transition-all"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Users;
