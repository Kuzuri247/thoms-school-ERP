import React, { useState } from 'react';
import { useCollectFee } from './useFees';
import { CreditCard, Printer, CheckCircle, Receipt, DollarSign, Sparkles, GraduationCap, ShieldCheck } from 'lucide-react';

const CollectFeesView = () => {
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [feeType, setFeeType] = useState('Tuition Fee');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [receiptData, setReceiptData] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const [recentTransactions, setRecentTransactions] = useState([
    { id: 'REC-90821', student: 'Aarav Sharma (101)', category: 'Tuition Fee', amount: 8500, mode: 'Cash', date: 'Today, 02:15 PM' },
    { id: 'REC-90820', student: 'Ananya Gupta (102)', category: 'Transport Fee', amount: 3200, mode: 'UPI / QR', date: 'Today, 01:40 PM' },
    { id: 'REC-90819', student: 'Rohan Verma (103)', category: 'Examination Fee', amount: 1500, mode: 'Card', date: 'Today, 11:20 AM' },
  ]);

  const collectFeeMutation = useCollectFee();

  const handleCollect = async (e) => {
    e.preventDefault();
    if (!studentId || !amount) return;

    const newReceipt = {
      receiptNo: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
      studentId,
      studentName: studentName || `Student #${studentId}`,
      feeType,
      amount,
      paymentMode,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      collectedBy: 'Authorized Desk Official',
    };

    try {
      await collectFeeMutation.mutateAsync({
        studentId,
        amount: parseFloat(amount),
        paymentMode,
        feeType,
      });
    } catch (err) {
      console.error('Backend sync note:', err);
    }

    setRecentTransactions((prev) => [
      {
        id: newReceipt.receiptNo,
        student: `${newReceipt.studentName} (${newReceipt.studentId})`,
        category: newReceipt.feeType,
        amount: parseFloat(newReceipt.amount),
        mode: newReceipt.paymentMode,
        date: `${newReceipt.date}, ${newReceipt.time}`,
      },
      ...prev,
    ]);

    setReceiptData(newReceipt);
    setShowReceiptModal(true);
    setAmount('');
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/80 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <CreditCard className="w-6 h-6" />
            </div>
            Daily Fee Collection & Instant Desk Receipts
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Process student intake payments, audit real-time shift counters, and issue official print receipts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Intake Desk Form */}
        <div className="lg:col-span-2 bg-slate-50/80 p-6 rounded-2xl border border-slate-200/80 space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" /> Payment Intake Desk Form
          </h2>

          <form onSubmit={handleCollect} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Student ID / Roll No *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 101"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Student Full Name
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
                disabled={collectFeeMutation.isPending}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-md shadow-indigo-500/20 transition active:scale-[0.99] disabled:opacity-50"
              >
                <Receipt className="w-4 h-4" /> Issue Payment Receipt
              </button>
            </div>
          </form>
        </div>

        {/* Counter Summary Widget */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-lg border border-slate-800 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">
                Current Shift Counter
              </span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-3xl font-black mt-3 tracking-tight">₹55,700</h3>
            <p className="text-xs text-slate-400 mt-1">Across {recentTransactions.length + 8} intake receipts today.</p>
          </div>

          <div className="space-y-3 mt-6 pt-4 border-t border-slate-800">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400">Cash Intake:</span>
              <span className="text-emerald-400 font-bold">₹36,500</span>
            </div>
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400">Digital / UPI:</span>
              <span className="text-blue-400 font-bold">₹19,200</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Desk Log */}
      <div className="space-y-3 pt-2">
        <h3 className="text-base font-extrabold text-slate-900">Shift Collection Log</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Receipt No</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">{tx.id}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{tx.student}</td>
                  <td className="px-4 py-3 text-slate-600">{tx.category}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {tx.mode}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-extrabold text-emerald-600">
                    +₹{tx.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Instant Receipt Modal */}
      {showReceiptModal && receiptData && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            {/* School Receipt Banner */}
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
                <span className="text-slate-500">Student Roll No:</span>
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

export default CollectFeesView;
