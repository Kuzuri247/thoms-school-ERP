import React, { useState } from 'react';
import { Search, Download, FileText, Calendar, Filter } from 'lucide-react';

const DownloadList = ({ title, description, icon: Icon, type }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const files = [
        { id: 1, title: 'Algebra Equations Workbook', class: 'Class 10', date: '2026-06-25', size: '2.4 MB', type: 'PDF' },
        { id: 2, title: 'History Final Term Syllabus', class: 'All Classes', date: '2026-06-20', size: '1.1 MB', type: 'DOCX' },
        { id: 3, title: 'Physics Practical Guidelines', class: 'Class 12', date: '2026-06-28', size: '5.6 MB', type: 'PDF' },
        { id: 4, title: 'Summer Holiday Homework', class: 'Class 8', date: '2026-05-15', size: '3.2 MB', type: 'ZIP' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-3xl border border-blue-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 tracking-tight flex items-center gap-3">
                        <Icon className="w-8 h-8 text-blue-600" />
                        {title}
                    </h1>
                    <p className="text-sm text-blue-600/80 font-medium mt-1">{description}</p>
                </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 flex flex-col sm:flex-row gap-5 justify-between items-center transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                <div className="relative w-full max-w-xl group">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search files by title or class..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 placeholder:font-medium shadow-inner"
                    />
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button className="flex items-center gap-2 px-5 py-3 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors bg-white shadow-sm w-full sm:w-auto justify-center">
                        <Filter className="w-4 h-4" /> Filter By Class
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {files.map((file) => (
                    <div key={file.id} className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 p-6 flex flex-col group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-blue-200/60 transition-all">
                        <div className="flex items-start gap-4 mb-5">
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100 shadow-inner group-hover:scale-105 transition-transform">
                                <FileText className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 leading-tight group-hover:text-blue-700 transition-colors line-clamp-2">{file.title}</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1.5">{file.class}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {file.date}</span>
                                <span className="flex items-center gap-1.5 font-bold">{file.size}</span>
                            </div>
                            <button className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                <Download className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DownloadList;
