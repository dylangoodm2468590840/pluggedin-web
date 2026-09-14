'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  X,
} from 'lucide-react';

export interface JarvisFloatingCompanionProps {
  isSpeaking: boolean;
  isListening: boolean;
  isThinking: boolean;
  isContinuousMode: boolean;
  isVoiceMuted: boolean;
  latestSpeech: string;
  transcriptPreview: string;
  onToggleMic: () => void;
  onToggleContinuous: () => void;
  onToggleMute: () => void;
  onStopSpeech: () => void;
  onSendCommand: (cmd: string) => void;
  onUnlockAudio: () => void;
  spotlightTarget: string | null;
  spotlightCaption: string | null;
}

export default function JarvisFloatingCompanion({
  isSpeaking,
  isListening,
  isThinking,
  isContinuousMode,
  isVoiceMuted,
  latestSpeech,
  transcriptPreview,
  onToggleMic,
  onToggleContinuous,
  onToggleMute,
  onSendCommand,
  onUnlockAudio,
  spotlightTarget,
  spotlightCaption,
}: JarvisFloatingCompanionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasUnlockedAudio, setHasUnlockedAudio] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 20, y: 120 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 20,
    posY: 120,
  });
  const hasMovedRef = useRef(false);

  // Initialize position to bottom-right corner on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initialX = Math.max(16, window.innerWidth - 110);
      const initialY = Math.max(100, window.innerHeight - 220);
      setPosition({ x: initialX, y: initialY });
    }
  }, []);

  // Handle Dragging (Mouse & Touch for Mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    dragStartRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      posX: position.x,
      posY: position.y,
    };
    hasMovedRef.current = false;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStartRef.current.startX;
    const dy = touch.clientY - dragStartRef.current.startY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      hasMovedRef.current = true;
    }
    const maxX = typeof window !== 'undefined' ? window.innerWidth - 80 : 300;
    const maxY = typeof window !== 'undefined' ? window.innerHeight - 80 : 600;
    const nextX = Math.min(Math.max(12, dragStartRef.current.posX + dx), maxX);
    const nextY = Math.min(Math.max(60, dragStartRef.current.posY + dy), maxY);
    setPosition({ x: nextX, y: nextY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y,
    };
    hasMovedRef.current = false;
    setIsDragging(true);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - dragStartRef.current.startX;
      const dy = moveEvent.clientY - dragStartRef.current.startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        hasMovedRef.current = true;
      }
      const maxX = window.innerWidth - 90;
      const maxY = window.innerHeight - 90;
      const nextX = Math.min(Math.max(12, dragStartRef.current.posX + dx), maxX);
      const nextY = Math.min(Math.max(60, dragStartRef.current.posY + dy), maxY);
      setPosition({ x: nextX, y: nextY });
    };

    const onMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleWidgetClick = () => {
    if (hasMovedRef.current) return;
    if (!hasUnlockedAudio) {
      onUnlockAudio();
      setHasUnlockedAudio(true);
    }
    setIsExpanded(!isExpanded);
  };

  // Determine current robot animation state
  const robotState = isListening
    ? 'listening'
    : isThinking
    ? 'thinking'
    : isSpeaking
    ? 'speaking'
    : 'idle';

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999,
        touchAction: 'none',
      }}
      className="select-none transition-transform duration-75"
    >
      {/* EXPANDED HOLOGRAPHIC HUD FLYOUT PILL */}
      {isExpanded && (
        <div className="absolute bottom-20 right-0 sm:right-auto sm:left-0 w-72 sm:w-84 bg-slate-950/95 border border-cyan-500/30 rounded-3xl p-4 shadow-[0_0_40px_rgba(0,240,255,0.25)] backdrop-blur-2xl text-white space-y-3 z-50 animate-in fade-in zoom-in-95 duration-200">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-mono text-xs font-black tracking-wider text-cyan-300">
                J.A.R.V.I.S. COMPANION
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={onToggleMute}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  isVoiceMuted ? 'text-rose-400 bg-rose-500/10' : 'text-emerald-400 bg-emerald-500/10'
                }`}
                title={isVoiceMuted ? 'Unmute' : 'Mute'}
              >
                {isVoiceMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subtitle / Spoken Thought Snippet */}
          <div className="bg-slate-900/80 rounded-2xl p-3 border border-slate-800 text-xs text-slate-200 leading-relaxed max-h-32 overflow-y-auto">
            {transcriptPreview ? (
              <p className="text-cyan-300 font-mono italic animate-pulse">
                &ldquo;{transcriptPreview}&rdquo;
              </p>
            ) : latestSpeech ? (
              <p className="font-sans">&ldquo;{latestSpeech}&rdquo;</p>
            ) : (
              <p className="text-slate-400 font-mono">
                &ldquo;Ready, Dylan. Tap my core or speak to isolate metrics or generate ads.&rdquo;
              </p>
            )}
          </div>

          {/* Screen Control Spotlight Status */}
          {spotlightTarget && (
            <div className="px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-[11px] font-mono flex items-center justify-between animate-pulse">
              <span>[ ── ⊕ {spotlightCaption || 'TARGET ISOLATED'} ── ]</span>
              <span className="text-[10px] text-cyan-400">ON SCREEN</span>
            </div>
          )}

          {/* Control Bar: Mic, Hands-Free, Audio Wake */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              onClick={() => {
                if (!hasUnlockedAudio) {
                  onUnlockAudio();
                  setHasUnlockedAudio(true);
                }
                onToggleMic();
              }}
              className={`flex-1 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all active:scale-95 ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.6)]'
                  : isSpeaking
                  ? 'bg-purple-600 text-white shadow-glow-purple'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-black shadow-glow-cyan'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-3.5 h-3.5" />
                  <span>Tap to Send</span>
                </>
              ) : isSpeaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Interrupt</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5" />
                  <span>Tap to Speak</span>
                </>
              )}
            </button>

            <button
              onClick={onToggleContinuous}
              className={`px-3 py-2.5 rounded-2xl border text-xs font-bold transition-all active:scale-95 flex items-center space-x-1 ${
                isContinuousMode
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="Hands-Free Duplex (Continuous Conversation Loop)"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isContinuousMode ? 'text-cyan-400 animate-spin' : ''}`} />
              <span className="text-[11px]">{isContinuousMode ? 'Duplex ON' : 'Duplex'}</span>
            </button>
          </div>

          {/* 1-Tap Screen Control Directives */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
              Autonomous Screen Directives:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: '📊 Net Sales', cmd: 'Jarvis, show me our sales and isolate net profit numbers.' },
                { label: '💻 Studio Rigs', cmd: 'Jarvis, show me my studio computers and active DAW rigs.' },
                { label: '📱 Social Queue', cmd: 'Jarvis, pull up the social media queue and marketing center.' },
                { label: '🎬 4-Plugin Ad', cmd: 'Jarvis, make an ad using 4 plugins on a vocal chain showing off the whole suite.' },
              ].map((btn) => (
                <button
                  key={btn.label}
                  onClick={() => {
                    if (!hasUnlockedAudio) {
                      onUnlockAudio();
                      setHasUnlockedAudio(true);
                    }
                    onSendCommand(btn.cmd);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-medium text-slate-300 hover:text-white text-left truncate transition-colors active:scale-95"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* THE ANIMATED FLOATING CYBER-ROBOT / ARC REACTOR ORB */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onClick={handleWidgetClick}
        className="relative w-16 h-16 sm:w-20 sm:h-20 cursor-grab active:cursor-grabbing group select-none"
      >
        {/* Ambient Pulsing Halo */}
        <div
          className={`absolute -inset-2 rounded-full blur-md transition-all duration-500 ${
            robotState === 'speaking'
              ? 'bg-purple-500/40 animate-pulse'
              : robotState === 'listening'
              ? 'bg-rose-500/40 animate-ping'
              : robotState === 'thinking'
              ? 'bg-amber-500/40 animate-pulse'
              : 'bg-cyan-500/20 group-hover:bg-cyan-500/35'
          }`}
        />

        {/* Outer Gyroscopic Shield Ring (Rotates) */}
        <div
          className={`absolute inset-0 rounded-full border border-dashed transition-all duration-700 ${
            robotState === 'speaking'
              ? 'border-purple-400 animate-[spin_4s_linear_infinite] shadow-[0_0_20px_rgba(168,85,247,0.6)]'
              : robotState === 'listening'
              ? 'border-rose-400 animate-[spin_2s_linear_infinite] shadow-[0_0_20px_rgba(244,63,94,0.6)]'
              : robotState === 'thinking'
              ? 'border-amber-400 animate-[spin_1.5s_linear_infinite] shadow-[0_0_20px_rgba(251,191,36,0.6)]'
              : 'border-cyan-400/50 animate-[spin_12s_linear_infinite] group-hover:border-cyan-400'
          }`}
        />

        {/* Inner Gyroscopic Ring (Counter-Rotating) */}
        <div
          className={`absolute inset-1.5 rounded-full border border-t-transparent transition-all duration-700 ${
            robotState === 'speaking'
              ? 'border-cyan-400 animate-[spin_3s_linear_infinite_reverse]'
              : robotState === 'listening'
              ? 'border-rose-300 animate-[spin_2s_linear_infinite_reverse]'
              : robotState === 'thinking'
              ? 'border-amber-300 animate-[spin_1.5s_linear_infinite_reverse]'
              : 'border-slate-700 animate-[spin_8s_linear_infinite_reverse]'
          }`}
        />

        {/* Spherical Robot Core Chassis */}
        <div
          className={`relative w-full h-full rounded-full flex flex-col items-center justify-center p-2 transition-all duration-300 shadow-2xl border ${
            robotState === 'speaking'
              ? 'bg-gradient-to-tr from-purple-950 to-slate-900 border-purple-500/80 shadow-[0_0_25px_rgba(147,51,234,0.7)]'
              : robotState === 'listening'
              ? 'bg-gradient-to-tr from-rose-950 to-slate-900 border-rose-500/80 shadow-[0_0_25px_rgba(244,63,94,0.7)]'
              : robotState === 'thinking'
              ? 'bg-gradient-to-tr from-amber-950 to-slate-900 border-amber-500/80 shadow-[0_0_25px_rgba(245,158,11,0.7)]'
              : 'bg-gradient-to-tr from-slate-950 to-slate-900 border-cyan-500/50 group-hover:border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
          }`}
        >
          {/* Animated Robotic Digital Eyes */}
          <div className="flex items-center space-x-1.5 mb-1">
            <div
              className={`w-2 h-2.5 rounded-full transition-all duration-200 ${
                robotState === 'speaking'
                  ? 'bg-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.9)] animate-pulse'
                  : robotState === 'listening'
                  ? 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.9)] scale-110'
                  : robotState === 'thinking'
                  ? 'bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-bounce'
                  : 'bg-cyan-400 shadow-[0_0_6px_rgba(0,240,255,0.7)]'
              }`}
            />
            <div
              className={`w-2 h-2.5 rounded-full transition-all duration-200 ${
                robotState === 'speaking'
                  ? 'bg-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.9)] animate-pulse'
                  : robotState === 'listening'
                  ? 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.9)] scale-110'
                  : robotState === 'thinking'
                  ? 'bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-bounce'
                  : 'bg-cyan-400 shadow-[0_0_6px_rgba(0,240,255,0.7)]'
              }`}
            />
          </div>

          {/* Animated Mouth / Audio Waveform Bars */}
          <div className="flex items-center space-x-0.5 h-2">
            {[10, 30, 20, 40, 15].map((h, i) => (
              <div
                key={i}
                className={`w-0.5 rounded-full transition-all duration-100 ${
                  robotState === 'speaking'
                    ? 'bg-purple-300 animate-pulse'
                    : robotState === 'listening'
                    ? 'bg-rose-300 animate-pulse'
                    : 'bg-cyan-500/50'
                }`}
                style={{
                  height:
                    robotState === 'speaking'
                      ? `${(h % 30) + 10}px`
                      : robotState === 'listening'
                      ? `${(h % 20) + 8}px`
                      : '4px',
                }}
              />
            ))}
          </div>

          {/* One-Touch Phone Audio Wake Beacon */}
          {!hasUnlockedAudio && (
            <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-[9px] font-black text-white flex items-center justify-center animate-bounce shadow-md">
              !
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
