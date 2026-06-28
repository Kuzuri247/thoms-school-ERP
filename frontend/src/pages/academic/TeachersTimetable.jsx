import React, { useState } from 'react';
import { Search, Clock, User, Print } from 'lucide-react';

const TeachersTimetable = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = [
        '08:00 AM - 08:45 AM',
        '08:45 AM - 09:30 AM',
        '09:30 AM - 10:15 AM',
        '10:45 AM - 11:30 AM',
        '11:30 AM - 12:15 PM'
    ];

    const timetableData = {
        'Monday': [{class: '10-A', subject: 'Math'}, {class: '9-B', subject: 'Math'}, null, {class: '12-Sci', subject: 'Adv Math'}, null],
        'Tuesday': [null, {class: '10-A', subject: 'Math'}, {class: '11-Sci', subject: 'Math'}, null, {class: '9-A', subject: 'Math'}],
        'Wednesday': [{class: '10-A', subject: 'Math'}, null, {class: '12-Sci', subject: 'Adv Math'}, {class: '9-B', subject: 'Math'}, null],
        'Thursday': [null, {class: '10-A', subject: 'Math'}, {class: '11-Sci', subject: 'Math'}, {class: '12-Sci', subject: 'Adv Math'}, null],
        'Friday': [{class: '9-B', subject: 'Math'}, null, {class: '10-A', subject: 'Math'}, null, {class: '11-Sci', subject: 'Math'}],
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-teal-50 to-emerald-50 p-6 rounded-3xl border border-teal-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-emerald-700 tracking-tight flex items-center gap-3">
                        <User className="w-8 h-8 text-teal-600" />
                        Teacher's Timetable
                    </h1>
                    <p className="text-sm text-teal-600/80 font-medium mt-1">View the weekly teaching schedule for a specific teacher.</p>
                </div>
                <div className="flex gap-2">
                    <button className="inline-flex items-center gap-2 bg-white text-slate-700 px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-slate-50 border border-slate-200 transition-all shadow-sm">
                        <Print className="w-4 h-4" /> Print Timetable
                    </button>
                </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 flex flex-col sm:flex-row gap-5 justify-between items-center transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                <div className="flex gap-3 w-full sm:w-auto">
                    <select className="px-4 py-2.5 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none bg-white shadow-sm hover:border-slate-300 cursor-pointer flex-1 sm:flex-none w-64">
                        <option>Select Teacher...</option>
                        <option>Mr. John Doe (Mathematics)</option>
                        <option>Mrs. Jane Smith (Science)</option>
                    </select>
                    <button className="px-6 py-2.5 bg-teal-600 text-white rounded-2xl text-sm font-bold hover:bg-teal-700 shadow-sm transition-colors">
                        Search
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-center border-collapse">
                        <thead>
                            <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200/80">
                                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-left w-32 border-r border-slate-100">Day / Time</th>
                                {timeSlots.map((slot, idx) => (
                                    <th key={idx} className="py-4 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-100 last:border-0 min-w-[120px]">
                                        {slot}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/80">
                            {days.map((day) => (
                                <tr key={day} className="hover:bg-teal-50/30 transition-all duration-200 group">
                                    <td className="py-5 px-6 font-bold text-slate-700 border-r border-slate-100 text-left bg-slate-50/30">
                                        {day}
                                    </td>
                                    {timetableData[day].map((session, idx) => (
                                        <td key={idx} className="py-4 px-4 border-r border-slate-100 last:border-0">
                                            {session ? (
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded-lg border border-teal-100 w-full truncate">
                                                        Class {session.class}
                                                    </span>
                                                    <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">{session.subject}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs font-medium text-slate-300 italic">Free Period</span>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TeachersTimetable;
