'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Sparkles, Volume2, Waves } from 'lucide-react';

interface PluginMiniPlayerProps {
  pluginId: string;
}

const PLUGIN_DEMO_MAP: Record<string, { title: string; dry: string; wet: string; dryLabel: string; wetLabel: string; desc: string }> = {
  PLUGTNE: {
    title: 'F Minor Vocal Autotune Comparison',
    dry: '/audio/vocal_dry.wav',
    wet: '/audio/vocal_wet.wav',
    dryLabel: 'Raw Dylan Desktop Mic',
    wetLabel: 'PLUGTNE F Minor AutoTune',
    desc: 'Notice instant hard-tune snapping in F Minor and pitch stabilization across vocal transients.',
  },
  PlugChop: {
    title: 'Vintage Soul Record Chop',
    dry: '/audio/sample_dry.wav',
    wet: '/audio/sample_wet.wav',
    dryLabel: 'Unchopped 1970s Vinyl',
    wetLabel: 'PlugChop 16-Pad Flip',
    desc: 'Chopped into 16 slices with transient auto-detection, pitched -3 semitones with choke groups.',
  },
  UNDERGRND: {
    title: '808 Sub-Bass Heat Saturation',
    dry: '/audio/808_dry.wav',
    wet: '/audio/808_wet.wav',
    dryLabel: 'Clean 42Hz Sine 808',
    wetLabel: 'UNDERGRND 12AX7 Tube Drive',
    desc: 'Asymmetric triode tube saturation that cuts through smartphone speakers while rumbling subs.',
  },
  pluggedin_plugged1: {
    title: 'PLUGGED 1 Hard Knock 808 Preset',
    dry: '/audio/808_dry.wav',
    wet: '/audio/preset_808_hardknock.wav',
    dryLabel: 'Basic Sine Sub',
    wetLabel: 'Hard Knock 808 (Hit)',
    desc: 'Flagship Sub808Engine pitch dive, woody beater knock, Anti-Squeak zero-crossing, and asymmetric tube mids.',
  },
  pluggedin_plugvox: {
    title: 'RVox-Style Vocal Dynamics',
    dry: '/audio/vocal_dry.wav',
    wet: '/audio/vocal_wet.wav',
    dryLabel: 'Dynamic Vocal Drift',
    wetLabel: 'PLUGVOX 40:1 Leveling',
    desc: 'Program-dependent soft-knee compression that pulls intimate vocal frequencies straight to the front.',
  },
};

export const PluginMiniPlayer: React.FC<PluginMiniPlayerProps> = ({ pluginId }) => {
  const demo = PLUGIN_DEMO_MAP[pluginId];
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<'dry' | 'wet'>('wet');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(8);

  const dryRef = useRef<HTMLAudioElement | null>(null);
  const wetRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (dryRef.current && wetRef.current) {
      if (mode === 'wet') {
        wetRef.current.muted = false;
        dryRef.current.muted = true;
      } else {
        dryRef.current.muted = false;
        wetRef.current.muted = true;
      }
    }
  }, [mode]);

  if (!demo) return null;

  const togglePlay = () => {
    if (!dryRef.current || !wetRef.current) return;
    if (isPlaying) {
      dryRef.current.pause();
      wetRef.current.pause();
      setIsPlaying(false);
    } else {
      const pos = dryRef.current.currentTime;
      wetRef.current.currentTime = pos;
      dryRef.current.play().catch(() => {});
      wetRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (dryRef.current) {
      setCurrentTime(dryRef.current.currentTime);
      if (dryRef.current.duration) setDuration(dryRef.current.duration);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="mt-8 rounded-3xl bg-studio-950/90 border border-white/10 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      <audio
        ref={dryRef}
        src={demo.dry}
        loop
        muted={mode !== 'dry'}
        onTimeUpdate={handleTimeUpdate}
      />
      <audio ref={wetRef} src={demo.wet} loop muted={mode !== 'wet'} />

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 w-full md:w-1/2">
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/20 text-[10px] font-bold text-cyber-cyan">
            <Waves className="w-3 h-3" />
            <span>LIVE DSP AUDIO AUDITION</span>
          </div>
          <h3 className="text-xl font-black text-white">{demo.title}</h3>
          <p className="text-xs text-slate-400 leading-relaxed">{demo.desc}</p>

          <div className="flex items-center space-x-2 pt-2">
            <button
              onClick={() => setMode('dry')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                mode === 'dry'
                  ? 'bg-amber-500/20 text-white border-amber-500 shadow-glow-amber'
                  : 'bg-studio-900 text-slate-400 border-white/5 hover:text-white'
              }`}
            >
              Bypass: {demo.dryLabel}
            </button>
            <button
              onClick={() => setMode('wet')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                mode === 'wet'
                  ? 'bg-cyber-cyan text-black border-cyan-300 shadow-glow-cyan'
                  : 'bg-studio-900 text-slate-400 border-white/5 hover:text-white'
              }`}
            >
              DSP Active: {demo.wetLabel}
            </button>
          </div>
        </div>

        <div className="w-full md:w-1/2 rounded-2xl bg-studio-900 border border-white/10 p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={togglePlay}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                  mode === 'wet'
                    ? 'bg-cyber-cyan text-black shadow-glow-cyan'
                    : 'bg-amber-500 text-black shadow-glow-amber'
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>
              <div>
                <span className="text-xs font-bold text-white block">
                  {isPlaying ? 'Streaming Audio' : 'Click to Audition'}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Mode: <strong className={mode === 'wet' ? 'text-cyber-cyan' : 'text-amber-400'}>{mode.toUpperCase()}</strong>
                </span>
              </div>
            </div>

            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              44.1kHz • 24-Bit WAV
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="w-full h-1.5 bg-studio-950 rounded-full overflow-hidden border border-white/10">
              <div
                className={`h-full transition-all duration-150 ${
                  mode === 'wet' ? 'bg-cyber-cyan shadow-glow-cyan' : 'bg-amber-400 shadow-glow-amber'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0:0{Math.floor(currentTime)}</span>
              <span>0:08 (Loop)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
