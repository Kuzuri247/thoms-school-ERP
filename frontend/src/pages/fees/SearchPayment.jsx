import React from 'react';
import { Search, FileText, CheckCircle2, Download } from 'lucide-react';

const SearchPayment = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-3xl border border-blue-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-cyan-700 tracking-tight flex items-center gap-3">
                        <Search className="w-8 h-8 text-blue-600" />
                        Search Payment
                    </h1>
                    <p className="text-sm text-blue-600/80 font-medium mt-1">Look up historical payment transactions by Payment ID or Student Details.</p>
                </div>
                <div className="flex gap-2">
                    <button className="inline-flex items-center gap-2 bg-white text-slate-700 px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-slate-50 border border-slate-200 transition-all shadow-sm">
                        <Download className="w-4 h-4" /> Export Ledger
                    </button>
                </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 flex flex-col sm:flex-row gap-5 justify-between items-center transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                <div className="relative w-full max-w-2xl group">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search by Payment ID, Admission No, or Name..." 
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 placeholder:font-medium shadow-inner"
                    />
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200/80">
                                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Payment ID</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Student Info</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Date & Mode</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Amount Paid</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/80">
                            {[1, 2, 3].map((item) => (
                                <tr key={item} className="hover:bg-blue-50/30 transition-all duration-200 group">
                                    <td className="py-4 px-6">
                                        <span className="font-bold text-blue-700 font-mono bg-blue-50 px-2 py-1 rounded-lg">#PAY-80{item}2</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className="font-bold text-slate-800">Student Name {item}</p>
                                        <p className="text-[11px] font-bold text-slate-400 mt-0.5">Class 10-A • Adm No: 100{item}</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className="font-bold text-slate-700">12 Jun 2026</p>
                                        <p className="text-[11px] font-bold text-slate-400 mt-0.5">UPI / App</p>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <span className="text-lg font-extrabold text-slate-900">₹7,500</span>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Successful
                                        </span>
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

export default SearchPayment;
