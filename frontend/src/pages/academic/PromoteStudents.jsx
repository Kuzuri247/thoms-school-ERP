import React, { useState } from 'react';
import { ArrowUpCircle, AlertTriangle, Users } from 'lucide-react';

const PromoteStudents = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-violet-50 to-purple-50 p-6 rounded-3xl border border-violet-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-700 to-purple-700 tracking-tight flex items-center gap-3">
                        <ArrowUpCircle className="w-8 h-8 text-violet-600" />
                        Promote Students
                    </h1>
                    <p className="text-sm text-violet-600/80 font-medium mt-1">Upgrade students to the next academic session or class based on their performance.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Current Session Data</h2>
                    <form className="space-y-5" onSubmit={e => e.preventDefault()}>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Class *</label>
                            <select className="block w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 bg-slate-50 focus:bg-white outline-none transition-all cursor-pointer">
                                <option>Class 9</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Section *</label>
                            <select className="block w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 bg-slate-50 focus:bg-white outline-none transition-all cursor-pointer">
                                <option>Section A</option>
                            </select>
                        </div>
                    </form>
                </div>

                <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-violet-200/60 ring-2 ring-violet-50">
                    <h2 className="text-lg font-bold text-violet-800 mb-4 border-b border-violet-100 pb-3">Promote To Next Session</h2>
                    <form className="space-y-5" onSubmit={e => e.preventDefault()}>
                        <div>
                            <label className="block text-[11px] font-bold text-violet-400 mb-1.5 uppercase tracking-widest">Promote To Session *</label>
                            <select className="block w-full px-4 py-3 border border-violet-200 rounded-2xl text-sm font-medium text-violet-700 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 bg-violet-50 focus:bg-white outline-none transition-all cursor-pointer">
                                <option>2027-2028</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-violet-400 mb-1.5 uppercase tracking-widest">Promote To Class *</label>
                            <select className="block w-full px-4 py-3 border border-violet-200 rounded-2xl text-sm font-medium text-violet-700 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 bg-violet-50 focus:bg-white outline-none transition-all cursor-pointer">
                                <option>Class 10</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-violet-400 mb-1.5 uppercase tracking-widest">Promote To Section *</label>
                            <select className="block w-full px-4 py-3 border border-violet-200 rounded-2xl text-sm font-medium text-violet-700 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 bg-violet-50 focus:bg-white outline-none transition-all cursor-pointer">
                                <option>Section A</option>
                            </select>
                        </div>
                    </form>
                </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <div>
                    <h3 className="font-bold text-amber-800 text-sm">Important Note</h3>
                    <p className="text-amber-700/80 text-sm mt-1">Promoting students will transfer their academic records to the new session. This action requires careful review. Ensure all final exams and results for the current session are complete before proceeding.</p>
                </div>
            </div>

            <div className="flex justify-end">
                <button className="flex items-center gap-2 px-8 py-3 bg-violet-600 text-white rounded-2xl text-sm font-bold hover:bg-violet-700 shadow-[0_4px_14px_0_rgba(124,58,237,0.39)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.23)] hover:-translate-y-0.5 transition-all">
                    <Users className="w-4 h-4" /> Load Students For Promotion
                </button>
            </div>
        </div>
    );
};

export default PromoteStudents;
