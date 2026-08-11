import React, { useState, useEffect } from "react";
import {
  Lock,
  AlertTriangle,
  CreditCard,
  CheckCircle,
  RefreshCw,
  Clock,
  ShieldAlert,
  ChevronRight,
  LogOut,
} from "lucide-react";
import api from "../../api/axios";
import { useRazorpay } from "../../hooks/useRazorpay";
import useAuthStore from "../../store/authStore";

const FeeLockoutScreen = ({ onUnlocked }) => {
  const { user, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [monthlyFees, setMonthlyFees] = useState([]);
  const [lockoutStatus, setLockoutStatus] = useState({ is_access_restricted: true, pending_months_count: 0 });
  const [processingMonthId, setProcessingMonthId] = useState(null);

  const { processPayment, loading: paying, error: payError } = useRazorpay();

  useEffect(() => {
    fetchDues();
  }, []);

  const fetchDues = async () => {
    try {
      setLoading(true);
      const res = await api.get("/payments/monthly-fees/my-fees");
      if (res.data?.success && res.data?.data) {
        setStudent(res.data.data.student);
        setMonthlyFees(res.data.data.monthlyFees || []);
        setLockoutStatus(res.data.data.lockoutStatus || { is_access_restricted: true, pending_months_count: 0 });

        if (res.data.data.lockoutStatus && !res.data.data.lockoutStatus.is_access_restricted) {
          if (onUnlocked) onUnlocked();
        }
      }
    } catch (err) {
      console.error("Failed to load lockout dues:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = (month) => {
    setProcessingMonthId(month.id);
    const amountDue = month.total_due - month.amount_paid;

    processPayment({
      monthId: month.id,
      monthCode: month.month_code,
      studentId: student?.id,
      amount: amountDue,
      feeRecordId: null,
      studentName: student?.full_name || `${student?.first_name || ''} ${student?.last_name || ''}`,
      email: user?.email || '',
      phone: student?.phone || '',
      onSuccess: async (verifyData) => {
        alert("Payment successful! Updating account status...");
        await fetchDues();
        setProcessingMonthId(null);
      },
      onFailure: (err) => {
        console.error("Payment failed:", err);
        setProcessingMonthId(null);
      },
    });
  };

  const schoolTodayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
  const overdueMonths = monthlyFees.filter((m) => {
    if (m.is_overdue || m.status === "OVERDUE") return true;
    if (m.status === "PENDING" || m.status === "PARTIAL") {
      const formattedDueDate = m.due_date ? String(m.due_date).split('T')[0] : '';
      return formattedDueDate && formattedDueDate <= schoolTodayStr;
    }
    return false;
  });
  const earliestOverdue = overdueMonths[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-600/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl p-6 sm:p-8 space-y-6 relative z-10 animate-fadeIn">
        {/* Top Warning Banner */}
        <div className="flex items-start gap-4 p-4 bg-rose-950/40 border border-rose-800/60 rounded-2xl">
          <div className="p-3 bg-rose-600/20 text-rose-400 rounded-xl shrink-0">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-rose-200">Portal Access Restricted</h1>
            <p className="text-sm text-rose-300/80 mt-1">
              Your student portal access is locked because you have{" "}
              <span className="font-semibold text-white">{lockoutStatus.pending_months_count || 2} or more months</span> of overdue fee payments.
            </p>
          </div>
        </div>

        {payError && (
          <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            {payError}
          </div>
        )}

        {/* Instructions */}
        <div className="text-sm text-slate-300 space-y-2">
          <p className="font-semibold text-slate-200">Please clear your pending dues below to instantly restore portal access:</p>
        </div>

        {/* Pending Months Breakdown Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" /> Pending Monthly Dues
            </h2>
            <button
              onClick={fetchDues}
              disabled={loading}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Status
            </button>
          </div>

          <div className="divide-y divide-slate-800/80 max-h-[260px] overflow-y-auto">
            {overdueMonths.length > 0 ? (
              overdueMonths.map((m) => (
                <div key={m.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100">{m.month_code} Fee</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800/60 font-medium">
                        {m.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Due Date: {new Date(m.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {parseFloat(m.bus_fee) > 0 && ` • Includes Bus Fee (₹${m.bus_fee})`}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-base font-bold text-emerald-400 font-mono">
                      ₹{parseFloat(m.total_due - m.amount_paid).toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => handlePayNow(m)}
                      disabled={paying}
                      className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-blue-600/25 flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <CreditCard className="w-3.5 h-3.5" /> Pay Now
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-sm text-slate-400">
                No pending dues found. Click refresh to check account status.
              </div>
            )}
          </div>
        </div>

        {/* Primary Pay & Unlock CTA */}
        {earliestOverdue && (
          <div className="p-5 bg-gradient-to-r from-indigo-900/40 to-blue-900/40 border border-indigo-700/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs text-indigo-300">Quick Unlock Payment</p>
              <h3 className="text-lg font-bold text-white">
                Clear Dues for {earliestOverdue.month_code} (₹{earliestOverdue.total_due - earliestOverdue.amount_paid})
              </h3>
            </div>
            <button
              onClick={() => handlePayNow(earliestOverdue)}
              disabled={paying}
              className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 transition-all shrink-0"
            >
              {paying ? "Opening Checkout..." : "Pay via Razorpay"} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400">
          <p>Need assistance? Contact school admin office: 9839009324</p>
          <button
            onClick={() => logout && logout()}
            className="hover:text-rose-400 flex items-center gap-1 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeeLockoutScreen;
