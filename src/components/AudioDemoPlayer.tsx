'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Sparkles, Sliders, Waves } from 'lucide-react';
import { DEMO_TRACKS } from '../data/plugins';

export const AudioDemoPlayer: React.FC = () => {
  const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<'dry' | 'wet'>('wet');
  const [progress, setProgress] = useState(35);

  const currentTrack = DEMO_TRACKS[selectedTrackIndex];
  const audioContextRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef(false);

  // Toggle playback simulation
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <section className="py-20 bg-studio-900/40 border-y border-white/5 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyber-purple/10 border border-cyber-purple/20 text-xs font-bold text-cyber-purple">
            <Waves className="w-3.5 h-3.5" />
            <span>HEAR THE SOUND IN ACTION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Interactive A/B Audio Switcher
          </h2>
          <p className="text-sm text-slate-400">
            Compare dry raw recordings against the processed master. Flip back and forth in real time to hear the PluggedIN difference.
          </p>
        </div>

        {/* Demo Selector Tabs */}
        <div className="flex justify-center space-x-2 sm:space-x-4 mb-8 overflow-x-auto pb-2">
          {DEMO_TRACKS.map((track, idx) => (
            <button
              key={track.id}
              onClick={() => {
                setSelectedTrackIndex(idx);
                setProgress(10);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center space-x-2 ${
                selectedTrackIndex === idx
                  ? 'bg-white/10 text-white border border-white/20 shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span>{track.title}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                {track.genre}
              </span>
            </button>
          ))}
        </div>

        {/* The Audio Player Console */}
        <div className="rounded-3xl bg-studio-950/90 border border-white/10 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Left: Track Information & A/B Buttons */}
            <div className="w-full lg:w-1/2 space-y-6">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-cyber-cyan font-bold">
                  Powered by {currentTrack.pluginUsed}
                </span>
                <h3 className="text-2xl font-black text-white mt-1">
                  {currentTrack.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                  {currentTrack.description}
                </p>
              </div>

              {/* The Big A/B Buttons */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
                  SIGNAL SWITCHER (TOGGLE IN REAL TIME)
                </span>
                <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-studio-900 border border-white/10">
                  <button
                    onClick={() => setMode('dry')}
                    className={`py-3.5 px-4 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center space-y-1 ${
                      mode === 'dry'
                        ? 'bg-slate-700 text-white shadow-md border border-white/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-mono tracking-wider opacity-70">BYPASS</span>
                    <span>{currentTrack.dryLabel}</span>
                  </button>

                  <button
                    onClick={() => setMode('wet')}
                    className={`py-3.5 px-4 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center space-y-1 ${
                      mode === 'wet'
                        ? 'bg-gradient-to-r from-cyber-cyan to-blue-600 text-black shadow-glow-cyan border border-cyber-cyan'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-mono tracking-wider opacity-80 flex items-center space-x-1">
                      <Sparkles className="w-3 h-3" />
                      <span>PLUGGED IN</span>
                    </span>
                    <span>{currentTrack.wetLabel}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Real-time Audio Waveform Visualizer & Transport */}
            <div className="w-full lg:w-1/2 rounded-2xl bg-studio-900 border border-white/10 p-6 flex flex-col justify-between">
              {/* Transport bar */}
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={togglePlay}
                    className="w-12 h-12 rounded-xl bg-cyber-cyan text-black flex items-center justify-center shadow-glow-cyan hover:scale-105 active:scale-95 transition-all"
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </button>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center space-x-2">
                      <span>{isPlaying ? 'Now Playing' : 'Paused'}</span>
                      <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      Mode: <strong className={mode === 'wet' ? 'text-cyber-cyan' : 'text-slate-300'}>{mode.toUpperCase()}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                  <Volume2 className="w-4 h-4 text-cyber-cyan" />
                  <span>32-bit Float</span>
                </div>
              </div>

              {/* Dynamic Waveform Bars */}
              <div className="h-32 my-6 flex items-center justify-between gap-1 px-2">
                {Array.from({ length: 36 }).map((_, i) => {
                  const baseHeight = ((Math.sin(i * 0.4) + 1.2) / 2.2) * 80 + 15;
                  const boost = mode === 'wet' ? 1.25 : 0.75;
                  const calculatedHeight = Math.min(100, baseHeight * boost);
                  const active = (i / 36) * 100 <= progress;

                  return (
                    <div
                      key={i}
                      className={`w-full rounded-full transition-all duration-200 ${
                        active
                          ? mode === 'wet'
                            ? 'bg-gradient-to-t from-cyber-cyan via-sky-400 to-cyber-purple'
                            : 'bg-slate-400'
                          : 'bg-studio-800'
                      }`}
                      style={{
                        height: isPlaying ? `${calculatedHeight}%` : `${baseHeight * 0.4}%`,
                        opacity: active ? 1 : 0.4,
                      }}
                    />
                  );
                })}
              </div>

              {/* Progress Slider */}
              <div className="space-y-1.5">
                <div className="w-full h-2 bg-studio-950 rounded-full overflow-hidden border border-white/10">
                  <div
                    className={`h-full transition-all duration-200 ${
                      mode === 'wet' ? 'bg-cyber-cyan shadow-glow-cyan' : 'bg-slate-400'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>0:{(progress * 0.3).toFixed(0).padStart(2, '0')}</span>
                  <span>0:30 (Loop)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
