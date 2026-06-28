import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Users, UserPlus, Trash2, Mail, Lock, ShieldAlert, Settings as SettingsIcon } from 'lucide-react';

const SuperAdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ email: '', password: '', role: 'admin' });
    const [loading, setLoading] = useState(false);

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
            const response = await fetch('http://localhost:5000/api/admin/users', {
                headers: { 'Authorization': `Bearer ${user.accessToken}` }
            });
            const data = await response.json();
            if (response.ok) {
                setUsers(data);
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/admin/users', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.accessToken}`
                },
                body: JSON.stringify(newUser)
            });
            
            if (response.ok) {
                fetchUsers();
                setNewUser({ email: '', password: '', role: 'admin' });
            } else {
                alert('Failed to create user');
            }
        } catch (error) {
            console.error('Failed to create user', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            const response = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${user.accessToken}` }
            });
            
            if (response.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error('Failed to delete user', error);
        }
    };

    const getRoleBadge = (role) => {
        const styles = {
            super_admin: 'bg-red-50 text-red-700 border-red-200',
            admin: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            teacher: 'bg-amber-50 text-amber-700 border-amber-200',
            student: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
        const defaultStyle = 'bg-slate-50 text-slate-700 border-slate-200';
        return `px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[role] || defaultStyle}`;
    };

    if (!user) return null;

    return (
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
                                            required 
                                            className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                            placeholder="••••••••"
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
                                        <option value="super_admin">Super Admin</option>
                                    </select>
                                </div>
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
                                        <Users className="w-5 h-5" />
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
                                                            <div className="text-xs text-slate-500">ID: {u.id}</div>
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
                                                        <button 
                                                            onClick={() => handleDeleteUser(u.id)} 
                                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete User"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
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
            </main>
        </div>
    );
};

export default SuperAdminDashboard;
