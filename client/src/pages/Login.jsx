import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, Eye, EyeOff, Lock, Mail, ArrowRight, Loader2, Sparkles } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-slate-100">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-500 to-indigo-500 text-white shadow-xl shadow-brand-500/30 mb-2">
            <Layers className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            CodeAlpha Project Manager
          </h1>
          <p className="text-sm text-slate-400">
            Sign in to manage projects, agile boards, and collaborate
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 text-xs font-medium text-rose-300 bg-rose-950/60 border border-rose-800/80 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-800/70 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-800/70 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-lg shadow-brand-600/30 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-400 mb-2.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Quick Demo Fill</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('alex@example.com', 'password123')}
                className="px-2.5 py-1.5 text-xs text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg text-left truncate transition-colors"
              >
                Alex (PM / Admin)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('sarah@example.com', 'password123')}
                className="px-2.5 py-1.5 text-xs text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg text-left truncate transition-colors"
              >
                Sarah (Engineer)
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs sm:text-sm text-slate-400">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-brand-400 hover:text-brand-300 underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
