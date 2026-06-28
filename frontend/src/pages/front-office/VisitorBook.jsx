import React, { useState } from 'react';
import { BookOpen, Search, User, Clock, Calendar, Plus, MoreVertical, LogOut } from 'lucide-react';

const VisitorBook = () => {
    const visitors = [
        { id: 1, name: 'Sanjay Gupta', purpose: 'Meet Principal', phone: '9876543210', date: '2026-06-28', inTime: '09:30 AM', outTime: '10:15 AM', status: 'Checked Out' },
        { id: 2, name: 'Neha Sharma', purpose: 'Admission Enquiry', phone: '8765432109', date: '2026-06-28', inTime: '11:00 AM', outTime: null, status: 'In Campus' },
        { id: 3, name: 'Vikas Singh', purpose: 'Vendor Delivery', phone: '7654321098', date: '2026-06-28', inTime: '12:45 PM', outTime: null, status: 'In Campus' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-sky-50 to-blue-50 p-6 rounded-3xl border border-sky-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-700 to-blue-700 tracking-tight flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-sky-600" />
                        Visitor Book
                    </h1>
                    <p className="text-sm text-sky-600/80 font-medium mt-1">Log all incoming visitors, track their purpose, and monitor campus entry/exit times.</p>
                </div>
                <div className="flex gap-2">
                    <button className="inline-flex items-center gap-2 bg-sky-600 text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-sky-700 transition-all shadow-[0_4px_14px_0_rgba(2,132,199,0.39)] hover:shadow-[0_6px_20px_rgba(2,132,199,0.23)] hover:-translate-y-0.5">
                        <Plus className="w-4 h-4" /> New Visitor Entry
                    </button>
                </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 flex flex-col sm:flex-row gap-5 justify-between items-center transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                <div className="relative w-full max-w-2xl group">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search by Visitor Name, Phone, or Purpose..." 
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 placeholder:font-medium shadow-inner"
                    />
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <input type="date" className="px-4 py-3 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none bg-white shadow-sm hover:border-slate-300 cursor-pointer w-full sm:w-auto" />
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200/80">
                                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Visitor Info</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Purpose</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">In Time</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Out Time</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/80">
                            {visitors.map((visitor) => (
                                <tr key={visitor.id} className="hover:bg-sky-50/30 transition-all duration-200 group">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-sky-100 text-sky-700 rounded-full flex items-center justify-center font-bold">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{visitor.name}</p>
                                                <p className="text-[11px] font-bold text-slate-400 mt-0.5">{visitor.phone}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className="text-sm font-bold text-slate-700">{visitor.purpose}</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-sm font-bold text-slate-700">{visitor.inTime}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        {visitor.outTime ? (
                                            <div className="flex items-center gap-2">
                                                <LogOut className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="text-sm font-bold text-slate-700">{visitor.outTime}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs font-bold text-slate-300 italic">-</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${visitor.status === 'In Campus' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                            {visitor.status === 'In Campus' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>}
                                            {visitor.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        {visitor.status === 'In Campus' ? (
                                            <button className="text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 px-3 py-1.5 rounded-lg shadow-sm transition-colors">
                                                Check Out
                                            </button>
                                        ) : (
                                            <button className="p-2 text-slate-400 hover:text-sky-600 bg-slate-50 hover:bg-sky-50 rounded-xl transition-colors">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default VisitorBook;
