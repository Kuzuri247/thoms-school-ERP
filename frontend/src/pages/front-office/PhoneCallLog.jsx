import React from 'react';
import { Phone, Search, Plus, Clock, User, PhoneCall, PhoneIncoming, PhoneOutgoing } from 'lucide-react';

const PhoneCallLog = () => {
    const logs = [
        { id: 1, name: 'Anil Desai', phone: '9876543210', date: '2026-06-28', description: 'Enquiry about transport fee', type: 'Incoming', duration: '5m 12s' },
        { id: 2, name: 'Kavita Patel', phone: '8765432109', date: '2026-06-27', description: 'Follow up on admission', type: 'Outgoing', duration: '2m 45s' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-3xl border border-indigo-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-blue-700 tracking-tight flex items-center gap-3">
                        <Phone className="w-8 h-8 text-indigo-600" />
                        Phone Call Log
                    </h1>
                    <p className="text-sm text-indigo-600/80 font-medium mt-1">Keep track of all incoming and outgoing administrative phone calls.</p>
                </div>
                <div className="flex gap-2">
                    <button className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5">
                        <Plus className="w-4 h-4" /> Add Call Log
                    </button>
                </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 flex flex-col sm:flex-row gap-5 justify-between items-center transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                <div className="relative w-full max-w-2xl group">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search by Caller Name or Phone..." 
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 placeholder:font-medium shadow-inner"
                    />
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <select className="px-4 py-3 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none bg-white shadow-sm hover:border-slate-300 cursor-pointer w-full sm:w-auto">
                        <option>All Calls</option>
                        <option>Incoming</option>
                        <option>Outgoing</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {logs.map((log) => (
                    <div key={log.id} className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 p-6 flex flex-col group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-indigo-200/60 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${log.type === 'Incoming' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {log.type === 'Incoming' ? <PhoneIncoming className="w-6 h-6" /> : <PhoneOutgoing className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 group-hover:text-indigo-700 transition-colors">{log.name}</h3>
                                    <p className="text-sm font-bold text-slate-400 mt-0.5">{log.phone}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4 flex-1">
                            <p className="text-sm font-medium text-slate-700 leading-relaxed">
                                "{log.description}"
                            </p>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                <Clock className="w-4 h-4 text-slate-400" />
                                {log.date}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                <PhoneCall className="w-4 h-4 text-slate-400" />
                                Duration: {log.duration}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PhoneCallLog;
