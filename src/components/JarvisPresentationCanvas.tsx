'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Sparkles,
  Presentation,
  GitBranch,
  Video,
  Volume2,
  Zap,
  X,
} from 'lucide-react';

export interface JarvisSlide {
  step: number;
  tag: string;
  headline: string;
  visualAction: string;
  soundCue?: string;
  script?: string;
  keyTakeaway?: string;
}

export interface JarvisPresentationDeck {
  type: 'slideshow' | 'whiteboard';
  title: string;
  subtitle?: string;
  slides: JarvisSlide[];
}

interface Props {
  deck: JarvisPresentationDeck;
  onClose?: () => void;
}

export default function JarvisPresentationCanvas({ deck, onClose }: Props) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'slides' | 'whiteboard'>('slides');
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const slides = deck?.slides || [];
  const currentSlide = slides[currentSlideIndex] || slides[0];

  if (!slides || slides.length === 0) return null;

  const handleCopyScript = () => {
    const fullText = slides
      .map(
        (s) =>
          `[${s.tag || `Slide ${s.step}`}] ${s.headline}\nVisual: ${s.visualAction}\n${s.soundCue ? `Audio: ${s.soundCue}\n` : ''}${s.script ? `Script: "${s.script}"\n` : ''}`
      )
      .join('\n---\n\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className={`w-full rounded-3xl border border-cyber-cyan/40 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-4 sm:p-6 shadow-[0_0_40px_rgba(0,240,255,0.15)] transition-all duration-300 ${
        isExpanded ? 'fixed inset-4 z-50 overflow-y-auto max-w-5xl mx-auto' : 'relative my-4'
      }`}
    >
      {/* Top Presentation Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 flex-wrap gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyber-cyan to-blue-600 flex items-center justify-center text-black shadow-glow-cyan">
            {viewMode === 'slides' ? (
              <Presentation className="w-4 h-4" />
            ) : (
              <GitBranch className="w-4 h-4" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black text-white tracking-wide">{deck.title}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan font-bold">
                {viewMode === 'slides' ? `Slide ${currentSlideIndex + 1} of ${slides.length}` : 'Whiteboard Flow'}
              </span>
            </div>
            {deck.subtitle && (
              <p className="text-[11px] text-slate-400 mt-0.5">{deck.subtitle}</p>
            )}
          </div>
        </div>

        {/* View Switcher & Action Controls */}
        <div className="flex items-center space-x-1.5">
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setViewMode('slides')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center space-x-1 ${
                viewMode === 'slides'
                  ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Presentation className="w-3 h-3" />
              <span>Slides</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('whiteboard')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center space-x-1 ${
                viewMode === 'whiteboard'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GitBranch className="w-3 h-3" />
              <span>Whiteboard</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyScript}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center space-x-1"
            title="Copy Full Storyboard Script"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs"
            title={isExpanded ? 'Collapse' : 'Expand Canvas'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all text-xs"
              title="Close Presentation"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* MODE 1: POWERPOINT SLIDESHOW CAROUSEL */}
      {viewMode === 'slides' ? (
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="w-full bg-slate-800/60 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyber-cyan to-blue-500 h-full transition-all duration-300"
              style={{ width: `${((currentSlideIndex + 1) / slides.length) * 100}%` }}
            />
          </div>

          {/* Active Presentation Slide Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/90 border border-slate-800/90 shadow-xl space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center space-x-1.5">
                <Zap className="w-3 h-3 text-emerald-400" />
                <span>{currentSlide.tag || `Phase ${currentSlide.step}`}</span>
              </span>
              <span className="text-xs font-mono text-slate-500">
                Slide {currentSlideIndex + 1} of {slides.length}
              </span>
            </div>

            <h4 className="text-base sm:text-lg font-black text-white tracking-wide">
              {currentSlide.headline}
            </h4>

            {/* Visual Action Box */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start space-x-3">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Video className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase text-blue-400 font-bold block">
                  Visual Action & On-Screen Text
                </span>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                  {currentSlide.visualAction}
                </p>
              </div>
            </div>

            {/* Audio Cue Box (if provided) */}
            {currentSlide.soundCue && (
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start space-x-3">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase text-purple-400 font-bold block">
                    Audio & Sound Design Cue
                  </span>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium">
                    {currentSlide.soundCue}
                  </p>
                </div>
              </div>
            )}

            {/* Spoken Script Box */}
            {currentSlide.script && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyber-cyan/10 via-slate-900 to-blue-900/10 border border-cyber-cyan/30">
                <span className="text-[10px] font-mono uppercase text-cyber-cyan font-bold block mb-1">
                  🎙️ Spoken Script
                </span>
                <p className="text-xs sm:text-sm text-white italic font-medium leading-relaxed">
                  "{currentSlide.script}"
                </p>
              </div>
            )}

            {/* Psychological Trigger */}
            {currentSlide.keyTakeaway && (
              <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-1.5 pt-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span><strong className="text-slate-300">Conversion Objective:</strong> {currentSlide.keyTakeaway}</span>
              </div>
            )}
          </div>

          {/* Carousel Slide Controls */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentSlideIndex === 0}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center space-x-1 active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Slide</span>
            </button>

            {/* Slide Indicator Dots */}
            <div className="flex items-center space-x-1.5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentSlideIndex
                      ? 'w-6 bg-cyber-cyan shadow-glow-cyan'
                      : 'bg-slate-700 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
              disabled={currentSlideIndex === slides.length - 1}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center space-x-1 active:scale-95"
            >
              <span>Next Slide</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* MODE 2: INTERACTIVE WHITEBOARD FLOWCHART */
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-300 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Whiteboard Flowchart: Visual sequence mapped by J.A.R.V.I.S.</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative">
            {slides.map((slide, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setCurrentSlideIndex(idx);
                  setViewMode('slides');
                }}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyber-cyan transition-all cursor-pointer space-y-2 relative group shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 font-bold">
                    Step {slide.step}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    {slide.tag}
                  </span>
                </div>
                <h5 className="text-sm font-bold text-white group-hover:text-cyber-cyan transition-colors">
                  {slide.headline}
                </h5>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {slide.visualAction}
                </p>
                {slide.script && (
                  <p className="text-[11px] text-slate-300 italic line-clamp-2 border-l-2 border-cyber-cyan pl-2">
                    "{slide.script}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
