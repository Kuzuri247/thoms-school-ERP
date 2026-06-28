import React from 'react';
import { UserCheck, Save } from 'lucide-react';

const AssignClassTeacher = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-3xl border border-orange-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-700 to-amber-700 tracking-tight flex items-center gap-3">
                        <UserCheck className="w-8 h-8 text-orange-600" />
                        Assign Class Teacher
                    </h1>
                    <p className="text-sm text-orange-600/80 font-medium mt-1">Designate a primary class teacher for a specific class and section.</p>
                </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 max-w-2xl">
                <form className="space-y-6" onSubmit={e => e.preventDefault()}>
                    <div className="space-y-5">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Select Class *</label>
                            <select className="block w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 bg-slate-50 focus:bg-white outline-none transition-all cursor-pointer">
                                <option>Class 10</option>
                                <option>Class 9</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Select Section *</label>
                            <select className="block w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 bg-slate-50 focus:bg-white outline-none transition-all cursor-pointer">
                                <option>Section A</option>
                                <option>Section B</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Select Class Teacher *</label>
                            <select className="block w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 bg-slate-50 focus:bg-white outline-none transition-all cursor-pointer">
                                <option>Mr. John Doe</option>
                                <option>Mrs. Jane Smith</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="pt-4 flex justify-end">
                        <button className="flex items-center gap-2 px-8 py-3 bg-orange-500 text-white rounded-2xl text-sm font-bold hover:bg-orange-600 shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.23)] hover:-translate-y-0.5 transition-all">
                            <Save className="w-4 h-4" /> Save Assignment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignClassTeacher;
