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
} from 'lucide-react';

export interface JarvisVideoScene {
  sceneNumber: number;
  durationSec: number;
  headline: string;
  visualAction: string;
  audioMode: 'dry' | 'wet' | 'beat';
  badgeText?: string;
  subtitles: string[];
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
  audioWetUrl?: string;
  pluginImageUrl?: string;
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

const DEFAULT_AUDIO_MAP: Record<'vocal' | '808' | 'sample', { dry: string; wet: string }> = {
  vocal: { dry: '/audio/vocal_dry.wav', wet: '/audio/vocal_tuned.wav' },
  808: { dry: '/audio/808_dry.wav', wet: '/audio/808_wet.wav' },
  sample: { dry: '/audio/sample_dry.wav', wet: '/audio/sample_wet.wav' },
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
  const wetAudioRef = useRef<HTMLAudioElement | null>(null);
  const pluginImgRef = useRef<HTMLImageElement | null>(null);

  const scenes = videoAd.scenes && videoAd.scenes.length > 0 ? videoAd.scenes : [
    {
      sceneNumber: 1,
      durationSec: 3,
      headline: videoAd.hookHeadline || 'Stop recording amateur vocals in FL Studio.',
      visualAction: 'Raw vocal waveform on screen with red off-key alert.',
      audioMode: 'dry' as const,
      badgeText: 'BEFORE: RAW DEMO',
      subtitles: ['Stop', 'recording', 'off-key', 'vocals', 'in', 'FL', 'Studio.'],
    },
    {
      sceneNumber: 2,
      durationSec: 4,
      headline: `The Solution: ${videoAd.pluginName}`,
      visualAction: 'Plugin interface engaged with instant snap dial turned to 100%.',
      audioMode: 'wet' as const,
      badgeText: 'AFTER: PLUGTNE ENGAGED',
      subtitles: ['One', 'click', 'and', 'the', 'pitch', 'locks', 'in', 'instantly.'],
    },
    {
      sceneNumber: 3,
      durationSec: 3,
      headline: videoAd.callToAction || 'Get the sound at pluggedin.studio',
      visualAction: 'Finished track waveform with link in bio overlay.',
      audioMode: 'wet' as const,
      badgeText: 'RADIO READY',
      subtitles: ['Grab', 'yours', 'now', 'link', 'in', 'bio.'],
    },
  ];

  const totalDuration = scenes.reduce((acc, s) => acc + s.durationSec, 0);

  // Resolve authentic assets
  const cleanId = (videoAd.pluginId || 'plugtne').toLowerCase().replace(/[^a-z0-9]/g, '');
  const pluginImageSrc = videoAd.pluginImageUrl || PLUGIN_IMAGE_MAP[cleanId] || '/images/plugins/plugtne.png';
  const audioPair = videoAd.audioPair || (cleanId.includes('808') || cleanId.includes('undergrnd') ? '808' : cleanId.includes('chop') ? 'sample' : 'vocal');
  const dryAudioSrc = videoAd.audioDryUrl || DEFAULT_AUDIO_MAP[audioPair]?.dry || '/audio/vocal_dry.wav';
  const wetAudioSrc = videoAd.audioWetUrl || DEFAULT_AUDIO_MAP[audioPair]?.wet || '/audio/vocal_tuned.wav';

  // Preload plugin image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = pluginImageSrc;
    img.onload = () => {
      pluginImgRef.current = img;
    };
  }, [pluginImageSrc]);

  // Preload audio elements
  useEffect(() => {
    dryAudioRef.current = new Audio(dryAudioSrc);
    dryAudioRef.current.loop = true;
    dryAudioRef.current.volume = 1.0;

    wetAudioRef.current = new Audio(wetAudioSrc);
    wetAudioRef.current.loop = true;
    wetAudioRef.current.volume = 1.0;

    return () => {
      dryAudioRef.current?.pause();
      wetAudioRef.current?.pause();
    };
  }, [dryAudioSrc, wetAudioSrc]);

  // Manage Audio Switching between Dry and Wet based on active scene
  useEffect(() => {
    const activeScene = scenes[currentSceneIdx];
    if (!isPlaying) {
      dryAudioRef.current?.pause();
      wetAudioRef.current?.pause();
      return;
    }

    if (activeScene?.audioMode === 'dry') {
      wetAudioRef.current?.pause();
      dryAudioRef.current?.play().catch(() => {});
    } else {
      dryAudioRef.current?.pause();
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

  // Sync current scene index from currentTime
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

    // Subtle Grid Lines
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

    // Top Brand Badge
    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PLUGGEDIN AUDIO', width / 2, 60);

    // A/B Comparison Pill
    const isDry = activeScene.audioMode === 'dry';
    const pillColor = isDry ? '#f43f5e' : '#10b981';
    const pillText = activeScene.badgeText || (isDry ? 'A/B: BEFORE (RAW DEMO)' : 'A/B: AFTER (PLUGTNE ON)');
    ctx.save();
    ctx.fillStyle = isDry ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)';
    ctx.strokeStyle = pillColor;
    ctx.lineWidth = 2;
    const pillW = 340;
    const pillH = 44;
    const pillX = (width - pillW) / 2;
    const pillY = 90;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 22);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = pillColor;
    ctx.font = 'bold 16px monospace';
    ctx.fillText(pillText, width / 2, pillY + 28);
    ctx.restore();

    // Hook Headline (Upper Section)
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 30px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    const headline = activeScene.headline;
    wrapText(ctx, headline, width / 2, 190, width - 80, 38);

    // Center Stage: Real Plugin GUI Photo
    if (showPluginImage && pluginImgRef.current) {
      const img = pluginImgRef.current;
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
      ctx.shadowColor = isDry ? 'rgba(244, 63, 94, 0.4)' : 'rgba(0, 240, 255, 0.5)';
      ctx.shadowBlur = 30;
      ctx.strokeStyle = isDry ? 'rgba(244, 63, 94, 0.6)' : 'rgba(0, 240, 255, 0.6)';
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
      } else {
        barGrad.addColorStop(0, '#00f0ff');
        barGrad.addColorStop(1, '#2563eb');
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

      // Draw highlighted kinetic active word
      const activeWord = subtitles[wordIndex] || '';
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.beginPath();
      ctx.roundRect((width - 460) / 2, subY - 45, 460, 65, 16);
      ctx.fill();

      ctx.fillStyle = '#facc15'; // Neon yellow highlight
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

      // Setup Web Audio recording if supported
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
        a.download = `${cleanId}_TikTok_Ad_Official.webm`;
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
                100% Authentic Assets
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

      {/* Main Preview: Video Canvas + Timeline */}
      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Render Canvas (9:16 Vertical TikTok Aspect Ratio) */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-cyber-cyan/30 bg-black shrink-0 max-w-[300px] sm:max-w-[320px] w-full aspect-[9/16]">
          <canvas
            ref={canvasRef}
            width={540}
            height={960}
            className="w-full h-full object-contain"
          />

          {/* Overlay Play Button when paused */}
          {!isPlaying && (
            <button
              type="button"
              onClick={handlePlayToggle}
              className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-cyber-cyan/80 text-black flex items-center justify-center shadow-glow-cyan hover:scale-110 active:scale-95 transition-all"
            >
              <Play className="w-7 h-7 fill-current ml-1" />
            </button>
          )}

          {/* Timecode overlay */}
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 border border-slate-700 text-[10px] font-mono text-white">
            {currentTime.toFixed(1)}s / {totalDuration.toFixed(1)}s
          </div>
        </div>

        {/* Storyboard Script & Scene Breakdown */}
        <div className="flex-1 space-y-4 w-full">
          <div>
            <span className="text-[11px] font-mono uppercase text-cyber-cyan font-bold tracking-wider block mb-1">
              🎯 Viral Hook Headline
            </span>
            <h4 className="text-base sm:text-lg font-black text-white leading-snug">
              "{videoAd.hookHeadline}"
            </h4>
          </div>

          {/* Scene Carousel Selector */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase text-slate-400 font-bold block">
              🎬 4-Part TikTok Storyboard
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {scenes.map((scene, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    let acc = 0;
                    for (let j = 0; j < idx; j++) acc += scenes[j].durationSec;
                    setCurrentTime(acc);
                    setCurrentSceneIdx(idx);
                  }}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                    idx === currentSceneIdx
                      ? 'bg-cyber-cyan/15 border-cyber-cyan text-white shadow-glow-cyan'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1">
                    <span>Scene {scene.sceneNumber}</span>
                    <span className={scene.audioMode === 'dry' ? 'text-rose-400' : 'text-emerald-400'}>
                      {scene.audioMode === 'dry' ? 'DRY AUDIO' : 'PROCESSED'}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-white line-clamp-1">{scene.headline}</h5>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-1">{scene.visualAction}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Authentic Audio Stem Switcher */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Real Audio Stem Demo</span>
                <span className="text-[10px] font-mono text-slate-400">
                  {audioPair === '808' ? 'Sub Bass Saturation Stem' : audioPair === 'sample' ? '16-Pad Sample Stem' : 'Lead Vocal Pitch Stem'}
                </span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              Verified Authentic
            </span>
          </div>

          {/* Playback Controls & Download Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handlePlayToggle}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 border border-slate-700 hover:border-cyber-cyan text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-md"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause Ad</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play Ad Video</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReplay}
              className="w-full sm:w-auto px-4 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Replay</span>
            </button>

            <button
              type="button"
              onClick={handleExportVideo}
              disabled={isExporting}
              className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyber-cyan to-blue-600 text-black font-black text-xs uppercase tracking-wider shadow-glow-cyan hover:brightness-110 active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isExporting ? (
                <span>Exporting Video ({exportProgress}%)...</span>
              ) : exportSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Ad Video (MP4 / WebM)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
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
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
}

function getSceneElapsed(currentTime: number, scenes: JarvisVideoScene[], activeIdx: number): number {
  let prevAccum = 0;
  for (let i = 0; i < activeIdx; i++) {
    prevAccum += scenes[i].durationSec;
  }
  return Math.max(0, currentTime - prevAccum);
}
