import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, CheckCircle, AlertCircle } from 'lucide-react';

const HRGenericSetup = ({ title, description, columns, initialData, data: propData }) => {
    const [data, setData] = useState(initialData || propData || []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [formData, setFormData] = useState({});
    const [notification, setNotification] = useState(null);

    // Reset data if props change (when navigating between different generic pages)
    useEffect(() => {
        setData(initialData || propData || []);
    }, [title, initialData, propData]);

    const handleOpenModal = (index = null) => {
        if (index !== null) {
            setEditingIndex(index);
            const rowData = data[index];
            // Reconstruct formData using column names as keys based on Object.values
            const values = Object.values(rowData);
            let editingData = {};
            columns.forEach((col, i) => {
                editingData[col] = values[i] || '';
            });
            setFormData(editingData);
        } else {
            setEditingIndex(null);
            let emptyData = {};
            columns.forEach(col => {
                emptyData[col] = '';
            });
            setFormData(emptyData);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingIndex(null);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (editingIndex !== null) {
            const newData = [...data];
            newData[editingIndex] = formData;
            setData(newData);
            setNotification({ type: 'success', message: 'Record updated successfully!' });
        } else {
            setData([...data, formData]);
            setNotification({ type: 'success', message: 'New record created!' });
        }
        handleCloseModal();
        setTimeout(() => setNotification(null), 3000);
    };

    const handleDelete = (index) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            const newData = data.filter((_, i) => i !== index);
            setData(newData);
            setNotification({ type: 'success', message: 'Record deleted.' });
            setTimeout(() => setNotification(null), 3000);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-3xl border border-indigo-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700 tracking-tight">{title}</h1>
                    <p className="text-sm text-indigo-600/80 font-medium mt-1">{description}</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5"
                >
                    <Plus className="w-4 h-4" /> Add {title}
                </button>
            </div>

            {notification && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${notification.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                    {notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                    <span className="font-medium text-sm">{notification.message}</span>
                </div>
            )}

            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200/80">
                                {columns.map((col, i) => (
                                    <th key={i} className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                        {col}
                                    </th>
                                ))}
                                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/80">
                            {data.map((row, i) => (
                                <tr key={i} className="hover:bg-indigo-50/30 transition-all duration-200 group">
                                    {Object.values(row).map((val, j) => (
                                        <td key={j} className="py-4 px-6 text-sm font-bold text-slate-700 group-hover:text-indigo-900 transition-colors">
                                            {val}
                                        </td>
                                    ))}
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => handleOpenModal(i)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(i)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan={columns.length + 1} className="py-12 text-center text-sm font-medium text-slate-400">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                                                <Plus className="w-6 h-6" />
                                            </div>
                                            No data available yet.
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Dynamic Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
                        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-bold text-slate-800 text-lg">
                                {editingIndex !== null ? `Edit ${title}` : `Add New ${title}`}
                            </h3>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-xl transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleSave} className="space-y-4">
                                {columns.map((col, idx) => (
                                    <div key={idx}>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">{col}</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={formData[col] || ''}
                                            onChange={(e) => setFormData({...formData, [col]: e.target.value})}
                                            className="block w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-slate-50 focus:bg-white transition-all"
                                            placeholder={`Enter ${col.toLowerCase()}`}
                                        />
                                    </div>
                                ))}
                                <div className="pt-4">
                                    <button 
                                        type="submit" 
                                        className="w-full py-3.5 px-4 bg-indigo-600 text-white text-sm font-bold rounded-2xl hover:bg-indigo-700 shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5 transition-all flex justify-center items-center"
                                    >
                                        {editingIndex !== null ? 'Save Changes' : `Create ${title}`}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HRGenericSetup;
