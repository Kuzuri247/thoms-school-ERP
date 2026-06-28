import React from 'react';
import { Search, AlertCircle, Download, FileText } from 'lucide-react';

const SearchDueFees = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-red-50 to-rose-50 p-6 rounded-3xl border border-red-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-700 to-rose-700 tracking-tight flex items-center gap-3">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                        Due Fees Report
                    </h1>
                    <p className="text-sm text-red-600/80 font-medium mt-1">Search and track pending fee payments across classes and sections.</p>
                </div>
                <div className="flex gap-2">
                    <button className="inline-flex items-center gap-2 bg-white text-slate-700 px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-slate-50 border border-slate-200 transition-all shadow-sm">
                        <Download className="w-4 h-4" /> Export Report
                    </button>
                </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 flex flex-col sm:flex-row gap-5 justify-between items-center transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                <div className="flex gap-3 w-full">
                    <select className="px-4 py-3 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none bg-white shadow-sm hover:border-slate-300 cursor-pointer flex-1">
                        <option>Class 10</option>
                        <option>Class 9</option>
                    </select>
                    <select className="px-4 py-3 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none bg-white shadow-sm hover:border-slate-300 cursor-pointer flex-1">
                        <option>Section A</option>
                        <option>Section B</option>
                    </select>
                    <select className="px-4 py-3 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none bg-white shadow-sm hover:border-slate-300 cursor-pointer flex-1">
                        <option>Tuition Fee</option>
                        <option>Transport Fee</option>
                    </select>
                    <button className="px-8 py-3 bg-red-600 text-white rounded-2xl text-sm font-bold hover:bg-red-700 shadow-sm transition-colors flex items-center gap-2">
                        <Search className="w-4 h-4" /> Search
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200/80">
                                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Student</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Class</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Fee Type</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Due Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/80">
                            {[1, 2, 3].map((item) => (
                                <tr key={item} className="hover:bg-red-50/30 transition-all duration-200 group">
                                    <td className="py-4 px-6">
                                        <p className="font-bold text-slate-800">Student Name {item}</p>
                                        <p className="text-[11px] font-bold text-slate-400 mt-0.5">Adm No: {1000 + item}</p>
                                    </td>
                                    <td className="py-4 px-6 text-sm font-bold text-slate-700">10 - A</td>
                                    <td className="py-4 px-6">
                                        <span className="text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">
                                            Tuition Fee (June)
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <span className="text-lg font-extrabold text-slate-900">₹5,000</span>
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

export default SearchDueFees;
