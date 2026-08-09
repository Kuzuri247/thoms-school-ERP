import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { getRoleHomePath } from '../utils/roleUtils';
import { Mail, Lock, AlertCircle, ArrowRight, GraduationCap, Sparkles, Shield, User, CreditCard, Crown, Bus, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { login, setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isDemoEnabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO_LOGIN === 'true';

  const demoAccounts = isDemoEnabled
    ? [
        { role: 'Super Admin', email: 'superadmin@stthomas.edu', pass: 'Thomson2026!', targetRole: 'super_admin', icon: Crown, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
        { role: 'Admin', email: 'admin@stthomas.edu', pass: 'Thomson2026!', targetRole: 'admin', icon: Shield, color: 'bg-purple-50 text-purple-700 border-purple-200' },
        { role: 'Teacher', email: 'teacher@stthomas.edu', pass: 'Thomson2026!', targetRole: 'teacher', icon: GraduationCap, color: 'bg-amber-50 text-amber-700 border-amber-200' },
        { role: 'Student', email: 'student@stthomas.edu', pass: 'Thomson2026!', targetRole: 'student', icon: User, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        { role: 'Cashier', email: 'cashier@stthomas.edu', pass: 'Thomson2026!', targetRole: 'cashier', icon: CreditCard, color: 'bg-blue-50 text-blue-700 border-blue-200' },
      ]
    : [];

  const redirectUserByRole = (userRole) => {
    const targetPath = getRoleHomePath({ role: userRole });
    navigate(targetPath);
  };

  const handleQuickFill = async (acc) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setError('');
    setLoading(true);
    try {
      const res = await login(acc.email, acc.pass);
      setLoading(false);
      if (res.success) {
        redirectUserByRole(res.user?.role || acc.targetRole);
      } else {
        setError(res.error || 'Quick fill login failed. Please verify user setup.');
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'An unexpected error occurred during quick fill login.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        redirectUserByRole(res.user?.role);
      } else {
        setError(res.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'An unexpected error occurred during login');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="relative max-w-md w-full space-y-6 bg-white p-8 rounded-2xl border border-slate-200/90 shadow-md">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-md border border-slate-200 p-1">
            <img src="/st_thomas_logo.png" alt="St. Thomas International School Emblem" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            St. Thomas International School
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Center of Excellence • Official ERP Portal
          </p>
        </div>

        {/* Demo Account Quick Selector */}
        {isDemoEnabled && (
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
              <span>Demo Quick-Select</span>
              <Sparkles className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {demoAccounts.map((acc) => {
                const IconComp = acc.icon;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleQuickFill(acc)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95 cursor-pointer ${acc.color}`}
                  >
                    <IconComp className="w-3 h-3" /> {acc.role}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <span className="text-xs font-semibold">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 h-4 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-800 font-medium text-sm transition-all"
                  placeholder="user@stthomas.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider" htmlFor="password">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 h-4 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-800 font-medium text-sm transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-650 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none transition-all shadow-xs active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Sign in to Portal'}
            <ArrowRight className="ml-2 w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
