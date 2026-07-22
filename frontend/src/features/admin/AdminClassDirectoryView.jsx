import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { BookOpen, Users, ChevronRight, Search, GraduationCap, Building2 } from 'lucide-react';

const AdminClassDirectoryView = () => {
  const navigate = useNavigate();
  const [classesData, setClassesData] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass.class_id || selectedClass.section_id);
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/classes');
      const raw = res.data?.data || [];

      // Group by class_id
      const grouped = {};
      raw.forEach(r => {
        if (!grouped[r.class_id]) {
          grouped[r.class_id] = {
            class_id: r.class_id,
            class_name: r.class_name,
            numeric_value: r.numeric_value,
            sections: []
          };
        }
        if (r.section_id) {
          grouped[r.class_id].sections.push({
            section_id: r.section_id,
            section_name: r.section_name,
            capacity: r.capacity
          });
        }
      });

      const list = Object.values(grouped).sort((a, b) => a.numeric_value - b.numeric_value);
      setClassesData(list);
      if (list.length > 0) {
        setSelectedClass(list[0]);
      }
    } catch (err) {
      console.error('Failed to fetch classes:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (classId) => {
    try {
      const res = await api.get(`/admin/classes/${classId}/students`);
      setStudents(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch class students:', err);
    }
  };

  const filteredStudents = students.filter(s => {
    const term = searchTerm.toLowerCase();
    const fullName = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase();
    return (
      fullName.includes(term) ||
      (s.admission_no || '').toLowerCase().includes(term) ||
      (s.email || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/80 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <GraduationCap className="w-6 h-6" />
            </div>
            Standards & Student Directory
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Inspect enrolled students across school classes and academic sections.
          </p>
        </div>
      </div>

      {/* Grid: Class Selector & Student List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Class Cards List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 px-1">Academic Standards</h3>
          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1 custom-scrollbar">
            {classesData.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium p-4 bg-white rounded-2xl border border-slate-200">
                No classes configured.
              </p>
            ) : (
              classesData.map((cls) => (
                <div
                  key={cls.class_id}
                  onClick={() => setSelectedClass(cls)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedClass?.class_id === cls.class_id
                      ? 'bg-indigo-50 border-indigo-300 shadow-xs ring-2 ring-indigo-500/20'
                      : 'bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className={`font-black text-sm ${selectedClass?.class_id === cls.class_id ? 'text-indigo-900' : 'text-slate-800'}`}>
                      {cls.class_name}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      Grade {cls.numeric_value}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {cls.sections.map(sec => (
                      <span key={sec.section_id} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                        Sec {sec.section_name}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Class Student Roster Table */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">{selectedClass?.class_name || 'Select Class'} Enrolled Roster</h2>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Showing {filteredStudents.length} enrolled students.</p>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Filter by name or admission no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="px-4 py-3">Admission No / Roll</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Section</th>
                  <th className="px-4 py-3">Contact Email</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-slate-400 text-xs font-medium">
                      No students found for this class filter.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.student_id} className="hover:bg-slate-50/80 transition cursor-pointer" onClick={() => navigate(`/profile/${s.user_id}`)}>
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-800">{s.admission_no}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">{s.first_name} {s.last_name}</td>
                      <td className="px-4 py-3.5 text-xs font-semibold text-slate-600">Section {s.section_name || 'A'}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-500">{s.email || 'N/A'}</td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/profile/${s.user_id}`); }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
                          title="View Student Profile"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminClassDirectoryView;
