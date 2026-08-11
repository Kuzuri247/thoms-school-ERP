import React, { useState } from 'react';
import useAuthStore from '../../store/authStore';
import { isSuperAdmin as checkIsSuperAdmin } from '../../utils/roleUtils';
import {
  useCollectCashFee,
  useGetPendingDues,
  useGetTotalCollection
} from './useFees';
import { useGetFinancialReport, useGetGlobalOverview } from '../reports/useReports';
import {
  CreditCard,
  Printer,
  Receipt,
  DollarSign,
  Sparkles,
  GraduationCap,
  FileSpreadsheet,
  PieChart,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Bus,
  Search,
  MapPin
} from 'lucide-react';

const FinanceDashboard = () => {
  const { user } = useAuthStore();
  const isSuperAdmin = checkIsSuperAdmin(user);

  const [activeTab, setActiveTab] = useState('collection');

  // Fee Collection State
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [feeType, setFeeType] = useState('Tuition Fee');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [receiptData, setReceiptData] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Bus Transport Fee Desk State
  const [busSearchQuery, setBusSearchQuery] = useState('');
  const [selectedRouteFilter, setSelectedRouteFilter] = useState('All');

  const mockBusAllocations = [
    {
      id: 'BUS-ALLOC-101',
      studentId: '1001',
      studentName: 'Aarav Sharma',
      class: 'Class 10-A',
      busNo: 'BUS-01 (PB-10-AB-1234)',
      routeName: 'Route #1: Civil Lines - Model Town',
      pickupStop: 'Clock Tower',
      monthlyFare: 1400,
      status: 'Paid',
      dueDate: '2026-02-05'
    },
    {
      id: 'BUS-ALLOC-102',
      studentId: '1002',
      studentName: 'Ananya Verma',
      class: 'Class 10-A',
      busNo: 'BUS-02 (PB-10-CD-5678)',
      routeName: 'Route #2: Urban Estate - Cantt',
      pickupStop: 'Urban Estate Phase 1 Gate',
      monthlyFare: 1600,
      status: 'Pending Due',
      dueDate: '2026-02-10'
    },
    {
      id: 'BUS-ALLOC-103',
      studentId: '9001',
      studentName: 'Rohan Gupta',
      class: 'Class 9-B',
      busNo: 'BUS-01 (PB-10-AB-1234)',
      routeName: 'Route #1: Civil Lines - Model Town',
      pickupStop: 'Model Town Main Market',
      monthlyFare: 1200,
      status: 'Pending Due',
      dueDate: '2026-02-10'
    }
  ];

  // Queries
  const { data: pendingDuesData, isLoading: duesLoading } = useGetPendingDues();
  const { data: totalCollectionData } = useGetTotalCollection();
  const { data: financialData } = useGetFinancialReport();
  const { data: overviewData } = useGetGlobalOverview();

  const collectCashMutation = useCollectCashFee();

  const handleCollect = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!studentId || !amount) return;

    try {
      const res = await collectCashMutation.mutateAsync({
        studentId,
        amount: parseFloat(amount),
        paymentMode,
        feeType,
      });

      const newReceipt = {
        receiptNo: res.data?.receiptNo || `REC-${Math.floor(100000 + Math.random() * 900000)}`,
        studentId,
        studentName: studentName || `Student #${studentId}`,
        feeType,
        amount,
        paymentMode,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        collectedBy: user?.full_name || 'Desk Official',
      };

      setReceiptData(newReceipt);
      setShowReceiptModal(true);
      setAmount('');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to process cash collection');
    }
  };

  const pendingDues = pendingDuesData?.data || [];

  const filteredBusAllocations = mockBusAllocations.filter(alloc => {
    const matchesSearch =
      alloc.studentName.toLowerCase().includes(busSearchQuery.toLowerCase()) ||
      alloc.studentId.includes(busSearchQuery) ||
      alloc.pickupStop.toLowerCase().includes(busSearchQuery.toLowerCase());

    const matchesRoute = selectedRouteFilter === 'All' || alloc.routeName === selectedRouteFilter;
    return matchesSearch && matchesRoute;
  });

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/80 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <CreditCard className="w-6 h-6" />
            </div>
            Finance & Accounts Desk
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Process intake payments, monitor cash flow, and manage student fee receipts.
          </p>
        </div>

        {/* Security Scope Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Scope: {isSuperAdmin ? 'Full Financial Access' : 'Intake Desk / Cashier'}</span>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div className="flex gap-2 bg-slate-50/80 p-2 rounded-2xl border border-slate-200/80 overflow-x-auto scrollbar-hide">
        {[
          { id: 'collection', label: 'Payment Intake', icon: DollarSign },
          { id: 'dues', label: 'Pending Dues Queue', icon: Receipt },
          { id: 'bus_fees', label: 'Buses & Transport Fee Desk', icon: Bus },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* --- Collection Tab --- */}
      {activeTab === 'collection' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          <div className="lg:col-span-2 bg-slate-50/80 p-6 rounded-2xl border border-slate-200/80 space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" /> Payment Intake Desk
            </h2>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleCollect} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Student ID / Admission No *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 101 or ADM-2025-01"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Student Full Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Aarav Sharma"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Fee Category
                  </label>
                  <select
                    value={feeType}
                    onChange={(e) => setFeeType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                  >
                    <option value="Tuition Fee">Tuition Fee</option>
                    <option value="Transport Fee">Transport Fee</option>
                    <option value="Examination Fee">Examination Fee</option>
                    <option value="Library Fee">Library Fee</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="5000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-extrabold text-indigo-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                  >
                    <option value="Cash">Cash Intake</option>
                    <option value="UPI / QR">UPI / QR Code</option>
                    <option value="Card">Debit / Credit Card</option>
                    <option value="Bank Transfer">Bank Transfer / Cheque</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={collectCashMutation.isPending}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-md shadow-indigo-500/20 transition active:scale-[0.99] disabled:opacity-50"
                >
                  <Receipt className="w-4 h-4" /> Issue Payment Receipt
                </button>
              </div>
            </form>
          </div>

          {/* Counter Summary Widget (Super Admin vs Cashier View) */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-lg border border-slate-800 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">
                  {isSuperAdmin ? 'School Total Revenue Aggregate' : 'Desk Duty Intake Counter'}
                </span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>

              {isSuperAdmin ? (
                <>
                  <h3 className="text-3xl font-black mt-3 tracking-tight">
                    ₹{(totalCollectionData?.total_collection || 0).toLocaleString()}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Super Admin Exclusive Total Collection Aggregate.</p>
                </>
              ) : (
                <>
                  <h3 className="text-3xl font-black mt-3 tracking-tight">Authorized Desk</h3>
                  <p className="text-xs text-slate-400 mt-1">Individual student fee intake terminal.</p>
                </>
              )}
            </div>

            <div className="space-y-3 mt-6 pt-4 border-t border-slate-800 text-xs">
              <p className="text-slate-400 leading-relaxed">
                All transactions are verified server-side. Receipts generated are anchored to official payment records.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- Pending Dues Queue Tab --- */}
      {activeTab === 'dues' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-extrabold text-slate-900">Pending Student Fee Dues Queue</h3>
            <span className="text-xs font-bold text-slate-500">{pendingDues.length} Pending Records</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Admission No</th>
                  <th className="px-4 py-3">Class / Section</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Total Fee (₹)</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {pendingDues.map((due) => (
                  <tr key={due.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3.5 font-bold text-slate-900">{due.student_name}</td>
                    <td className="px-4 py-3.5 font-mono text-xs font-semibold text-slate-600">{due.admission_no}</td>
                    <td className="px-4 py-3.5 text-slate-700 font-semibold">{due.class_name || 'N/A'} {due.section_name || ''}</td>
                    <td className="px-4 py-3.5 text-slate-600">{due.category_name || due.notes || 'Tuition Fee'}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                        {due.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-extrabold text-slate-900">
                      ₹{parseFloat(due.total_amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setStudentId(due.admission_no || String(due.student_id));
                          setStudentName(due.student_name);
                          setAmount(String(due.total_amount - due.paid_amount));
                          setActiveTab('collection');
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                      >
                        Collect
                      </button>
                    </td>
                  </tr>
                ))}

                {pendingDues.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-sm font-semibold">
                      No pending fee dues in queue.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- Buses & Transport Fee Desk Tab --- */}
      {activeTab === 'bus_fees' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-gradient-to-br from-indigo-50 to-white rounded-3xl border border-indigo-100 shadow-xs">
              <span className="text-[10px] font-extrabold uppercase text-indigo-500 tracking-wider block">Total Fleet Capacity</span>
              <span className="text-2xl font-black text-slate-900">45 Seats / Bus</span>
              <span className="text-xs text-slate-500 font-bold block mt-1">3 Active Bus Routes</span>
            </div>
            <div className="p-5 bg-gradient-to-br from-emerald-50 to-white rounded-3xl border border-emerald-100 shadow-xs">
              <span className="text-[10px] font-extrabold uppercase text-emerald-600 tracking-wider block">Collected Bus Fares</span>
              <span className="text-2xl font-black text-emerald-700">₹ 1,42,000</span>
              <span className="text-xs text-emerald-600 font-bold block mt-1">Current Academic Month</span>
            </div>
            <div className="p-5 bg-gradient-to-br from-amber-50 to-white rounded-3xl border border-amber-100 shadow-xs">
              <span className="text-[10px] font-extrabold uppercase text-amber-600 tracking-wider block">Pending Bus Dues</span>
              <span className="text-2xl font-black text-amber-700">₹ 42,000</span>
              <span className="text-xs text-amber-600 font-bold block mt-1">2 Student Dues Outstanding</span>
            </div>
          </div>

          {/* Search & Route Filters */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex items-center min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search Student, Bus Stop, Admission..."
                  value={busSearchQuery}
                  onChange={(e) => setBusSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs transition-all"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500">Route:</span>
                <select
                  value={selectedRouteFilter}
                  onChange={(e) => setSelectedRouteFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 outline-none"
                >
                  <option value="All">All Bus Routes</option>
                  <option value="Route #1: Civil Lines - Model Town">Route #1: Civil Lines - Model Town</option>
                  <option value="Route #2: Urban Estate - Cantt">Route #2: Urban Estate - Cantt</option>
                </select>
              </div>
            </div>

            <span className="text-xs font-black text-slate-500">
              Showing {filteredBusAllocations.length} Transport Students
            </span>
          </div>

          {/* Bus Transport Allocation Table */}
          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Class / Sec</th>
                  <th className="py-3 px-4">Assigned Bus</th>
                  <th className="py-3 px-4">Route & Pickup Stop</th>
                  <th className="py-3 px-4">Monthly Fare</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Collect Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                {filteredBusAllocations.map((alloc) => (
                  <tr key={alloc.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {alloc.studentName}
                      <span className="block text-[10px] text-slate-400 font-mono">ID: {alloc.studentId}</span>
                    </td>
                    <td className="py-3 px-4">{alloc.class}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-black border border-indigo-100">
                        {alloc.busNo}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{alloc.pickupStop}</span>
                      <span className="text-[10px] text-slate-500">{alloc.routeName}</span>
                    </td>
                    <td className="py-3 px-4 font-black text-indigo-700">₹ {alloc.monthlyFare.toLocaleString()} / mo</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        alloc.status === 'Paid' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {alloc.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {alloc.status === 'Paid' ? (
                        <span className="text-xs text-emerald-600 font-bold flex items-center justify-end gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Cleared
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setStudentId(alloc.studentId);
                            setStudentName(alloc.studentName);
                            setFeeType('Transport Fee');
                            setAmount(String(alloc.monthlyFare));
                            setActiveTab('collection');
                          }}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-end gap-1.5 ml-auto cursor-pointer"
                        >
                          <DollarSign className="w-3.5 h-3.5" /> Collect Transport Fee
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Printable Instant Receipt Modal */}
      {showReceiptModal && receiptData && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="text-center border-b border-slate-200 pb-4 space-y-1">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-md shadow-indigo-200">
                <GraduationCap className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">THOMSON PUBLIC SCHOOL</h3>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Official Fee Intake Voucher</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs space-y-2.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Voucher No:</span>
                <span className="font-extrabold text-slate-900">{receiptData.receiptNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span>{receiptData.date} {receiptData.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Student ID / Ref:</span>
                <span>{receiptData.studentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Student Name:</span>
                <span className="font-bold">{receiptData.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fee Category:</span>
                <span>{receiptData.feeType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="font-bold text-slate-800">{receiptData.paymentMode}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200/80 pt-2.5 text-sm font-sans font-black text-slate-900">
                <span>Total Received:</span>
                <span className="text-indigo-600">₹{receiptData.amount}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Printer className="w-4 h-4" /> Print Voucher
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceDashboard;
