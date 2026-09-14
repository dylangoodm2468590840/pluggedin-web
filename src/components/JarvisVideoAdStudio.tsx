'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Check,
  Video,
  Sliders,
  Sparkles,
  Volume2,
  VolumeX,
  Smartphone,
  Laptop,
  Image as ImageIcon,
  Zap,
  X,
  Layers,
  Share2,
} from 'lucide-react';

export interface JarvisVideoScene {
  sceneNumber: number;
  durationSec: number;
  headline: string;
  visualAction: string;
  audioMode: 'dry' | 'tuned' | 'wet' | 'beat';
  badgeText?: string;
  subtitles: string[];
  pluginId?: string; // e.g. 'plugtne', 'plugeq', 'plugvox', 'plugverb'
  pluginName?: string;
}

export interface JarvisVideoAd {
  id?: string;
  pluginId: string;
  pluginName: string;
  hookHeadline: string;
  targetAudience?: string;
  aspectRatio?: '9:16' | '16:9';
  audioPair: 'vocal' | '808' | 'sample';
  audioDryUrl?: string;
  audioTunedUrl?: string;
  audioWetUrl?: string;
  pluginImageUrl?: string;
  isChainAd?: boolean;
  chainPlugins?: Array<{ id: string; name: string }>;
  scenes: JarvisVideoScene[];
  callToAction?: string;
}

interface Props {
  videoAd: JarvisVideoAd;
  onClose?: () => void;
}

const PLUGIN_IMAGE_MAP: Record<string, string> = {
  plugtne: '/images/plugins/plugtne.png',
  plugtune: '/images/plugins/plugtne.png',
  undergrnd: '/images/plugins/undergrnd.png',
  underground: '/images/plugins/undergrnd.png',
  plugchop: '/images/plugins/plugchop.png',
  plugvox: '/images/plugins/PlugVox.png',
  plugeq: '/images/plugins/PlugEq.png',
  plugglue: '/images/plugins/PlugGlue.png',
  plugopto: '/images/plugins/PlugOpto.png',
  pluglimit: '/images/plugins/pluglimit.png',
  plugdelay: '/images/plugins/plugdelay.png',
  plugverb: '/images/plugins/plugverb.png',
  plugwarp: '/images/plugins/plugwarp.png',
  plugsilky: '/images/plugins/plugsilky.png',
  plugblue: '/images/plugins/plugblue.png',
  plugrack: '/images/plugins/plugrack.png',
  plugged1: '/images/plugins/Plugged1.png',
};

const DEFAULT_AUDIO_MAP: Record<'vocal' | '808' | 'sample', { dry: string; tuned: string; wet: string }> = {
  vocal: { dry: '/audio/vocal_dry.wav', tuned: '/audio/vocal_tuned.wav', wet: '/audio/vocal_wet.wav' },
  808: { dry: '/audio/808_dry.wav', tuned: '/audio/808_wet.wav', wet: '/audio/808_wet.wav' },
  sample: { dry: '/audio/sample_dry.wav', tuned: '/audio/sample_wet.wav', wet: '/audio/sample_wet.wav' },
};

export default function JarvisVideoAdStudio({ videoAd, onClose }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [showPluginImage, setShowPluginImage] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>(videoAd.aspectRatio || '9:16');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportSuccess, setExportSuccess] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const dryAudioRef = useRef<HTMLAudioElement | null>(null);
  const tunedAudioRef = useRef<HTMLAudioElement | null>(null);
  const wetAudioRef = useRef<HTMLAudioElement | null>(null);
  const imageCacheRef = useRef<Record<string, HTMLImageElement>>({});

  const scenes = videoAd.scenes && videoAd.scenes.length > 0 ? videoAd.scenes : [
    {
      sceneNumber: 1,
      durationSec: 3,
      headline: videoAd.hookHeadline || 'Stop recording amateur vocals in FL Studio.',
      visualAction: 'Raw vocal waveform on screen with red off-key alert.',
      audioMode: 'dry' as const,
      badgeText: 'BEFORE: RAW DEMO',
      subtitles: ['Stop', 'recording', 'off-key', 'vocals', 'in', 'FL', 'Studio.'],
      pluginId: 'plugtne',
    },
    {
      sceneNumber: 2,
      durationSec: 4,
      headline: `Step 1: ${videoAd.pluginName}`,
      visualAction: 'Plugin interface engaged with instant snap dial turned to 100%.',
      audioMode: 'tuned' as const,
      badgeText: 'STEP 1: PLUGTNE 0MS SNAP',
      subtitles: ['One', 'click', 'and', 'the', 'pitch', 'locks', 'in', 'instantly.'],
      pluginId: 'plugtne',
    },
    {
      sceneNumber: 3,
      durationSec: 4,
      headline: 'Full Studio Chain: Radio Ready',
      visualAction: 'All 4 plugins active in the mixer with final polish.',
      audioMode: 'wet' as const,
      badgeText: 'FULL VOCAL CHAIN (RADIO READY)',
      subtitles: ['Grab', 'yours', 'now', 'link', 'in', 'bio.'],
      pluginId: 'plugverb',
    },
  ];

  const totalDuration = scenes.reduce((acc, s) => acc + s.durationSec, 0);

  // Preload all 15 authentic plugin images
  useEffect(() => {
    Object.entries(PLUGIN_IMAGE_MAP).forEach(([key, src]) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = src;
      imageCacheRef.current[key] = img;
    });
  }, []);

  // Preload authentic audio elements
  const audioPair = videoAd.audioPair || 'vocal';
  const dryAudioSrc = videoAd.audioDryUrl || DEFAULT_AUDIO_MAP[audioPair]?.dry || '/audio/vocal_dry.wav';
  const tunedAudioSrc = videoAd.audioTunedUrl || DEFAULT_AUDIO_MAP[audioPair]?.tuned || '/audio/vocal_tuned.wav';
  const wetAudioSrc = videoAd.audioWetUrl || (videoAd.isChainAd ? '/audio/vocal_wet.wav' : DEFAULT_AUDIO_MAP[audioPair]?.wet || '/audio/vocal_wet.wav');

  useEffect(() => {
    dryAudioRef.current = new Audio(dryAudioSrc);
    dryAudioRef.current.loop = true;
    dryAudioRef.current.volume = 1.0;

    tunedAudioRef.current = new Audio(tunedAudioSrc);
    tunedAudioRef.current.loop = true;
    tunedAudioRef.current.volume = 1.0;

    wetAudioRef.current = new Audio(wetAudioSrc);
    wetAudioRef.current.loop = true;
    wetAudioRef.current.volume = 1.0;

    return () => {
      dryAudioRef.current?.pause();
      tunedAudioRef.current?.pause();
      wetAudioRef.current?.pause();
    };
  }, [dryAudioSrc, tunedAudioSrc, wetAudioSrc]);

  // Manage Audio Switching between Dry, Tuned, and Wet (Full Chain)
  useEffect(() => {
    const activeScene = scenes[currentSceneIdx];
    if (!isPlaying) {
      dryAudioRef.current?.pause();
      tunedAudioRef.current?.pause();
      wetAudioRef.current?.pause();
      return;
    }

    if (activeScene?.audioMode === 'dry') {
      tunedAudioRef.current?.pause();
      wetAudioRef.current?.pause();
      dryAudioRef.current?.play().catch(() => {});
    } else if (activeScene?.audioMode === 'tuned') {
      dryAudioRef.current?.pause();
      wetAudioRef.current?.pause();
      tunedAudioRef.current?.play().catch(() => {});
    } else {
      dryAudioRef.current?.pause();
      tunedAudioRef.current?.pause();
      wetAudioRef.current?.play().catch(() => {});
    }
  }, [isPlaying, currentSceneIdx, scenes]);

  // Main playback timer
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.05;
          if (next >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return next;
        });
      }, 50);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalDuration]);

  // Determine current active scene from currentTime
  useEffect(() => {
    let accumulated = 0;
    for (let i = 0; i < scenes.length; i++) {
      accumulated += scenes[i].durationSec;
      if (currentTime < accumulated) {
        setCurrentSceneIdx(i);
        break;
      }
    }
  }, [currentTime, scenes]);

  // Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const activeScene = scenes[currentSceneIdx] || scenes[0];

    // Background Gradient (Dark Cyber Studio)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#020617');
    bgGrad.addColorStop(0.5, '#090d16');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle DAW Grid Lines
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Top Brand Badge & Chain Indicator
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PLUGGEDIN AUDIO • STUDIO RIG', width / 2, 55);

    // Scene Badge (e.g. BEFORE: RAW DEMO vs STEP 1: PLUGTNE 0MS vs FULL CHAIN)
    const isDry = activeScene.audioMode === 'dry';
    const isTuned = activeScene.audioMode === 'tuned';
    const badgeText = activeScene.badgeText || (isDry ? 'BEFORE: RAW DEMO' : isTuned ? 'STEP 1: PLUGTNE' : 'AFTER: FULL CHAIN');

    ctx.save();
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    const badgeW = ctx.measureText(badgeText).width + 48;
    const badgeH = 48;
    const badgeX = (width - badgeW) / 2;
    const badgeY = 80;

    ctx.fillStyle = isDry ? 'rgba(244, 63, 94, 0.2)' : isTuned ? 'rgba(0, 240, 255, 0.2)' : 'rgba(52, 211, 153, 0.2)';
    ctx.strokeStyle = isDry ? '#f43f5e' : isTuned ? '#00f0ff' : '#34d399';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 24);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isDry ? '#f43f5e' : isTuned ? '#00f0ff' : '#34d399';
    ctx.textAlign = 'center';
    ctx.fillText(badgeText, width / 2, badgeY + 33);
    ctx.restore();

    // Scene Headline Text (High-contrast hook)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    wrapText(ctx, activeScene.headline, width / 2, 175, width - 80, 42);

    // Center Stage: Active Plugin GUI Photo (Switches automatically per scene!)
    if (showPluginImage) {
      const activePluginId = (activeScene.pluginId || videoAd.pluginId || 'plugtne').toLowerCase().replace(/[^a-z0-9]/g, '');
      const img = imageCacheRef.current[activePluginId] || imageCacheRef.current['plugtne'];

      if (img && img.complete) {
        const imgMaxW = width - 80;
        const imgMaxH = height * 0.36;
        let drawW = img.width || 400;
        let drawH = img.height || 250;
        const scale = Math.min(imgMaxW / drawW, imgMaxH / drawH, 1);
        drawW = drawW * scale;
        drawH = drawH * scale;
        const drawX = (width - drawW) / 2;
        const drawY = height * 0.33;

        // Glow behind plugin
        ctx.save();
        ctx.shadowColor = isDry ? 'rgba(244, 63, 94, 0.4)' : isTuned ? 'rgba(0, 240, 255, 0.5)' : 'rgba(52, 211, 153, 0.5)';
        ctx.shadowBlur = 30;
        ctx.strokeStyle = isDry ? 'rgba(244, 63, 94, 0.6)' : isTuned ? 'rgba(0, 240, 255, 0.6)' : 'rgba(52, 211, 153, 0.6)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(drawX - 6, drawY - 6, drawW + 12, drawH + 12, 16);
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(drawX, drawY, drawW, drawH, 12);
        ctx.clip();
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        ctx.restore();
      }
    }

    // Dynamic Audio Waveform Spectrum Bars
    const waveY = height * 0.74;
    const barCount = 36;
    const barWidth = 10;
    const barGap = 6;
    const totalWaveW = barCount * (barWidth + barGap);
    const startX = (width - totalWaveW) / 2;

    for (let i = 0; i < barCount; i++) {
      const phase = currentTime * 8 + i * 0.4;
      const amplitude = isPlaying ? (Math.sin(phase) * 0.5 + 0.5) * 60 + 10 : 8;
      const barX = startX + i * (barWidth + barGap);
      const barH = amplitude;

      const barGrad = ctx.createLinearGradient(0, waveY - barH, 0, waveY + barH);
      if (isDry) {
        barGrad.addColorStop(0, '#f43f5e');
        barGrad.addColorStop(1, '#9f1239');
      } else if (isTuned) {
        barGrad.addColorStop(0, '#00f0ff');
        barGrad.addColorStop(1, '#2563eb');
      } else {
        barGrad.addColorStop(0, '#34d399');
        barGrad.addColorStop(1, '#059669');
      }
      ctx.fillStyle = barGrad;
      ctx.beginPath();
      ctx.roundRect(barX, waveY - barH / 2, barWidth, barH, 4);
      ctx.fill();
    }

    // Kinetic Subtitle Captions (Viral TikTok karaoke style)
    const subtitles = activeScene.subtitles || [];
    if (subtitles.length > 0) {
      const sceneElapsed = getSceneElapsed(currentTime, scenes, currentSceneIdx);
      const sceneDuration = activeScene.durationSec;
      const wordIndex = Math.min(
        Math.floor((sceneElapsed / sceneDuration) * subtitles.length),
        subtitles.length - 1
      );

      ctx.font = '900 36px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';

      const subY = height * 0.85;

      const activeWord = subtitles[wordIndex] || '';
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.beginPath();
      ctx.roundRect((width - 460) / 2, subY - 45, 460, 65, 16);
      ctx.fill();

      ctx.fillStyle = '#facc15';
      ctx.shadowColor = 'rgba(250, 204, 21, 0.8)';
      ctx.shadowBlur = 15;
      ctx.fillText(`"${activeWord.toUpperCase()}"`, width / 2, subY);
      ctx.restore();
    }

    // Bottom Call to Action
    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(videoAd.callToAction || '👉 Grab it at pluggedin.studio • Link in bio', width / 2, height - 40);

    // Progress Bar on Very Bottom
    const progressPct = currentTime / totalDuration;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, height - 10, width, 10);
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(0, height - 10, width * progressPct, 10);

  }, [currentTime, currentSceneIdx, showPluginImage, isPlaying, scenes, totalDuration, videoAd]);

  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReplay = () => {
    setCurrentTime(0);
    setCurrentSceneIdx(0);
    setIsPlaying(true);
  };

  // Video Export & Download Engine (Canvas + Web Audio MediaRecorder)
  const handleExportVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsExporting(true);
    setExportProgress(10);
    setIsPlaying(false);
    setCurrentTime(0);

    try {
      const stream = canvas.captureStream(30);
      let combinedStream = stream;

      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass && wetAudioRef.current) {
          const actx = new AudioContextClass();
          const dest = actx.createMediaStreamDestination();
          const source = actx.createMediaElementSource(wetAudioRef.current);
          source.connect(dest);
          source.connect(actx.destination);
          dest.stream.getAudioTracks().forEach((track) => stream.addTrack(track));
          combinedStream = stream;
        }
      } catch (_) {}

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';
      const recorder = new MediaRecorder(combinedStream, { mimeType });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${videoAd.pluginId}_Ad_Official.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsExporting(false);
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 4000);
      };

      recorder.start();
      setIsPlaying(true);

      const checkInterval = setInterval(() => {
        setExportProgress((prev) => Math.min(prev + 12, 95));
      }, 500);

      setTimeout(() => {
        clearInterval(checkInterval);
        recorder.stop();
        setIsPlaying(false);
        setCurrentTime(0);
      }, (totalDuration + 0.5) * 1000);

    } catch (err: any) {
      alert(`Could not export video on this browser: ${err.message}`);
      setIsExporting(false);
    }
  };

  const activeScene = scenes[currentSceneIdx] || scenes[0];

  return (
    <div className="w-full rounded-3xl border border-cyber-cyan/40 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-4 sm:p-6 shadow-[0_0_50px_rgba(0,240,255,0.2)] my-4 text-left">
      {/* Studio Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 flex-wrap gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-cyber-cyan flex items-center justify-center text-black shadow-glow-cyan font-black">
            <Video className="w-4 h-4 text-black" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-black text-white">{videoAd.pluginName} Ad Studio</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold">
                100% Authentic C++ DSP
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Targeting: <strong className="text-slate-300">{videoAd.targetAudience || 'FL Studio Music Producers'}</strong>
            </p>
          </div>
        </div>

        {/* Controls: Plugin Image Toggle & Close */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowPluginImage(!showPluginImage)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center space-x-1.5 ${
              showPluginImage
                ? 'bg-cyber-cyan/15 border-cyber-cyan text-cyber-cyan'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{showPluginImage ? 'GUI Photo: ON' : 'GUI Photo: OFF'}</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all text-xs"
              title="Close Studio"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Signal Chain Flow Bar (For Multi-Plugin / Vocal Chain Ads) */}
      {(videoAd.isChainAd || videoAd.chainPlugins) && (
        <div className="w-full bg-black/60 border border-white/10 rounded-2xl p-3 mb-4 flex items-center justify-between overflow-x-auto gap-2">
          <div className="text-[11px] font-mono text-cyber-cyan font-bold uppercase tracking-wider shrink-0 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" />
            <span>Vocal Chain Sequence:</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs overflow-x-auto no-scrollbar">
            {(videoAd.chainPlugins || [
              { id: 'plugtne', name: '1. PLUGTNE' },
              { id: 'plugeq', name: '2. PLUGEQ' },
              { id: 'plugvox', name: '3. PLUGVOX' },
              { id: 'plugverb', name: '4. PLUGVERB' },
            ]).map((plug) => {
              const isCurrent = activeScene?.pluginId === plug.id;
              return (
                <div
                  key={plug.id}
                  className={`px-3 py-1 rounded-xl border transition-all shrink-0 flex items-center gap-1.5 ${
                    isCurrent
                      ? 'bg-cyber-cyan text-black border-cyber-cyan font-bold shadow-[0_0_15px_rgba(0,240,255,0.6)] scale-105'
                      : 'bg-slate-900 border-white/10 text-slate-400'
                  }`}
                >
                  <span>{plug.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Preview: Video Canvas + Timeline */}
      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Render Canvas (9:16 Vertical TikTok Aspect Ratio) */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-cyber-cyan/30 bg-black shrink-0 max-w-[300px] sm:max-w-[320px] w-full aspect-[9/16]">
          <canvas
            ref={canvasRef}
            width={720}
            height={1280}
            className="w-full h-full object-cover block"
          />

          {/* Overlay Play Indicator */}
          {!isPlaying && (
            <div
              onClick={handlePlayToggle}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center cursor-pointer group transition-all"
            >
              <div className="w-16 h-16 rounded-full bg-cyber-cyan/90 text-black flex items-center justify-center shadow-glow-cyan transform group-hover:scale-110 transition-all">
                <Play className="w-8 h-8 fill-black ml-1" />
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Timeline Scenes & Export Controls */}
        <div className="flex-1 w-full space-y-4">
          {/* Active Audio Mode Indicator */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-black/60 border border-slate-800 text-xs font-mono">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Audio Mode:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded-full ${
                  activeScene.audioMode === 'dry'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : activeScene.audioMode === 'tuned'
                    ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {activeScene.audioMode === 'dry'
                  ? 'Raw Demo (Dry)'
                  : activeScene.audioMode === 'tuned'
                  ? 'Signalsmith 0ms Snap'
                  : 'Full 4-Plugin Chain'}
              </span>
            </div>
            <div className="text-slate-400">
              {currentTime.toFixed(1)}s / {totalDuration.toFixed(1)}s
            </div>
          </div>

          {/* Scene Breakdown List */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {scenes.map((scene, idx) => {
              const isCurrent = idx === currentSceneIdx;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    let seek = 0;
                    for (let s = 0; s < idx; s++) seek += scenes[s].durationSec;
                    setCurrentTime(seek);
                    setCurrentSceneIdx(idx);
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-slate-900 border-cyber-cyan text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span className="font-mono font-bold text-cyber-cyan">
                      Scene {scene.sceneNumber}: {scene.badgeText || (scene.audioMode === 'dry' ? 'Dry' : 'Wet')}
                    </span>
                    <span className="font-mono text-slate-500">{scene.durationSec}s</span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-200 line-clamp-1">
                    {scene.headline}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Playback Controls & 1-Click Export */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handlePlayToggle}
              className="flex-1 py-3 px-4 rounded-2xl bg-cyber-cyan text-black font-black text-sm flex items-center justify-center space-x-2 shadow-glow-cyan hover:brightness-110 active:scale-95 transition-all"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-black" />
                  <span>Pause Preview</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-black" />
                  <span>Play Video Ad</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReplay}
              className="p-3 rounded-2xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 active:scale-95 transition-all"
              title="Replay from beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleExportVideo}
              disabled={isExporting}
              className="py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm flex items-center justify-center space-x-2 shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? `Rendering (${exportProgress}%)` : exportSuccess ? 'Exported!' : 'Download Video'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helpers
function getSceneElapsed(time: number, scenes: JarvisVideoScene[], currentIdx: number): number {
  let accum = 0;
  for (let i = 0; i < currentIdx; i++) {
    accum += scenes[i].durationSec;
  }
  return Math.max(0, time - accum);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}
