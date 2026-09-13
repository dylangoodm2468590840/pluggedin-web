'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Sparkles, Waves, VolumeX } from 'lucide-react';
import { DEMO_TRACKS } from '../data/plugins';

const TRACK_AUDIO_MAP: Record<string, { dry: string; wet: string }> = {
  trap_vocal: {
    dry: '/audio/vocal_dry.wav',
    wet: '/audio/vocal_wet.wav',
  },
  hiphop_sample: {
    dry: '/audio/sample_dry.wav',
    wet: '/audio/sample_wet.wav',
  },
  distorted_808: {
    dry: '/audio/808_dry.wav',
    wet: '/audio/808_wet.wav',
  },
};

export const AudioDemoPlayer: React.FC = () => {
  const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<'dry' | 'wet'>('wet');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(8);

  const currentTrack = DEMO_TRACKS[selectedTrackIndex];
  const audioFiles = TRACK_AUDIO_MAP[currentTrack.id] || TRACK_AUDIO_MAP.trap_vocal;

  const dryAudioRef = useRef<HTMLAudioElement | null>(null);
  const wetAudioRef = useRef<HTMLAudioElement | null>(null);

  // Sync audio sources when track changes
  useEffect(() => {
    if (dryAudioRef.current && wetAudioRef.current) {
      dryAudioRef.current.src = audioFiles.dry;
      wetAudioRef.current.src = audioFiles.wet;
      dryAudioRef.current.currentTime = 0;
      wetAudioRef.current.currentTime = 0;

      if (isPlaying) {
        dryAudioRef.current.play().catch(() => {});
        wetAudioRef.current.play().catch(() => {});
      }
    }
  }, [selectedTrackIndex, audioFiles.dry, audioFiles.wet]);

  // Handle Mode (Dry vs Wet mute toggle for gapless real-time A/B flip)
  useEffect(() => {
    if (dryAudioRef.current && wetAudioRef.current) {
      if (mode === 'wet') {
        wetAudioRef.current.muted = false;
        wetAudioRef.current.volume = 1.0;
        dryAudioRef.current.muted = true;
      } else {
        dryAudioRef.current.muted = false;
        dryAudioRef.current.volume = 1.0;
        wetAudioRef.current.muted = true;
      }
    }
  }, [mode]);

  // Toggle Play / Pause
  const togglePlay = () => {
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
  };

  // Time update
  const handleTimeUpdate = () => {
    if (dryAudioRef.current) {
      setCurrentTime(dryAudioRef.current.currentTime);
      if (dryAudioRef.current.duration) {
        setDuration(dryAudioRef.current.duration);
      }
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <section className="py-20 bg-studio-900/40 border-y border-white/5 relative overflow-hidden">
      {/* Hidden Synchronized HTML5 Audio Elements */}
      <audio
        ref={dryAudioRef}
        src={audioFiles.dry}
        loop
        muted={mode !== 'dry'}
        onTimeUpdate={handleTimeUpdate}
      />
      <audio
        ref={wetAudioRef}
        src={audioFiles.wet}
        loop
        muted={mode !== 'wet'}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyber-purple/10 border border-cyber-purple/20 text-xs font-bold text-cyber-purple">
            <Waves className="w-3.5 h-3.5" />
            <span>REAL PLUGIN DSP AUDIO</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Interactive A/B Audio Switcher
          </h2>
          <p className="text-sm text-slate-400">
            Rendered directly from our actual C++ DSP algorithms. Switch between Dry and Wet in real time without audio drops.
          </p>
        </div>

        {/* Demo Selector Tabs */}
        <div className="flex justify-center space-x-2 sm:space-x-4 mb-8 overflow-x-auto pb-2">
          {DEMO_TRACKS.map((track, idx) => (
            <button
              key={track.id}
              onClick={() => {
                setSelectedTrackIndex(idx);
                setCurrentTime(0);
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
                      Channel: <strong className={mode === 'wet' ? 'text-cyber-cyan' : 'text-slate-300'}>{mode.toUpperCase()}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                  <Volume2 className="w-4 h-4 text-cyber-cyan" />
                  <span>44.1kHz • 16-Bit WAV</span>
                </div>
              </div>

              {/* Dynamic Waveform Bars */}
              <div className="h-32 my-6 flex items-center justify-between gap-1 px-2">
                {Array.from({ length: 36 }).map((_, i) => {
                  const baseHeight = ((Math.sin(i * 0.4) + 1.2) / 2.2) * 80 + 15;
                  const boost = mode === 'wet' ? 1.25 : 0.75;
                  const calculatedHeight = Math.min(100, baseHeight * boost);
                  const active = (i / 36) * 100 <= progressPercent;

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
      </div>
    </section>
  );
};
