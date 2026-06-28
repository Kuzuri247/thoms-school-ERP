import React, { useState } from 'react';
import { Search, Plus, Car, Edit2, Trash2, X, CheckCircle, AlertCircle } from 'lucide-react';

const initialVehicles = [
    { id: 'VH001', number: 'DL-01-AB-1234', model: 'Tata Marcopolo', capacity: 45, driver: 'John Smith', mobile: '9876543210', status: 'Active' },
    { id: 'VH002', number: 'DL-01-XY-5678', model: 'Ashok Leyland', capacity: 50, driver: 'Robert Doe', mobile: '8765432109', status: 'Maintenance' },
    { id: 'VH003', number: 'DL-01-ZZ-9999', model: 'Force Traveler', capacity: 20, driver: 'Mike Johnson', mobile: '7654321098', status: 'Active' },
];

const Vehicles = () => {
    const [vehicles, setVehicles] = useState(initialVehicles);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [notification, setNotification] = useState(null);

    const [formData, setFormData] = useState({
        number: '',
        model: '',
        capacity: '',
        driver: '',
        mobile: '',
        status: 'Active'
    });

    const handleOpenModal = (vehicle = null) => {
        if (vehicle) {
            setEditingVehicle(vehicle);
            setFormData(vehicle);
        } else {
            setEditingVehicle(null);
            setFormData({ number: '', model: '', capacity: '', driver: '', mobile: '', status: 'Active' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingVehicle(null);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (editingVehicle) {
            setVehicles(vehicles.map(v => v.id === editingVehicle.id ? { ...formData, id: editingVehicle.id } : v));
            setNotification({ type: 'success', message: 'Vehicle updated successfully!' });
        } else {
            setVehicles([...vehicles, { ...formData, id: `VH00${vehicles.length + 1}` }]);
            setNotification({ type: 'success', message: 'New vehicle added!' });
        }
        handleCloseModal();
        setTimeout(() => setNotification(null), 3000);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this vehicle?')) {
            setVehicles(vehicles.filter(v => v.id !== id));
            setNotification({ type: 'success', message: 'Vehicle deleted.' });
            setTimeout(() => setNotification(null), 3000);
        }
    };

    const filteredVehicles = vehicles.filter(v => 
        v.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
        v.driver.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-3xl border border-indigo-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700 tracking-tight">Vehicles</h1>
                    <p className="text-sm text-indigo-600/80 font-medium mt-1">Manage school fleet, vehicle details, and capacities.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5"
                >
                    <Plus className="w-4 h-4" /> Add Vehicle
                </button>
            </div>

            {notification && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${notification.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                    {notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                    <span className="font-medium text-sm">{notification.message}</span>
                </div>
            )}

            <div className="bg-white/70 backdrop-blur-xl p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 flex flex-col sm:flex-row gap-5 justify-between items-center transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                <div className="relative w-full sm:w-96 group">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search vehicles..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 shadow-inner"
                    />
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200/80">
                                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Vehicle Details</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Model</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Capacity</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Driver & Contact</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/80">
                            {vehicleData.map(vehicle => (
                                <tr key={vehicle.id} className="hover:bg-indigo-50/30 transition-all duration-200 group">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white">
                                                <Car className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">{vehicle.number}</div>
                                                <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{vehicle.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-sm font-bold text-slate-600">{vehicle.model}</td>
                                    <td className="py-4 px-6 text-sm font-bold text-slate-700">{vehicle.capacity} Seats</td>
                                    <td className="py-4 px-6">
                                        <div className="text-sm font-bold text-slate-700">{vehicle.driver}</div>
                                        <div className="text-xs text-slate-500">📞 {vehicle.mobile}</div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-xl shadow-sm border ${
                                            vehicle.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20' :
                                            'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                                                vehicle.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'
                                            }`}></span>
                                            {vehicle.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => handleOpenModal(vehicle)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(vehicle.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
                        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-bold text-slate-800 text-lg">
                                {editingVehicle ? 'Edit Vehicle Details' : 'Add New Vehicle'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-xl transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Bus No (Vehicle No)</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={formData.number}
                                            onChange={(e) => setFormData({...formData, number: e.target.value})}
                                            className="block w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-slate-50 focus:bg-white"
                                            placeholder="e.g. DL-01-AB-1234"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Model</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={formData.model}
                                            onChange={(e) => setFormData({...formData, model: e.target.value})}
                                            className="block w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-slate-50 focus:bg-white"
                                            placeholder="e.g. Tata Marcopolo"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Seating Capacity</label>
                                        <input 
                                            type="number" 
                                            required
                                            value={formData.capacity}
                                            onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                                            className="block w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-slate-50 focus:bg-white"
                                            placeholder="e.g. 50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                                        <select 
                                            value={formData.status}
                                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                                            className="block w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-slate-50 focus:bg-white"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Maintenance">Maintenance</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Driver Name</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={formData.driver}
                                            onChange={(e) => setFormData({...formData, driver: e.target.value})}
                                            className="block w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-slate-50 focus:bg-white"
                                            placeholder="e.g. John Smith"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Driver Mobile No</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={formData.mobile}
                                            onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                                            className="block w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-slate-50 focus:bg-white"
                                            placeholder="e.g. 9876543210"
                                        />
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button 
                                        type="submit" 
                                        className="w-full py-3.5 px-4 bg-indigo-600 text-white text-sm font-bold rounded-2xl hover:bg-indigo-700 shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2"
                                    >
                                        {editingVehicle ? 'Save Changes' : 'Add Vehicle'}
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

export default Vehicles;
