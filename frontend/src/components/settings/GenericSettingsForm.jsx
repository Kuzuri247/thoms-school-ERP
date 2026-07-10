import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Save } from 'lucide-react';
import api from '../../api/axios';

const GenericSettingsForm = ({ title, description, icon: Icon, schema }) => {
    const { user } = useContext(AuthContext);
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const initialSettings = {};
        schema.forEach(field => {
            initialSettings[field.key] = field.defaultValue || '';
        });
        setSettings(initialSettings);
        fetchSettings();
    }, [schema, user]);

    const fetchSettings = async () => {
        if (!user) return;
        try {
            const response = await api.get('/admin/settings');
            const data = response.data;
            if (Object.keys(data).length > 0) {
                setSettings(prev => ({ ...prev, ...data }));
            }
        } catch (err) {
            console.error(`Failed to fetch settings for ${title}`, err);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        
        try {
            // Only send the keys that are in the schema
            const settingsToSave = {};
            schema.forEach(field => {
                settingsToSave[field.key] = settings[field.key];
            });

            await api.post('/admin/settings', { settings: settingsToSave });
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
                    {Icon && <Icon className="w-5 h-5" />}
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
                    {description && <p className="text-sm text-slate-500">{description}</p>}
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
                        {schema.map((field) => (
                            <div key={field.key} className={field.fullWidth ? 'sm:col-span-2' : ''}>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{field.label}</label>
                                {field.type === 'textarea' ? (
                                    <textarea 
                                        value={settings[field.key] || ''} 
                                        onChange={e => setSettings({...settings, [field.key]: e.target.value})} 
                                        className="block w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                        placeholder={field.placeholder}
                                        required={field.required}
                                        rows={4}
                                    />
                                ) : field.type === 'select' ? (
                                    <select
                                        value={settings[field.key] || ''} 
                                        onChange={e => setSettings({...settings, [field.key]: e.target.value})} 
                                        className="block w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                                        required={field.required}
                                    >
                                        <option value="">Select Option</option>
                                        {field.options && field.options.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                ) : field.type === 'toggle' ? (
                                    <div className="flex items-center mt-2">
                                        <button
                                            type="button"
                                            onClick={() => setSettings({...settings, [field.key]: settings[field.key] === 'true' ? 'false' : 'true'})}
                                            className={`${settings[field.key] === 'true' ? 'bg-indigo-600' : 'bg-slate-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2`}
                                        >
                                            <span aria-hidden="true" className={`${settings[field.key] === 'true' ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
                                        </button>
                                        <span className="ml-3 text-sm font-medium text-slate-700">
                                            {settings[field.key] === 'true' ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </div>
                                ) : (
                                    <input 
                                        type={field.type || 'text'} 
                                        value={settings[field.key] || ''} 
                                        onChange={e => setSettings({...settings, [field.key]: e.target.value})} 
                                        className="block w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                        placeholder={field.placeholder}
                                        required={field.required}
                                    />
                                )}
                            </div>
                        ))}
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

export default GenericSettingsForm;
