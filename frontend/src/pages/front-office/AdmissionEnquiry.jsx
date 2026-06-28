import React, { useState } from 'react';
import { UserPlus, Search, Phone, Mail, Calendar, MessageSquare, Plus, MoreVertical } from 'lucide-react';

const AdmissionEnquiry = () => {
    const [statusFilter, setStatusFilter] = useState('Active');

    const enquiries = [
        { id: 1, name: 'Rahul Sharma', phone: '9876543210', class: 'Class 1', source: 'Website', date: '2026-06-25', nextFollowUp: '2026-06-29', status: 'Active' },
        { id: 2, name: 'Priya Singh', phone: '8765432109', class: 'Class 5', source: 'Walk-in', date: '2026-06-20', nextFollowUp: '2026-06-22', status: 'Dead' },
        { id: 3, name: 'Amit Kumar', phone: '7654321098', class: 'Class 9', source: 'Reference', date: '2026-06-28', nextFollowUp: '2026-07-01', status: 'Active' },
    ];

    const filtered = enquiries.filter(e => e.status === statusFilter);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-3xl border border-emerald-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-teal-700 tracking-tight flex items-center gap-3">
                        <UserPlus className="w-8 h-8 text-emerald-600" />
                        Admission Enquiry
                    </h1>
                    <p className="text-sm text-emerald-600/80 font-medium mt-1">Manage new leads, track follow-ups, and convert enquiries to admissions.</p>
                </div>
                <div className="flex gap-2">
                    <button className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:-translate-y-0.5">
                        <Plus className="w-4 h-4" /> Add Enquiry
                    </button>
                </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 flex flex-col md:flex-row gap-5 justify-between items-center transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 w-full md:w-auto overflow-x-auto">
                    {['Active', 'Dead', 'Converted'].map((status) => (
                        <button 
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${statusFilter === status ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {status} Enquiries
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-72 group">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search name, phone..." 
                        className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((enq) => (
                    <div key={enq.id} className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 p-6 flex flex-col group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-emerald-200/60 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 group-hover:text-emerald-700 transition-colors">{enq.name}</h3>
                                <p className="text-sm font-bold text-slate-400 mt-0.5">Enquiry for {enq.class}</p>
                            </div>
                            <button className="text-slate-400 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 p-2 rounded-xl transition-colors">
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <div className="space-y-3 mb-6 flex-1">
                            <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                <Phone className="w-4 h-4 text-emerald-500" /> {enq.phone}
                            </div>
                            <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                <MessageSquare className="w-4 h-4 text-emerald-500" /> Source: <span className="font-bold text-slate-700">{enq.source}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                <Calendar className="w-4 h-4 text-emerald-500" /> Date: {enq.date}
                            </div>
                        </div>

                        <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 flex justify-between items-center">
                            <div>
                                <span className="block text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest mb-1">Next Follow Up</span>
                                <span className="font-bold text-emerald-900">{enq.nextFollowUp}</span>
                            </div>
                            <button className="p-2.5 bg-white text-emerald-600 rounded-xl shadow-sm hover:shadow-md border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all">
                                <Phone className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
                
                {filtered.length === 0 && (
                    <div className="col-span-full py-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="font-bold text-slate-700 text-lg">No enquiries found</h3>
                        <p className="text-slate-500 text-sm mt-1">There are no {statusFilter.toLowerCase()} enquiries at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdmissionEnquiry;
