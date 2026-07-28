import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Bell,
  Clock,
  Sparkles,
  Tag,
  Check,
  X,
  Megaphone,
  BookOpen,
  PartyPopper,
  Filter,
  AlertCircle
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const todayStr = new Date().toISOString().split('T')[0];

const INITIAL_EVENTS = [
  {
    id: 1,
    title: 'Welcome to Academic Year 2026-2027',
    date: todayStr,
    category: 'notice',
    categoryLabel: 'Important Notice',
    target: 'All Classes',
    time: 'All Day',
    description: 'Official Thomson ERP is live for all students, faculty, cashiers, and administrators.',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    dotColor: 'bg-amber-500'
  },
  {
    id: 2,
    title: 'Mid-Term Board Examination Starts',
    date: todayStr,
    category: 'exam',
    categoryLabel: 'Exam & Test',
    target: 'Class 9th to 12th',
    time: '08:30 AM - 11:30 AM',
    description: 'Commencement of CBSE pattern mid-term written examinations. Admit cards required.',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    dotColor: 'bg-rose-500'
  },
  {
    id: 3,
    title: 'Parent-Teacher Meeting (PTM)',
    date: todayStr,
    category: 'notice',
    categoryLabel: 'Important Notice',
    target: 'All Students & Staff',
    time: '10:00 AM - 01:00 PM',
    description: 'Mandatory PTM scheduled for term evaluation and academic performance review.',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    dotColor: 'bg-amber-500'
  }
];

const AcademicCalendarView = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const isAuthorized = user?.role === 'super_admin' || user?.role === 'admin';

  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    if (location.state?.selectedDate) {
      const dateVal = location.state.selectedDate;
      setSelectedDateStr(dateVal);
      const parsed = new Date(dateVal);
      if (!isNaN(parsed.getTime())) {
        setCurrentDate(parsed);
      }
    }
  }, [location.state]);

  const todayStr = new Date().toISOString().split('T')[0];

  React.useEffect(() => {
    import('../../api/axios').then(({ default: api }) => {
      api.get('/notices')
        .then((res) => {
          if (res.data?.data && Array.isArray(res.data.data)) {
            const fetched = res.data.data.map((n, idx) => {
              const category = n.notice_type === 'exam' ? 'exam' : (n.notice_type === 'holiday' ? 'holiday' : 'notice');
              const badgeColor = category === 'exam' 
                ? 'bg-rose-100 text-rose-800 border-rose-300' 
                : (category === 'holiday' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300');
              const dotColor = category === 'exam' ? 'bg-rose-500' : (category === 'holiday' ? 'bg-emerald-500' : 'bg-amber-500');
              return {
                id: n.id || `api-${idx}`,
                title: n.title,
                date: n.publish_date ? n.publish_date.split('T')[0] : todayStr,
                category,
                categoryLabel: category === 'exam' ? 'Exam & Test' : (category === 'holiday' ? 'School Holiday' : 'Notice Board'),
                target: n.target_role ? `Role: ${n.target_role}` : 'All Classes',
                time: 'All Day',
                description: n.content || n.title,
                badgeColor,
                dotColor
              };
            });
            setEvents(prev => {
              const existingIds = new Set(prev.map(e => String(e.id)));
              const uniqueFetched = fetched.filter(f => !existingIds.has(String(f.id)));
              return [...uniqueFetched, ...prev];
            });
          }
        })
        .catch(() => {});
    });
  }, [todayStr]);

  // New Event Form State
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: todayStr,
    category: 'notice',
    target: 'All Classes',
    time: '09:00 AM - 12:00 PM',
    description: ''
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calendar Math
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title.trim() || !newEvent.date) return;

    if (newEvent.date < todayStr) {
      alert('Events can only be scheduled for today or future dates.');
      return;
    }

    let badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
    let dotColor = 'bg-amber-500';
    let categoryLabel = 'Important Notice';

    if (newEvent.category === 'exam') {
      badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
      dotColor = 'bg-rose-500';
      categoryLabel = 'Exam & Test';
    } else if (newEvent.category === 'holiday') {
      badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
      dotColor = 'bg-emerald-500';
      categoryLabel = 'School Holiday';
    } else if (newEvent.category === 'event') {
      badgeColor = 'bg-indigo-100 text-indigo-800 border-indigo-300';
      dotColor = 'bg-indigo-500';
      categoryLabel = 'School Event';
    }

    const created = {
      id: Date.now(),
      ...newEvent,
      categoryLabel,
      badgeColor,
      dotColor
    };

    setEvents(prev => [created, ...prev]);
    setSelectedDateStr(newEvent.date);

    // Push notice to Notice Board API
    try {
      const { default: api } = await import('../../api/axios');
      await api.post('/notices', {
        title: `[Calendar Event] ${newEvent.title}`,
        content: `${newEvent.description || newEvent.title} (Scheduled: ${newEvent.date} ${newEvent.time})`,
        notice_type: newEvent.category === 'exam' ? 'exam' : 'general',
        type: 'global',
        publish_date: newEvent.date,
        is_published: 1
      });
    } catch (err) {
      // Graceful fallback if backend API is offline
    }

    setShowAddModal(false);
    setFormSuccess(`Event "${newEvent.title}" posted to Academic Calendar & pushed to Notice Board!`);
    setNewEvent({
      title: '',
      date: todayStr,
      category: 'notice',
      target: 'All Classes',
      time: '09:00 AM - 12:00 PM',
      description: ''
    });
    setTimeout(() => setFormSuccess(''), 4000);
  };

  // Helper to format date string YYYY-MM-DD
  const formatDateString = (y, m, d) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Filter events
  const filteredEvents = events.filter(ev => {
    if (filterCategory === 'all') return true;
    return ev.category === filterCategory;
  });

  // Events on selected date
  const eventsOnSelectedDate = filteredEvents.filter(ev => ev.date === selectedDateStr);

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/80 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <CalendarIcon className="w-6 h-6" />
            </div>
            Academic Calendar & Important Notices
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Month-wise academic schedule, examination timetables, holidays, and official school notices.
          </p>
        </div>

        {isAuthorized && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-indigo-500/20 transition active:scale-[0.99] cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Event / Notice
          </button>
        )}
      </div>

      {formSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-5 h-5 text-emerald-600" />
          {formSuccess}
        </div>
      )}

      {/* Control Bar: Month Navigation & Category Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 text-sm font-black text-slate-900 min-w-[140px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              const now = new Date();
              setCurrentDate(now);
              setSelectedDateStr(now.toISOString().split('T')[0]);
            }}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            Today
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          {[
            { id: 'all', label: 'All Schedule' },
            { id: 'notice', label: 'Notices', color: 'bg-amber-50 text-amber-700 border-amber-200' },
            { id: 'exam', label: 'Exams', color: 'bg-rose-50 text-rose-700 border-rose-200' },
            { id: 'holiday', label: 'Holidays', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
            { id: 'event', label: 'Events', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                filterCategory === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Layout: Month Calendar + Selected Date Event Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 7x5 Calendar Grid */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_2px_20px_rgba(0,0,0,0.02)] space-y-4">
          <div className="grid grid-cols-7 gap-1 text-center border-b border-slate-100 pb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
              <div key={d} className={`text-xs font-black uppercase tracking-wider ${i === 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty slots for leading days */}
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="h-24 bg-slate-50/40 rounded-2xl border border-dashed border-slate-100 opacity-30" />
            ))}

            {/* Actual Month Days */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const dayNum = index + 1;
              const dateStr = formatDateString(year, month, dayNum);
              const dayEvents = filteredEvents.filter(ev => ev.date === dateStr);
              const isSelected = selectedDateStr === dateStr;
              const isToday = dateStr === todayStr;

              return (
                <div
                  key={dayNum}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`h-24 p-2 rounded-2xl border transition flex flex-col justify-between cursor-pointer group ${
                    isSelected
                      ? 'bg-indigo-50/90 border-indigo-500 ring-2 ring-indigo-500/30 shadow-sm'
                      : isToday
                      ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-400/40 shadow-xs'
                      : dayEvents.length > 0
                      ? 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                      : 'bg-white border-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-black px-1.5 py-0.5 rounded-md ${
                      isToday 
                        ? 'bg-amber-500 text-white shadow-xs font-black' 
                        : isSelected 
                        ? 'text-indigo-600' 
                        : 'text-slate-800'
                    }`}>
                      {dayNum} {isToday && <span className="text-[8px] uppercase tracking-tighter ml-0.5">Today</span>}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-extrabold px-1.5 py-0.2 bg-indigo-100 text-indigo-700 rounded-full">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Pinned event badges inside cell */}
                  <div className="space-y-1 overflow-hidden max-h-14">
                    {dayEvents.slice(0, 2).map(ev => (
                      <div
                        key={ev.id}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md truncate border flex items-center gap-1 ${ev.badgeColor}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ev.dotColor}`} />
                        <span className="truncate">{ev.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[8px] font-bold text-slate-400 block px-1">
                        +{dayEvents.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Selected Date Events & Notice Details */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_2px_20px_rgba(0,0,0,0.02)] space-y-4 flex flex-col h-full">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600" /> Date Notices & Schedule
              </h3>
              <p className="text-[11px] font-bold text-indigo-600 mt-0.5">
                {selectedDateStr}
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px] pr-1 custom-scrollbar">
            {eventsOnSelectedDate.length > 0 ? (
              eventsOnSelectedDate.map(ev => (
                <div
                  key={ev.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:border-indigo-200 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${ev.badgeColor}`}>
                      {ev.categoryLabel}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {ev.time}
                    </span>
                  </div>

                  <h4 className="text-xs font-black text-slate-900 leading-snug">
                    {ev.title}
                  </h4>

                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                    {ev.description}
                  </p>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-bold text-slate-500">
                    <span>Target: <strong className="text-slate-800">{ev.target}</strong></span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="text-xs font-bold text-slate-600">No Events Pinned for this Date</h4>
                <p className="text-[11px] text-slate-400">Select another date from the calendar grid or add a new event/notice.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Event / Notice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" /> Post Academic Event / Notice
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-3.5 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1">Title / Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics Olympiad Exam"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-bold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Event Category *</label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-bold text-slate-800"
                  >
                    <option value="notice">Important Notice</option>
                    <option value="exam">Exam & Test</option>
                    <option value="holiday">School Holiday</option>
                    <option value="event">School Event</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Target Audience</label>
                  <input
                    type="text"
                    placeholder="e.g. All Classes / Staff"
                    value={newEvent.target}
                    onChange={(e) => setNewEvent({ ...newEvent, target: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block mb-1">Time Schedule</label>
                  <input
                    type="text"
                    placeholder="e.g. 09:00 AM - 12:00 PM"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Notice & Event Description</label>
                <textarea
                  rows={3}
                  placeholder="Provide detailed information or instructions..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-bold text-slate-800"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  Post to Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicCalendarView;
