import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Settings as SettingsIcon, Save, ArrowLeft, Mail } from 'lucide-react';
import api from '../api/axios';

const Settings = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [settings, setSettings] = useState({
        smtp_host: '',
        smtp_port: '',
        smtp_user: '',
        smtp_pass: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user || user.role !== 'super_admin') {
            navigate('/');
            return;
        }
        fetchSettings();
    }, [user, navigate]);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/admin/settings');
            if (Object.keys(response.data).length > 0) {
                setSettings(prev => ({ ...prev, ...response.data }));
            }
        } catch (err) {
            console.error('Failed to fetch settings', err);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        
        try {
            await api.post('/admin/settings', { settings });
            setMessage('Settings saved successfully!');
        } catch (err) {
            setError('Failed to save settings.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Mail className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">SMTP Configuration</h2>
                    <p className="text-sm text-slate-500">Configure email server settings for sending password reset emails.</p>
                </div>
            </div>
            
            <div className="p-6">
                {message && (
                    <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-medium">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">SMTP Host</label>
                            <input 
                                type="text" 
                                value={settings.smtp_host} 
                                onChange={e => setSettings({...settings, smtp_host: e.target.value})} 
                                className="block w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                placeholder="smtp.gmail.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">SMTP Port</label>
                            <input 
                                type="number" 
                                value={settings.smtp_port} 
                                onChange={e => setSettings({...settings, smtp_port: e.target.value})} 
                                className="block w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                placeholder="587"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">SMTP Username</label>
                            <input 
                                type="text" 
                                value={settings.smtp_user} 
                                onChange={e => setSettings({...settings, smtp_user: e.target.value})} 
                                className="block w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                placeholder="youremail@gmail.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">SMTP Password / App Password</label>
                            <input 
                                type="password" 
                                value={settings.smtp_pass} 
                                onChange={e => setSettings({...settings, smtp_pass: e.target.value})} 
                                className="block w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                placeholder="••••••••••••"
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="flex items-center gap-2 py-2.5 px-6 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
