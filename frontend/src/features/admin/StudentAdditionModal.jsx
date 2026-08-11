import React, { useState } from "react";
import {
  X,
  UserPlus,
  Bus,
  Shield,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Building,
  Phone,
  Mail,
  User,
  Calendar,
} from "lucide-react";
import api from "../../api/axios";
import { BUS_DISTANCE_SLABS, getBusFeeForSlab } from "../../constants/academicConstants";

const StudentAdditionModal = ({ isOpen, onClose, onSuccess, classesList = [] }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [gender, setGender] = useState("Male");
  const [dob, setDob] = useState("");
  const [targetClassId, setTargetClassId] = useState(classesList[0]?.id || "");
  const [tuitionFee, setTuitionFee] = useState(3500);

  // Transport Opt-in state
  const [optsBusService, setOptsBusService] = useState(false);
  const [busDistanceSlab, setBusDistanceSlab] = useState("0-2 KM");
  const [busQuarterlyFee, setBusQuarterlyFee] = useState(3825);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (classesList.length > 0 && !targetClassId) {
      setTargetClassId(classesList[0]?.id || "");
    }
  }, [classesList, targetClassId]);

  if (!isOpen) return null;

  const handleSlabChange = (e) => {
    const selectedSlab = e.target.value;
    setBusDistanceSlab(selectedSlab);
    const fee = getBusFeeForSlab ? getBusFeeForSlab(selectedSlab) : 3825;
    setBusQuarterlyFee(fee);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) return setError("Student full name is required");
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Valid email address is required");
    if (!phone || !/^\d{10}$/.test(phone)) return setError("10-digit phone number is required");

    try {
      setLoading(true);
      const payload = {
        role: "student",
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        emergency_contact: emergencyContact.trim() || phone.trim(),
        father_name: fatherName.trim(),
        gender,
        dob,
        class_id: targetClassId,
        tuition_fee: parseFloat(tuitionFee) || 3500,
        opts_bus_service: optsBusService,
        bus_distance_slab: optsBusService ? busDistanceSlab : null,
        bus_quarterly_fee: optsBusService ? parseFloat(busQuarterlyFee) || 3825 : 0,
      };

      const res = await api.post("/admin/users", payload);
      if (res.data?.success) {
        if (onSuccess) onSuccess(res.data);
        onClose();
      } else {
        setError(res.data?.message || "Failed to create student profile.");
      }
    } catch (err) {
      console.error("Failed to create student:", err);
      setError(err.response?.data?.message || err.message || "Error creating student profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Register New Student</h2>
              <p className="text-xs text-blue-100">Provision account & initialize 12 CBSE monthly fee records</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Basic Student Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" /> Student Profile Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aditya Verma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Primary Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="aditya.verma@thomson.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Contact Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="10 digit mobile"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Father / Guardian Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Prakash Verma"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Class Assignment
                </label>
                <select
                  value={targetClassId}
                  onChange={(e) => setTargetClassId(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {classesList.length > 0 ? (
                    classesList.map((c) => (
                      <option key={c.id || c.class_id} value={c.id || c.class_id}>
                        {c.name || c.class_name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="1">Class 1</option>
                      <option value="2">Class 2</option>
                      <option value="3">Class 3</option>
                      <option value="4">Class 4</option>
                      <option value="5">Class 5</option>
                      <option value="6">Class 6</option>
                      <option value="7">Class 7</option>
                      <option value="8">Class 8</option>
                      <option value="9">Class 9</option>
                      <option value="10">Class 10</option>
                      <option value="11">Class 11</option>
                      <option value="12">Class 12</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Academic Monthly Fee Settings */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" /> Academic Fee Structure
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Monthly Tuition Fee (₹)
                </label>
                <input
                  type="number"
                  value={tuitionFee}
                  onChange={(e) => setTuitionFee(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Transport / Bus Opt-in Section */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Bus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Opt-in for School Transport Service</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Quarterly bus fee charged on April, July, October, January</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={optsBusService}
                onChange={(e) => setOptsBusService(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            {optsBusService && (
              <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Distance Slab (KM)
                  </label>
                  <select
                    value={busDistanceSlab}
                    onChange={handleSlabChange}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="0-2 KM">0-2 KM (₹3,825/quarter)</option>
                    <option value="2-4 KM">2-4 KM (₹3,975/quarter)</option>
                    <option value="4-6 KM">4-6 KM (₹4,125/quarter)</option>
                    <option value="6-8 KM">6-8 KM (₹4,275/quarter)</option>
                    <option value="8-10 KM">8-10 KM (₹4,425/quarter)</option>
                    <option value="10-12 KM">10-12 KM (₹4,575/quarter)</option>
                    <option value="12-14 KM">12-14 KM (₹4,725/quarter)</option>
                    <option value="14-16 KM">14-16 KM (₹4,875/quarter)</option>
                    <option value="16-18 KM">16-18 KM (₹5,025/quarter)</option>
                    <option value="18-20 KM">18-20 KM (₹5,175/quarter)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Quarterly Bus Fee Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={busQuarterlyFee}
                    onChange={(e) => setBusQuarterlyFee(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-blue-600 dark:text-blue-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-2 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating Fees...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" /> Provision Student & Generate Fees
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentAdditionModal;
