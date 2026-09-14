'use client';

import React, { useState, useEffect } from 'react';
import { Download, Laptop, Apple, ShieldCheck, RefreshCw, Sparkles, ArrowRight } from 'lucide-react';

export const DownloadHub: React.FC = () => {
  const [os, setOs] = useState<'mac' | 'win'>('win');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent.toLowerCase();
      if (userAgent.includes('mac') || userAgent.includes('darwin')) {
        setOs('mac');
      } else {
        setOs('win');
      }
    }
  }, []);

  const winDownloadUrl = 'https://github.com/dylangoodm2468590840/pluggedin-releases-/releases/download/central-v3.0.3/PluggedIN-Central_Setup_3.0.3.exe';
  const macDownloadUrl = 'https://github.com/dylangoodm2468590840/pluggedin-releases-/releases/download/central-v3.0.0/PluggedIN.Central_Mac_Universal_3.0.2.dmg';

  return (
    <section id="download" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl p-[1.5px] bg-gradient-to-r from-cyber-cyan/40 via-cyber-purple/40 to-pink-500/40 shadow-2xl">
        <div className="rounded-[22px] bg-studio-950 p-8 sm:p-14 flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Info */}
          <div className="space-y-6 max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/20 text-xs font-bold text-cyber-cyan">
              <Download className="w-3.5 h-3.5" />
              <span>THE DESKTOP HUB</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              PluggedIN Central
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              The official desktop manager for all your instruments and effects. Install plugins in 1-click, sync licenses across machines, and receive autonomous background updates directly to your DAW folders.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-cyber-cyan shrink-0" />
                <span>Zero intrusive DRM / Offline Safe</span>
              </div>
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-cyber-cyan shrink-0" />
                <span>Autonomous in-app updating</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-cyber-cyan shrink-0" />
                <span>1-Click DAW scan cache repair</span>
              </div>
              <div className="flex items-center space-x-2">
                <Laptop className="w-4 h-4 text-cyber-cyan shrink-0" />
                <span>Supports up to 3 studio machines</span>
              </div>
            </div>
          </div>

          {/* Right Download Action Card */}
          <div className="w-full lg:w-96 rounded-2xl bg-studio-900 border border-white/10 p-6 sm:p-8 flex flex-col items-center text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyber-cyan to-blue-600 p-0.5 shadow-glow-cyan flex items-center justify-center">
              <div className="w-full h-full bg-studio-950 rounded-[14px] flex items-center justify-center">
                {os === 'mac' ? (
                  <Apple className="w-8 h-8 text-white" />
                ) : (
                  <Laptop className="w-8 h-8 text-cyber-cyan" />
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-black text-white">
                PluggedIN Central v3.0.2
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {os === 'mac' ? 'macOS Universal (Apple Silicon & Intel)' : 'Windows x64 (10 / 11)'}
              </p>
            </div>

            {/* Primary OS Download CTA */}
            <a
              href={os === 'mac' ? macDownloadUrl : winDownloadUrl}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-600 text-black text-xs font-black shadow-glow-cyan hover:brightness-110 active:scale-95 transition-all flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>
                Download for {os === 'mac' ? 'macOS (DMG)' : 'Windows (EXE)'}
              </span>
            </a>

            {/* Alternate OS link */}
            <div className="text-[11px] text-slate-400 flex items-center space-x-2">
              <span>Also available for:</span>
              {os === 'mac' ? (
                <a
                  href={winDownloadUrl}
                  className="text-cyber-cyan font-bold hover:underline"
                >
                  Windows (EXE)
                </a>
              ) : (
                <a
                  href={macDownloadUrl}
                  className="text-cyber-cyan font-bold hover:underline"
                >
                  macOS (DMG)
                </a>
              )}
            </div>

            <div className="text-[10px] text-slate-500 font-mono">
              100% Free Download • No Account Required to Install
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
