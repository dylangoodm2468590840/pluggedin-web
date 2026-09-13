import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Sparkles, Check, ArrowLeft, Download, ShieldCheck, Cpu, Layers } from 'lucide-react';
import { PLUGINS_DATA } from '../../../data/plugins';

export function generateStaticParams() {
  return PLUGINS_DATA.map((plugin) => ({
    id: plugin.id,
  }));
}

export default function PluginDetailPage({ params }: { params: { id: string } }) {
  const plugin = PLUGINS_DATA.find((p) => p.id === params.id);

  if (!plugin) {
    notFound();
  }

  return (
    <div className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back Link */}
      <Link
        href="/#plugins"
        className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Plugin Catalog</span>
      </Link>

      {/* Main Header Card */}
      <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-white/10 relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20">
              {plugin.category}
            </span>
            <div className="flex items-center space-x-2 font-mono text-xs text-slate-400">
              <span>v{plugin.latestVersion}</span>
              <span>•</span>
              <span className="text-cyber-cyan">{plugin.devBuild}</span>
            </div>
          </div>

          <div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {plugin.name}
            </h1>
            <p className="text-base sm:text-lg text-slate-300 mt-2">
              {plugin.subtitle}
            </p>
          </div>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
            {plugin.description}
          </p>

          {/* Pricing & CTA Banner */}
          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-baseline space-x-3">
                <span className="text-4xl font-black text-white font-mono">
                  ${plugin.salePrice}
                </span>
                <span className="text-base text-slate-500 line-through font-mono">
                  ${plugin.retailPrice}
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Save {Math.round(((plugin.retailPrice - plugin.salePrice) / plugin.retailPrice) * 100)}%
                </span>
              </div>
              <span className="text-xs text-slate-400 block mt-1">
                One-time purchase • Lifetime updates • 3 machine activations
              </span>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <Link
                href="/pricing"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-600 text-black text-xs font-black shadow-glow-cyan hover:brightness-110 active:scale-95 transition-all flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Get with All-Access Pass ($14.99/mo)</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Real Hardware VST3 Interface Showcase */}
      <div className="mt-10 glass-panel rounded-3xl p-4 sm:p-6 border border-white/10 relative overflow-hidden group">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 px-2">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-cyan animate-pulse" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Authentic VST3 / AU Hardware GUI Faceplate
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
            Native JUCE 7 • 64-Bit Float
          </span>
        </div>

        <div className="mt-4 rounded-2xl overflow-hidden bg-studio-950/80 border border-white/10 shadow-2xl relative">
          <img
            src={`/images/plugins/${plugin.id}.png`}
            alt={`${plugin.name} Full Faceplate Screenshot`}
            className="w-full h-auto object-contain mx-auto"
          />
        </div>
      </div>

      {/* Feature Breakdown & Specifications */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Core Features */}
        <div className="glass-panel rounded-3xl p-8 border border-white/10 space-y-4">
          <div className="flex items-center space-x-2 text-white font-black text-lg">
            <Layers className="w-5 h-5 text-cyber-cyan" />
            <span>Key Engineering Highlights</span>
          </div>
          <ul className="space-y-3 pt-2">
            {plugin.features.map((feat, i) => (
              <li key={i} className="flex items-start space-x-3 text-xs sm:text-sm text-slate-300">
                <Check className="w-4 h-4 text-cyber-cyan shrink-0 mt-0.5" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* System Specs */}
        <div className="glass-panel rounded-3xl p-8 border border-white/10 space-y-4">
          <div className="flex items-center space-x-2 text-white font-black text-lg">
            <Cpu className="w-5 h-5 text-cyber-purple" />
            <span>Technical Specifications</span>
          </div>
          <div className="space-y-3 pt-2 text-xs sm:text-sm text-slate-300 divide-y divide-white/5">
            <div className="flex justify-between py-2">
              <span className="text-slate-400">Plugin Formats:</span>
              <span className="font-mono text-white font-bold">VST3, Audio Units (AU)</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">macOS Support:</span>
              <span className="font-mono text-white font-bold">macOS 11+ (M1/M2/M3 & Intel)</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">Windows Support:</span>
              <span className="font-mono text-white font-bold">Windows 10 / 11 (64-bit)</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">DSP Architecture:</span>
              <span className="font-mono text-white font-bold">64-bit Internal / 32-bit Float</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">Host Latency:</span>
              <span className="font-mono text-emerald-400 font-bold">0 Samples (Zero-Latency)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
