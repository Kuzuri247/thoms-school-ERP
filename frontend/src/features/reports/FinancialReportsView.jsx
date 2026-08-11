import React, { useState } from 'react';
import {
  FileSpreadsheet,
  TrendingUp,
  Download,
  Printer,
  Calendar,
  PieChart,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  Receipt,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { useGetFinancialReport } from './useReports';

const FinancialReportsView = () => {
  const { user } = useAuthStore();
  const [selectedDateRange, setSelectedDateRange] = useState('This Academic Year');
  const [selectedReportType, setSelectedReportType] = useState('all');

  const currentMonthLabel = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const { data: reportResp } = useGetFinancialReport(selectedDateRange);
  const reportData = reportResp?.data || {};

  // Real Financial Aggregates from Database
  const financialSummary = {
    totalRevenue: Number(reportData.financialSummary?.totalRevenue || 0),
    tuitionFeeInflow: Number(reportData.financialSummary?.tuitionFeeInflow || 0),
    transportFeeInflow: Number(reportData.financialSummary?.transportFeeInflow || 0),
    pendingDues: Number(reportData.financialSummary?.pendingDues || 0),
    defaultersCount: Number(reportData.financialSummary?.defaultersCount || 0),
    operationalExpenses: 0,
    netSurplus: Number(reportData.financialSummary?.totalRevenue || 0),
  };

  const fmt = (val) => Number(val || 0).toLocaleString();

  const totalRev = financialSummary.totalRevenue || 1;
  const tuitionPct = Math.round(((financialSummary.tuitionFeeInflow || 0) / totalRev) * 100);
  const busPct = Math.round(((financialSummary.transportFeeInflow || 0) / totalRev) * 100);

  // Dynamic Category Breakdown
  const categoryBreakdown = [
    { category: 'Tuition Fee Intake', amount: financialSummary.tuitionFeeInflow, percentage: `${tuitionPct}%`, color: 'bg-indigo-600' },
    { category: 'Transport & Bus Fleet Fees', amount: financialSummary.transportFeeInflow, percentage: `${busPct}%`, color: 'bg-amber-500' },
  ];

  // Dynamic Payment Mode Breakdown (omit table when backend data is absent)
  const paymentModeShare = Array.isArray(reportData.paymentModeShare)
    ? reportData.paymentModeShare.map(p => ({
        mode: p.mode || 'Online Gateway',
        amount: Number(p.amount || 0),
        transactions: Number(p.transactions || 0),
        percentage: p.percentage || '0%',
      }))
    : null;

  // Dynamic Class-wise Dues Audit
  const classDuesAudit = reportData.classDuesAudit || [];

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
            Complete financial inflow breakdown, payment gateway audits, pending dues defaulters, and school operational reports ({selectedDateRange}).
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => alert('Exporting full financial audit statement...')}
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
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 outline-none cursor-pointer"
          >
            <option value="This Academic Year">This Academic Year (2026-27)</option>
            <option value="Current Month">Current Month ({currentMonthLabel})</option>
          </select>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Audits' },
            { id: 'collection', label: 'Inflows' },
            { id: 'dues', label: 'Pending Dues' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedReportType(type.id)}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition cursor-pointer ${
                selectedReportType === type.id
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Financial Executive Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-gradient-to-br from-emerald-500/10 via-slate-50 to-white rounded-3xl border border-emerald-200/80 shadow-xs space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 block">Total Gross Inflow</span>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">₹ {fmt(financialSummary.totalRevenue)}</h3>
          <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Total Realized Collections
          </span>
        </div>

        <div className="p-5 bg-gradient-to-br from-amber-500/10 via-slate-50 to-white rounded-3xl border border-amber-200/80 shadow-xs space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 block">Outstanding Fee Dues</span>
          <h3 className="text-2xl font-black text-amber-900 tracking-tight">₹ {fmt(financialSummary.pendingDues)}</h3>
          <span className="text-xs text-amber-700 font-bold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> {financialSummary.defaultersCount} Restricted Defaulters
          </span>
        </div>

        <div className="p-5 bg-gradient-to-br from-indigo-500/10 via-slate-50 to-white rounded-3xl border border-indigo-200/80 shadow-xs space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 block">Tuition Fee Inflow</span>
          <h3 className="text-2xl font-black text-indigo-900 tracking-tight">₹ {fmt(financialSummary.tuitionFeeInflow)}</h3>
          <span className="text-xs text-slate-500 font-bold block">CBSE Academic Monthly Fee</span>
        </div>

        <div className="p-5 bg-gradient-to-br from-amber-500/10 via-slate-50 to-white rounded-3xl border border-amber-200/80 shadow-xs space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 block">Transport Bus Inflow</span>
          <h3 className="text-2xl font-black text-amber-900 tracking-tight">₹ {fmt(financialSummary.transportFeeInflow)}</h3>
          <span className="text-xs text-amber-700 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Quarterly Distance Slabs
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
                    <span className="text-slate-900">₹ {fmt(item.amount)} ({item.percentage})</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className={`${item.color} h-2.5 rounded-full`} style={{ width: item.percentage }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Gateway Mode Breakdown */}
          {paymentModeShare && paymentModeShare.length > 0 && (
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
                        <td className="py-2.5 px-3 text-center text-slate-600">{p.transactions}</td>
                        <td className="py-2.5 px-3 text-right font-black text-indigo-700">₹ {fmt(p.amount)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-500">{p.percentage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: CLASS-WISE PENDING DUES AUDIT */}
      {(selectedReportType === 'all' || selectedReportType === 'dues') && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Class-Wise Pending Fee Dues & Defaulter Audit
            </h3>
            <span className="text-xs font-black text-amber-700">Total Pending: ₹ {fmt(financialSummary.pendingDues)}</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Class Level</th>
                  <th className="py-3 px-4 text-center">Total Enrolled</th>
                  <th className="py-3 px-4 text-center">Defaulters Count</th>
                  <th className="py-3 px-4 text-right">Outstanding Dues (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                {classDuesAudit.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{c.className}</td>
                    <td className="py-3 px-4 text-center text-slate-600">{c.totalStudents}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] ${
                        c.defaulters > 0 ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {c.defaulters} Defaulters
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-amber-700">₹ {fmt(c.pendingAmount)}</td>
                  </tr>
                ))}

                {classDuesAudit.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400 font-semibold">
                      No class dues audit data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialReportsView;
