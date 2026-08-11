import React, { useState, useEffect } from "react";
import {
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Clock,
  Download,
  Lock,
  Unlock,
  RefreshCw,
  Search,
  DollarSign,
  Bus,
  Calendar,
  FileText,
  User,
  ArrowLeft,
  Send,
  X,
} from "lucide-react";
import api from "../../api/axios";
import PaymentReceiptModal from "../../components/PaymentReceiptModal";

const StudentFeeProfileView = ({ studentId, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [monthlyFees, setMonthlyFees] = useState([]);
  const [lockoutStatus, setLockoutStatus] = useState({ is_access_restricted: false, pending_months_count: 0 });
  const [error, setError] = useState("");

  // Cash payment modal state
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [cashAmount, setCashAmount] = useState(0);
  const [cashMode, setCashMode] = useState("Cash");
  const [submittingCash, setSubmittingCash] = useState(false);

  // Active printable receipt modal state
  const [activeReceiptData, setActiveReceiptData] = useState(null);

  useEffect(() => {
    if (studentId) {
      fetchStudentFeeProfile();
    }
  }, [studentId]);

  const fetchStudentFeeProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/payments/monthly-fees/student/${studentId}`);
      if (res.data?.success && res.data?.data) {
        setStudent(res.data.data.student);
        setMonthlyFees(res.data.data.monthlyFees || []);
        setLockoutStatus(res.data.data.lockoutStatus || { is_access_restricted: false, pending_months_count: 0 });
      } else {
        setError("Failed to load student fee profile.");
      }
    } catch (err) {
      console.error("Error fetching fee profile:", err);
      setError(err.response?.data?.message || err.message || "Failed to load fee profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRestriction = async () => {
    try {
      const targetState = !lockoutStatus.is_access_restricted;
      const res = await api.post("/payments/override-restriction", {
        studentId: student?.id || studentId,
        isAccessRestricted: targetState,
      });

      if (res.data?.success) {
        setLockoutStatus((prev) => ({
          ...prev,
          is_access_restricted: targetState,
        }));
      }
    } catch (err) {
      console.error("Failed to override restriction:", err);
      alert("Failed to update access restriction state.");
    }
  };

  const handleOpenCashModal = (month) => {
    setSelectedMonth(month);
    setCashAmount(month.total_due - month.amount_paid);
  };

  const handleCollectCash = async (e) => {
    e.preventDefault();
    if (!selectedMonth) return;

    try {
      setSubmittingCash(true);
      const res = await api.post("/payments/pay-monthly-fee", {
        studentId: student?.id || studentId,
        monthCode: selectedMonth.month_code,
        monthId: selectedMonth.id,
        amount: parseFloat(cashAmount),
        paymentMode: cashMode,
      });

      if (res.data?.success) {
        setSelectedMonth(null);
        fetchStudentFeeProfile();
      }
    } catch (err) {
      console.error("Failed to collect cash payment:", err);
      alert(err.response?.data?.message || "Failed to record cash payment.");
    } finally {
      setSubmittingCash(false);
    }
  };

  const handleViewReceipt = (m) => {
    setActiveReceiptData({
      receiptNo: m.receipt_no || `REC-${Date.now().toString().slice(-6)}`,
      studentId: student?.admission_no || studentId,
      studentName: student ? `${student.first_name} ${student.last_name}` : 'Student',
      fatherName: student?.father_name || 'N/A',
      className: student?.class_name || 'N/A',
      feeType: `CBSE MONTHLY FEE (${m.month_code})`,
      amount: m.amount_paid || m.total_due,
      paymentMode: m.payment_mode || 'Cash / Online',
      date: m.paid_at ? new Date(m.paid_at).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'),
      time: m.paid_at ? new Date(m.paid_at).toLocaleTimeString('en-IN') : '12:00:00',
    });
  };

  const totalDues = monthlyFees.reduce((acc, m) => acc + parseFloat(m.total_due || 0), 0);
  const totalPaid = monthlyFees.reduce((acc, m) => acc + parseFloat(m.amount_paid || 0), 0);
  const totalPending = totalDues - totalPaid;

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Loading CBSE Monthly Fee Details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {student?.full_name || `${student?.first_name || ''} ${student?.last_name || ''}`}
              </h1>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                Roll #{student?.roll_no || student?.admission_no || '-'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Class: {student?.class_name || '-'} | Section: {student?.section_name || 'A'} | Father: {student?.father_name || 'N/A'}
            </p>
          </div>
        </div>

        {/* Lockout & Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={fetchStudentFeeProfile}
            className="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
            title="Refresh Dues"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggleRestriction}
            className={`px-4 py-2.5 text-sm font-semibold rounded-xl flex items-center gap-2 transition-all shadow-md ${
              lockoutStatus.is_access_restricted
                ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20"
                : "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20"
            }`}
          >
            {lockoutStatus.is_access_restricted ? (
              <>
                <Unlock className="w-4 h-4" /> Override: Unlock Portal
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" /> Restrict Portal Access
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Session Fees</p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">₹{totalDues.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Paid</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">₹{totalPaid.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending Dues</p>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">₹{totalPending.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className={`p-3 rounded-xl ${lockoutStatus.is_access_restricted ? 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'}`}>
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Portal Status</p>
            <p className={`text-sm font-bold ${lockoutStatus.is_access_restricted ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {lockoutStatus.is_access_restricted ? `RESTRICTED (${lockoutStatus.pending_months_count} Mos)` : 'ACTIVE / NORMAL'}
            </p>
          </div>
        </div>
      </div>

      {/* CBSE 12-Month Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" /> CBSE Academic Month-by-Month Breakdown (2026-27)
          </h2>
          {student?.opts_bus_service && (
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5">
              <Bus className="w-3.5 h-3.5" /> Transport: {student.bus_distance_slab} (₹{student.bus_quarterly_fee}/qtr)
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Month</th>
                <th className="py-3.5 px-4 font-semibold">Due Date</th>
                <th className="py-3.5 px-4 font-semibold text-right">Tuition Fee</th>
                <th className="py-3.5 px-4 font-semibold text-right">Bus Fee</th>
                <th className="py-3.5 px-4 font-semibold text-right">Total Due</th>
                <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {monthlyFees.map((m) => {
                const isPaid = m.status === 'PAID';
                const isOverdue = m.status === 'OVERDUE';
                const hasBusFee = parseFloat(m.bus_fee) > 0;

                return (
                  <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {m.month_code} ({m.month_order === 1 ? 'April' : m.month_order === 2 ? 'May' : m.month_order === 3 ? 'June' : m.month_order === 4 ? 'July' : m.month_order === 5 ? 'August' : m.month_order === 6 ? 'September' : m.month_order === 7 ? 'October' : m.month_order === 8 ? 'November' : m.month_order === 9 ? 'December' : m.month_order === 10 ? 'January' : m.month_order === 11 ? 'February' : 'March'})
                    </td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400 text-xs">
                      {new Date(m.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-4 text-right text-slate-900 dark:text-slate-100 font-mono">
                      ₹{parseFloat(m.tuition_fee).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-4 text-right font-mono">
                      {hasBusFee ? (
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                          ₹{parseFloat(m.bus_fee).toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-slate-900 dark:text-slate-100 font-mono">
                      ₹{parseFloat(m.total_due).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${
                          isPaid
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : isOverdue
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {isPaid ? <CheckCircle className="w-3.5 h-3.5" /> : isOverdue ? <AlertTriangle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {m.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {isPaid ? (
                        <button
                          onClick={() => handleViewReceipt(m)}
                          className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" /> Receipt
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenCashModal(m)}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <DollarSign className="w-3.5 h-3.5" /> Collect Fee
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cash Collection Modal */}
      {selectedMonth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
              <h3 className="font-bold text-lg">Collect Fee: {selectedMonth.month_code}</h3>
              <button onClick={() => setSelectedMonth(null)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCollectCash} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Payment Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Payment Mode
                </label>
                <select
                  value={cashMode}
                  onChange={(e) => setCashMode(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                >
                  <option value="Cash">Cash</option>
                  <option value="POS / Card">POS / Card</option>
                  <option value="UPI Direct">UPI Direct</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedMonth(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCash}
                  className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md flex items-center gap-2 cursor-pointer"
                >
                  {submittingCash ? "Recording..." : "Record & Print Receipt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Official Payment Receipt Modal */}
      {activeReceiptData && (
        <PaymentReceiptModal
          receiptData={activeReceiptData}
          onClose={() => setActiveReceiptData(null)}
        />
      )}
    </div>
  );
};

export default StudentFeeProfileView;
