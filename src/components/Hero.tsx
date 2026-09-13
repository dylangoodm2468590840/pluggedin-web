'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Download, ArrowRight, Flame, CheckCircle2, Sliders, Music, Zap } from 'lucide-react';
import { FOUNDERS_SPOTS_REMAINING, FOUNDERS_SPOTS_TOTAL, TOTAL_CATALOG_VALUE } from '../data/plugins';

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-12 pb-24 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] ambient-glow-cyan blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[450px] h-[300px] ambient-glow-purple blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Scarcity Founder Banner */}
        <div className="flex justify-center mb-8">
          <Link
            href="/pricing"
            className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-studio-900/90 border border-cyber-cyan/30 text-xs text-slate-300 shadow-glow-cyan hover:border-cyber-cyan/60 transition-all group"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-cyan"></span>
            </span>
            <span className="font-extrabold text-white">FOUNDER&apos;S PASS:</span>
            <span className="text-slate-300">Only <strong className="text-cyber-cyan">{FOUNDERS_SPOTS_REMAINING} of {FOUNDERS_SPOTS_TOTAL}</strong> spots left @ $9.99/mo</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyber-cyan group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Main Headline */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
            Studio-Grade Plugins Built for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan via-sky-400 to-cyber-purple">
              Modern Hitmakers.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            From the new <strong>PlugChop 16-pad playable sampler</strong> to zero-latency pitch correction and analog tube heat. 15 plugins engineered natively for FL Studio, Pro Tools, Logic Pro, and Ableton.
          </p>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/download"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyber-cyan to-blue-600 text-black text-sm font-black shadow-glow-cyan hover:brightness-110 active:scale-95 transition-all flex items-center justify-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>Download PluggedIN Central (Free)</span>
            </Link>

            <Link
              href="/pricing"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-studio-900 border border-white/10 text-white text-sm font-bold hover:bg-studio-850 hover:border-white/20 transition-all flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-5 h-5 text-cyber-purple" />
              <span>Get All-Access Pass • $14.99</span>
            </Link>
          </div>

          {/* Social Proof & Guarantee Badges */}
          <div className="pt-6 flex items-center justify-center flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Zero-Latent Monitoring</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Apple Silicon M1/M2/M3 & Windows x64</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>VST3 & AU Ready</span>
            </div>
          </div>
        </div>

        {/* 3D Hardware Rack Showcase Hero */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="relative rounded-3xl p-1 bg-gradient-to-b from-white/15 via-white/5 to-transparent shadow-2xl">
            <div className="rounded-[22px] bg-studio-900/90 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs font-mono text-slate-400">PLUGGEDIN STUDIO RACK ENGINE • 15 ACTIVE HARDWARE PROCESSORS</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-cyber-cyan font-mono font-bold bg-cyber-cyan/10 px-2.5 py-1 rounded-lg border border-cyber-cyan/20">
                  <Zap className="w-3.5 h-3.5" />
                  <span>32-BIT FLOAT 192kHz</span>
                </div>
              </div>

              {/* 3 Featured Units Inside the Rack */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Rack Unit 1: PlugChop */}
                <div className="rounded-2xl bg-studio-950 p-5 border border-amber-500/30 shadow-glow-amber flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        SAMPLER
                      </span>
                      <span className="text-xs font-mono text-slate-400">DEV-1022</span>
                    </div>
                    <h3 className="text-lg font-black text-white mt-3">PLUGCHOP 2.0</h3>
                    <p className="text-xs text-slate-400 mt-1">16-Pad playable slicing MPC workstation with choke groups & auto-transient detection.</p>
                    
                    {/* Simulated 16 pads */}
                    <div className="grid grid-cols-4 gap-1.5 my-4">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-7 rounded-md flex items-center justify-center text-[9px] font-mono font-bold transition-all ${
                            i === 5 || i === 9 || i === 12
                              ? 'bg-amber-500 text-black shadow-glow-amber'
                              : 'bg-studio-850 text-slate-400 hover:bg-studio-800'
                          }`}
                        >
                          P{i + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                    <span className="font-mono text-amber-400 font-bold">$39 Perpetual</span>
                    <span className="text-[11px] text-slate-400">or with All-Access</span>
                  </div>
                </div>

                {/* Rack Unit 2: PLUGTNE */}
                <div className="rounded-2xl bg-studio-950 p-5 border border-cyber-cyan/30 shadow-glow-cyan flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30">
                        VOCAL MULTI-FX
                      </span>
                      <span className="text-xs font-mono text-slate-400">DEV-1079</span>
                    </div>
                    <h3 className="text-lg font-black text-white mt-3">PLUGTNE v1.0.3</h3>
                    <p className="text-xs text-slate-400 mt-1">Real-time low-latency pitch snap with dual vector oscilloscope & chromatic key scale detector.</p>
                    
                    {/* Simulated vector oscilloscope */}
                    <div className="my-4 h-24 rounded-xl bg-studio-900 border border-cyber-cyan/20 flex items-center justify-center p-2 relative overflow-hidden">
                      <div className="absolute inset-0 bg-cyber-cyan/5"></div>
                      <div className="w-full flex items-center justify-center space-x-1.5 h-12">
                        {[40, 65, 80, 50, 95, 70, 85, 60, 90, 75, 45, 85, 60].map((h, i) => (
                          <div
                            key={i}
                            className="w-1.5 bg-cyber-cyan rounded-full animate-waveform"
                            style={{ height: `${h}%`, animationDelay: `${i * 0.08}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                    <span className="font-mono text-cyber-cyan font-bold">$49 Perpetual</span>
                    <span className="text-[11px] text-slate-400">or with All-Access</span>
                  </div>
                </div>

                {/* Rack Unit 3: UNDERGRND */}
                <div className="rounded-2xl bg-studio-950 p-5 border border-cyber-rose/30 shadow-glow-rose flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-cyber-rose/20 text-cyber-rose border border-cyber-rose/30">
                        ANALOG HEAT
                      </span>
                      <span className="text-xs font-mono text-slate-400">DEV-0110</span>
                    </div>
                    <h3 className="text-lg font-black text-white mt-3">UNDERGRND v4.2</h3>
                    <p className="text-xs text-slate-400 mt-1">12AX7 tube saturation, pitch formant demon warping, and sub-bass generator for aggressive trap 808s.</p>
                    
                    {/* Simulated Tube VU display */}
                    <div className="my-4 h-24 rounded-xl bg-studio-900 border border-cyber-rose/20 p-3 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>12AX7 DRIVE</span>
                        <span className="text-cyber-rose font-bold">+18.5 dB</span>
                      </div>
                      <div className="w-full h-3 bg-studio-950 rounded-full overflow-hidden p-0.5 border border-white/10">
                        <div className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-cyber-rose rounded-full" style={{ width: '78%' }} />
                      </div>
                      <div className="flex justify-between text-[9px] font-mono text-slate-500">
                        <span>CLEAN</span>
                        <span>SATURATE</span>
                        <span className="text-rose-400">DEMON</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                    <span className="font-mono text-cyber-rose font-bold">$29 Perpetual</span>
                    <span className="text-[11px] text-slate-400">or with All-Access</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
