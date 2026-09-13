'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, Sparkles, Waves, VolumeX, Radio, Disc3, Flame, Music, Command } from 'lucide-react';
import { DEMO_TRACKS } from '../data/plugins';

const TRACK_AUDIO_MAP: Record<string, { dry: string; wet: string; dspSpecs: string[]; bpm: string; key: string }> = {
  trap_vocal: {
    dry: '/audio/vocal_dry.wav',
    wet: '/audio/vocal_wet.wav',
    dspSpecs: ['0ms Snap Retune Speed', 'PLUGVOX 40:1 Soft-Knee Leveling', 'Stereo Formant Sheen'],
    bpm: '140 BPM',
    key: 'C Minor',
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
  const [mode, setMode] = useState<'dry' | 'wet'>('wet');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(8);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);

  const currentTrack = DEMO_TRACKS[selectedTrackIndex] || DEMO_TRACKS[0];
  const audioMeta = TRACK_AUDIO_MAP[currentTrack.id] || TRACK_AUDIO_MAP.trap_vocal;

  const dryAudioRef = useRef<HTMLAudioElement | null>(null);
  const wetAudioRef = useRef<HTMLAudioElement | null>(null);

  // Sync audio sources when track changes
  useEffect(() => {
    if (dryAudioRef.current && wetAudioRef.current) {
      dryAudioRef.current.src = audioMeta.dry;
      wetAudioRef.current.src = audioMeta.wet;
      dryAudioRef.current.currentTime = 0;
      wetAudioRef.current.currentTime = 0;

      if (isPlaying) {
        dryAudioRef.current.play().catch(() => {});
        wetAudioRef.current.play().catch(() => {});
      }
    }
  }, [selectedTrackIndex, audioMeta.dry, audioMeta.wet]);

  // Handle Mode (Dry vs Wet mute toggle for gapless real-time A/B flip)
  useEffect(() => {
    const effectiveVolume = isMuted ? 0 : volume;
    if (dryAudioRef.current && wetAudioRef.current) {
      if (mode === 'wet') {
        wetAudioRef.current.muted = isMuted;
        wetAudioRef.current.volume = effectiveVolume;
        dryAudioRef.current.muted = true;
      } else {
        dryAudioRef.current.muted = isMuted;
        dryAudioRef.current.volume = effectiveVolume;
        wetAudioRef.current.muted = true;
      }
    }
  }, [mode, volume, isMuted]);

  // Keyboard Shortcuts (Space: Play/Pause, D: Dry, W: Wet)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'd' || e.key === 'D') {
        setMode('dry');
      } else if (e.key === 'w' || e.key === 'W') {
        setMode('wet');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  // Toggle Play / Pause
  const togglePlay = useCallback(() => {
    if (!dryAudioRef.current || !wetAudioRef.current) return;

    if (isPlaying) {
      dryAudioRef.current.pause();
      wetAudioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Sync positions
      const pos = dryAudioRef.current.currentTime;
      wetAudioRef.current.currentTime = pos;

      dryAudioRef.current.play().catch(() => {});
      wetAudioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [isPlaying]);

  // Seek handler
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dryAudioRef.current || !wetAudioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickRatio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = clickRatio * duration;

    dryAudioRef.current.currentTime = newTime;
    wetAudioRef.current.currentTime = newTime;
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
    <section id="audio-demo" className="py-24 bg-studio-950/60 border-y border-white/5 relative overflow-hidden">
      {/* Dynamic Background Glow reacting to A/B mode */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] blur-[160px] pointer-events-none transition-colors duration-700 ${
          mode === 'wet' ? 'bg-cyber-cyan/15' : 'bg-amber-500/10'
        }`}
      />

      {/* Hidden Synchronized HTML5 Audio Elements */}
      <audio
        ref={dryAudioRef}
        src={audioMeta.dry}
        loop
        muted={mode !== 'dry' || isMuted}
        onTimeUpdate={handleTimeUpdate}
      />
      <audio
        ref={wetAudioRef}
        src={audioMeta.wet}
        loop
        muted={mode !== 'wet' || isMuted}
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
          <p className="text-sm sm:text-base text-slate-400">
            Real human vocal stems, authentic 808 sub synthesis, and vintage vinyl flips. Switch between <strong>Bypass</strong> and <strong>PluggedIN DSP</strong> in real time with zero dropouts.
          </p>
        </div>

        {/* Demo Selector Tabs */}
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

        {/* The Flagship Audio Player Console */}
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
                DSP HARDWARE CHANNEL • A/B AUDITION CONSOLE
              </span>
            </div>

            {/* Quick Specs Badges */}
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                {audioMeta.bpm}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                {audioMeta.key}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                44.1kHz • 24-Bit Linear PCM
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Track Info & The Big Glowing A/B Toggle (5 Cols) */}
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

              {/* DSP Processing Badges */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
                  ACTIVE ALGORITHMS:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {audioMeta.dspSpecs.map((spec, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-studio-950 border border-white/10 text-slate-300"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* The Studio A/B Rocker Switch */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                    SIGNAL MONITOR (HOT-SWAP A/B)
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    Keys: <kbd className="px-1 py-0.5 rounded bg-white/10 text-slate-300">D</kbd> Dry / <kbd className="px-1 py-0.5 rounded bg-white/10 text-slate-300">W</kbd> Wet
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-studio-950 border border-white/10">
                  {/* DRY (BYPASS) BUTTON */}
                  <button
                    onClick={() => setMode('dry')}
                    className={`py-4 px-4 rounded-xl font-black transition-all flex flex-col items-center justify-center space-y-1.5 relative overflow-hidden ${
                      mode === 'dry'
                        ? 'bg-amber-500/20 text-white border-2 border-amber-500 shadow-glow-amber'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span
                        className={`w-2 h-2 rounded-full transition-colors ${
                          mode === 'dry' ? 'bg-amber-400 shadow-[0_0_8px_#F59E0B]' : 'bg-slate-600'
                        }`}
                      />
                      <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 font-bold">
                        BYPASS (DRY)
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-center">
                      {currentTrack.dryLabel}
                    </span>
                  </button>

                  {/* WET (PLUGGEDIN) BUTTON */}
                  <button
                    onClick={() => setMode('wet')}
                    className={`py-4 px-4 rounded-xl font-black transition-all flex flex-col items-center justify-center space-y-1.5 relative overflow-hidden ${
                      mode === 'wet'
                        ? 'bg-cyber-cyan text-black border-2 border-cyan-300 shadow-glow-cyan'
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <Sparkles className={`w-3 h-3 ${mode === 'wet' ? 'text-black' : 'text-cyber-cyan'}`} />
                      <span
                        className={`text-[10px] uppercase font-mono tracking-wider font-bold ${
                          mode === 'wet' ? 'text-black' : 'text-cyber-cyan'
                        }`}
                      >
                        PLUGGED IN (WET)
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-center">
                      {currentTrack.wetLabel}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Waveform Display, Reactive Spectrum & Transport Controls (7 Cols) */}
            <div className="lg:col-span-7 rounded-2xl bg-studio-950 border border-white/10 p-6 flex flex-col justify-between space-y-6">
              {/* Transport bar */}
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 transform active:scale-95 ${
                      mode === 'wet'
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
                      <span>{isPlaying ? 'Streaming Real Audio' : 'Paused (Click to Listen)'}</span>
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isPlaying
                            ? mode === 'wet'
                              ? 'bg-cyber-cyan animate-pulse shadow-[0_0_8px_#00F0FF]'
                              : 'bg-amber-400 animate-pulse shadow-[0_0_8px_#F59E0B]'
                            : 'bg-slate-600'
                        }`}
                      />
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      Channel: <strong className={mode === 'wet' ? 'text-cyber-cyan' : 'text-amber-400'}>{mode.toUpperCase()}</strong> • Hot-Swap Active
                    </span>
                  </div>
                </div>

                {/* Volume & Mute control */}
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
                {/* Visualizer bars */}
                {Array.from({ length: 44 }).map((_, i) => {
                  const x = i / 44;
                  // Dynamic height based on sine + harmonic curves
                  const harmonic = Math.sin(x * Math.PI * 3.5) * 0.35 + Math.sin(x * Math.PI * 7) * 0.15 + 0.5;
                  const baseHeight = Math.max(15, Math.min(100, harmonic * 90));
                  const boost = mode === 'wet' ? 1.25 : 0.85;
                  const calculatedHeight = Math.min(100, baseHeight * boost);
                  const active = (i / 44) * 100 <= progressPercent;

                  return (
                    <div
                      key={i}
                      className={`w-full rounded-full transition-all duration-150 ${
                        active
                          ? mode === 'wet'
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

                {/* Hover Playhead Indicator */}
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
                      mode === 'wet' ? 'bg-cyber-cyan shadow-glow-cyan' : 'bg-amber-400 shadow-glow-amber'
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
                  <span>0:08 (Seamless Loop)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
