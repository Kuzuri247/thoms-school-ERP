import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { 
  BookOpen, Users, ChevronRight, Search, GraduationCap, Building2, Plus, 
  UserCheck, X, Check, Shield, UserPlus, Phone, Mail, Home, Award, 
  User, Image as ImageIcon, Filter, Layers, Briefcase, Heart, Eye,
  Upload, Camera
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const AdminClassDirectoryView = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [classesData, setClassesData] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [teacherFilterOnly, setTeacherFilterOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modals visibility
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(null);

  // Staff Form State
  const [staffForm, setStaffForm] = useState({
    full_name: '',
    role: 'teacher',
    email: '',
    phone: '',
    department: '',
    profile_pic: ''
  });

  const handleAddStaffFrontend = (e) => {
    e.preventDefault();
    if (!staffForm.full_name.trim()) return;

    setFormSuccess(`Staff member "${staffForm.full_name}" added successfully!`);
    setShowAddStaffModal(false);
    setStaffForm({
      full_name: '',
      role: 'teacher',
      email: '',
      phone: '',
      department: '',
      profile_pic: ''
    });
    setTimeout(() => setFormSuccess(''), 3000);
  };

  // Add Class Form State
  const [newClassName, setNewClassName] = useState('');
  const [newGradeValue, setNewGradeValue] = useState('');
  const [newSectionName, setNewSectionName] = useState('A');
  const [newCapacity, setNewCapacity] = useState('40');
  const [newClassTeacher, setNewClassTeacher] = useState('');

  // Add Student Form State (Pure Frontend Design Ready)
  const [studentForm, setStudentForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    admission_no: '',
    roll_no: '',
    gender: 'Male',
    dob: '',
    profile_pic: '',
    address: '',
    previous_school: '',
    father_name: '',
    father_phone: '',
    father_occupation: '',
    mother_name: '',
    mother_phone: '',
    mother_occupation: '',
    guardian_name: '',
    guardian_phone: '',
    guardian_relation: ''
  });

  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      const firstSec = selectedClass.sections?.[0] || null;
      setSelectedSection(firstSec);
      fetchStudents(selectedClass.class_id);
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
            capacity: r.capacity,
            class_teacher_name: r.class_teacher_name || 'Rajesh Sharma (Class HOD)',
            class_teacher_email: r.class_teacher_email || 'teacher@thomson.edu'
          });
        }
      });

      const list = Object.values(grouped).sort((a, b) => a.numeric_value - b.numeric_value);
      
      // Fallback demo classes if empty
      if (list.length === 0) {
        const demoList = [
          {
            class_id: 101,
            class_name: 'Class 10',
            numeric_value: 10,
            sections: [
              { section_id: 201, section_name: 'A', capacity: 40, class_teacher_name: 'Rajesh Sharma (HOD)', class_teacher_email: 'rajesh@thomson.edu' },
              { section_id: 202, section_name: 'B', capacity: 38, class_teacher_name: 'Anita Verma', class_teacher_email: 'anita@thomson.edu' }
            ]
          },
          {
            class_id: 102,
            class_name: 'Class 11',
            numeric_value: 11,
            sections: [
              { section_id: 203, section_name: 'A (Science)', capacity: 45, class_teacher_name: 'Dr. S. K. Gupta', class_teacher_email: 'gupta@thomson.edu' },
              { section_id: 204, section_name: 'B (Commerce)', capacity: 42, class_teacher_name: 'Meenakshi Sundaram', class_teacher_email: 'meenakshi@thomson.edu' }
            ]
          }
        ];
        setClassesData(demoList);
        setSelectedClass(demoList[0]);
        setSelectedSection(demoList[0].sections[0]);
      } else {
        setClassesData(list);
        setSelectedClass(list[0]);
        setSelectedSection(list[0].sections[0]);
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
      const apiStudents = res.data?.data || [];
      
      if (apiStudents.length > 0) {
        setStudents(apiStudents);
      } else {
        // Enriched Frontend Mock Data with all requested details
        setStudents([
          {
            student_id: 1,
            user_id: 10,
            admission_no: 'TS-2026-001',
            roll_no: '101',
            first_name: 'Aarav',
            last_name: 'Sharma',
            section_name: 'A',
            email: 'aarav.sharma@student.thomson.edu',
            phone: '+91 98765 43210',
            profile_pic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
            address: '14/B Heritage Park, MG Road, New Delhi',
            previous_school: 'St. Xavier Convent High School',
            father_name: 'Vikram Sharma',
            father_phone: '+91 98111 22334',
            father_occupation: 'Senior Software Engineer',
            mother_name: 'Priyanka Sharma',
            mother_phone: '+91 98111 22335',
            mother_occupation: 'Architect',
            guardian_name: 'Ramesh Sharma (Grandfather)',
            guardian_phone: '+91 98111 00000',
            guardian_relation: 'Grandfather'
          },
          {
            student_id: 2,
            user_id: 11,
            admission_no: 'TS-2026-002',
            roll_no: '102',
            first_name: 'Ananya',
            last_name: 'Patel',
            section_name: 'A',
            email: 'ananya.p@student.thomson.edu',
            phone: '+91 98989 12345',
            profile_pic: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
            address: '702 Lakeview Apartments, Civil Lines',
            previous_school: 'Delhi Public School',
            father_name: 'Rajesh Patel',
            father_phone: '+91 99000 11223',
            father_occupation: 'Business Owner',
            mother_name: 'Sunita Patel',
            mother_phone: '+91 99000 11224',
            mother_occupation: 'Doctor (Pediatrician)',
            guardian_name: 'Rajesh Patel',
            guardian_phone: '+91 99000 11223',
            guardian_relation: 'Father'
          }
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch class students:', err);
    }
  };

  // Add Class Handler (Frontend Only State Update)
  const handleAddClassFrontend = (e) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const newId = Date.now();
    const createdClass = {
      class_id: newId,
      class_name: newClassName.trim(),
      numeric_value: parseInt(newGradeValue) || (classesData.length + 1),
      sections: [
        {
          section_id: newId + 1,
          section_name: newSectionName.trim() || 'A',
          capacity: parseInt(newCapacity) || 40,
          class_teacher_name: newClassTeacher.trim() || 'Assigned Teacher',
          class_teacher_email: 'teacher@thomson.edu'
        }
      ]
    };

    setClassesData(prev => [...prev, createdClass]);
    setSelectedClass(createdClass);
    setSelectedSection(createdClass.sections[0]);
    setShowAddClassModal(false);

    // Reset Form
    setNewClassName('');
    setNewGradeValue('');
    setNewSectionName('A');
    setNewCapacity('40');
    setNewClassTeacher('');
    setFormSuccess('Class added successfully!');
    setTimeout(() => setFormSuccess(''), 3000);
  };

  // Handle profile image file upload
  const handleProfilePicUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit. Please choose a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setStudentForm(prev => ({ ...prev, profile_pic: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Add Student Handler (Frontend Only State Update)
  const handleAddStudentFrontend = (e) => {
    e.preventDefault();
    if (!studentForm.first_name.trim()) return;

    const chosenClassId = studentForm.class_id || selectedClass?.class_id;
    const chosenSectionName = studentForm.section_name || selectedSection?.section_name || 'A';

    const targetClass = classesData.find(c => String(c.class_id) === String(chosenClassId)) || selectedClass;
    if (targetClass) {
      setSelectedClass(targetClass);
      const targetSec = targetClass.sections?.find(s => s.section_name === chosenSectionName) || targetClass.sections?.[0];
      if (targetSec) setSelectedSection(targetSec);
    }

    const newStu = {
      student_id: Date.now(),
      user_id: Date.now(),
      class_id: chosenClassId,
      admission_no: studentForm.admission_no || `TS-2026-${Math.floor(100 + Math.random() * 900)}`,
      roll_no: studentForm.roll_no || `${students.length + 101}`,
      first_name: studentForm.first_name,
      last_name: studentForm.last_name,
      section_name: chosenSectionName,
      email: studentForm.email || `${studentForm.first_name.toLowerCase()}@student.thomson.edu`,
      phone: studentForm.phone || '+91 99999 88888',
      profile_pic: studentForm.profile_pic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      address: studentForm.address || 'Address provided on record',
      previous_school: studentForm.previous_school || 'N/A',
      father_name: studentForm.father_name || 'Father Name',
      father_phone: studentForm.father_phone || 'N/A',
      father_occupation: studentForm.father_occupation || 'N/A',
      mother_name: studentForm.mother_name || 'Mother Name',
      mother_phone: studentForm.mother_phone || 'N/A',
      mother_occupation: studentForm.mother_occupation || 'N/A',
      guardian_name: studentForm.guardian_name || studentForm.father_name || 'Guardian',
      guardian_phone: studentForm.guardian_phone || studentForm.father_phone || 'N/A',
      guardian_relation: studentForm.guardian_relation || 'Parent'
    };

    setStudents(prev => [newStu, ...prev]);
    setShowAddStudentModal(false);

    // Reset Form
    setStudentForm({
      first_name: '', last_name: '', email: '', phone: '', admission_no: '', roll_no: '',
      gender: 'Male', dob: '', profile_pic: '', address: '', previous_school: '',
      father_name: '', father_phone: '', father_occupation: '',
      mother_name: '', mother_phone: '', mother_occupation: '',
      guardian_name: '', guardian_phone: '', guardian_relation: ''
    });

    setFormSuccess('Student added to roster successfully!');
    setTimeout(() => setFormSuccess(''), 3000);
  };

  const filteredStudents = students.filter(s => {
    const term = searchTerm.toLowerCase();
    const fullName = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase();
    const matchesSearch = (
      fullName.includes(term) ||
      (s.admission_no || '').toLowerCase().includes(term) ||
      (s.email || '').toLowerCase().includes(term)
    );
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/80 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shadow-xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            Standards & Student Directory
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage academic standards, section rosters, assigned class teachers, and student profiles.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTeacherFilterOnly(!teacherFilterOnly)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
              teacherFilterOnly 
                ? 'bg-amber-50 text-amber-700 border-amber-300 shadow-xs ring-2 ring-amber-500/20'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <UserCheck className="w-4 h-4 text-amber-600" />
            {teacherFilterOnly ? 'Showing Teachers Only' : 'Show Class Teachers'}
          </button>

          {(user?.role === 'super_admin' || user?.role === 'admin') && (
            <button
              onClick={() => {
                const initialClassId = selectedClass?.class_id || (classesData[0]?.class_id || '');
                const initialClassObj = classesData.find(c => String(c.class_id) === String(initialClassId));
                const initialSectionName = selectedSection?.section_name || (initialClassObj?.sections?.[0]?.section_name || 'A');

                setStudentForm(prev => ({
                  ...prev,
                  class_id: initialClassId,
                  section_name: initialSectionName
                }));
                setShowAddStudentModal(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-emerald-500/20 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Add Student
            </button>
          )}
        </div>
      </div>

      {formSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-xs animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          {formSuccess}
        </div>
      )}

      {/* Grid: Class Standard Selector & Roster Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Academic Standards Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Academic Standards</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {classesData.length} Classes
            </span>
          </div>

          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1 custom-scrollbar">
            {classesData.map((cls) => {
              const isSelected = selectedClass?.class_id === cls.class_id;
              const teacherName = cls.sections?.[0]?.class_teacher_name || 'Assigned Teacher';

              return (
                <div
                  key={cls.class_id}
                  onClick={() => setSelectedClass(cls)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-50/90 border-indigo-300 shadow-xs ring-2 ring-indigo-500/20'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className={`font-black text-sm ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                      {cls.class_name}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      Grade {cls.numeric_value}
                    </span>
                  </div>

                  {/* Class Teacher info badge */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                      <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="truncate max-w-[150px]">{teacherName}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Class Student Roster & Teacher Info */}
        <div className="lg:col-span-3 space-y-4">
          {/* Active Class Header Card */}
          <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-black text-slate-900">
                    {selectedClass?.class_name || 'Class'} {selectedSection ? `- Section ${selectedSection.section_name}` : ''}
                  </h2>
                  {selectedSection?.class_teacher_name && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 shadow-2xs">
                      <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                      Class Teacher: {selectedSection.class_teacher_name}
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  Enrolled Students: <span className="text-slate-800 font-bold">{filteredStudents.length}</span> | Capacity: <span className="text-slate-800 font-bold">{selectedSection?.capacity || 40}</span>
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search student or roll no..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Teacher Only Filter Mode Banner */}
          {teacherFilterOnly ? (
            <div className="bg-amber-50/80 border border-amber-200 p-5 rounded-2xl space-y-3">
              <h3 className="text-sm font-black text-amber-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-600" />
                Class Teachers Directory for {selectedClass?.class_name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedClass?.sections.map(sec => (
                  <div key={sec.section_id} className="p-3.5 bg-white rounded-xl border border-amber-200 flex items-center gap-3">
                    <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl font-black text-xs">
                      Sec {sec.section_name}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900">{sec.class_teacher_name || 'Assigned Class Teacher'}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">{sec.class_teacher_email || 'teacher@thomson.edu'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Student Roster Table */
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-xs">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Admission & Roll</th>
                    <th className="px-4 py-3">Parent / Guardian</th>
                    <th className="px-4 py-3">Contact Email & Phone</th>
                    <th className="px-4 py-3 text-right">Profile View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-slate-400 text-xs font-medium">
                        No students found for this standard & section filter.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => (
                      <tr 
                        key={s.student_id} 
                        className="hover:bg-slate-50/80 transition cursor-pointer"
                        onClick={() => setShowStudentDetailModal(s)}
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={s.profile_pic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                              alt={s.first_name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-2xs"
                            />
                            <div>
                              <div className="font-extrabold text-slate-900 text-xs">{s.first_name} {s.last_name}</div>
                              <div className="text-[10px] font-semibold text-indigo-600">Sec {s.section_name || 'A'}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="font-mono font-bold text-xs text-slate-800">{s.admission_no}</div>
                          <div className="text-[10px] text-slate-500 font-medium">Roll No: {s.roll_no}</div>
                        </td>

                        <td className="px-4 py-3.5 text-xs">
                          <div className="font-extrabold text-slate-800">{s.father_name || s.guardian_name || 'N/A'}</div>
                          <div className="text-[10px] text-slate-500 font-medium">{s.father_occupation || 'Parent'}</div>
                        </td>

                        <td className="px-4 py-3.5 text-xs">
                          <div className="font-medium text-slate-700">{s.email || 'N/A'}</div>
                          <div className="text-[10px] font-mono text-slate-500">{s.phone || 'N/A'}</div>
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); setShowStudentDetailModal(s); }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
                            title="View Full Student Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Class Modal (Pure Frontend) */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Add Academic Class / Standard</h3>
                  <p className="text-[11px] font-semibold text-slate-400">Configure grade standard, section & Class Teacher</p>
                </div>
              </div>
              <button onClick={() => setShowAddClassModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddClassFrontend} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Class / Standard Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Class 11 or Grade 11"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Grade (Numeric)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 11"
                    value={newGradeValue}
                    onChange={(e) => setNewGradeValue(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Section Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. A"
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Assigned Class Teacher Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Sharma (Mathematics HOD)"
                  value={newClassTeacher}
                  onChange={(e) => setNewClassTeacher(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowAddClassModal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer">
                  Save Class Standard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Student Modal (Pure Frontend Design Ready) */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Add New Student Profile</h3>
                  <p className="text-[11px] font-semibold text-slate-400">Complete student enrollment form with parent & guardian details</p>
                </div>
              </div>
              <button onClick={() => setShowAddStudentModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudentFrontend} className="space-y-4 text-xs font-semibold text-slate-700">
              {/* Section 1: Basic & Academic Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 border-b border-indigo-50 pb-1">
                  1. Basic & Academic Information
                </h4>

                {/* Profile Photo Upload Widget */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-16 h-16 rounded-2xl bg-white border border-slate-300 shadow-xs overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {studentForm.profile_pic ? (
                      <img src={studentForm.profile_pic} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-slate-400" />
                    )}
                    <div className="absolute bottom-0 inset-x-0 bg-slate-900/70 text-white text-[8px] py-0.5 text-center font-bold tracking-wider uppercase">
                      PHOTO
                    </div>
                  </div>

                  <div className="flex-1 space-y-1 text-center sm:text-left">
                    <label className="block text-xs font-bold text-slate-900">
                      Student Profile Photo
                    </label>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Upload student photo file from your computer or enter image URL.
                    </p>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                      <label className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        Browse & Upload Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePicUpload}
                          className="hidden"
                        />
                      </label>

                      {studentForm.profile_pic && (
                        <button
                          type="button"
                          onClick={() => setStudentForm(prev => ({ ...prev, profile_pic: '' }))}
                          className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1">Target Class / Standard *</label>
                    <select
                      value={studentForm.class_id || selectedClass?.class_id || ''}
                      onChange={(e) => {
                        const targetCls = classesData.find(c => String(c.class_id) === String(e.target.value));
                        setStudentForm({
                          ...studentForm,
                          class_id: e.target.value,
                          section_name: targetCls?.sections?.[0]?.section_name || 'A'
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-bold text-slate-800"
                    >
                      {classesData.map(c => (
                        <option key={c.class_id} value={c.class_id}>
                          {c.class_name} (Grade {c.numeric_value})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1">Target Section *</label>
                    <select
                      value={studentForm.section_name || selectedSection?.section_name || 'A'}
                      onChange={(e) => setStudentForm({ ...studentForm, section_name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-bold text-slate-800"
                    >
                      {(() => {
                        const activeClassId = studentForm.class_id || selectedClass?.class_id;
                        const activeClassObj = classesData.find(c => String(c.class_id) === String(activeClassId)) || selectedClass;
                        const availableSections = activeClassObj?.sections?.length 
                          ? activeClassObj.sections 
                          : [{ section_name: 'A' }, { section_name: 'B' }, { section_name: 'C' }];

                        return availableSections.map((sec, idx) => (
                          <option key={sec.section_id || idx} value={sec.section_name}>
                            Section {sec.section_name} {sec.class_teacher_name ? `(Teacher: ${sec.class_teacher_name})` : ''}
                          </option>
                        ));
                      })()}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1">First Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Aarav"
                      value={studentForm.first_name}
                      onChange={(e) => setStudentForm({ ...studentForm, first_name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Last Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Sharma"
                      value={studentForm.last_name}
                      onChange={(e) => setStudentForm({ ...studentForm, last_name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Student Email</label>
                    <input
                      type="email"
                      placeholder="e.g. student@thomson.edu"
                      value={studentForm.email}
                      onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Contact Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. +91 98765 43210"
                      value={studentForm.phone}
                      onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Admission No</label>
                    <input
                      type="text"
                      placeholder="e.g. TS-2026-003"
                      value={studentForm.admission_no}
                      onChange={(e) => setStudentForm({ ...studentForm, admission_no: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Roll No</label>
                    <input
                      type="text"
                      placeholder="e.g. 103"
                      value={studentForm.roll_no}
                      onChange={(e) => setStudentForm({ ...studentForm, roll_no: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Address & Previous School */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 border-b border-indigo-50 pb-1">
                  2. Residential & Previous School Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1">Profile Picture URL</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={studentForm.profile_pic}
                      onChange={(e) => setStudentForm({ ...studentForm, profile_pic: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Previous School Name</label>
                    <input
                      type="text"
                      placeholder="e.g. St. Convent Academy"
                      value={studentForm.previous_school}
                      onChange={(e) => setStudentForm({ ...studentForm, previous_school: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block mb-1">Full Permanent Address</label>
                    <textarea
                      rows="2"
                      placeholder="Enter house no, street, city and pin code..."
                      value={studentForm.address}
                      onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Father, Mother & Guardian Details */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 border-b border-indigo-50 pb-1">
                  3. Parents & Guardian Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block mb-1">Father's Name</label>
                    <input
                      type="text"
                      placeholder="Father full name"
                      value={studentForm.father_name}
                      onChange={(e) => setStudentForm({ ...studentForm, father_name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Father Phone</label>
                    <input
                      type="text"
                      placeholder="+91..."
                      value={studentForm.father_phone}
                      onChange={(e) => setStudentForm({ ...studentForm, father_phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Father Occupation</label>
                    <input
                      type="text"
                      placeholder="Occupation"
                      value={studentForm.father_occupation}
                      onChange={(e) => setStudentForm({ ...studentForm, father_occupation: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Mother's Name</label>
                    <input
                      type="text"
                      placeholder="Mother full name"
                      value={studentForm.mother_name}
                      onChange={(e) => setStudentForm({ ...studentForm, mother_name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Mother Phone</label>
                    <input
                      type="text"
                      placeholder="+91..."
                      value={studentForm.mother_phone}
                      onChange={(e) => setStudentForm({ ...studentForm, mother_phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Mother Occupation</label>
                    <input
                      type="text"
                      placeholder="Occupation"
                      value={studentForm.mother_occupation}
                      onChange={(e) => setStudentForm({ ...studentForm, mother_occupation: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Guardian Name</label>
                    <input
                      type="text"
                      placeholder="Guardian name"
                      value={studentForm.guardian_name}
                      onChange={(e) => setStudentForm({ ...studentForm, guardian_name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Guardian Phone</label>
                    <input
                      type="text"
                      placeholder="+91..."
                      value={studentForm.guardian_phone}
                      onChange={(e) => setStudentForm({ ...studentForm, guardian_phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Relationship</label>
                    <input
                      type="text"
                      placeholder="e.g. Uncle / Grandfather"
                      value={studentForm.guardian_relation}
                      onChange={(e) => setStudentForm({ ...studentForm, guardian_relation: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowAddStudentModal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer">
                  Save Student Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Profile Preview Modal */}
      {showStudentDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={showStudentDetailModal.profile_pic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                  alt="Avatar"
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-sm"
                />
                <div>
                  <h3 className="text-base font-black text-slate-900">{showStudentDetailModal.first_name} {showStudentDetailModal.last_name}</h3>
                  <p className="text-xs font-semibold text-indigo-600">
                    Admission: {showStudentDetailModal.admission_no} | Roll: {showStudentDetailModal.roll_no}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowStudentDetailModal(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 font-medium max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
              <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                <div className="font-black text-slate-900 text-xs">Contact & Residence</div>
                <div><span className="font-bold text-slate-500">Email:</span> {showStudentDetailModal.email}</div>
                <div><span className="font-bold text-slate-500">Phone:</span> {showStudentDetailModal.phone}</div>
                <div><span className="font-bold text-slate-500">Address:</span> {showStudentDetailModal.address}</div>
                <div><span className="font-bold text-slate-500">Previous School:</span> {showStudentDetailModal.previous_school}</div>
              </div>

              <div className="p-3 bg-indigo-50/60 rounded-2xl space-y-1">
                <div className="font-black text-indigo-900 text-xs">Parents Information</div>
                <div><span className="font-bold text-slate-600">Father:</span> {showStudentDetailModal.father_name} ({showStudentDetailModal.father_occupation})</div>
                <div><span className="font-bold text-slate-600">Father Phone:</span> {showStudentDetailModal.father_phone}</div>
                <div className="pt-1"><span className="font-bold text-slate-600">Mother:</span> {showStudentDetailModal.mother_name} ({showStudentDetailModal.mother_occupation})</div>
                <div><span className="font-bold text-slate-600">Mother Phone:</span> {showStudentDetailModal.mother_phone}</div>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-2xl space-y-1">
                <div className="font-black text-emerald-900 text-xs">Guardian Information</div>
                <div><span className="font-bold text-slate-600">Guardian Name:</span> {showStudentDetailModal.guardian_name}</div>
                <div><span className="font-bold text-slate-600">Relationship:</span> {showStudentDetailModal.guardian_relation}</div>
                <div><span className="font-bold text-slate-600">Contact:</span> {showStudentDetailModal.guardian_phone}</div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowStudentDetailModal(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClassDirectoryView;
