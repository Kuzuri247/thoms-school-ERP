import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, Users, CheckCircle, FileSpreadsheet, Award, CalendarDays, BookText, Settings } from 'lucide-react';
import { useGetTeacherClasses, useGetClassStudents } from '../features/academics/useAcademics';

const TeacherDashboard = () => {
    const { user } = useContext(AuthContext);
    const [selectedClass, setSelectedClass] = useState({});
    const [activeTab, setActiveTab] = useState('marks'); // marks, homework, attendance

    const { data: classesData } = useGetTeacherClasses();
    const classes = classesData?.data || [];

    const { data: studentsData } = useGetClassStudents(selectedClass?.id);
    const students = studentsData?.data || [];

    useEffect(() => {
        if (classes.length > 0 && !selectedClass.id) {
            setSelectedClass(classes[0]);
        }
    }, [classes]);

    return (
        <div className="space-y-6 pb-12">
            <div className="bg-gradient-to-r from-teal-500 to-emerald-600 p-8 rounded-3xl shadow-lg text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                        <Users className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight mb-1">Teacher Portal</h1>
                        <div className="flex items-center gap-3 text-teal-100 font-medium">
                            <p>Welcome back, <span className="font-bold text-white">{user?.email || 'Teacher'}</span>.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar / Class Selector */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="font-bold text-slate-800 text-lg">My Classes</h3>
                    {classes.map(cls => (
                        <div 
                            key={cls.id} 
                            onClick={() => setSelectedClass(cls)}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedClass.id === cls.id ? 'bg-teal-50 border-teal-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200'}`}
                        >
                            <h4 className={`font-black text-sm mb-1 ${selectedClass.id === cls.id ? 'text-teal-800' : 'text-slate-800'}`}>{cls.name}</h4>
                            <div className="flex flex-col gap-1 text-xs font-medium">
                                <span className={selectedClass.id === cls.id ? 'text-teal-600' : 'text-slate-500'}>Subject: {cls.subject}</span>
                                <span className={selectedClass.id === cls.id ? 'text-teal-600' : 'text-slate-500'}>Role: {cls.role}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 overflow-hidden">
                        
                        {/* Tabs */}
                        <div className="flex border-b border-slate-100 bg-slate-50">
                            <button onClick={() => setActiveTab('marks')} className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'marks' ? 'text-teal-600 bg-white border-b-2 border-teal-500' : 'text-slate-500 hover:text-slate-800'}`}>
                                Update Marks
                            </button>
                            <button onClick={() => setActiveTab('homework')} className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'homework' ? 'text-teal-600 bg-white border-b-2 border-teal-500' : 'text-slate-500 hover:text-slate-800'}`}>
                                Assign Homework
                            </button>
                            {selectedClass.role === 'Class Teacher' && (
                                <button onClick={() => setActiveTab('attendance')} className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'attendance' ? 'text-teal-600 bg-white border-b-2 border-teal-500' : 'text-slate-500 hover:text-slate-800'}`}>
                                    Mark Attendance
                                </button>
                            )}
                        </div>

                        <div className="p-6">
                            <div className="mb-6 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-black text-slate-800">{selectedClass.name} - {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
                                    <p className="text-xs font-medium text-slate-500 mt-1">Managing {selectedClass.subject} data for this class.</p>
                                </div>
                                <button className="px-4 py-2 bg-teal-600 text-white font-bold rounded-xl text-sm hover:bg-teal-700 transition-colors shadow-sm">
                                    Save Changes
                                </button>
                            </div>

                            {activeTab === 'marks' && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-200">
                                                <th className="py-3 px-4 text-xs font-black text-slate-500 uppercase tracking-widest bg-slate-50">Roll No</th>
                                                <th className="py-3 px-4 text-xs font-black text-slate-500 uppercase tracking-widest bg-slate-50">Student Name</th>
                                                <th className="py-3 px-4 text-xs font-black text-slate-500 uppercase tracking-widest bg-slate-50 text-right">{selectedClass.subject} Marks</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {students.map(student => (
                                                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="py-3 px-4 text-sm font-bold text-slate-700">{student.roll}</td>
                                                    <td className="py-3 px-4 text-sm font-bold text-slate-800">{student.name}</td>
                                                    <td className="py-3 px-4 text-right">
                                                        <input 
                                                            type="number" 
                                                            defaultValue={student.englishMark} 
                                                            className="w-20 px-3 py-1.5 text-right font-bold text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" 
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 'homework' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Homework Title</label>
                                        <input type="text" placeholder="e.g. Read Chapter 4 and complete exercises" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all shadow-inner" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Due Date</label>
                                        <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all shadow-inner" />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'attendance' && selectedClass.role === 'Class Teacher' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <CalendarDays className="w-5 h-5 text-teal-600" />
                                            <span className="font-bold text-slate-700 text-sm">Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs font-bold">
                                            <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Present: 2</span>
                                            <span className="text-rose-600 bg-rose-50 px-2 py-1 rounded">Absent: 1</span>
                                        </div>
                                    </div>
                                    
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-slate-200">
                                                    <th className="py-3 px-4 text-xs font-black text-slate-500 uppercase tracking-widest bg-slate-50">Roll No</th>
                                                    <th className="py-3 px-4 text-xs font-black text-slate-500 uppercase tracking-widest bg-slate-50">Student Name</th>
                                                    <th className="py-3 px-4 text-xs font-black text-slate-500 uppercase tracking-widest bg-slate-50 text-right">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {students.map(student => (
                                                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="py-4 px-4 text-sm font-bold text-slate-700">{student.roll}</td>
                                                        <td className="py-4 px-4 text-sm font-bold text-slate-800">{student.name}</td>
                                                        <td className="py-4 px-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-lg transition-colors border ${student.attendance === 'Present' ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'}`}>P</button>
                                                                <button className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-lg transition-colors border ${student.attendance === 'Absent' ? 'bg-rose-500 text-white border-rose-600 shadow-sm' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'}`}>A</button>
                                                                <button className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-lg transition-colors border ${student.attendance === 'Half-Day' ? 'bg-amber-500 text-white border-amber-600 shadow-sm' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'}`}>H</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
