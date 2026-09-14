'use client';

import React, { useState } from 'react';
import { Cpu, Sliders, Sparkles, Code2, ShieldCheck, Check, Copy, Layers, Eye, Download } from 'lucide-react';

export interface PluginSpec {
  name: string;
  tagline: string;
  category: string;
  chassisTheme: 'cyberpunk_cyan' | 'analog_warm_amber' | 'stealth_obsidian' | 'vintage_gold' | 'neon_purple';
  controls: Array<{ id: string; label: string; type: 'knob' | 'slider' | 'switch'; defaultValue: number; unit?: string }>;
  dspBreakdown: string[];
  competitorEdge: string;
  targetBpmKey?: string;
  cppSnippet?: string;
}

interface Props {
  spec: PluginSpec;
  onClose?: () => void;
}

export default function JarvisPluginLab({ spec, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'gui' | 'dsp' | 'cpp'>('gui');
  const [copied, setCopied] = useState(false);
  const [knobValues, setKnobValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    spec.controls.forEach((c) => {
      initial[c.id] = c.defaultValue;
    });
    return initial;
  });

  const getThemeStyles = () => {
    switch (spec.chassisTheme) {
      case 'analog_warm_amber':
        return {
          border: 'border-amber-500/50',
          glow: 'shadow-[0_0_50px_rgba(245,158,11,0.2)]',
          accent: '#f59e0b',
          bg: 'from-amber-950/40 via-slate-900 to-black',
          knobStroke: '#f59e0b',
        };
      case 'neon_purple':
        return {
          border: 'border-purple-500/50',
          glow: 'shadow-[0_0_50px_rgba(168,85,247,0.2)]',
          accent: '#a855f7',
          bg: 'from-purple-950/40 via-slate-900 to-black',
          knobStroke: '#c084fc',
        };
      case 'vintage_gold':
        return {
          border: 'border-yellow-600/50',
          glow: 'shadow-[0_0_50px_rgba(202,138,4,0.2)]',
          accent: '#eab308',
          bg: 'from-yellow-950/30 via-slate-900 to-black',
          knobStroke: '#facc15',
        };
      case 'stealth_obsidian':
        return {
          border: 'border-slate-700/60',
          glow: 'shadow-[0_0_50px_rgba(100,116,139,0.15)]',
          accent: '#94a3b8',
          bg: 'from-slate-900 via-black to-black',
          knobStroke: '#cbd5e1',
        };
      default: // cyberpunk_cyan
        return {
          border: 'border-cyber-cyan/50',
          glow: 'shadow-[0_0_50px_rgba(0,240,255,0.2)]',
          accent: '#00f0ff',
          bg: 'from-cyan-950/40 via-slate-900 to-black',
          knobStroke: '#00f0ff',
        };
    }
  };

  const theme = getThemeStyles();

  const handleCopyCpp = () => {
    if (spec.cppSnippet) {
      navigator.clipboard.writeText(spec.cppSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`w-full rounded-3xl border ${theme.border} bg-gradient-to-b ${theme.bg} p-4 sm:p-6 ${theme.glow} my-4 text-left font-sans`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30">
              <Sparkles className="w-3 h-3" />
              AI Plugin R&D Lab
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              JUCE C++ Verified Spec
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            {spec.name}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300">
            {spec.tagline}
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="flex items-center bg-black/50 p-1 rounded-xl border border-white/10 text-xs font-mono">
          <button
            onClick={() => setActiveTab('gui')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'gui' ? 'bg-cyber-cyan text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Hardware GUI
          </button>
          <button
            onClick={() => setActiveTab('dsp')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'dsp' ? 'bg-cyber-cyan text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            DSP Math
          </button>
          {spec.cppSnippet && (
            <button
              onClick={() => setActiveTab('cpp')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'cpp' ? 'bg-cyber-cyan text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              C++ JUCE
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Interactive Hardware GUI Mockup */}
      {activeTab === 'gui' && (
        <div className="space-y-4">
          {/* Plugin Chassis Faceplate */}
          <div className="relative rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-white/15 p-6 shadow-2xl overflow-hidden">
            {/* Metallic Brush Texture & Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                <span className="font-mono text-xs tracking-widest text-slate-400 uppercase">
                  PluggedIN Audio • {spec.category}
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-500">
                0ms Latency DSP • 64-bit Floating Point
              </div>
            </div>

            {/* Glowing OLED Center Display */}
            <div className="w-full bg-black/80 rounded-xl border border-white/10 p-4 mb-6 shadow-inner flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-mono text-cyber-cyan uppercase tracking-widest">
                  OLED Signal Visualizer
                </div>
                <div className="text-sm font-bold text-white mt-0.5">
                  Dynamic Adaptive Response Engine
                </div>
              </div>

              {/* Animated Waveform Bars */}
              <div className="flex items-end gap-1.5 h-8">
                {[30, 65, 85, 45, 95, 60, 40, 75, 55, 90, 35, 70].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%`, backgroundColor: theme.accent }}
                    className="w-1.5 rounded-t-sm opacity-80 animate-pulse"
                  />
                ))}
              </div>

              <div className="text-right font-mono text-xs">
                <span className="text-slate-400">Target: </span>
                <span className="text-cyber-cyan font-bold">{spec.targetBpmKey || 'FL Studio 140 BPM'}</span>
              </div>
            </div>

            {/* Hardware Knobs & Sliders Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-2">
              {spec.controls.map((ctrl) => {
                const val = knobValues[ctrl.id] ?? ctrl.defaultValue;
                return (
                  <div
                    key={ctrl.id}
                    className="flex flex-col items-center bg-slate-900/50 rounded-xl p-3 border border-white/5 hover:border-white/20 transition-all"
                  >
                    {/* Simulated Radial Knob */}
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="26"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="4"
                          fill="none"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="26"
                          stroke={theme.knobStroke}
                          strokeWidth="4"
                          strokeDasharray={163}
                          strokeDashoffset={163 - (163 * (val / 100))}
                          strokeLinecap="round"
                          fill="none"
                          className="transition-all duration-150"
                        />
                      </svg>
                      <div className="absolute w-11 h-11 rounded-full bg-gradient-to-b from-slate-700 to-slate-900 shadow-lg border border-white/20 flex items-center justify-center font-mono text-[11px] font-bold text-white">
                        {val}{ctrl.unit || ''}
                      </div>
                    </div>

                    <span className="text-xs font-bold text-slate-200 mt-2 uppercase tracking-wide">
                      {ctrl.label}
                    </span>

                    {/* Quick Adjustment Slider */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={val}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        setKnobValues((prev) => ({ ...prev, [ctrl.id]: next }));
                      }}
                      className="w-20 mt-2 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyber-cyan"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Competitive Advantage Card */}
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold mb-1">
              <ShieldCheck className="w-4 h-4" />
              Why This Beats Competitors:
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              {spec.competitorEdge}
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: DSP Mathematics Breakdown */}
      {activeTab === 'dsp' && (
        <div className="space-y-3">
          <div className="bg-black/60 border border-white/10 rounded-2xl p-4 sm:p-5 font-mono text-xs sm:text-sm space-y-2.5">
            <div className="text-cyber-cyan font-bold uppercase tracking-wider mb-2">
              Mathematical DSP Signal Chain Architecture
            </div>
            {spec.dspBreakdown.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-slate-300">
                <span className="text-cyber-cyan font-bold mt-0.5">[{idx + 1}]</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: C++ JUCE Blueprint */}
      {activeTab === 'cpp' && spec.cppSnippet && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">
              Compile-ready C++ Class Blueprint
            </span>
            <button
              onClick={handleCopyCpp}
              className="flex items-center gap-1.5 text-xs font-mono bg-cyber-cyan/15 hover:bg-cyber-cyan/25 text-cyber-cyan border border-cyber-cyan/30 px-3 py-1 rounded-lg transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied to Clipboard' : 'Copy C++ Code'}
            </button>
          </div>

          <pre className="p-4 rounded-2xl bg-black/90 border border-white/10 font-mono text-xs text-emerald-400 overflow-x-auto max-h-80 leading-relaxed">
            {spec.cppSnippet}
          </pre>
        </div>
      )}
    </div>
  );
}
