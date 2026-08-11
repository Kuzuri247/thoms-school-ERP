import React, { useState } from 'react';
import {
  Bus,
  MapPin,
  DollarSign,
  Plus,
  Search,
  Filter,
  Phone,
  UserCheck,
  Navigation,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Edit3,
  Trash2,
  Users,
  ShieldCheck
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

// Initial Mock Bus Fleet
const INITIAL_BUSES = [
  {
    id: 1,
    busNumber: 'BUS-01 (PB-10-AB-1234)',
    driverName: 'Harpreet Singh',
    driverPhone: '+91 98765 11111',
    helperName: 'Ramesh Kumar',
    capacity: 45,
    assignedStudents: 38,
    routeName: 'Route A - City Center to School'
  },
  {
    id: 2,
    busNumber: 'BUS-02 (PB-10-CD-5678)',
    driverName: 'Sukhwinder Singh',
    driverPhone: '+91 98765 22222',
    helperName: 'Mohan Lal',
    capacity: 50,
    assignedStudents: 44,
    routeName: 'Route B - Green Park to School'
  },
  {
    id: 3,
    busNumber: 'BUS-03 (PB-10-EF-9012)',
    driverName: 'Gurdeep Singh',
    driverPhone: '+91 98765 33333',
    helperName: 'Sunil Verma',
    capacity: 40,
    assignedStudents: 32,
    routeName: 'Route C - Model Town to School'
  }
];

// Initial Mock Pickup Point Routes with Fares (Price)
const INITIAL_ROUTES = [
  {
    id: 1,
    routeName: 'Route A - City Center to School',
    busAssigned: 'BUS-01 (PB-10-AB-1234)',
    stops: [
      { id: 101, stopName: 'Clock Tower / City Center', pickupTime: '07:15 AM', dropTime: '02:45 PM', fare: 1200 },
      { id: 102, stopName: 'Railway Station Chowk', pickupTime: '07:25 AM', dropTime: '02:35 PM', fare: 1400 },
      { id: 103, stopName: 'Civil Lines Bus Stand', pickupTime: '07:35 AM', dropTime: '02:25 PM', fare: 1500 },
      { id: 104, stopName: 'Thomson School Main Gate', pickupTime: '07:55 AM', dropTime: '02:05 PM', fare: 0 }
    ]
  },
  {
    id: 2,
    routeName: 'Route B - Green Park to School',
    busAssigned: 'BUS-02 (PB-10-CD-5678)',
    stops: [
      { id: 201, stopName: 'Green Park Main Gate', pickupTime: '07:10 AM', dropTime: '02:50 PM', fare: 1600 },
      { id: 202, stopName: 'Urban Estate Phase II', pickupTime: '07:22 AM', dropTime: '02:38 PM', fare: 1800 },
      { id: 203, stopName: 'Bypass Flyover Stop', pickupTime: '07:35 AM', dropTime: '02:25 PM', fare: 1900 },
      { id: 204, stopName: 'Thomson School Main Gate', pickupTime: '07:55 AM', dropTime: '02:05 PM', fare: 0 }
    ]
  }
];

// Initial Mock Allocated Students
const INITIAL_ALLOCATED_STUDENTS = [
  { id: 1, name: 'Aarav Sharma', rollNo: '1001', classSec: 'Class 10 - A', bus: 'BUS-01', stop: 'Railway Station Chowk', monthlyFare: 1400 },
  { id: 2, name: 'Ananya Verma', rollNo: '1002', classSec: 'Class 10 - A', bus: 'BUS-02', stop: 'Green Park Main Gate', monthlyFare: 1600 },
  { id: 3, name: 'Rohan Gupta', rollNo: '9001', classSec: 'Class 9 - B', bus: 'BUS-01', stop: 'Clock Tower / City Center', monthlyFare: 1200 },
  { id: 4, name: 'Priya Malhotra', rollNo: '8005', classSec: 'Class 8 - A', bus: 'BUS-02', stop: 'Urban Estate Phase II', monthlyFare: 1800 }
];

const TransportManagementView = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('routes'); // 'routes', 'buses', 'students'

  // Fleet & Routes State
  const [buses, setBuses] = useState(INITIAL_BUSES);
  const [routes, setRoutes] = useState(INITIAL_ROUTES);
  const [allocatedStudents, setAllocatedStudents] = useState(INITIAL_ALLOCATED_STUDENTS);

  // Modals
  const [showAddBusModal, setShowAddBusModal] = useState(false);
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);

  // New Bus State
  const [newBus, setNewBus] = useState({
    busNumber: '',
    driverName: '',
    driverPhone: '',
    helperName: '',
    capacity: 45,
    routeName: ''
  });

  // New Route & Pickup Points State
  const [newRoute, setNewRoute] = useState({
    routeName: '',
    busAssigned: '',
    stops: [
      { id: Date.now(), stopName: '', pickupTime: '07:30 AM', dropTime: '02:30 PM', fare: 1500 }
    ]
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [notificationMsg, setNotificationMsg] = useState('');

  // Handle Add Bus
  const handleAddBusSubmit = (e) => {
    e.preventDefault();
    if (!newBus.busNumber || !newBus.driverName) return;

    const b = {
      id: Date.now(),
      ...newBus,
      capacity: Number(newBus.capacity),
      assignedStudents: 0
    };

    setBuses([...buses, b]);
    setShowAddBusModal(false);
    setNotificationMsg(`Bus ${newBus.busNumber} added to fleet successfully!`);
    setNewBus({ busNumber: '', driverName: '', driverPhone: '', helperName: '', capacity: 45, routeName: '' });
    setTimeout(() => setNotificationMsg(''), 3500);
  };

  // Add Pickup Point Stop input inside New Route Modal
  const handleAddStopField = () => {
    setNewRoute({
      ...newRoute,
      stops: [
        ...newRoute.stops,
        { id: Date.now(), stopName: '', pickupTime: '07:30 AM', dropTime: '02:30 PM', fare: 1500 }
      ]
    });
  };

  const handleStopChange = (index, field, value) => {
    const updatedStops = [...newRoute.stops];
    updatedStops[index][field] = field === 'fare' ? Number(value) : value;
    setNewRoute({ ...newRoute, stops: updatedStops });
  };

  // Handle Add Route
  const handleAddRouteSubmit = (e) => {
    e.preventDefault();
    if (!newRoute.routeName || newRoute.stops.length === 0) return;

    const r = {
      id: Date.now(),
      ...newRoute
    };

    setRoutes([...routes, r]);
    setShowAddRouteModal(false);
    setNotificationMsg(`Transport Route "${newRoute.routeName}" & Pickup Fares added successfully!`);
    setNewRoute({
      routeName: '',
      busAssigned: '',
      stops: [{ id: Date.now(), stopName: '', pickupTime: '07:30 AM', dropTime: '02:30 PM', fare: 1500 }]
    });
    setTimeout(() => setNotificationMsg(''), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/80 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
              <Bus className="w-6 h-6" />
            </div>
            Transport & Bus Fleet Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage school buses, pickup-to-drop routes, stop-wise monthly fare prices, and student transport allocations.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('routes')}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'routes'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" /> Pickup Points & Fares ({routes.length})
          </button>
          <button
            onClick={() => setActiveTab('buses')}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'buses'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bus className="w-3.5 h-3.5" /> Bus Fleet ({buses.length})
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'students'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Student Allocations ({allocatedStudents.length})
          </button>
          <button
            onClick={() => setActiveTab('slabs')}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'slabs'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" /> Transport Fee Slabs (2026–27)
          </button>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          {notificationMsg}
        </div>
      )}

      {/* --- TAB 1: PICKUP POINTS & FARES --- */}
      {activeTab === 'routes' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center bg-white p-5 rounded-3xl border border-slate-200/80">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Pickup Points, Route Schedule & Price/Fare Setup</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Configure pickup locations, timings, and stop-to-stop monthly fares.</p>
            </div>
            <button
              onClick={() => setShowAddRouteModal(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Route & Pickup Points
            </button>
          </div>

          <div className="space-y-6">
            {routes.map((rt) => (
              <div key={rt.id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-3 gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
                      <Navigation className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">{rt.routeName}</h3>
                      <span className="text-[11px] font-bold text-slate-500">Assigned Vehicle: {rt.busAssigned || 'Not Assigned'}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-black">
                    {rt.stops.length} Pickup Stops
                  </span>
                </div>

                {/* Stops & Fares Table */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Stop #</th>
                        <th className="py-3 px-4">Pickup Location Name</th>
                        <th className="py-3 px-4">Morning Pickup</th>
                        <th className="py-3 px-4">Afternoon Drop</th>
                        <th className="py-3 px-4 text-right">Monthly Transport Fare (Price)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {rt.stops.map((stop, index) => (
                        <tr key={stop.id} className="hover:bg-slate-50/60 font-semibold text-slate-800">
                          <td className="py-3 px-4">
                            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-extrabold text-[10px] inline-flex items-center justify-center">
                              {index + 1}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-amber-500" />
                            {stop.stopName}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">{stop.pickupTime}</td>
                          <td className="py-3 px-4 font-mono text-slate-600">{stop.dropTime}</td>
                          <td className="py-3 px-4 text-right font-black text-emerald-700">
                            {stop.fare > 0 ? `₹ ${stop.fare.toLocaleString()} / mo` : 'School Terminal (Free)'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 2: BUS FLEET --- */}
      {activeTab === 'buses' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center bg-white p-5 rounded-3xl border border-slate-200/80">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">School Bus Fleet Directory</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Manage buses, driver details, helper contacts, and seating capacities.</p>
            </div>
            <button
              onClick={() => setShowAddBusModal(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add New Bus
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {buses.map((b) => (
              <div key={b.id} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 hover:border-amber-300 transition">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-100 text-amber-800 rounded-xl font-bold">
                      <Bus className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-900">{b.busNumber}</h3>
                      <span className="text-[10px] font-bold text-slate-500">{b.routeName}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs font-semibold text-slate-700">
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                    <span className="text-slate-500 text-[10px]">Driver Name</span>
                    <span className="font-bold text-slate-900">{b.driverName}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                    <span className="text-slate-500 text-[10px]">Driver Phone</span>
                    <span className="font-mono font-bold text-amber-700 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {b.driverPhone}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                    <span className="text-slate-500 text-[10px]">Helper / Conductor</span>
                    <span className="font-bold text-slate-900">{b.helperName}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                    <span className="text-slate-500 text-[10px]">Capacity / Assigned</span>
                    <span className="font-black text-slate-900">
                      {b.assignedStudents} / {b.capacity} Seats
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 3: STUDENT ALLOCATIONS --- */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden p-5 space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Student Transport Allocations & Fare Status</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">List of students assigned to transport routes with monthly price rates.</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Roll No</th>
                  <th className="py-3 px-4">Class & Section</th>
                  <th className="py-3 px-4">Assigned Bus</th>
                  <th className="py-3 px-4">Pickup Point Location</th>
                  <th className="py-3 px-4 text-right">Monthly Transport Fare</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {allocatedStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/60 font-semibold text-slate-800">
                    <td className="py-3 px-4 font-extrabold text-slate-900">{st.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{st.rollNo}</td>
                    <td className="py-3 px-4 font-bold text-slate-700">{st.classSec}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-[10px] font-black">
                        {st.bus}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" /> {st.stop}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-emerald-700">₹ {st.monthlyFare.toLocaleString()} / mo</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Official Transport Fee Slabs (2026-27) */}
      {activeTab === 'slabs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Bus className="w-5 h-5 text-amber-600" /> Transport Fee Structure (2026–27)
              </h2>
              <p className="text-xs text-slate-500 mt-1">Official STIS Varanasi quarterly distance slab fee rates</p>
            </div>
            <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold">
              Academic Session 2026-2027
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-amber-900 text-white uppercase text-xs font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 text-center">S.No</th>
                  <th className="py-3.5 px-6">Distance (KM)</th>
                  <th className="py-3.5 px-6 text-center" colSpan="4">Quarterly Fee (₹)</th>
                </tr>
                <tr className="bg-amber-950 text-amber-200 text-[11px] font-bold text-center border-t border-amber-800">
                  <th></th>
                  <th></th>
                  <th className="py-2 px-4">Apr-Jun</th>
                  <th className="py-2 px-4">Jul-Sep</th>
                  <th className="py-2 px-4">Oct-Dec</th>
                  <th className="py-2 px-4">Jan-Mar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-semibold text-slate-800 text-center">
                {[
                  { sno: 1, dist: '0–2', fee: 3825 },
                  { sno: 2, dist: '2–4', fee: 3975 },
                  { sno: 3, dist: '4–6', fee: 4125 },
                  { sno: 4, dist: '6–8', fee: 4275 },
                  { sno: 5, dist: '8–10', fee: 4425 },
                  { sno: 6, dist: '10–12', fee: 4575 },
                  { sno: 7, dist: '12–14', fee: 4725 },
                  { sno: 8, dist: '14–16', fee: 4875 },
                  { sno: 9, dist: '16–18', fee: 5025 },
                  { sno: 10, dist: '18–20', fee: 5175 },
                ].map((row) => (
                  <tr key={row.sno} className="hover:bg-amber-50/50 transition-colors">
                    <td className="py-3 px-4 font-extrabold text-slate-600">{row.sno}</td>
                    <td className="py-3 px-6 text-left font-bold text-slate-900">{row.dist}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">₹{row.fee.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">₹{row.fee.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">₹{row.fee.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">₹{row.fee.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
            <p className="font-bold text-slate-800 mb-1.5">Official Transport Terms & Conditions:</p>
            <p>• Transport fee is charged quarterly (April, July, October, January).</p>
            <p>• Routes & distance slabs decided by school transport authority.</p>
            <p>• Transport facility subject to availability.</p>
            <p>• Once opted, transport is compulsory for full academic session.</p>
          </div>
        </div>
      )}

      {/* Modal: Add Bus */}
      {showAddBusModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Bus className="w-5 h-5 text-amber-600" /> Register New Bus in Fleet
              </h3>
              <button onClick={() => setShowAddBusModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBusSubmit} className="space-y-3 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1">Bus / Vehicle Registration Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BUS-04 (PB-10-XY-9999)"
                  value={newBus.busNumber}
                  onChange={(e) => setNewBus({ ...newBus, busNumber: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Driver Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full name"
                    value={newBus.driverName}
                    onChange={(e) => setNewBus({ ...newBus, driverName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1">Driver Contact Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765..."
                    value={newBus.driverPhone}
                    onChange={(e) => setNewBus({ ...newBus, driverPhone: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Helper / Conductor Name</label>
                  <input
                    type="text"
                    placeholder="Helper name"
                    value={newBus.helperName}
                    onChange={(e) => setNewBus({ ...newBus, helperName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1">Seating Capacity</label>
                  <input
                    type="number"
                    value={newBus.capacity}
                    onChange={(e) => setNewBus({ ...newBus, capacity: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddBusModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 text-white font-extrabold rounded-xl hover:bg-amber-600 transition shadow-md cursor-pointer"
                >
                  Save Bus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Route & Pickup Points */}
      {showAddRouteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-600" /> Create Pickup Route & Price / Fare Setup
              </h3>
              <button onClick={() => setShowAddRouteModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRouteSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Route Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Route D - Southern Express"
                    value={newRoute.routeName}
                    onChange={(e) => setNewRoute({ ...newRoute, routeName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1">Assign Bus Vehicle</label>
                  <select
                    value={newRoute.busAssigned}
                    onChange={(e) => setNewRoute({ ...newRoute, busAssigned: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                  >
                    <option value="">Select Bus</option>
                    {buses.map(b => <option key={b.id} value={b.busNumber}>{b.busNumber}</option>)}
                  </select>
                </div>
              </div>

              {/* Dynamic Stop Inputs */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-slate-900 uppercase">Pickup Points & Fares (Price)</span>
                  <button
                    type="button"
                    onClick={handleAddStopField}
                    className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 font-extrabold text-[10px] rounded-lg hover:bg-amber-100 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Stop
                  </button>
                </div>

                {newRoute.stops.map((stop, index) => (
                  <div key={stop.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Stop Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Main Chowk"
                        value={stop.stopName}
                        onChange={(e) => handleStopChange(index, 'stopName', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Morning Pickup</label>
                      <input
                        type="text"
                        value={stop.pickupTime}
                        onChange={(e) => handleStopChange(index, 'pickupTime', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Afternoon Drop</label>
                      <input
                        type="text"
                        value={stop.dropTime}
                        onChange={(e) => handleStopChange(index, 'dropTime', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Monthly Price (₹) *</label>
                      <input
                        type="number"
                        required
                        placeholder="1500"
                        value={stop.fare}
                        onChange={(e) => handleStopChange(index, 'fare', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-emerald-700 outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddRouteModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 text-white font-extrabold rounded-xl hover:bg-amber-600 transition shadow-md cursor-pointer"
                >
                  Save Route & Fares
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportManagementView;
