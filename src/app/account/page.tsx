'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Key, ShieldCheck, Laptop, LogOut, Mail, Lock, Sparkles, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { UserAccount } from '../../types';

export default function AccountPage() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Load user from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('pluggedin_web_user');
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setTimeout(() => {
      const user: UserAccount = {
        uid: 'user_' + Math.random().toString(36).substring(2, 9),
        email,
        displayName: email.split('@')[0],
        tier: 'Standard',
        isLifetimeVIP: false,
        subscriptionStatus: 'none',
        ownedPlugins: ['PlugChop'],
        authorizedMachines: ['PRIMARY-STUDIO-RIG'],
      };
      setCurrentUser(user);
      localStorage.setItem('pluggedin_web_user', JSON.stringify(user));
      setLoading(false);
    }, 600);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('pluggedin_web_user');
  };

  const handleRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    setLoading(true);
    setPromoMessage(null);

    try {
      const res = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setPromoMessage({ type: 'success', text: data.message });
        
        // Update user state
        const updated: UserAccount = currentUser
          ? {
              ...currentUser,
              tier: 'Pioneer Beta Tester (Lifetime)',
              isLifetimeVIP: true,
              subscriptionStatus: 'active',
              ownedPlugins: ['ALL_15_PLUGINS'],
            }
          : {
              uid: 'user_vip_' + Math.random().toString(36).substring(2, 9),
              email: 'vip-creator@studio.com',
              displayName: 'VIP Creator',
              tier: 'Pioneer Beta Tester (Lifetime)',
              isLifetimeVIP: true,
              subscriptionStatus: 'active',
              ownedPlugins: ['ALL_15_PLUGINS'],
              authorizedMachines: ['STUDIO-DESKTOP-01'],
            };
        setCurrentUser(updated);
        localStorage.setItem('pluggedin_web_user', JSON.stringify(updated));
      } else {
        setPromoMessage({ type: 'error', text: data.error || 'Invalid promo code.' });
      }
    } catch {
      setPromoMessage({ type: 'error', text: 'Network error validating code.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          Producer Account & License Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Manage your active plugins, redeem VIP beta codes, and view machine activations.
        </p>
      </div>

      {currentUser ? (
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
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    currentUser.isLifetimeVIP
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
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
                    <span>1 of 3 Devices Used</span>
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

          {/* Promo Code Redemption Section */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/30 bg-gradient-to-r from-amber-500/5 via-transparent to-transparent">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Redeem VIP or Creator Code</h3>
                <p className="text-xs text-slate-400">Enter a code from Dylan or our team to unlock full studio access.</p>
              </div>
            </div>

            {promoMessage && (
              <div className={`p-3 rounded-xl mb-4 text-xs flex items-center space-x-2 border ${
                promoMessage.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}>
                {promoMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{promoMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleRedeemCode} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Try DYLANVIP or HOMIEPASS..."
                className="flex-1 px-4 py-3 bg-studio-950/80 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 uppercase font-mono tracking-wider transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-black shadow-glow-amber hover:brightness-110 active:scale-95 transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                <Key className="w-4 h-4" />
                <span>{loading ? 'Validating...' : 'Apply Code'}</span>
              </button>
            </form>
          </div>

          {/* Active Licenses List */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-base font-black text-white">Registered Studio Licenses</h3>
              <span className="text-xs text-cyber-cyan font-mono font-bold">15 PLUGINS SYNCED</span>
            </div>

            <div className="space-y-2">
              <div className="p-4 rounded-xl bg-studio-900/60 border border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-cyber-cyan/10 text-cyber-cyan flex items-center justify-center font-bold">
                    ★
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">PluggedIN Complete Studio Bundle</h4>
                    <p className="text-[11px] text-slate-400">Includes PlugChop 2.0, PLUGTNE, UNDERGRND, PLUGGED 1, and 11 more</p>
                  </div>
                </div>
                <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Activated in Central</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Sign In / Sign Up Card */
        <div className="max-w-md mx-auto glass-panel rounded-3xl p-8 border border-white/10 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-white">
              {isRegisterMode ? 'Create Studio Account' : 'Sign In to PluggedIN'}
            </h2>
            <p className="text-xs text-slate-400">
              Access your cloud licenses, preset library, and link with Central.
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="producer@studio.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-studio-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan/50 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-studio-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan/50 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-600 text-black text-xs font-black shadow-glow-cyan hover:brightness-110 active:scale-95 transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <span>{isRegisterMode ? 'Create Free Account' : 'Sign In'}</span>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsRegisterMode(!isRegisterMode)}
              className="text-xs text-slate-400 hover:text-cyber-cyan transition-all"
            >
              {isRegisterMode ? 'Already have an account? Sign in here' : "Don't have an account yet? Register for free"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
