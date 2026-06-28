import React, { useState } from 'react';
import { FileSpreadsheet, Search, Edit2, Trash2, X, Plus, CheckCircle } from 'lucide-react';

const months = ['apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar'];
const monthLabels = ['April', 'May', 'June', 'July', 'August', 'Sept', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'March'];

// Initial structured data for demonstration
const initialFeeStructure = {
    'Class 1': [
        { id: 1, type: 'Tuition Fee', apr: 1500, may: 1500, jun: 1500, jul: 1500, aug: 1500, sep: 1500, oct: 1500, nov: 1500, dec: 1500, jan: 1500, feb: 1500, mar: 1500 },
        { id: 2, type: 'Computer Fee', apr: 300, may: 300, jun: 300, jul: 300, aug: 300, sep: 300, oct: 300, nov: 300, dec: 300, jan: 300, feb: 300, mar: 300 },
        { id: 3, type: 'Annual Charges', apr: 5000, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0, jan: 0, feb: 0, mar: 0 },
    ],
    'Class 10': [
        { id: 4, type: 'Tuition Fee', apr: 2500, may: 2500, jun: 2500, jul: 2500, aug: 2500, sep: 2500, oct: 2500, nov: 2500, dec: 2500, jan: 2500, feb: 2500, mar: 2500 },
        { id: 5, type: 'Computer Fee', apr: 500, may: 500, jun: 500, jul: 500, aug: 500, sep: 500, oct: 500, nov: 500, dec: 500, jan: 500, feb: 500, mar: 500 },
        { id: 6, type: 'Lab Fee', apr: 800, may: 800, jun: 800, jul: 800, aug: 800, sep: 800, oct: 800, nov: 800, dec: 800, jan: 800, feb: 800, mar: 800 },
        { id: 7, type: 'Annual Charges', apr: 8000, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0, jan: 0, feb: 0, mar: 0 },
    ]
};

const emptyFormData = {
    type: '', apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0, jan: 0, feb: 0, mar: 0
};

const FeeSheet = () => {
    const [database, setDatabase] = useState(initialFeeStructure);
    const [selectedClass, setSelectedClass] = useState('');
    const [feeData, setFeeData] = useState(null);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFee, setEditingFee] = useState(null);
    const [formData, setFormData] = useState(emptyFormData);
    const [notification, setNotification] = useState(null);

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        if (selectedClass) {
            setFeeData(database[selectedClass] || []);
        }
    };

    const handleOpenModal = (fee = null) => {
        if (fee) {
            setEditingFee(fee);
            setFormData(fee);
        } else {
            setEditingFee(null);
            setFormData({ ...emptyFormData, id: Date.now() });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingFee(null);
    };

    const handleSave = (e) => {
        e.preventDefault();
        const currentData = database[selectedClass] || [];
        
        let newData;
        if (editingFee) {
            newData = currentData.map(f => f.id === editingFee.id ? formData : f);
            setNotification('Fee structure updated successfully!');
        } else {
            newData = [...currentData, formData];
            setNotification('New fee structure added!');
        }

        const newDatabase = { ...database, [selectedClass]: newData };
        setDatabase(newDatabase);
        setFeeData(newData); // update view
        handleCloseModal();
        setTimeout(() => setNotification(null), 3000);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this fee row?')) {
            const currentData = database[selectedClass] || [];
            const newData = currentData.filter(f => f.id !== id);
            
            const newDatabase = { ...database, [selectedClass]: newData };
            setDatabase(newDatabase);
            setFeeData(newData); // update view
            setNotification('Fee row deleted.');
            setTimeout(() => setNotification(null), 3000);
        }
    };

    const calculateTotal = (row) => {
        return months.reduce((sum, month) => sum + (Number(row[month]) || 0), 0);
    };

    const getMonthColor = (idx) => {
        // Assign a distinct very light gradient to quarters
        if (idx < 3) return 'bg-rose-50/40 text-rose-700'; // Q1
        if (idx < 6) return 'bg-amber-50/40 text-amber-700'; // Q2
        if (idx < 9) return 'bg-emerald-50/40 text-emerald-700'; // Q3
        return 'bg-sky-50/40 text-sky-700'; // Q4
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white text-indigo-600 rounded-2xl shadow-sm">
                        <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700 tracking-tight">Class Fee Sheet</h1>
                        <p className="text-sm text-indigo-600/80 font-medium mt-1">Configure and manage detailed fee structures from April to March.</p>
                    </div>
                </div>
            </div>

            {notification && (
                <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium text-sm">{notification}</span>
                </div>
            )}

            {/* Filter Section */}
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 p-5">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 w-full relative">
                        <label className="block text-sm font-bold text-slate-700 mb-2 tracking-wide uppercase text-[11px]">Select Academic Class</label>
                        <select 
                            required
                            value={selectedClass}
                            onChange={(e) => {
                                setSelectedClass(e.target.value);
                                setFeeData(null); // Clear data when class changes until search
                            }}
                            className="block w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-inner"
                        >
                            <option value="">-- Choose Class --</option>
                            {[...Array(12)].map((_, i) => (
                                <option key={i} value={`Class ${i + 1}`}>Class {i + 1}</option>
                            ))}
                        </select>
                    </div>
                    <button 
                        type="submit" 
                        className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5"
                    >
                        <Search className="w-4 h-4" /> Load Fee Matrix
                    </button>
                </form>
            </div>

            {/* Fee Table */}
            {feeData && (
                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <h2 className="font-extrabold text-slate-800 text-xl tracking-tight">Fee Matrix: {selectedClass}</h2>
                            <span className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 rounded-full text-xs font-bold ring-1 ring-emerald-500/20 shadow-sm">Academic Year</span>
                        </div>
                        <button 
                            onClick={() => handleOpenModal()}
                            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" /> Add Fee Component
                        </button>
                    </div>
                    
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[1200px]">
                            <thead>
                                <tr className="border-b-2 border-slate-200">
                                    <th className="py-4 px-5 text-xs font-black text-slate-700 uppercase tracking-widest sticky left-0 bg-white z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[160px]">
                                        Fee Component
                                    </th>
                                    {monthLabels.map((month, idx) => (
                                        <th key={month} className={`py-4 px-4 text-xs font-extrabold uppercase tracking-widest text-center ${getMonthColor(idx)} border-r border-white/50`}>
                                            {month}
                                        </th>
                                    ))}
                                    <th className="py-4 px-5 text-xs font-black text-white uppercase tracking-widest text-right bg-slate-900 shadow-inner">
                                        Total
                                    </th>
                                    <th className="py-4 px-5 text-xs font-black text-slate-500 uppercase tracking-widest text-center bg-slate-50 border-l border-slate-200">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {feeData.map((row, idx) => (
                                    <tr key={row.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 px-5 text-sm font-black text-slate-800 sticky left-0 bg-white group-hover:bg-slate-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] z-10 transition-colors">
                                            {row.type}
                                        </td>
                                        {months.map((month, mIdx) => (
                                            <td key={month} className={`py-4 px-4 text-sm font-bold text-center ${row[month] > 0 ? getMonthColor(mIdx) : 'text-slate-300 bg-slate-50/30'}`}>
                                                {row[month] > 0 ? `₹${row[month]}` : '-'}
                                            </td>
                                        ))}
                                        <td className="py-4 px-5 text-sm font-black text-white text-right bg-slate-800 group-hover:bg-slate-900 transition-colors">
                                            ₹{calculateTotal(row)}
                                        </td>
                                        <td className="py-4 px-5 text-center bg-slate-50 border-l border-slate-100">
                                            <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleOpenModal(row)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(row.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {/* Grand Total Row */}
                                {feeData.length > 0 ? (
                                    <tr className="border-t-4 border-slate-900">
                                        <td className="py-5 px-5 text-base font-black text-slate-900 sticky left-0 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] z-10 uppercase tracking-widest">
                                            Grand Total
                                        </td>
                                        {months.map((month, mIdx) => {
                                            const monthTotal = feeData.reduce((sum, row) => sum + (Number(row[month]) || 0), 0);
                                            return (
                                                <td key={month} className={`py-5 px-4 text-sm font-black text-center ${monthTotal > 0 ? 'text-slate-900 bg-slate-100/80' : 'text-slate-400 bg-slate-50'}`}>
                                                    {monthTotal > 0 ? `₹${monthTotal}` : '-'}
                                                </td>
                                            );
                                        })}
                                        <td className="py-5 px-5 text-lg font-black text-emerald-400 text-right bg-slate-900">
                                            ₹{feeData.reduce((sum, row) => sum + calculateTotal(row), 0)}
                                        </td>
                                        <td className="bg-slate-50 border-l border-slate-200"></td>
                                    </tr>
                                ) : (
                                    <tr>
                                        <td colSpan={15} className="py-12 text-center">
                                            <p className="text-slate-500 font-medium">No fee components configured for this class.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal for Edit / Add */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-extrabold text-slate-800 text-xl tracking-tight">
                                {editingFee ? 'Edit Fee Component' : 'Add Fee Component'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-xl transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <form onSubmit={handleSave} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Fee Component Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.type}
                                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                                        className="block w-full px-5 py-3 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-slate-50 focus:bg-white transition-all shadow-inner"
                                        placeholder="e.g. Tuition Fee, Exam Fee, Transport..."
                                    />
                                </div>

                                <div>
                                    <h4 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide border-b border-slate-200 pb-2">Monthly Amounts (₹)</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                        {months.map((month, idx) => (
                                            <div key={month}>
                                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">{monthLabels[idx]}</label>
                                                <input 
                                                    type="number" 
                                                    min="0"
                                                    value={formData[month]}
                                                    onChange={(e) => setFormData({...formData, [month]: Number(e.target.value) || 0})}
                                                    className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-indigo-50/30 focus:bg-white transition-all text-center"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                                    <button 
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-6 py-3 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5 transition-all"
                                    >
                                        {editingFee ? 'Save Changes' : 'Create Component'}
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

export default FeeSheet;
