import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { getRoleHomePath } from '../utils/roleUtils';
import { Mail, Lock, AlertCircle, ArrowRight, GraduationCap, Sparkles, Shield, User, CreditCard, Crown } from 'lucide-react';

const Login = () => {
  const { login, setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const demoAccounts = [
    { role: 'Super Admin', email: 'superadmin2@erp.com', pass: 'password123', targetRole: 'super_admin', icon: Crown, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { role: 'Admin', email: 'admin1@erp.com', pass: 'password123', targetRole: 'admin', icon: Shield, color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { role: 'Teacher', email: 'teacher1@erp.com', pass: 'password123', targetRole: 'teacher', icon: GraduationCap, color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { role: 'Student', email: 'student1@erp.com', pass: 'password123', targetRole: 'student', icon: User, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { role: 'Cashier', email: 'cashier@erp.com', pass: 'password123', targetRole: 'cashier', icon: CreditCard, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  ];

  const redirectUserByRole = (userRole) => {
    const targetPath = getRoleHomePath({ role: userRole });
    navigate(targetPath);
  };

  const handleQuickFill = (acc) => {
    setEmail(acc.email);
    setPassword(acc.pass);

    const demoUser = {
      id: 'demo-' + acc.targetRole,
      full_name: 'Demo ' + acc.role,
      email: acc.email,
      role: acc.targetRole,
    };

    setAuth(demoUser, 'demo-token');
    redirectUserByRole(acc.targetRole);
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
    <div className="min-h-screen relative flex items-center justify-center bg-slate-950 p-4 sm:p-6 lg:p-8 overflow-hidden font-sans">
      {/* Dynamic Ambient Mesh Glow Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/30 via-violet-600/20 to-pink-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-blue-600/20 blur-[90px] rounded-full pointer-events-none" />

      <div className="relative max-w-md w-full space-y-6 bg-slate-900/80 backdrop-blur-2xl p-8 rounded-3xl border border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-violet-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30 border border-indigo-400/20">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            Thomson ERP
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Unified Role-Based School Portal
          </p>
        </div>

        {/* Demo Account Quick Selector */}
        <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
            <span>Demo Quick-Select</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {demoAccounts.map((acc) => {
              const IconComp = acc.icon;
              return (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleQuickFill(acc)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95 ${acc.color}`}
                >
                  <IconComp className="w-3 h-3" /> {acc.role}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-2xl flex items-start gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <span className="text-xs font-semibold">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 h-4 text-slate-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-medium text-sm transition-all"
                  placeholder="user@thoms.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider" htmlFor="password">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 h-4 text-slate-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-medium text-sm transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-lg shadow-indigo-600/30 active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign in to Portal'}
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
