import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { CheckCircle, XCircle, Search, Save, AlertCircle } from 'lucide-react';

const StudentAttendance = () => {
    const { user } = useContext(AuthContext);
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchClass, setSearchClass] = useState('');
    const [searchSection, setSearchSection] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState({});
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/students', {
                headers: { 'Authorization': `Bearer ${user.accessToken}` }
            });
            const data = await response.json();
            if (response.ok) {
                setStudents(data);
                setFilteredStudents(data);
                
                // Initialize attendance data to 'Present' by default
                const initialData = {};
                data.forEach(s => {
                    initialData[s.id] = 'Present';
                });
                setAttendanceData(initialData);
            }
        } catch (error) {
            console.error('Failed to fetch students', error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        let filtered = students;
        if (searchClass) {
            filtered = filtered.filter(s => s.class === searchClass);
        }
        if (searchSection) {
            filtered = filtered.filter(s => s.section === searchSection);
        }
        setFilteredStudents(filtered);
    };

    const handleMarkAttendance = (id, status) => {
        setAttendanceData(prev => ({ ...prev, [id]: status }));
    };

    const handleSaveAttendance = () => {
        // Here you would typically send it to the backend via POST /attendance
        console.log('Saving attendance for', date, attendanceData);
        setNotification({ type: 'success', message: `Attendance for ${date} saved successfully!` });
        setTimeout(() => setNotification(null), 3000);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Student Attendance</h1>
                        <p className="text-sm text-slate-500 font-medium">Mark daily attendance for your class.</p>
                    </div>
                </div>

                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                        <input 
                            type="text" 
                            value={searchClass} 
                            onChange={e => setSearchClass(e.target.value)} 
                            className="block w-full px-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="e.g. 10th"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Section</label>
                        <input 
                            type="text" 
                            value={searchSection} 
                            onChange={e => setSearchSection(e.target.value)} 
                            className="block w-full px-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="e.g. A"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                        <input 
                            type="date" 
                            value={date} 
                            onChange={e => setDate(e.target.value)} 
                            className="block w-full px-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <button type="submit" className="w-full py-2.5 px-4 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                            <Search className="w-4 h-4" /> Search
                        </button>
                    </div>
                </form>
            </div>

            {notification && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${notification.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                    {notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                    <span className="font-medium text-sm">{notification.message}</span>
                </div>
            )}

            {filteredStudents.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-800">Student List</h3>
                        <button onClick={handleSaveAttendance} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm">
                            <Save className="w-4 h-4" /> Save Attendance
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white border-b border-slate-200">
                                    <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Name (Email)</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Attendance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredStudents.map(student => (
                                    <tr key={student.id} className="hover:bg-slate-50/50">
                                        <td className="py-4 px-6 text-sm font-medium text-slate-900">
                                            #{student.id}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="text-sm font-bold text-slate-900">{student.email.split('@')[0]}</div>
                                            <div className="text-xs text-slate-500">{student.email}</div>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-white shadow-sm">
                                                <button
                                                    onClick={() => handleMarkAttendance(student.id, 'Present')}
                                                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${attendanceData[student.id] === 'Present' ? 'bg-emerald-100 text-emerald-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                                                >
                                                    Present
                                                </button>
                                                <button
                                                    onClick={() => handleMarkAttendance(student.id, 'Absent')}
                                                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${attendanceData[student.id] === 'Absent' ? 'bg-red-100 text-red-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                                                >
                                                    Absent
                                                </button>
                                                <button
                                                    onClick={() => handleMarkAttendance(student.id, 'Late')}
                                                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${attendanceData[student.id] === 'Late' ? 'bg-amber-100 text-amber-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                                                >
                                                    Late
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {filteredStudents.length === 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                    <XCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-800 mb-1">No Students Found</h3>
                    <p className="text-slate-500 font-medium">Use the filters above to search for a specific class and section.</p>
                </div>
            )}
        </div>
    );
};

export default StudentAttendance;
