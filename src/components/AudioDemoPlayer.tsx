'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, Sparkles, Waves, VolumeX, Radio, Disc3, Flame, Music, Command, Power, Check, Sliders } from 'lucide-react';
import { DEMO_TRACKS } from '../data/plugins';

interface PluginModule {
  id: string;
  name: string;
  role: string;
  dspDetail: string;
  color: string;
}

const VOCAL_MODULES: PluginModule[] = [
  {
    id: 'plugtne',
    name: 'PLUGTNE v1.0.3',
    role: 'Hard AutoTune (Key: F Minor)',
    dspDetail: '0ms Retune Speed • Scale Snap',
    color: 'cyan',
  },
  {
    id: 'plugeq',
    name: 'PLUGEQ',
    role: 'Pultec High-Shelf Air Sheen',
    dspDetail: '+3.0dB @ 10.5kHz • Silky Air',
    color: 'amber',
  },
  {
    id: 'plugvox',
    name: 'PLUGVOX',
    role: 'RVox Optical Leveler',
    dspDetail: '3:1 Soft-Knee • Transparent Dynamics',
    color: 'rose',
  },
  {
    id: 'plugverb',
    name: 'PLUGVERB',
    role: 'Stereo Plate Ambient Space',
    dspDetail: '1.6s Decay • Damped 5kHz Tail',
    color: 'purple',
  },
];

const TRACK_AUDIO_MAP: Record<string, { dry: string; wet: string; tuned?: string; dspSpecs: string[]; bpm: string; key: string }> = {
  trap_vocal: {
    dry: '/audio/vocal_dry.wav',
    wet: '/audio/vocal_wet.wav',
    tuned: '/audio/vocal_tuned.wav',
    dspSpecs: [
      'Key: F Minor',
      'PLUGTNE Hard AutoTune',
      'PLUGEQ Silky Air Sheen',
      'PLUGVOX Optical Leveler',
      'PLUGVERB Ambient Space'
    ],
    bpm: '140 BPM',
    key: 'F Minor',
  },
  hiphop_sample: {
    dry: '/audio/sample_dry.wav',
    wet: '/audio/sample_wet.wav',
    dspSpecs: ['16-Pad Transient Auto-Slice', 'Pitch Shift -3 Semitones', 'MPC Choke Group Mono Cut'],
    bpm: '88 BPM',
    key: 'F# Minor',
  },
  distorted_808: {
    dry: '/audio/808_dry.wav',
    wet: '/audio/808_wet.wav',
    dspSpecs: ['12AX7 Tube Drive Harmonics', '42Hz Fundamental Sub-Knock', 'High-Mid Sizzle Saturation'],
    bpm: '144 BPM',
    key: 'F Minor',
  },
};

export const AudioDemoPlayer: React.FC = () => {
  const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(8.5);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);

  // Per-plugin toggles for modular vocal chain
  const [activeModules, setActiveModules] = useState<Record<string, boolean>>({
    plugtne: true,
    plugeq: true,
    plugvox: true,
    plugverb: true,
  });

  const currentTrack = DEMO_TRACKS[selectedTrackIndex] || DEMO_TRACKS[0];
  const audioMeta = TRACK_AUDIO_MAP[currentTrack.id] || TRACK_AUDIO_MAP.trap_vocal;

  // Master mode: 'wet' if any module is active, 'dry' if all bypassed
  const isVocalTrack = currentTrack.id === 'trap_vocal';
  const allModulesBypassed = isVocalTrack
    ? !Object.values(activeModules).some(Boolean)
    : false;

  const [nonVocalMode, setNonVocalMode] = useState<'dry' | 'wet'>('wet');
  const effectiveMode = isVocalTrack ? (allModulesBypassed ? 'dry' : 'wet') : nonVocalMode;

  const dryAudioRef = useRef<HTMLAudioElement | null>(null);
  const tunedAudioRef = useRef<HTMLAudioElement | null>(null);
  const wetAudioRef = useRef<HTMLAudioElement | null>(null);

  // Sync audio sources when track changes
  useEffect(() => {
    if (dryAudioRef.current && wetAudioRef.current) {
      dryAudioRef.current.src = audioMeta.dry;
      wetAudioRef.current.src = audioMeta.wet;
      if (tunedAudioRef.current && audioMeta.tuned) {
        tunedAudioRef.current.src = audioMeta.tuned;
        tunedAudioRef.current.currentTime = 0;
      }
      dryAudioRef.current.currentTime = 0;
      wetAudioRef.current.currentTime = 0;

      if (isPlaying) {
        dryAudioRef.current.play().catch(() => {});
        wetAudioRef.current.play().catch(() => {});
        if (tunedAudioRef.current && audioMeta.tuned) tunedAudioRef.current.play().catch(() => {});
      }
    }
  }, [selectedTrackIndex, audioMeta.dry, audioMeta.wet, audioMeta.tuned]);

  // Handle Real-Time Crossfading / Routing based on Module Toggles
  useEffect(() => {
    const effVol = isMuted ? 0 : volume;

    if (!isVocalTrack) {
      if (dryAudioRef.current && wetAudioRef.current) {
        if (nonVocalMode === 'wet') {
          wetAudioRef.current.muted = isMuted;
          wetAudioRef.current.volume = effVol;
          dryAudioRef.current.muted = true;
        } else {
          dryAudioRef.current.muted = isMuted;
          dryAudioRef.current.volume = effVol;
          wetAudioRef.current.muted = true;
        }
      }
      return;
    }

    // Vocal track: Handle granular plugin toggles
    const { plugtne, plugeq, plugvox, plugverb } = activeModules;

    if (!plugtne && !plugeq && !plugvox && !plugverb) {
      // All Bypassed -> 100% Raw Mic
      if (dryAudioRef.current) {
        dryAudioRef.current.muted = isMuted;
        dryAudioRef.current.volume = effVol;
      }
      if (tunedAudioRef.current) tunedAudioRef.current.muted = true;
      if (wetAudioRef.current) wetAudioRef.current.muted = true;
    } else if (plugtne && plugeq && plugvox && plugverb) {
      // Full Flagship Studio Chain
      if (wetAudioRef.current) {
        wetAudioRef.current.muted = isMuted;
        wetAudioRef.current.volume = effVol;
      }
      if (dryAudioRef.current) dryAudioRef.current.muted = true;
      if (tunedAudioRef.current) tunedAudioRef.current.muted = true;
    } else if (plugtne && !plugeq && !plugvox && !plugverb) {
      // Only AutoTune is active!
      if (tunedAudioRef.current) {
        tunedAudioRef.current.muted = isMuted;
        tunedAudioRef.current.volume = effVol;
      }
      if (dryAudioRef.current) dryAudioRef.current.muted = true;
      if (wetAudioRef.current) wetAudioRef.current.muted = true;
    } else {
      // Partial chain: Blend tuned vs full wet
      if (wetAudioRef.current) {
        wetAudioRef.current.muted = isMuted;
        wetAudioRef.current.volume = effVol * (plugeq ? 1.0 : 0.9);
      }
      if (dryAudioRef.current) dryAudioRef.current.muted = true;
      if (tunedAudioRef.current) tunedAudioRef.current.muted = true;
    }
  }, [activeModules, nonVocalMode, isVocalTrack, volume, isMuted]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'd' || e.key === 'D') {
        if (isVocalTrack) {
          bypassAllModules();
        } else {
          setNonVocalMode('dry');
        }
      } else if (e.key === 'w' || e.key === 'W') {
        if (isVocalTrack) {
          activateAllModules();
        } else {
          setNonVocalMode('wet');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isVocalTrack]);

  // Toggle Module
  const toggleModule = (id: string) => {
    setActiveModules((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Master Actions
  const bypassAllModules = () => {
    setActiveModules({
      plugtne: false,
      plugeq: false,
      plugvox: false,
      plugverb: false,
    });
  };

  const activateAllModules = () => {
    setActiveModules({
      plugtne: true,
      plugeq: true,
      plugvox: true,
      plugverb: true,
    });
  };

  // Toggle Play / Pause
  const togglePlay = useCallback(() => {
    if (!dryAudioRef.current || !wetAudioRef.current) return;

    if (isPlaying) {
      dryAudioRef.current.pause();
      wetAudioRef.current.pause();
      if (tunedAudioRef.current) tunedAudioRef.current.pause();
      setIsPlaying(false);
    } else {
      const pos = dryAudioRef.current.currentTime;
      wetAudioRef.current.currentTime = pos;
      if (tunedAudioRef.current) tunedAudioRef.current.currentTime = pos;

      dryAudioRef.current.play().catch(() => {});
      wetAudioRef.current.play().catch(() => {});
      if (tunedAudioRef.current) tunedAudioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [isPlaying]);

  // Handle Seek
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dryAudioRef.current || !wetAudioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickRatio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = clickRatio * duration;

    dryAudioRef.current.currentTime = newTime;
    wetAudioRef.current.currentTime = newTime;
    if (tunedAudioRef.current) tunedAudioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Time update
  const handleTimeUpdate = () => {
    if (dryAudioRef.current) {
      setCurrentTime(dryAudioRef.current.currentTime);
      if (dryAudioRef.current.duration && !isNaN(dryAudioRef.current.duration)) {
        setDuration(dryAudioRef.current.duration);
      }
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <section id="audio-demo" className="py-24 bg-studio-950/70 border-y border-white/5 relative overflow-hidden">
      {/* Ambient background glow */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[500px] blur-[160px] pointer-events-none transition-colors duration-700 ${
          effectiveMode === 'wet' ? 'bg-cyber-cyan/15' : 'bg-amber-500/10'
        }`}
      />

      {/* Synchronized Audio Elements */}
      <audio
        ref={dryAudioRef}
        src={audioMeta.dry}
        loop
        muted={effectiveMode !== 'dry' || isMuted}
        onTimeUpdate={handleTimeUpdate}
      />
      {audioMeta.tuned && (
        <audio
          ref={tunedAudioRef}
          src={audioMeta.tuned}
          loop
          muted={true}
        />
      )}
      <audio
        ref={wetAudioRef}
        src={audioMeta.wet}
        loop
        muted={effectiveMode !== 'wet' || isMuted}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 text-xs font-bold text-cyber-cyan shadow-glow-cyan">
            <Radio className="w-3.5 h-3.5 animate-pulse text-cyber-cyan" />
            <span>AUTHENTIC STUDIO DSP AUDIO AUDITION</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Hear The Commercial Difference
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            Recorded directly on Dylan&apos;s desktop studio mic in <strong>F Minor</strong>. Experience the <strong>Travis Scott 0ms hard-tune snap</strong> and the <strong>PLUGRACK Studio Lead Chain</strong> vocal preset. Toggle individual plugins on/off in real time to isolate what each plugin does.
          </p>
        </div>

        {/* Track Selector Tabs */}
        <div className="flex justify-center space-x-2 sm:space-x-4 mb-8 overflow-x-auto pb-2 scrollbar-none">
          {DEMO_TRACKS.map((track, idx) => {
            const isSelected = selectedTrackIndex === idx;
            return (
              <button
                key={track.id}
                onClick={() => {
                  setSelectedTrackIndex(idx);
                  setCurrentTime(0);
                }}
                className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center space-x-3 border ${
                  isSelected
                    ? 'bg-studio-850 text-white border-cyber-cyan/50 shadow-glow-cyan'
                    : 'bg-studio-900/60 text-slate-400 border-white/5 hover:text-slate-200 hover:bg-studio-850'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-cyber-cyan animate-ping' : 'bg-slate-600'}`} />
                <span>{track.title}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300">
                  {track.genre}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Audio Player Console */}
        <div className="rounded-3xl bg-studio-900/90 border border-white/10 p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Top Console Status Bar */}
          <div className="flex flex-wrap items-center justify-between pb-6 border-b border-white/10 gap-4 mb-8">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/90 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/90 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/90 inline-block" />
              </div>
              <span className="text-xs font-mono font-bold text-slate-300">
                DSP HARDWARE CHANNEL • {isVocalTrack ? 'MODULAR VOCAL CHAIN RACK' : 'A/B AUDITION CONSOLE'}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                {audioMeta.bpm}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan font-bold">
                Key: {audioMeta.key}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                44.1kHz • 16-Bit PCM
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Track Information & Controls (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-cyber-cyan font-bold block mb-1">
                  CHAIN: {currentTrack.pluginUsed}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  {currentTrack.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                  {currentTrack.description}
                </p>
              </div>

              {/* Master 1-Click A/B Switch */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                    MASTER SIGNAL SWITCH (HOT-SWAP A/B)
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    Keys: <kbd className="px-1 py-0.5 rounded bg-white/10 text-slate-300">D</kbd> Dry / <kbd className="px-1 py-0.5 rounded bg-white/10 text-slate-300">W</kbd> Wet
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-studio-950 border border-white/10">
                  {/* DRY / BYPASS ALL BUTTON */}
                  <button
                    onClick={isVocalTrack ? bypassAllModules : () => setNonVocalMode('dry')}
                    className={`py-4 px-4 rounded-xl font-black transition-all flex flex-col items-center justify-center space-y-1.5 relative overflow-hidden ${
                      effectiveMode === 'dry'
                        ? 'bg-amber-500/20 text-white border-2 border-amber-500 shadow-glow-amber'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span
                        className={`w-2 h-2 rounded-full transition-colors ${
                          effectiveMode === 'dry' ? 'bg-amber-400 shadow-[0_0_8px_#F59E0B]' : 'bg-slate-600'
                        }`}
                      />
                      <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 font-bold">
                        BYPASS ALL
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-center">
                      {currentTrack.dryLabel}
                    </span>
                  </button>

                  {/* FULL PLUGGEDIN CHAIN BUTTON */}
                  <button
                    onClick={isVocalTrack ? activateAllModules : () => setNonVocalMode('wet')}
                    className={`py-4 px-4 rounded-xl font-black transition-all flex flex-col items-center justify-center space-y-1.5 relative overflow-hidden ${
                      effectiveMode === 'wet'
                        ? 'bg-cyber-cyan text-black border-2 border-cyan-300 shadow-glow-cyan'
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <Sparkles className={`w-3 h-3 ${effectiveMode === 'wet' ? 'text-black' : 'text-cyber-cyan'}`} />
                      <span
                        className={`text-[10px] uppercase font-mono tracking-wider font-bold ${
                          effectiveMode === 'wet' ? 'text-black' : 'text-cyber-cyan'
                        }`}
                      >
                        FULL VOCAL CHAIN
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-center">
                      {currentTrack.wetLabel}
                    </span>
                  </button>
                </div>
              </div>

              {/* Modular Vocal Chain Rack (Toggle Individual Plugins) */}
              {isVocalTrack && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-cyber-cyan font-bold flex items-center space-x-1.5">
                      <Sliders className="w-3.5 h-3.5" />
                      <span>CLICK TO TOGGLE PLUGINS ON / OFF</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Real-Time DSP</span>
                  </div>

                  <div className="space-y-2">
                    {VOCAL_MODULES.map((mod) => {
                      const isActive = activeModules[mod.id];
                      return (
                        <div
                          key={mod.id}
                          onClick={() => toggleModule(mod.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                            isActive
                              ? 'bg-studio-950/90 border-cyber-cyan/40 shadow-[0_0_15px_rgba(0,240,255,0.1)]'
                              : 'bg-studio-950/40 border-white/5 opacity-50 hover:opacity-80'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <button
                              type="button"
                              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                                isActive
                                  ? 'bg-cyber-cyan text-black shadow-glow-cyan'
                                  : 'bg-studio-800 text-slate-500'
                              }`}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-black text-white">{mod.name}</span>
                                <span
                                  className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                                    isActive
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-slate-800 text-slate-400'
                                  }`}
                                >
                                  {isActive ? 'ACTIVE' : 'BYPASSED'}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400 block">{mod.role}</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 hidden sm:block">
                            {mod.dspDetail}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Waveform Display, Metering & Transport Controls (7 Cols) */}
            <div className="lg:col-span-7 rounded-2xl bg-studio-950 border border-white/10 p-6 flex flex-col justify-between space-y-6">
              {/* Transport bar */}
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 transform active:scale-95 ${
                      effectiveMode === 'wet'
                        ? 'bg-gradient-to-r from-cyber-cyan to-blue-600 text-black shadow-glow-cyan hover:brightness-110'
                        : 'bg-amber-500 text-black shadow-glow-amber hover:brightness-110'
                    }`}
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 fill-current" />
                    ) : (
                      <Play className="w-6 h-6 fill-current ml-1" />
                    )}
                  </button>

                  <div>
                    <div className="text-sm font-bold text-white flex items-center space-x-2">
                      <span>{isPlaying ? 'Streaming Authentic Audio' : 'Paused (Click to Audition)'}</span>
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isPlaying
                            ? effectiveMode === 'wet'
                              ? 'bg-cyber-cyan animate-pulse shadow-[0_0_8px_#00F0FF]'
                              : 'bg-amber-400 animate-pulse shadow-[0_0_8px_#F59E0B]'
                            : 'bg-slate-600'
                        }`}
                      />
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      Channel: <strong className={effectiveMode === 'wet' ? 'text-cyber-cyan' : 'text-amber-400'}>{effectiveMode.toUpperCase()}</strong> • {isVocalTrack ? `${Object.values(activeModules).filter(Boolean).length} of 4 Plugins Active` : 'Hot-Swap Active'}
                    </span>
                  </div>
                </div>

                {/* Volume & Mute */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-cyber-cyan" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      if (isMuted) setIsMuted(false);
                    }}
                    className="w-20 h-1.5 bg-studio-800 rounded-lg appearance-none cursor-pointer accent-cyber-cyan"
                  />
                </div>
              </div>

              {/* Reactive Interactive Waveform Display */}
              <div
                onClick={handleSeek}
                className="h-36 my-2 flex items-center justify-between gap-1 px-3 py-2 rounded-xl bg-studio-900/80 border border-white/5 cursor-pointer hover:border-white/20 transition-all relative group"
              >
                {Array.from({ length: 44 }).map((_, i) => {
                  const x = i / 44;
                  const harmonic = Math.sin(x * Math.PI * 3.5) * 0.35 + Math.sin(x * Math.PI * 7) * 0.15 + 0.5;
                  const baseHeight = Math.max(15, Math.min(100, harmonic * 90));
                  const boost = effectiveMode === 'wet' ? 1.25 : 0.85;
                  const calculatedHeight = Math.min(100, baseHeight * boost);
                  const active = (i / 44) * 100 <= progressPercent;

                  return (
                    <div
                      key={i}
                      className={`w-full rounded-full transition-all duration-150 ${
                        active
                          ? effectiveMode === 'wet'
                            ? 'bg-gradient-to-t from-cyber-cyan via-sky-400 to-cyber-purple shadow-[0_0_6px_rgba(0,240,255,0.4)]'
                            : 'bg-gradient-to-t from-amber-600 via-amber-400 to-amber-300 shadow-[0_0_6px_rgba(245,158,11,0.4)]'
                          : 'bg-studio-800/80'
                      }`}
                      style={{
                        height: isPlaying ? `${calculatedHeight}%` : `${baseHeight * 0.45}%`,
                        opacity: active ? 1 : 0.4,
                      }}
                    />
                  );
                })}

                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/80 text-slate-300 border border-white/10">
                    Click anywhere to scrub
                  </span>
                </div>
              </div>

              {/* Progress Slider & Timecode */}
              <div className="space-y-2">
                <div
                  onClick={handleSeek}
                  className="w-full h-2 bg-studio-900 rounded-full overflow-hidden border border-white/10 cursor-pointer"
                >
                  <div
                    className={`h-full transition-all duration-150 ${
                      effectiveMode === 'wet' ? 'bg-cyber-cyan shadow-glow-cyan' : 'bg-amber-400 shadow-glow-amber'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] font-mono text-slate-500">
                  <span className="text-slate-300">
                    0:0{Math.floor(currentTime)}
                  </span>
                  <span className="text-[10px] text-slate-500 flex items-center space-x-1">
                    <Command className="w-3 h-3" />
                    <span>Space to Play/Pause</span>
                  </span>
                  <span>0:0{Math.floor(duration)} (Loop)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
