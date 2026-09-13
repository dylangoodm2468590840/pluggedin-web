'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Key,
  ShieldCheck,
  Laptop,
  LogOut,
  Mail,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Download,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  tier: string;
  isLifetimeVIP: boolean;
  subscriptionStatus: string;
  ownedPlugins: string[];
  licenseKey: string;
  authorizedMachines: string[];
  createdAt: string;
}

export default function AccountPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');

  // Status banners
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [pendingBuyItem, setPendingBuyItem] = useState<{ id: string; name: string; price: string } | null>(null);

  // Check existing session from server or URL params on mount
  useEffect(() => {
    // Check URL parameters for reset token or buy intent
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode');
      const token = params.get('token');
      const paramEmail = params.get('email');
      const buyId = params.get('buy');
      const buyName = params.get('name');
      const buyPrice = params.get('price');

      if (mode === 'reset' && token) {
        setAuthMode('reset');
        setResetToken(token);
        if (paramEmail) setEmail(paramEmail);
      }

      if (buyId && buyPrice) {
        setPendingBuyItem({ id: buyId, name: buyName || buyId, price: buyPrice });
      }
    }

    checkActiveSession();
  }, []);

  const checkActiveSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem('pluggedin_web_user', JSON.stringify(data.user));
      } else {
        // Check local storage fallback
        const saved = localStorage.getItem('pluggedin_web_user');
        if (saved) {
          try {
            setCurrentUser(JSON.parse(saved));
          } catch {}
        }
      }
    } catch {
      const saved = localStorage.getItem('pluggedin_web_user');
      if (saved) {
        try {
          setCurrentUser(JSON.parse(saved));
        } catch {}
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to sign in.');
      } else {
        setCurrentUser(data.user);
        localStorage.setItem('pluggedin_web_user', JSON.stringify(data.user));
        setSuccessMessage('Signed in successfully! Welcome back.');
      }
    } catch {
      setErrorMessage('Network error while signing in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          displayName: displayName.trim() || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to create account.');
      } else {
        setCurrentUser(data.user);
        localStorage.setItem('pluggedin_web_user', JSON.stringify(data.user));
        setSuccessMessage('Account created successfully! You are now signed in forever.');
      }
    } catch {
      setErrorMessage('Network error while registering. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Could not find an account with that email.');
      } else {
        setSuccessMessage(
          'Password reset link generated! Click the button below to set your new password.'
        );
        if (data.resetToken) {
          setResetToken(data.resetToken);
        }
      }
    } catch {
      setErrorMessage('Network error requesting password reset.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-type your new password.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to reset password. The link may have expired.');
      } else {
        setSuccessMessage('Password reset successful! You can now sign in with your new password.');
        setTimeout(() => {
          setAuthMode('login');
          setPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }, 1200);
      }
    } catch {
      setErrorMessage('Network error while resetting password.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    setCurrentUser(null);
    localStorage.removeItem('pluggedin_web_user');
  };

  const copyLicenseKey = () => {
    if (currentUser?.licenseKey) {
      navigator.clipboard.writeText(currentUser.licenseKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[75vh]">
      <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          Producer Account &amp; License Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Permanent cloud credentials for PluggedIN Central, software activations, and All-Access passes.
        </p>
      </div>

      {/* Pending Plugin Purchase Notice */}
      {pendingBuyItem && (
        <div className="mb-8 p-5 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-studio-900 to-cyber-cyan/20 border border-emerald-500/40 shadow-glow-cyan">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-black flex items-center justify-center font-black text-lg shrink-0">
                $
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                  PERPETUAL LIFETIME LICENSE CHECKOUT
                </span>
                <h3 className="text-base font-black text-white">
                  {pendingBuyItem.name} — ${pendingBuyItem.price} Launch Price
                </h3>
                <p className="text-xs text-slate-300">
                  {currentUser
                    ? 'Your license key below activates this plugin on up to 3 studio machines.'
                    : 'Sign in or create your free account below to receive your permanent license key.'}
                </p>
              </div>
            </div>

            <Link
              href="/pricing"
              className="px-4 py-2 rounded-xl bg-cyber-purple/20 hover:bg-cyber-purple/30 text-cyber-purple border border-cyber-purple/40 text-xs font-bold transition-all text-center whitespace-nowrap"
            >
              Or get all 15 for $9.99/mo &rarr;
            </Link>
          </div>
        </div>
      )}

      {currentUser ? (
        /* LOGGED IN MEMBER DASHBOARD */
        <div className="space-y-8">
          {/* User Profile Banner */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyber-cyan to-cyber-purple text-black font-black text-xl flex items-center justify-center shadow-glow-cyan">
                {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'P'}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-black text-white">{currentUser.displayName}</h2>
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      currentUser.isLifetimeVIP
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}
                  >
                    {currentUser.tier}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{currentUser.email}</p>
                <div className="mt-2 flex items-center space-x-3 text-[11px] text-slate-400">
                  <span className="flex items-center space-x-1 text-cyber-cyan font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{currentUser.subscriptionStatus === 'active' ? 'Active Pass' : 'Standard'}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Laptop className="w-3.5 h-3.5" />
                    <span>{currentUser.authorizedMachines?.length || 1} of 3 Studio Devices</span>
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all self-start sm:self-auto"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Master License Key & Central Sync */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-cyber-cyan/30 bg-gradient-to-r from-cyber-cyan/5 via-transparent to-transparent space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30">
                  CLOUD LICENSE SYNC
                </span>
                <h3 className="text-lg font-black text-white mt-2">Master Studio Serial Key</h3>
                <p className="text-xs text-slate-400">Use this license key inside PluggedIN Central to unlock all 15 plugins.</p>
              </div>

              <div className="flex items-center space-x-2">
                <div className="font-mono text-sm font-black text-cyber-cyan bg-studio-950 px-4 py-2 rounded-xl border border-cyber-cyan/30">
                  {currentUser.licenseKey || 'PLUG-VIP-9999-STUDIO'}
                </div>
                <button
                  onClick={copyLicenseKey}
                  className="px-3 py-2 rounded-xl bg-cyber-cyan/20 hover:bg-cyber-cyan/30 text-cyber-cyan border border-cyber-cyan/40 text-xs font-bold flex items-center space-x-1 transition-all"
                  title="Copy License Key"
                >
                  {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <span className="text-slate-400">
                Log into <strong>PluggedIN Central</strong> with this email ({currentUser.email}) to auto-sync licenses.
              </span>
              <Link
                href="/download"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-600 text-black font-black text-xs shadow-glow-cyan hover:brightness-110 transition-all flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Desktop Central</span>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* AUTHENTICATION SCREENS (LOGIN / REGISTER / FORGOT / RESET) */
        <div className="max-w-md mx-auto">
          {/* Navigation Tabs */}
          <div className="flex rounded-2xl bg-studio-900 border border-white/10 p-1 mb-8">
            <button
              onClick={() => {
                setAuthMode('login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                authMode === 'login'
                  ? 'bg-cyber-cyan text-black shadow-glow-cyan'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setAuthMode('register');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                authMode === 'register'
                  ? 'bg-cyber-purple text-white shadow-glow-purple'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback alerts */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl mb-6 text-xs flex items-center space-x-2 bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl mb-6 text-xs flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* MODE: SIGN IN */}
          {authMode === 'login' && (
            <div className="glass-panel rounded-3xl p-8 border border-white/10">
              <h2 className="text-xl font-black text-white mb-2">Welcome Back</h2>
              <p className="text-xs text-slate-400 mb-6">
                Sign in to manage your licenses and connect PluggedIN Central.
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="producer@studio.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-studio-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyber-cyan/50"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('forgot');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="text-[11px] text-cyber-cyan hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-studio-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyber-cyan/50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-cyber-cyan hover:bg-cyber-cyan/90 text-black text-xs font-black shadow-glow-cyan transition-all disabled:opacity-50 mt-2"
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-white/5 text-center text-xs text-slate-400">
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => {
                    setAuthMode('register');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-cyber-cyan font-bold hover:underline"
                >
                  Create one now
                </button>
              </div>
            </div>
          )}

          {/* MODE: REGISTER */}
          {authMode === 'register' && (
            <div className="glass-panel rounded-3xl p-8 border border-white/10">
              <h2 className="text-xl font-black text-white mb-2">Create Permanent Account</h2>
              <p className="text-xs text-slate-400 mb-6">
                Your credentials will be saved forever so you can always log into Central.
              </p>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Producer / Display Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Metro Beats"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-studio-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyber-purple/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="producer@studio.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-studio-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyber-purple/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-studio-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyber-purple/50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-cyber-purple hover:bg-cyber-purple/90 text-white text-xs font-black shadow-glow-purple transition-all disabled:opacity-50 mt-2"
                >
                  {loading ? 'Creating Account...' : 'Create Account & Save Credentials'}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-white/5 text-center text-xs text-slate-400">
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-cyber-purple font-bold hover:underline"
                >
                  Sign in here
                </button>
              </div>
            </div>
          )}

          {/* MODE: FORGOT PASSWORD */}
          {authMode === 'forgot' && (
            <div className="glass-panel rounded-3xl p-8 border border-white/10">
              <h2 className="text-xl font-black text-white mb-2">Reset Your Password</h2>
              <p className="text-xs text-slate-400 mb-6">
                Enter your account email. We will generate an instant secure recovery link so you can reset your password immediately.
              </p>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="producer@studio.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-studio-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyber-cyan/50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-cyber-cyan hover:bg-cyber-cyan/90 text-black text-xs font-black shadow-glow-cyan transition-all disabled:opacity-50"
                >
                  {loading ? 'Finding Account...' : 'Send Recovery Link'}
                </button>
              </form>

              {resetToken && (
                <div className="mt-6 p-4 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/30 text-center space-y-3">
                  <p className="text-xs text-cyber-cyan font-bold">
                    Recovery Token Verified for {email}
                  </p>
                  <button
                    onClick={() => {
                      setAuthMode('reset');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="w-full py-2.5 rounded-xl bg-cyber-cyan text-black font-black text-xs shadow-glow-cyan hover:brightness-110 transition-all"
                  >
                    Proceed to Enter New Password &rarr;
                  </button>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-white/5 text-center text-xs text-slate-400">
                Remember your password?{' '}
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-cyber-cyan font-bold hover:underline"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          )}

          {/* MODE: RESET PASSWORD */}
          {authMode === 'reset' && (
            <div className="glass-panel rounded-3xl p-8 border border-white/10">
              <h2 className="text-xl font-black text-white mb-2">Set New Password</h2>
              <p className="text-xs text-slate-400 mb-6">
                Enter your new password below. Your account will be immediately updated.
              </p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-studio-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyber-cyan/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="Re-type new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-studio-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyber-cyan/50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black shadow-lg transition-all disabled:opacity-50 mt-2"
                >
                  {loading ? 'Updating Password...' : 'Save New Password & Sign In'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
