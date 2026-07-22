import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  GraduationCap,
  Bell,
  BookOpen,
  Award,
  Bus,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Calendar,
  LogIn
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SchoolLandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicNotices();
  }, []);

  const fetchPublicNotices = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/notices`);
      setNotices(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load public notices:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      {/* Ambient Mesh Glow Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-indigo-600/20 via-violet-600/10 to-transparent blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-[800px] -left-40 w-96 h-96 bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Navbar Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/20">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-white tracking-tight block leading-none">
                Thomson School
              </span>
              <span className="text-[11px] text-indigo-400 font-semibold tracking-wider uppercase">
                Excellence in Education
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-300">
            <a href="#home" className="hover:text-white transition-colors">Home</a>
            <a href="#notices" className="hover:text-white transition-colors flex items-center gap-1">
              <Bell className="w-3.5 h-3.5 text-amber-400" /> Notice Board
            </a>
            <a href="#academics" className="hover:text-white transition-colors">Academics</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
              >
                Go to Portal <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" /> Sign In to ERP
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold animate-in fade-in">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Welcome to Thomson Public School • Admissions 2026 Open</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
          Nurturing Leaders for <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-pink-400 bg-clip-text text-transparent">
            Tomorrow's World
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-slate-400 text-sm sm:text-base font-medium leading-relaxed">
          Thomson School provides a holistic education empowering students with academic rigor, ethical values, modern STEM innovation, and vibrant sports programs.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            Access ERP Portal <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#notices"
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-extrabold text-sm rounded-2xl transition flex items-center justify-center gap-2"
          >
            <Bell className="w-4 h-4 text-amber-400" /> View Announcements
          </a>
        </div>
      </section>

      {/* Announcements & Notice Board Section */}
      <section id="notices" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-slate-800 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Bell className="w-4 h-4" /> Official Notice Board
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Public Announcements & Updates</h2>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-full">
            {notices.length} Published Notices
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notices.length === 0 ? (
            <div className="col-span-full p-8 bg-slate-900/60 rounded-3xl border border-slate-800 text-center text-slate-400 text-sm font-medium">
              No public announcements posted at this moment. Check back soon.
            </div>
          ) : (
            notices.map((notice) => (
              <div
                key={notice.id}
                className="p-6 bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-slate-800/80 shadow-lg hover:border-indigo-500/50 transition duration-300 space-y-3 flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-3 py-1 rounded-full font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {notice.notice_type || 'General'}
                    </span>
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {notice.publish_date ? new Date(notice.publish_date).toLocaleDateString() : 'Today'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {notice.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    {notice.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* School Features & Pillars Section */}
      <section id="academics" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Why Choose Thomson</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Comprehensive Educational Ecosystem</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-slate-900/50 rounded-3xl border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Academic Excellence</h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Curriculum designed to foster critical thinking, STEM mastery, and global communication skills.
            </p>
          </div>

          <div className="p-6 bg-slate-900/50 rounded-3xl border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Sports & Activities</h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              State-of-the-art sports facilities, athletics, arts, and leadership programs.
            </p>
          </div>

          <div className="p-6 bg-slate-900/50 rounded-3xl border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Bus className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Safe Transport Network</h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              GPS-enabled school buses with verified drivers covering all major transit routes.
            </p>
          </div>

          <div className="p-6 bg-slate-900/50 rounded-3xl border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Integrated ERP Portal</h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Real-time portal access for students, parents, teachers, and administration.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer id="contact" className="border-t border-slate-800/80 pt-12 pb-8 bg-slate-950 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-indigo-400" />
              <span className="text-base font-extrabold text-white">Thomson Public School</span>
            </div>
            <p className="text-slate-500 font-medium">Empowering minds, building character, and shaping future leaders.</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold text-white uppercase tracking-wider">Contact Administration</h4>
            <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-indigo-400" /> 100 Thomson Campus Road, Educational Zone</p>
            <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-indigo-400" /> +91 (080) 2345-6789</p>
            <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-indigo-400" /> admissions@thoms.edu</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold text-white uppercase tracking-wider">Portal Quick Link</h4>
            <Link to="/login" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition">
              Sign In to ERP Portal <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-900 pt-6 text-center text-slate-600 font-medium">
          © {new Date().getFullYear()} Thomson Public School. All rights reserved. Powered by Thomson ERP System.
        </div>
      </footer>
    </div>
  );
};

export default SchoolLandingPage;
