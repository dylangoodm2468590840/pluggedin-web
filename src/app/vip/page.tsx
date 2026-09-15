'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, ShieldCheck, Download, Laptop, Apple, ArrowRight, Lock, Key, ShieldAlert } from 'lucide-react';

export default function VipInvitePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successUser, setSuccessUser] = useState<any | null>(null);
  const [isValidKey, setIsValidKey] = useState<boolean | null>(null);
  const [key, setKey] = useState('');

  const VALID_KEYS = [
    'dylan_vip_8f9c21b3',
    'dylan-vip-exclusive-2026',
    'dylan-vip-2026',
  ];

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const k = (params.get('key') || params.get('token') || params.get('access') || '').trim();
      if (VALID_KEYS.includes(k)) {
        setKey(k);
        setIsValidKey(true);
      } else {
        setIsValidKey(false);
      }
    } catch {
      setIsValidKey(false);
    }
  }, []);

  const winDownloadUrl = 'https://github.com/dylangoodm2468590840/pluggedin-releases-/releases/download/central-v3.0.3/PluggedIN-Central_Setup_3.0.3.exe';
  const macDownloadUrl = 'https://github.com/dylangoodm2468590840/pluggedin-releases-/releases/download/central-v3.0.0/PluggedIN.Central_Mac_Universal_3.0.2.dmg';

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register-vip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: name,
          email,
          password,
          vipKey: key,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to claim VIP pass.');
      }

      setSuccessUser(data.user);
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating your VIP account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-studio-950 text-white flex flex-col justify-center items-center px-4 py-16">
      <div className="w-full max-w-xl">
        {/* Top VIP Invitation Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono text-xs font-bold shadow-glow-purple">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>PRIVATE INVITATION • LIFETIME VIP PASS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Dylan Goodman Has Invited You to PluggedIN
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            You have been granted complimentary Lifetime VIP access to our entire audio plugin catalog. Zero renewals, zero fees, forever.
          </p>
        </div>

        {/* Card Container */}
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/10 shadow-2xl bg-studio-900/90 relative overflow-hidden">
          {/* Glowing Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

          {isValidKey === null ? (
            <div className="py-16 text-center text-slate-400 text-xs font-mono animate-pulse">
              Verifying VIP invitation credentials...
            </div>
          ) : !isValidKey ? (
            <div className="py-10 text-center space-y-5 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Private VIP Invitation Required
                </h2>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  This portal is strictly unlisted and by personal invitation only. If Dylan Goodman sent you an invitation link, please make sure you use the complete link with your access key.
                </p>
              </div>
              <div className="pt-3">
                <a
                  href="/"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all"
                >
                  <span>Return to Official Store</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : successUser ? (
            /* Success State */
            <div className="space-y-6 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-glow-emerald">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white">
                  VIP Studio Pass Activated!
                </h2>
                <p className="text-xs text-slate-300">
                  Welcome to the inner circle, <span className="text-purple-300 font-bold">{successUser.displayName || successUser.email}</span>.
                  Your account is permanently unlocked with Lifetime All-Access.
                </p>
              </div>

              {/* Step 2: Download Central */}
              <div className="p-5 rounded-2xl bg-studio-950 border border-white/10 text-left space-y-4">
                <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 font-bold">
                  <Key className="w-4 h-4" />
                  <span>STEP 2: DOWNLOAD & SIGN IN TO CENTRAL</span>
                </div>
                <p className="text-xs text-slate-400">
                  Open Plugged In Central on your computer and sign in with this email and password. All plugins will automatically unlock inside FL Studio, Ableton, and Logic.
                </p>

                {/* Separate Windows and Mac Download Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <a
                    href={winDownloadUrl}
                    className="p-3.5 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-600 text-black text-xs font-black shadow-glow-cyan hover:brightness-110 active:scale-95 transition-all flex items-center justify-center space-x-2"
                  >
                    <Laptop className="w-4 h-4" />
                    <span>Download Windows (.EXE)</span>
                  </a>

                  <a
                    href={macDownloadUrl}
                    className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-white text-xs font-bold active:scale-95 transition-all flex items-center justify-center space-x-2"
                  >
                    <Apple className="w-4 h-4" />
                    <span>Download macOS (.DMG)</span>
                  </a>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 font-mono">
                Already have Plugged In Central installed? Just open it on your PC and log in!
              </p>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleClaim} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300 block">Your Name / Producer Handle</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mike Beats"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-studio-950 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300 block">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. mike@studio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-studio-950 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300 block">Choose Password (Min 6 Characters)</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-studio-950 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* VIP Benefits Checklist */}
              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1.5 text-xs text-purple-200">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Permanent Lifetime VIP Pass (Never Expires)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>PLUGTNE, UNDERGRND, PLUG WARP & all future releases</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Authorized for up to 5 studio computers</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-mono font-black text-xs uppercase tracking-wider transition-all shadow-glow-purple flex items-center justify-center space-x-2 active:scale-98"
              >
                <span>{isLoading ? 'Activating VIP Pass...' : 'Claim Lifetime VIP Pass'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-1">
                <span className="text-[10px] text-slate-500 font-mono">
                  100% Free Invitation • No Credit Card Required
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
