import React from 'react';
import { UploadCloud, FileType, CheckCircle, Upload } from 'lucide-react';

const UploadContent = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-violet-50 to-indigo-50 p-6 rounded-3xl border border-violet-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-700 to-indigo-700 tracking-tight flex items-center gap-3">
                        <UploadCloud className="w-8 h-8 text-violet-600" />
                        Upload Content
                    </h1>
                    <p className="text-sm text-violet-600/80 font-medium mt-1">Upload assignments, study materials, and syllabus for students.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60">
                    <form className="space-y-6" onSubmit={e => e.preventDefault()}>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Content Title *</label>
                            <input type="text" className="block w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 bg-slate-50 focus:bg-white outline-none transition-all placeholder:text-slate-400" placeholder="e.g. Chapter 1 Physics Notes" required />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Content Type *</label>
                                <select className="block w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 bg-slate-50 focus:bg-white outline-none transition-all cursor-pointer">
                                    <option>Assignments</option>
                                    <option>Study Material</option>
                                    <option>Syllabus</option>
                                    <option>Other Downloads</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Available For *</label>
                                <select className="block w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 bg-slate-50 focus:bg-white outline-none transition-all cursor-pointer">
                                    <option>All Classes</option>
                                    <option>Class 10</option>
                                    <option>Class 9</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Description</label>
                            <textarea rows="3" className="block w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 bg-slate-50 focus:bg-white outline-none transition-all placeholder:text-slate-400 resize-none" placeholder="Add a brief description about this content..."></textarea>
                        </div>

                        <div className="border-2 border-dashed border-violet-200 rounded-3xl p-10 flex flex-col items-center justify-center bg-violet-50/50 hover:bg-violet-50 transition-colors group cursor-pointer relative overflow-hidden">
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                            <div className="w-16 h-16 bg-white shadow-sm border border-violet-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <FileType className="w-8 h-8 text-violet-500" />
                            </div>
                            <h3 className="font-extrabold text-slate-700 text-lg">Drag & Drop file here</h3>
                            <p className="text-sm font-medium text-slate-400 mt-1">or click to browse from your computer</p>
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-4">Supported: PDF, DOCX, ZIP, JPG (Max 20MB)</span>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button className="flex items-center gap-2 px-8 py-3.5 bg-violet-600 text-white rounded-2xl text-sm font-bold hover:bg-violet-700 shadow-[0_4px_14px_0_rgba(124,58,237,0.39)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.23)] hover:-translate-y-0.5 transition-all">
                                <Upload className="w-4 h-4" /> Upload Content
                            </button>
                        </div>
                    </form>
                </div>

                <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 flex flex-col h-fit">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500" /> Recent Uploads
                    </h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100">
                                    <FileType className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-700 line-clamp-1">Chapter {item} Mathematics Quiz</h4>
                                    <p className="text-xs font-medium text-slate-400 mt-0.5">Uploaded 2 hrs ago • Class 10</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadContent;
