'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Check, Flame, Shield, ArrowRight, Key, Zap } from 'lucide-react';
import { ALL_ACCESS_MONTHLY, ALL_ACCESS_ANNUAL, FOUNDERS_PROMO_MONTHLY, TOTAL_CATALOG_VALUE } from '../data/plugins';

export const PricingSection: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  return (
    <section id="pricing" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] ambient-glow-purple blur-[140px] pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyber-purple/10 border border-cyber-purple/20 text-xs font-bold text-cyber-purple">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ZERO-LOCKOUT ACCESS MODEL</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Unlock the Complete PluggedIN Suite
        </h2>
        <p className="text-sm sm:text-base text-slate-300">
          Subscribe to the All-Access Pass for every plugin plus all future drops, or purchase individual perpetual lifetime licenses.
        </p>

        {/* Monthly vs Annual Toggle */}
        <div className="pt-4 flex items-center justify-center space-x-3">
          <span className={`text-xs font-bold ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-500'}`}>
            Monthly Billing
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            className="w-14 h-7 rounded-full bg-studio-900 border border-white/10 p-1 relative transition-colors focus:outline-none"
          >
            <div
              className={`w-5 h-5 rounded-full bg-cyber-purple transition-all shadow-glow-purple ${
                billingCycle === 'annual' ? 'translate-x-7 bg-cyber-cyan shadow-glow-cyan' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-xs font-bold flex items-center space-x-1.5 ${billingCycle === 'annual' ? 'text-white' : 'text-slate-500'}`}>
            <span>Annual Billing</span>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyber-cyan text-black shadow-glow-cyan">
              Save 45%
            </span>
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
        {/* Tier 1: Single Perpetual License */}
        <div className="glass-panel rounded-3xl p-8 flex flex-col justify-between border border-white/10 glass-card-hover">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
              INDIVIDUAL OWNERSHIP
            </span>
            <h3 className="text-2xl font-black text-white mt-4">Single Plugin Perpetual</h3>
            <p className="text-xs text-slate-400 mt-2">
              Buy only the tools you need today. Own them forever with lifetime free updates and zero recurring fees.
            </p>

            <div className="my-6">
              <span className="text-4xl font-black text-white font-mono">$19 - $49</span>
              <span className="text-xs text-slate-400 block mt-1">One-time payment per plugin</span>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/5 text-xs text-slate-300">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Lifetime perpetual license for chosen plugin</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Free lifetime point updates (v1.0 ➔ v1.5)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Authorized on up to 3 studio machines</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>VST3 & AU format installers included</span>
              </div>
            </div>
          </div>

          <Link
            href="/#plugins"
            className="mt-8 w-full py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 transition-all text-center block"
          >
            Browse Individual Plugins
          </Link>
        </div>

        {/* Tier 2: The Flagship All-Access Studio Pass (Slate Style) */}
        <div className="relative rounded-3xl p-[2px] bg-gradient-to-b from-cyber-cyan via-cyber-purple to-pink-500 shadow-2xl lg:-translate-y-3">
          <div className="w-full h-full rounded-[22px] bg-studio-950 p-8 sm:p-9 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-cyber-purple text-white shadow-glow-purple">
                  MOST POPULAR • BEST VALUE
                </span>
                <span className="text-xs font-mono font-bold text-cyber-cyan line-through">
                  ${TOTAL_CATALOG_VALUE} Value
                </span>
              </div>

              <h3 className="text-3xl font-black text-white mt-4">All-Access Studio Pass</h3>
              <p className="text-xs text-slate-300 mt-2">
                Every current plugin, all future instrument releases, preset expansions, and cloud license sync across all your studio machines.
              </p>

              <div className="my-6">
                <div className="flex items-baseline space-x-2">
                  <span className="text-5xl font-black text-white font-mono">
                    ${billingCycle === 'monthly' ? ALL_ACCESS_MONTHLY : Math.round(ALL_ACCESS_ANNUAL / 12)}
                  </span>
                  <span className="text-sm text-slate-400 font-mono">/ month</span>
                </div>
                <span className="text-xs text-cyber-cyan block mt-1 font-medium">
                  {billingCycle === 'annual' ? `$99 billed annually (Save $80/year)` : 'Billed monthly. Cancel anytime in 1-click.'}
                </span>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/10 text-xs text-slate-200">
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-cyber-cyan shrink-0" />
                  <span><strong>All 15 Flagship Plugins</strong> unlocked instantly</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-cyber-cyan shrink-0" />
                  <span>Includes <strong>PlugChop 2.0</strong> 16-Pad Sampler</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-cyber-cyan shrink-0" />
                  <span>Includes <strong>PLUGTNE</strong> AutoTune & Formant Suite</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-cyber-cyan shrink-0" />
                  <span>Includes <strong>UNDERGRND</strong> Analog Heat Suite</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-cyber-cyan shrink-0" />
                  <span><strong>Every future plugin</strong> added at zero extra charge</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-cyber-cyan shrink-0" />
                  <span>1-click cloud sync inside PluggedIN Central</span>
                </div>
              </div>
            </div>

            <Link
              href="/account"
              className="mt-8 w-full py-4 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-600 text-black text-sm font-black shadow-glow-cyan hover:brightness-110 active:scale-95 transition-all text-center block"
            >
              Claim All-Access Pass Now
            </Link>
          </div>
        </div>

        {/* Tier 3: VIP Creator & Friends Pass */}
        <div className="glass-panel rounded-3xl p-8 flex flex-col justify-between border border-white/10 glass-card-hover">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              CREATORS & BETA TESTERS
            </span>
            <h3 className="text-2xl font-black text-white mt-4">VIP Promo Pass</h3>
            <p className="text-xs text-slate-400 mt-2">
              Received a creator code from Dylan or our beta team? Redeem your code to unlock lifetime access with zero payment required.
            </p>

            <div className="my-6">
              <span className="text-4xl font-black text-amber-400 font-mono">100% Free</span>
              <span className="text-xs text-slate-400 block mt-1">With valid invite or beta code</span>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/5 text-xs text-slate-300">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Instant full studio pass activation</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Zero credit card or payment info required</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Syncs with Central desktop app immediately</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Early access to pre-release beta builds</span>
              </div>
            </div>
          </div>

          <Link
            href="/account"
            className="mt-8 w-full py-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 transition-all text-center flex items-center justify-center space-x-1.5"
          >
            <Key className="w-4 h-4" />
            <span>Redeem VIP Code</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
