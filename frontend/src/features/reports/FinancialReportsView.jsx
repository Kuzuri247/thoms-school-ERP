import React, { useState } from 'react';
import {
  FileSpreadsheet,
  TrendingUp,
  DollarSign,
  Download,
  Printer,
  Calendar,
  Filter,
  PieChart,
  BarChart3,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Building2,
  Receipt,
  FileText
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const FinancialReportsView = () => {
  const { user } = useAuthStore();
  const [selectedDateRange, setSelectedDateRange] = useState('This Academic Year');
  const [selectedReportType, setSelectedReportType] = useState('all'); // 'all', 'collection', 'dues', 'mode', 'expenses'

  // Financial KPI Aggregates
  const financialSummary = {
    totalRevenue: 2450000,
    tuitionFeeInflow: 1680000,
    transportFeeInflow: 420000,
    examFeeInflow: 210000,
    miscFeeInflow: 140000,
    pendingDues: 385000,
    defaultersCount: 42,
    operationalExpenses: 1120000,
    netSurplus: 1330000
  };

  // Category Breakdown
  const categoryBreakdown = [
    { category: 'Tuition Fee Intake', amount: 1680000, percentage: '68.6%', color: 'bg-indigo-600' },
    { category: 'Transport & Bus Fleet Fees', amount: 420000, percentage: '17.1%', color: 'bg-blue-500' },
    { category: 'Examination & Certification', amount: 210000, percentage: '8.6%', color: 'bg-purple-500' },
    { category: 'Admission & Miscellaneous', amount: 140000, percentage: '5.7%', color: 'bg-emerald-500' }
  ];

  // Payment Mode Share
  const paymentModeShare = [
    { mode: 'Cash Intake Desk', amount: 1100000, transactions: 450, percentage: '44.9%' },
    { mode: 'UPI / QR Payment', amount: 850000, transactions: 380, percentage: '34.7%' },
    { mode: 'Debit / Credit Card', amount: 320000, transactions: 110, percentage: '13.1%' },
    { mode: 'Bank Transfer / Cheque', amount: 180000, transactions: 45, percentage: '7.3%' }
  ];

  // Class-wise Pending Dues Audit
  const classDuesAudit = [
    { className: 'Class 10', totalStudents: 120, paidStudents: 104, defaulters: 16, pendingAmount: 144000 },
    { className: 'Class 9', totalStudents: 115, paidStudents: 102, defaulters: 13, pendingAmount: 117000 },
    { className: 'Class 12', totalStudents: 95, paidStudents: 88, defaulters: 7, pendingAmount: 77000 },
    { className: 'Class 8', totalStudents: 110, paidStudents: 104, defaulters: 6, pendingAmount: 47000 }
  ];

  // Expenses Breakdown
  const expenseItems = [
    { item: 'Faculty & Staff Salaries', category: 'Payroll', amount: 780000, status: 'Disbursed' },
    { item: 'Bus Diesel & Transport Maintenance', category: 'Fleet Logistics', amount: 145000, status: 'Paid' },
    { item: 'Electricity & Internet Utilities', category: 'Utilities', amount: 85000, status: 'Paid' },
    { item: 'Laboratory & Library Upgrades', category: 'Academic Supplies', amount: 110000, status: 'Approved' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/80 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            Comprehensive Financial Audit & Reports Desk
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Complete financial inflow breakdown, payment gateway audits, pending dues defaulters, and school operational expense reports.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => alert('Exporting full financial audit statement to CSV format...')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-md shadow-indigo-500/20 cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print Statement
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <Calendar className="w-4 h-4 text-indigo-600" /> Date Scope:
          </div>
          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 outline-none"
          >
            <option value="This Academic Year">This Academic Year (2025-26)</option>
            <option value="Current Quarter">Current Quarter (Q4)</option>
            <option value="Current Month">Current Month (February 2026)</option>
          </select>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-hide">
          {[
            { id: 'all', label: 'All Financial Metrics' },
            { id: 'collection', label: 'Fee Collections' },
            { id: 'dues', label: 'Pending Dues Audit' },
            { id: 'expenses', label: 'School Expenses' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedReportType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedReportType === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Financial Executive Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-gradient-to-br from-emerald-500/10 via-slate-50 to-white rounded-3xl border border-emerald-200/80 shadow-xs space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 block">Total Gross Inflow</span>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">₹ {financialSummary.totalRevenue.toLocaleString()}</h3>
          <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% vs previous term
          </span>
        </div>

        <div className="p-5 bg-gradient-to-br from-amber-500/10 via-slate-50 to-white rounded-3xl border border-amber-200/80 shadow-xs space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 block">Outstanding Fee Dues</span>
          <h3 className="text-2xl font-black text-amber-900 tracking-tight">₹ {financialSummary.pendingDues.toLocaleString()}</h3>
          <span className="text-xs text-amber-700 font-bold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> {financialSummary.defaultersCount} Student Defaulters
          </span>
        </div>

        <div className="p-5 bg-gradient-to-br from-rose-500/10 via-slate-50 to-white rounded-3xl border border-rose-200/80 shadow-xs space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 block">Operational Outflow</span>
          <h3 className="text-2xl font-black text-rose-900 tracking-tight">₹ {financialSummary.operationalExpenses.toLocaleString()}</h3>
          <span className="text-xs text-slate-500 font-bold block">Payroll, Bus Fuel, Utilities</span>
        </div>

        <div className="p-5 bg-gradient-to-br from-indigo-500/10 via-slate-50 to-white rounded-3xl border border-indigo-200/80 shadow-xs space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 block">Net Surplus Reserve</span>
          <h3 className="text-2xl font-black text-indigo-900 tracking-tight">₹ {financialSummary.netSurplus.toLocaleString()}</h3>
          <span className="text-xs text-indigo-700 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Healthy Reserve Margin
          </span>
        </div>
      </div>

      {/* SECTION 1: FEE COLLECTION CATEGORY BREAKDOWN */}
      {(selectedReportType === 'all' || selectedReportType === 'collection') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
          {/* Category Inflow Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-indigo-600" /> Category-Wise Revenue Inflow
              </h3>
              <span className="text-[11px] font-bold text-slate-400">Gross Total</span>
            </div>

            <div className="space-y-3">
              {categoryBreakdown.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">{item.category}</span>
                    <span className="text-slate-900">₹ {item.amount.toLocaleString()} ({item.percentage})</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className={`${item.color} h-2.5 rounded-full`} style={{ width: item.percentage }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Gateway Mode Breakdown */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" /> Payment Intake Mode Audit
              </h3>
              <span className="text-[11px] font-bold text-slate-400">Audit Summary</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Payment Mode</th>
                    <th className="py-2.5 px-3 text-center">Txn Count</th>
                    <th className="py-2.5 px-3 text-right">Total Collection</th>
                    <th className="py-2.5 px-3 text-right">Share %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                  {paymentModeShare.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{p.mode}</td>
                      <td className="py-2.5 px-3 text-center text-slate-600">{p.transactions} Txns</td>
                      <td className="py-2.5 px-3 text-right font-black text-indigo-700">₹ {p.amount.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-500">{p.percentage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: CLASS-WISE PENDING DUES AUDIT */}
      {(selectedReportType === 'all' || selectedReportType === 'dues') && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Class-Wise Pending Fee Dues & Defaulter Audit
            </h3>
            <span className="text-xs font-black text-amber-700">Total Pending: ₹ {financialSummary.pendingDues.toLocaleString()}</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Class Level</th>
                  <th className="py-3 px-4 text-center">Total Enrolled</th>
                  <th className="py-3 px-4 text-center">Fee Paid Students</th>
                  <th className="py-3 px-4 text-center">Defaulters Count</th>
                  <th className="py-3 px-4 text-right">Outstanding Dues (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                {classDuesAudit.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{c.className}</td>
                    <td className="py-3 px-4 text-center text-slate-600">{c.totalStudents}</td>
                    <td className="py-3 px-4 text-center text-emerald-700 font-black">{c.paidStudents}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-black border border-amber-200">
                        {c.defaulters} Defaulters
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-amber-700">₹ {c.pendingAmount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: OPERATIONAL EXPENSE AUDIT */}
      {(selectedReportType === 'all' || selectedReportType === 'expenses') && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-rose-600" /> Operational Expense & Outflow Audit
            </h3>
            <span className="text-xs font-black text-slate-500">Total Outflow: ₹ {financialSummary.operationalExpenses.toLocaleString()}</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Expense Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Disbursed Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                {expenseItems.map((ex, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{ex.item}</td>
                    <td className="py-3 px-4 text-slate-500">{ex.category}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md text-[10px] font-extrabold border border-emerald-200">
                        {ex.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900">₹ {ex.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialReportsView;
