import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, List, Grid, Tag, Clock, Save, X } from 'lucide-react';
import axios from 'axios';

const AnnualCalendar = () => {
    const [viewMode, setViewMode] = useState('grid');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    const currentYear = currentDate.getFullYear();
    const currentMonthIndex = currentDate.getMonth();
    const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });
    const currentMonthString = `${currentMonthName} ${currentYear}`;

    const [events, setEvents] = useState([
        { id: 1, title: 'Staff Training Day', date: '15', month: 'June', year: 2026, type: 'Event', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
        { id: 2, title: 'Parent-Teacher Meeting', date: '22', month: 'June', year: 2026, type: 'Meeting', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    ]);

    const [newEvent, setNewEvent] = useState({ title: '', startDate: '', endDate: '', type: 'School Event' });

    useEffect(() => {
        const fetchHolidays = async () => {
            try {
                const response = await axios.get(`https://date.nager.at/api/v3/PublicHolidays/${currentYear}/IN`);
                
                const apiHolidays = response.data.map((holiday, index) => {
                    const dateObj = new Date(holiday.date);
                    return {
                        id: `api-${holiday.date}-${index}`,
                        title: holiday.name,
                        date: dateObj.getDate().toString(),
                        month: dateObj.toLocaleString('default', { month: 'long' }),
                        year: dateObj.getFullYear(),
                        type: 'Public Holiday',
                        color: 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    };
                });
                
                setEvents(prev => {
                    const customEvents = prev.filter(e => !e.id.toString().startsWith('api-'));
                    return [...customEvents, ...apiHolidays];
                });
            } catch (error) {
                console.error("Failed to fetch Indian holidays", error);
            }
        };
        fetchHolidays();
    }, [currentYear]);

    const handleAddEvent = (e) => {
        e.preventDefault();
        setIsFormOpen(false);
        setNewEvent({ title: '', startDate: '', endDate: '', type: 'School Event' }); // reset
    };

    const calculateDuration = () => {
        if (!newEvent.startDate || !newEvent.endDate) return null;
        const start = new Date(newEvent.startDate);
        const end = new Date(newEvent.endDate);
        const diffTime = end - start;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return 'Invalid Date Range';
        return diffDays === 0 ? '1 Day' : `${diffDays + 1} Days`;
    };

    const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonthIndex + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonthIndex - 1, 1));

    const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonthIndex, 1).getDay();

    // Filter events for the current month being viewed
    const currentMonthEvents = events.filter(e => e.month === currentMonthName && e.year === currentYear)
                                     .sort((a, b) => parseInt(a.date) - parseInt(b.date));

    return (
        <div className="space-y-6 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-fuchsia-50 to-pink-50 p-6 rounded-3xl border border-fuchsia-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-700 to-pink-700 tracking-tight flex items-center gap-3">
                        <CalendarIcon className="w-8 h-8 text-fuchsia-600" />
                        Annual Calendar
                    </h1>
                    <p className="text-sm text-fuchsia-600/80 font-medium mt-1">Manage academic events and view Indian public holidays.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setIsFormOpen(true)}
                        className="inline-flex items-center gap-2 bg-fuchsia-600 text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-fuchsia-700 transition-all shadow-[0_4px_14px_0_rgba(192,38,211,0.39)] hover:shadow-[0_6px_20px_rgba(192,38,211,0.23)] hover:-translate-y-0.5">
                        <Plus className="w-4 h-4" /> Add Event
                    </button>
                </div>
            </div>

            {isFormOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-800">Add New Event</h2>
                            <button onClick={() => { setIsFormOpen(false); setNewEvent({ title: '', startDate: '', endDate: '', type: 'School Event' }); }} className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-xl transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAddEvent} className="p-6 space-y-6">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Event Title *</label>
                                <input type="text" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="block w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:ring-4 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 bg-slate-50 focus:bg-white outline-none transition-all placeholder:text-slate-400" placeholder="e.g. Science Fair" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Start Date *</label>
                                    <input type="date" value={newEvent.startDate} onChange={e => setNewEvent({...newEvent, startDate: e.target.value})} className="block w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:ring-4 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 bg-slate-50 focus:bg-white outline-none transition-all cursor-pointer" required />
                                </div>
                                <div>
                                    <label className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">
                                        End Date *
                                        {calculateDuration() && (
                                            <span className="text-fuchsia-600 font-extrabold normal-case bg-fuchsia-50 px-2 py-0.5 rounded-lg">{calculateDuration()}</span>
                                        )}
                                    </label>
                                    <input type="date" value={newEvent.endDate} onChange={e => setNewEvent({...newEvent, endDate: e.target.value})} className="block w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:ring-4 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 bg-slate-50 focus:bg-white outline-none transition-all cursor-pointer" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Event Type *</label>
                                <select value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value})} className="block w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:ring-4 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 bg-slate-50 focus:bg-white outline-none transition-all cursor-pointer">
                                    <option>School Event</option>
                                    <option>Meeting</option>
                                    <option>Exam</option>
                                </select>
                            </div>
                            <div className="pt-2 flex justify-end gap-3">
                                <button type="button" onClick={() => { setIsFormOpen(false); setNewEvent({ title: '', startDate: '', endDate: '', type: 'School Event' }); }} className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-all">
                                    Cancel
                                </button>
                                <button type="submit" disabled={calculateDuration() === 'Invalid Date Range'} className="flex items-center gap-2 px-6 py-2.5 bg-fuchsia-600 text-white rounded-2xl text-sm font-bold hover:bg-fuchsia-700 shadow-[0_4px_14px_0_rgba(192,38,211,0.39)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none">
                                    <Save className="w-4 h-4" /> Save Event
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white/70 backdrop-blur-xl p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 flex flex-col sm:flex-row gap-5 justify-between items-center transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                <div className="flex items-center gap-4 bg-white px-2 py-1.5 rounded-2xl border border-slate-200 shadow-sm">
                    <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="font-bold text-slate-800 text-lg w-36 text-center">{currentMonthString}</span>
                    <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                    <button 
                        onClick={() => setViewMode('grid')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'grid' ? 'bg-white text-fuchsia-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Grid className="w-4 h-4" /> Grid
                    </button>
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white text-fuchsia-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <List className="w-4 h-4" /> List
                    </button>
                </div>
            </div>

            {viewMode === 'list' ? (
                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 text-lg">Events for {currentMonthString}</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {currentMonthEvents.length > 0 ? currentMonthEvents.map((event) => (
                            <div key={event.id} className="p-6 flex items-center justify-between hover:bg-fuchsia-50/30 transition-colors group">
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-200 group-hover:border-fuchsia-200 group-hover:shadow-md transition-all">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{event.month.substring(0,3)}</span>
                                        <span className="text-2xl font-extrabold text-slate-800 leading-none">{event.date}</span>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-800 group-hover:text-fuchsia-700 transition-colors">{event.title}</h4>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                                <Clock className="w-3.5 h-3.5" /> All Day
                                            </span>
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${event.color}`}>
                                                {event.type}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button className="p-2 text-slate-400 hover:text-fuchsia-600 bg-white shadow-sm border border-slate-200 rounded-xl transition-colors">
                                    <Tag className="w-4 h-4" />
                                </button>
                            </div>
                        )) : (
                            <div className="p-12 text-center text-slate-400 font-medium">No events or holidays found for this month.</div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 p-6">
                    <div className="grid grid-cols-7 gap-4 mb-4">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                            <div key={idx} className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest py-2">
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2 sm:gap-4">
                        {[...Array(firstDayOfMonth)].map((_, i) => (
                            <div key={`empty-${i}`} className="h-24 sm:h-32 rounded-2xl bg-slate-50/50 border border-slate-100"></div>
                        ))}
                        {[...Array(daysInMonth)].map((_, i) => {
                            const date = i + 1;
                            const dayEvents = currentMonthEvents.filter(e => parseInt(e.date) === date);
                            const hasEvent = dayEvents.length > 0;
                            
                            return (
                                <div key={date} className={`h-24 sm:h-32 p-2 sm:p-3 rounded-2xl border transition-all ${
                                    hasEvent ? 'border-fuchsia-200 bg-fuchsia-50/30' : 'border-slate-200 hover:border-slate-300'
                                } flex flex-col cursor-pointer group hover:shadow-sm overflow-hidden`}>
                                    <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${
                                        hasEvent ? 'bg-fuchsia-600 text-white shadow-sm' : 'text-slate-700 group-hover:bg-slate-100'
                                    }`}>
                                        {date}
                                    </span>
                                    <div className="mt-auto space-y-1">
                                        {dayEvents.slice(0, 2).map(e => (
                                            <div key={e.id} title={e.title} className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-1 rounded-lg truncate border ${e.color}`}>
                                                {e.title}
                                            </div>
                                        ))}
                                        {dayEvents.length > 2 && (
                                            <div className="text-[10px] font-bold text-fuchsia-600 text-center">
                                                +{dayEvents.length - 2} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnnualCalendar;
