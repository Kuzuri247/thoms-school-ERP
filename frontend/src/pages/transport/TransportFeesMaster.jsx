import React, { useState } from 'react';
import { Bus, Plus, Trash2, Edit2, Search, X, CheckCircle, AlertCircle } from 'lucide-react';

const initialFees = [
    { id: 1, type: 'Monthly Route A', amount: 1500, description: 'Standard monthly fee for Route A (up to 5km)', status: 'Active' },
    { id: 2, type: 'Quarterly Route B', amount: 5000, description: 'Quarterly fee for Route B (up to 10km)', status: 'Active' },
    { id: 3, type: 'Annual Bus Pass', amount: 18000, description: 'Full year prepaid transport pass', status: 'Inactive' }
];

const TransportFeesMaster = () => {
    const [fees, setFees] = useState(initialFees);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFee, setEditingFee] = useState(null);
    const [notification, setNotification] = useState(null);

    const [formData, setFormData] = useState({
        type: '',
        amount: '',
        description: '',
        status: 'Active'
    });

    const handleOpenModal = (fee = null) => {
        if (fee) {
            setEditingFee(fee);
            setFormData(fee);
        } else {
            setEditingFee(null);
            setFormData({ type: '', amount: '', description: '', status: 'Active' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingFee(null);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (editingFee) {
            setFees(fees.map(f => f.id === editingFee.id ? { ...formData, id: editingFee.id } : f));
            setNotification({ type: 'success', message: 'Transport fee updated successfully!' });
        } else {
            setFees([...fees, { ...formData, id: Date.now() }]);
            setNotification({ type: 'success', message: 'New transport fee created!' });
        }
        handleCloseModal();
        setTimeout(() => setNotification(null), 3000);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this fee structure?')) {
            setFees(fees.filter(f => f.id !== id));
            setNotification({ type: 'success', message: 'Fee structure deleted.' });
            setTimeout(() => setNotification(null), 3000);
        }
    };

    const filteredFees = fees.filter(f => 
        f.type.toLowerCase().includes(searchTerm.toLowerCase()) || 
        f.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Bus className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Transport Fees Master</h1>
                        <p className="text-sm text-slate-500 font-medium">Manage and configure all transportation fee structures.</p>
                    </div>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Add New Fee
                </button>
            </div>

            {notification && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${notification.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                    {notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                    <span className="font-medium text-sm">{notification.message}</span>
                </div>
            )}

            {/* List Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="font-semibold text-slate-800">Fee Structures</h2>
                    <div className="relative w-full sm:w-72">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="w-4 h-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search fees..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fee Type Name</th>
                                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredFees.map(fee => (
                                <tr key={fee.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-4 px-6 text-sm font-bold text-slate-900">{fee.type}</td>
                                    <td className="py-4 px-6 text-sm text-slate-600">{fee.description}</td>
                                    <td className="py-4 px-6 text-sm font-semibold text-slate-900">₹{fee.amount}</td>
                                    <td className="py-4 px-6">
                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${fee.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {fee.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => handleOpenModal(fee)}
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(fee.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
                        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-bold text-slate-800 text-lg">
                                {editingFee ? 'Edit Fee Structure' : 'Create New Fee Structure'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-xl transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Fee Type Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.type}
                                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                                        className="block w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-slate-50 focus:bg-white transition-all"
                                        placeholder="e.g. Monthly Zone A"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount (₹)</label>
                                    <input 
                                        type="number" 
                                        required
                                        value={formData.amount}
                                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                        className="block w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-slate-50 focus:bg-white transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                                    <textarea 
                                        rows="3"
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        className="block w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-slate-50 focus:bg-white transition-all resize-none"
                                        placeholder="Brief description of what this fee covers..."
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                                    <select 
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                                        className="block w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-slate-50 focus:bg-white transition-all"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                                <div className="pt-4">
                                    <button 
                                        type="submit" 
                                        className="w-full py-3.5 px-4 bg-indigo-600 text-white text-sm font-bold rounded-2xl hover:bg-indigo-700 shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2"
                                    >
                                        {editingFee ? 'Save Changes' : 'Create Fee'}
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

export default TransportFeesMaster;
