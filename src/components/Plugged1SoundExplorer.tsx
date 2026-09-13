'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Play, Pause, Sparkles, Volume2, Waves, Radio, Disc3, ArrowRight, Music, Zap, Sliders, ChevronLeft, ChevronRight } from 'lucide-react';

interface PresetItem {
  id: string;
  name: string;
  category: string;
  engine: string;
  key: string;
  description: string;
  audioSrc: string;
  macros: { name: string; val: number }[];
  accentColor: string;
}

const PRESETS_DATA: PresetItem[] = [
  {
    id: 'hard_knock_808',
    name: 'Hard Knock 808 (Hit)',
    category: '808s & Subs',
    engine: 'Sub808Engine',
    key: 'F Minor (F1 43.65Hz)',
    description: 'The undisputed trap standard: instant woody beater knock, tight punch decay, and asymmetric tube mid warmth.',
    audioSrc: '/audio/preset_808_hardknock.wav',
    macros: [
      { name: 'Punch', val: 85 },
      { name: 'Dirt', val: 55 },
      { name: 'Decay', val: 65 },
      { name: 'Sub', val: 95 },
    ],
    accentColor: 'rose',
  },
  {
    id: 'velvet_rhodes',
    name: 'Velvet MK1 Rhodes',
    category: 'Rhodes & Keys',
    engine: 'RealismKeysEngine',
    key: 'F Minor (Fm9 Chord)',
    description: 'Authentic electro-mechanical tine resonance, hammer release dynamics, and vintage dimensional stereo chorus.',
    audioSrc: '/audio/preset_rhodes_velvet.wav',
    macros: [
      { name: 'Tine', val: 78 },
      { name: 'Chorus', val: 62 },
      { name: 'Warmth', val: 80 },
      { name: 'Space', val: 50 },
    ],
    accentColor: 'amber',
  },
  {
    id: 'hyper_pluck',
    name: 'Hyperpop Pluck (Arp)',
    category: 'Plucks & Mallets',
    engine: 'StringPluckEngine',
    key: 'F Minor 16th Arp',
    description: 'Ultra-fast acoustic pluck transient with Karplus-Strong physical modeling and wide stereo spread.',
    audioSrc: '/audio/preset_pluck_hyper.wav',
    macros: [
      { name: 'Bright', val: 90 },
      { name: 'Decay', val: 40 },
      { name: 'Pluck', val: 85 },
      { name: 'Width', val: 75 },
    ],
    accentColor: 'cyan',
  },
  {
    id: 'cloud_pad',
    name: 'Ethereal Cloud Pad',
    category: 'Textures & Pads',
    engine: 'TextureEngine',
    key: 'F Minor Ambient',
    description: 'Warm analog detuned supersaw layers with vintage tape flutter, crackle noise, and lush slow-attack air.',
    audioSrc: '/audio/preset_pad_cloud.wav',
    macros: [
      { name: 'Air', val: 88 },
      { name: 'Flutter', val: 45 },
      { name: 'Detune', val: 65 },
      { name: 'Tape', val: 55 },
    ],
    accentColor: 'purple',
  },
];

const CATEGORIES = ['All Sounds', '808s & Subs', 'Rhodes & Keys', 'Plucks & Mallets', 'Textures & Pads'];

export const Plugged1SoundExplorer: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All Sounds');
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const filteredPresets = PRESETS_DATA.filter(
    (p) => selectedCategory === 'All Sounds' || p.category === selectedCategory
  );

  const handlePlayPreset = (preset: PresetItem) => {
    if (activePlayingId === preset.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setActivePlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = preset.audioSrc;
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
        setActivePlayingId(preset.id);
      }
    }
  };

  const handleAudioEnded = () => {
    setActivePlayingId(null);
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <section id="sound-explorer" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Hidden Audio Element */}
      <audio ref={audioRef} onEnded={handleAudioEnded} />

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyber-purple/10 border border-cyber-purple/30 text-xs font-bold text-cyber-purple mb-3">
            <Music className="w-3.5 h-3.5 text-cyber-purple" />
            <span>PLUGGED 1 SYNTHESIZER SOUND BANK</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Explore Playable Sounds
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-xl">
            Swipe and audition real instrument presets from <strong>PLUGGED 1</strong>. From earth-shaking 808 sub kicks to lush Rhodes tines and hyperpop plucks in F Minor.
          </p>
        </div>

        {/* Swipe Controls & CTA */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2">
            <button
              onClick={scrollLeft}
              className="w-10 h-10 rounded-xl bg-studio-900 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:border-white/20 transition-all"
              aria-label="Previous presets"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={scrollRight}
              className="w-10 h-10 rounded-xl bg-studio-900 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:border-white/20 transition-all"
              aria-label="Next presets"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <Link
            href="/plugins/pluggedin_plugged1"
            className="px-5 py-2.5 rounded-xl bg-studio-900 hover:bg-studio-850 border border-white/10 text-xs font-bold text-white transition-all flex items-center space-x-2"
          >
            <span>Inspect PLUGGED 1</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyber-cyan" />
          </Link>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                isSelected
                  ? 'bg-cyber-purple text-white border-cyber-purple shadow-glow-purple'
                  : 'bg-studio-900/70 text-slate-400 hover:text-white border-white/5'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Swipeable Sound Cards Carousel / Grid */}
      <div
        ref={scrollContainerRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto pb-4 scrollbar-none snap-x"
      >
        {filteredPresets.map((preset) => {
          const isPlaying = activePlayingId === preset.id;
          return (
            <div
              key={preset.id}
              className={`rounded-3xl bg-studio-900/90 border p-6 flex flex-col justify-between transition-all duration-300 snap-start relative group ${
                isPlaying
                  ? 'border-cyber-cyan shadow-glow-cyan bg-studio-900'
                  : 'border-white/10 hover:border-white/20 hover:bg-studio-850'
              }`}
            >
              <div>
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
                    {preset.category}
                  </span>
                  <span className="text-[10px] font-mono text-cyber-cyan">
                    {preset.key}
                  </span>
                </div>

                {/* Preset Name & Engine */}
                <h3 className="text-lg font-black text-white mt-4">{preset.name}</h3>
                <span className="text-[11px] font-mono text-slate-500 block mb-2">
                  Engine: <strong className="text-slate-300">{preset.engine}</strong>
                </span>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  {preset.description}
                </p>

                {/* Macro Dials Graphic */}
                <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/5 mb-6">
                  {preset.macros.map((m, idx) => (
                    <div key={idx} className="text-center">
                      <div className="w-full bg-studio-950 h-1.5 rounded-full overflow-hidden border border-white/5 mb-1">
                        <div
                          className="h-full bg-gradient-to-r from-cyber-cyan to-cyber-purple"
                          style={{ width: `${m.val}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase block">
                        {m.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Play Audition Trigger */}
              <button
                onClick={() => handlePlayPreset(preset)}
                className={`w-full py-3.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 ${
                  isPlaying
                    ? 'bg-cyber-cyan text-black shadow-glow-cyan animate-pulse'
                    : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Playing Sound Demo...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Audition {preset.name}</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
