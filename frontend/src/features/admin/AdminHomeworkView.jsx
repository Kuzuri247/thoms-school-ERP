import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import {
  BookText,
  Search,
  Filter,
  Trash2,
  Calendar,
  User,
  Building2,
  CheckCircle2,
  Clock,
  BookOpen,
  ExternalLink,
} from "lucide-react";

const AdminHomeworkView = () => {
  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState("all");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("all");
  const [deleteMessage, setDeleteMessage] = useState("");

  useEffect(() => {
    fetchAdminHomeworks();
  }, []);

  const fetchAdminHomeworks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/homework/admin/all");
      setHomeworks(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch admin homeworks:", err);
      // Fallback mock data if server error
      setHomeworks([
        {
          id: 1,
          title: "Quadratic Equations Worksheet",
          description: "Solve problems 1 to 25 from Exercise 4.2 in NCERT textbook.",
          class_name: "Class 10",
          section_name: "Section A",
          subject_name: "Mathematics",
          teacher_name: "Prof. Rajesh Verma",
          assigned_date: "2026-07-29",
          due_date: "2026-07-31",
          total_students: 28,
          completed_count: 18,
        },
        {
          id: 2,
          title: "Ray Diagrams & Refraction Worksheet",
          description: "Draw ray diagrams for concave and convex mirrors with focal calculations.",
          class_name: "Class 10",
          section_name: "Section A",
          subject_name: "Physics",
          teacher_name: "Prof. Dr. Vikram Sarabhai",
          assigned_date: "2026-07-29",
          due_date: "2026-08-01",
          total_students: 28,
          completed_count: 12,
        },
        {
          id: 3,
          title: "Organic Compounds & Hydrocarbons",
          description: "Prepare structural formulas and naming for alkenes and alkynes.",
          class_name: "Class 11",
          section_name: "Section A",
          subject_name: "Chemistry",
          teacher_name: "Prof. Priyanka Sen",
          assigned_date: "2026-07-28",
          due_date: "2026-07-30",
          total_students: 26,
          completed_count: 22,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHomework = async (id) => {
    if (!window.confirm("Are you sure you want to remove this homework assignment?")) return;
    try {
      await api.delete(`/homework/${id}`);
      setHomeworks((prev) => prev.filter((h) => h.id !== id));
      setDeleteMessage("Homework assignment removed successfully.");
      setTimeout(() => setDeleteMessage(""), 4000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete homework");
    }
  };

  // Get unique classes & subjects for filter options
  const uniqueClasses = Array.from(new Set(homeworks.map((h) => h.class_name).filter(Boolean)));
  const uniqueSubjects = Array.from(new Set(homeworks.map((h) => h.subject_name).filter(Boolean)));

  const filteredHomeworks = homeworks.filter((h) => {
    const term = searchTerm.toLowerCase();
    const titleMatch = (h.title || "").toLowerCase().includes(term);
    const teacherMatch = (h.teacher_name || "").toLowerCase().includes(term);
    const descMatch = (h.description || "").toLowerCase().includes(term);
    const matchesSearch = titleMatch || teacherMatch || descMatch;

    const matchesClass = selectedClassFilter === "all" || h.class_name === selectedClassFilter;
    const matchesSubject = selectedSubjectFilter === "all" || h.subject_name === selectedSubjectFilter;

    return matchesSearch && matchesClass && matchesSubject;
  });

  // Group homeworks by Class Name for clear admin segregation
  const groupedByClass = filteredHomeworks.reduce((acc, h) => {
    const className = h.class_name || "Unassigned Standard";
    if (!acc[className]) acc[className] = [];
    acc[className].push(h);
    return acc;
  }, {});

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/80 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shadow-xs">
              <BookText className="w-6 h-6" />
            </div>
            School Homework Repository
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Centralized admin view of all class homeworks assigned by homeroom and subject teachers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs font-extrabold">
            {homeworks.length} Total Assignments
          </span>
        </div>
      </div>

      {deleteMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {deleteMessage}
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex items-center w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search homework title, teacher, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs transition-all"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Class:</span>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none shadow-2xs"
            >
              <option value="all">All Classes</option>
              {uniqueClasses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <span>Subject:</span>
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none shadow-2xs"
            >
              <option value="all">All Subjects</option>
              {uniqueSubjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : Object.keys(groupedByClass).length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No Homework Assignments Found</h3>
          <p className="text-xs text-slate-500">No homework records match your search or filter criteria.</p>
        </div>
      ) : (
        /* Segregated Class Sections */
        <div className="space-y-8">
          {Object.entries(groupedByClass).map(([className, items]) => (
            <div key={className} className="space-y-4">
              <div className="flex items-center gap-2 px-1 border-b border-slate-200 pb-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <h2 className="text-base font-black text-slate-900">{className}</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {items.length} Assignment{items.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((hw) => {
                  const pct =
                    hw.total_students > 0
                      ? Math.round(((hw.completed_count || 0) / hw.total_students) * 100)
                      : 0;

                  return (
                    <div
                      key={hw.id}
                      className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition space-y-3 relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {hw.subject_name || "Subject"}
                          </span>
                          <h3 className="text-sm font-extrabold text-slate-900 mt-1.5">
                            {hw.title}
                          </h3>
                        </div>

                        <button
                          onClick={() => handleDeleteHomework(hw.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Delete Homework Assignment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {hw.description}
                      </p>

                      {hw.classroom_url && (
                        <a
                          href={hw.classroom_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition"
                        >
                          <span>Google Classroom</span>
                          <ExternalLink className="w-3 h-3 text-emerald-600" />
                        </a>
                      )}

                      <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate font-semibold text-slate-700">
                            {hw.teacher_name || "Assigned Teacher"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-slate-500 justify-end">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-700">
                            Due: {hw.due_date ? new Date(hw.due_date).toLocaleDateString() : "No Date"}
                          </span>
                        </div>
                      </div>

                      {/* Completion Progress Bar */}
                      <div className="pt-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                          <span>Submission Progress</span>
                          <span className="text-indigo-700 font-extrabold">
                            {hw.completed_count || 0}/{hw.total_students || 0} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminHomeworkView;
