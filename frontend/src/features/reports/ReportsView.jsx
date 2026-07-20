import React, { useState } from 'react';
import { useGetFinancialReport, useGetGlobalOverview } from './useReports';
import { FileSpreadsheet, TrendingUp, DollarSign, Download, PieChart, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';

const ReportsView = ({ activeTab = 'ledger' }) => {
  const [filterType, setFilterType] = useState('All');
  const { data: financialData } = useGetFinancialReport();
  const { data: overviewData } = useGetGlobalOverview();

  const ledgerData = (financialData?.data || []).map(r => ({
    date: new Date(r.generated_at).toLocaleDateString(),
    category: r.category_name,
    reference: `Receipt #${r.receipt_number}`,
    type: 'Credit',
    amount: r.amount
  }));

  const filteredLedger = ledgerData.filter((item) => {
    if (filterType === 'Credit') return item.type === 'Credit';
    if (filterType === 'Debit') return item.type === 'Debit';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/80 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            Accountant General Ledger & Financial Overview
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Global report parsing, batch invoicing audit logs, and operational expense balances.
          </p>
        </div>

        <button className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition shadow-sm active:scale-[0.99]">
          <Download className="w-4 h-4 text-slate-300" /> Export Audit CSV
        </button>
      </div>

      {/* KPI Financial Overview Cards */}
      {activeTab === 'reports' && (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-emerald-500/10 via-slate-50 to-slate-50 p-5 rounded-2xl border border-emerald-200/60 space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Total Inflow</span>
            <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">₹{overviewData?.data?.totalRevenue?.toLocaleString() || 0}</h3>
          <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Total Collected Fees
          </span>
        </div>

        <div className="bg-gradient-to-br from-indigo-500/10 via-slate-50 to-slate-50 p-5 rounded-2xl border border-indigo-200/60 space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Total Students</span>
            <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{overviewData?.data?.totalStudents || 0}</h3>
          <span className="text-xs text-indigo-600 font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Active Enrollment
          </span>
        </div>

        <div className="bg-gradient-to-br from-indigo-500/10 via-slate-50 to-slate-50 p-5 rounded-2xl border border-indigo-200/60 space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Total Teachers</span>
            <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{overviewData?.data?.totalTeachers || 0}</h3>
          <span className="text-xs text-indigo-600 font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Active Staff
          </span>
        </div>
      </div>
      )}

      {activeTab === 'ledger' && (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="text-base font-extrabold text-slate-900">General Ledger Audit Log</h3>

          <div className="flex gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 text-xs font-bold">
            <button
              onClick={() => setFilterType('All')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterType === 'All' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Entries
            </button>
            <button
              onClick={() => setFilterType('Credit')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterType === 'Credit' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Credit Inflow
            </button>
            <button
              onClick={() => setFilterType('Debit')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterType === 'Debit' ? 'bg-white text-red-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Debit Outflow
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Category / Description</th>
                <th className="px-4 py-3">Reference / Batch</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredLedger.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition">
                  <td className="px-4 py-3.5 text-slate-500 font-mono text-xs font-semibold">{row.date}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-900">{row.category}</td>
                  <td className="px-4 py-3.5 text-slate-500 font-mono text-xs">{row.reference}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                        row.type === 'Credit'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : 'bg-red-50 text-red-700 border border-red-200/60'
                      }`}
                    >
                      {row.type}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3.5 text-right font-black ${
                      row.type === 'Credit' ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {row.type === 'Credit' ? '+' : '-'}₹{row.amount.toLocaleString()}
                  </td>
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

export default ReportsView;
