import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Sparkles, Check, ArrowLeft, Download, ShieldCheck, Cpu, Layers, CheckCircle2, Zap, MonitorCheck, ArrowRight } from 'lucide-react';
import { PLUGINS_DATA, getPluginImageUrl } from '../../../data/plugins';

export function generateStaticParams() {
  return PLUGINS_DATA.map((plugin) => ({
    id: plugin.id,
  }));
}

const COMPATIBLE_DAWS = [
  { name: 'FL Studio', version: '20, 21, 2026+', format: 'Native VST3' },
  { name: 'Ableton Live', version: '10, 11, 12+', format: 'VST3 / AU' },
  { name: 'Apple Logic Pro', version: '10.7, 11+', format: 'AU (Silicon M1-M4)' },
  { name: 'Avid Pro Tools', version: '2023, 2024+', format: 'VST3 Bridge / PatchWork' },
  { name: 'PreSonus Studio One', version: '5, 6+', format: 'Native VST3' },
  { name: 'Cockos REAPER', version: '6, 7+', format: 'Native VST3' },
];

export default function PluginDetailPage({ params }: { params: { id: string } }) {
  const plugin = PLUGINS_DATA.find((p) => p.id === params.id);

  if (!plugin) {
    notFound();
  }

  return (
    <div className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top All-Access Pass Promo Banner */}
      <div className="mb-8 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-cyber-purple/20 via-studio-900 to-cyber-cyan/20 border border-cyber-cyan/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-glow-cyan">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyber-cyan to-cyber-purple p-0.5 shadow-glow-cyan shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-studio-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyber-cyan" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black uppercase text-white tracking-wide">ALL-ACCESS STUDIO PASS</span>
              <span className="text-[10px] font-mono font-bold text-cyber-cyan bg-cyber-cyan/10 px-2 py-0.5 rounded border border-cyber-cyan/30">BEST VALUE</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Unlock <strong>{plugin.name}</strong> plus all 14 other plugins for just <strong>$14.99/mo</strong>. Cancel anytime.
            </p>
          </div>
        </div>
        <Link
          href="/pricing"
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-600 hover:brightness-110 text-black font-black text-xs shadow-glow-cyan whitespace-nowrap transition-all flex items-center justify-center space-x-1.5"
        >
          <span>Claim All-Access Pass ($14.99/mo)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Back Link */}
      <Link
        href="/#plugins"
        className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white transition-colors mb-6"
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
              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 text-[10px]">
                OFFICIAL RELEASE
              </span>
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
                  Launch Sale -{Math.round(((plugin.retailPrice - plugin.salePrice) / plugin.retailPrice) * 100)}%
                </span>
              </div>
              <span className="text-xs text-slate-400 block mt-1">
                One-time purchase • Perpetual lifetime license • 3 machine authorizations
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Link
                href={`/account?buy=${plugin.id}&name=${encodeURIComponent(plugin.name)}&price=${plugin.salePrice}`}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-600 text-black text-xs font-black shadow-glow-cyan hover:brightness-110 active:scale-95 transition-all flex items-center justify-center space-x-2"
              >
                <span>Buy Lifetime License • ${plugin.salePrice}</span>
              </Link>
              <Link
                href="/pricing"
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-studio-900 border border-white/10 text-white text-xs font-bold hover:bg-studio-850 hover:border-white/20 transition-all flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-cyber-purple" />
                <span>Or All-Access ($14.99/mo)</span>
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

        <div className="mt-4 rounded-2xl overflow-hidden bg-studio-950/80 border border-white/10 shadow-2xl relative flex items-center justify-center p-2">
          <img
            src={getPluginImageUrl(plugin.id)}
            alt={`${plugin.name} Full Faceplate Screenshot`}
            className="w-full max-h-[600px] object-contain mx-auto"
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
              <span className="font-mono text-white font-bold">macOS 11+ (Apple Silicon & Intel)</span>
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

      {/* Verified DAW Compatibility Grid */}
      <div className="mt-12 rounded-3xl bg-studio-900/60 border border-white/10 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <MonitorCheck className="w-6 h-6 text-emerald-400" />
          <div>
            <h3 className="text-lg font-black text-white">Verified DAW Compatibility</h3>
            <p className="text-xs text-slate-400">Strictly tested and verified against plugin scanner crashes and AU validation tests.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {COMPATIBLE_DAWS.map((daw, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-studio-950 border border-white/5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center space-x-1.5 text-xs font-black text-white">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{daw.name}</span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">{daw.version}</span>
              </div>
              <span className="text-[10px] font-mono text-cyber-cyan bg-cyber-cyan/10 px-2 py-0.5 rounded mt-3 text-center">
                {daw.format}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Slate Digital / Waves Style Trust & Guarantee Box */}
      <div className="mt-8 rounded-3xl bg-gradient-to-r from-studio-950 via-studio-900 to-studio-950 border border-white/10 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-cyber-cyan" />
          </div>
          <div>
            <h4 className="text-base font-black text-white">Instant Digital Delivery & Zero Dongles</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              All digital software license sales are final. Instant machine authorization and offline DAW usage via PluggedIN Central with no iLok USB hardware dongles required.
            </p>
          </div>
        </div>

        <Link
          href="/download"
          className="w-full md:w-auto px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center space-x-2 border border-white/10"
        >
          <Download className="w-4 h-4 text-cyber-cyan" />
          <span>Install with Central</span>
        </Link>
      </div>
    </div>
  );
}
