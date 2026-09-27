import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Input, Button } from '../../components/common/UIComponents';
import { Shield, Lock, User, ArrowRight } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-[#f8fafc]">
      {/* Left Branding Panel (Hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-[#771313] text-white p-12 relative overflow-hidden">
        {/* Abstract Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="absolute h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,0 L100,100 L100,0 Z" fill="#ffffff" />
            <path d="M0,100 L100,0 L100,100 Z" fill="#4a0404" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="bg-white p-3 rounded-xl inline-block shadow-lg mb-8">
            <img 
              src="/wce-logo.jpg" 
              alt="WCE Logo" 
              className="h-16 w-auto mix-blend-multiply" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            {/* Fallback icon if image is deleted or fails to load */}
            <Shield className="w-12 h-12 text-[#771313] hidden" />
          </div>
          <h1 className="text-4xl xl:text-5xl font-black tracking-tight leading-tight mb-4">
            Walchand College of Engineering
          </h1>
          <div className="h-1 w-16 bg-white/30 rounded-full mb-6"></div>
          <p className="text-xl font-medium text-white/90 mb-2 tracking-wide">
            Mentorship Platform
          </p>
          <p className="text-sm text-white/70 max-w-sm leading-relaxed">
            A comprehensive ecosystem designed to bridge the gap between mentors and mentees, tracking progress, achievements, and meetings efficiently.
          </p>
        </div>

        <div className="relative z-10 mt-auto">
          <p className="text-xs text-white/50 tracking-widest uppercase">
            &copy; {new Date().getFullYear()} WCE Sangli. All Rights Reserved.
          </p>
        </div>
      </div>

      {/* Right Login Form Panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20 xl:px-32 relative">
        <div className="w-full max-w-md mx-auto">
          
          {/* Mobile Logo Header */}
          <div className="lg:hidden text-center mb-8 flex flex-col items-center">
            <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 mb-4 inline-block">
              <img 
                src="/wce-logo.jpg" 
                alt="WCE Logo" 
                className="h-14 w-auto object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">WCE Mentorship</h2>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10 relative overflow-hidden">
            {/* Subtle top accent border */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-[#771313]"></div>

            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Welcome Back</h2>
              <p className="text-sm text-slate-500 mt-2 font-medium">Please enter your institutional credentials to access your dashboard.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50/80 border-l-4 border-red-500 text-red-700 p-4 rounded-lg text-sm flex items-start animate-fade-in shadow-sm">
                  <div className="font-bold flex-1">{error}</div>
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required 
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:ring-2 focus:ring-[#771313]/20 focus:border-[#771313] transition-all outline-none"
                    placeholder="Email or PRN"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:ring-2 focus:ring-[#771313]/20 focus:border-[#771313] transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-[#771313] hover:bg-[#590e0e] text-white py-3.5 px-4 rounded-xl font-bold tracking-wide transition-all shadow-lg shadow-[#771313]/30 disabled:opacity-70 disabled:cursor-not-allowed group active:scale-[0.98]"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Secure Login
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-xs font-medium text-slate-400">
              Having trouble connecting? Contact the IT administration desk.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
