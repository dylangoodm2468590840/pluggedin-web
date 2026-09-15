'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Mic,
} from 'lucide-react';

export interface JarvisVideoScene {
  sceneNumber: number;
  durationSec: number;
  headline: string;
  visualAction: string;
  audioMode: 'dry' | 'tuned' | 'wet' | 'beat';
  badgeText?: string;
  subtitles: string[];
  pluginId?: string;
  pluginName?: string;
  knobLabel?: string;
  knobTarget?: number;
  voiceoverScript?: string;
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
  pluggedin_plugglue: '/images/plugins/PlugGlue.png',
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
  const [isVoiceoverEnabled, setIsVoiceoverEnabled] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [activeKnobVal, setActiveKnobVal] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dryAudioRef = useRef<HTMLAudioElement | null>(null);
  const tunedAudioRef = useRef<HTMLAudioElement | null>(null);
  const wetAudioRef = useRef<HTMLAudioElement | null>(null);
  const voiceoverAudioRef = useRef<HTMLAudioElement | null>(null);
  const imageCacheRef = useRef<Record<string, HTMLImageElement>>({});

  // Web Audio Context & FFT Analyser
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioSourceNodesRef = useRef<Map<HTMLAudioElement, MediaElementAudioSourceNode>>(new Map());
  const freqDataRef = useRef<Uint8Array>(new Uint8Array(32));

  // Voiceover audio cache per scene
  const voiceoverBuffersRef = useRef<Record<number, string>>({});

  const scenes: JarvisVideoScene[] = videoAd.scenes && videoAd.scenes.length > 0 ? videoAd.scenes : [
    {
      sceneNumber: 1,
      durationSec: 4,
      headline: videoAd.hookHeadline || 'Stop recording amateur vocals in FL Studio.',
      visualAction: 'Raw waveform on screen with red clipping alert.',
      audioMode: 'dry' as const,
      badgeText: 'BEFORE: RAW DEMO',
      subtitles: ['Stop', 'recording', 'off-key', 'vocals', 'in', 'FL', 'Studio.'],
      pluginId: videoAd.pluginId || 'plugtne',
      voiceoverScript: 'Stop recording amateur, off-key vocals in FL Studio.',
    },
    {
      sceneNumber: 2,
      durationSec: 6,
      headline: `Step 1: ${videoAd.pluginName}`,
      visualAction: 'Plugin interface engaged with instant snap dial turned to 100%.',
      audioMode: 'tuned' as const,
      badgeText: 'STEP 1: SNAP ENGAGED',
      subtitles: ['One', 'click', 'and', 'the', 'pitch', 'locks', 'in', 'instantly.'],
      pluginId: videoAd.pluginId || 'plugtne',
      knobLabel: 'TUNE SPEED',
      knobTarget: 100,
      voiceoverScript: 'One click with PLUGTNE and your pitch locks in with zero latency.',
    },
    {
      sceneNumber: 3,
      durationSec: 6,
      headline: 'Full Studio Chain: Radio Ready',
      visualAction: 'All plugins active in mixer with final harmonic polish.',
      audioMode: 'wet' as const,
      badgeText: 'FULL CHAIN (RADIO READY)',
      subtitles: ['Grab', 'your', 'pass', 'at', 'pluggedin.studio', 'link', 'in', 'bio.'],
      pluginId: 'plugverb',
      knobLabel: 'MASTER GLUE',
      knobTarget: 75,
      voiceoverScript: 'Now your entire vocal sits radio ready in the mix. Grab yours at pluggedin.studio.',
    },
  ];

  const totalDuration = scenes.reduce((acc, s) => acc + s.durationSec, 0);

  // Preload all plugin UI screenshots
  useEffect(() => {
    Object.entries(PLUGIN_IMAGE_MAP).forEach(([key, src]) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = src;
      imageCacheRef.current[key] = img;
    });
  }, []);

  // Preload Audio Elements & Setup Web Audio Graph
  const audioPair = videoAd.audioPair || 'vocal';
  const dryAudioSrc = videoAd.audioDryUrl || DEFAULT_AUDIO_MAP[audioPair]?.dry || '/audio/vocal_dry.wav';
  const tunedAudioSrc = videoAd.audioTunedUrl || DEFAULT_AUDIO_MAP[audioPair]?.tuned || '/audio/vocal_tuned.wav';
  const wetAudioSrc = videoAd.audioWetUrl || (videoAd.isChainAd ? '/audio/vocal_wet.wav' : DEFAULT_AUDIO_MAP[audioPair]?.wet || '/audio/vocal_wet.wav');

  useEffect(() => {
    const dry = new Audio(dryAudioSrc);
    dry.loop = true;
    dry.crossOrigin = 'anonymous';
    dryAudioRef.current = dry;

    const tuned = new Audio(tunedAudioSrc);
    tuned.loop = true;
    tuned.crossOrigin = 'anonymous';
    tunedAudioRef.current = tuned;

    const wet = new Audio(wetAudioSrc);
    wet.loop = true;
    wet.crossOrigin = 'anonymous';
    wetAudioRef.current = wet;

    const vo = new Audio();
    vo.crossOrigin = 'anonymous';
    voiceoverAudioRef.current = vo;

    return () => {
      dry.pause();
      tuned.pause();
      wet.pause();
      vo.pause();
    };
  }, [dryAudioSrc, tunedAudioSrc, wetAudioSrc]);

  // Connect Web Audio AnalyserNode (For real-time 32-band FFT spectrum)
  const initWebAudio = useCallback(() => {
    if (audioContextRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64; // 32 frequency bins
      analyser.smoothingTimeConstant = 0.8;

      const connectElement = (el: HTMLAudioElement | null) => {
        if (!el || audioSourceNodesRef.current.has(el)) return;
        try {
          const source = ctx.createMediaElementSource(el);
          source.connect(analyser);
          analyser.connect(ctx.destination);
          audioSourceNodesRef.current.set(el, source);
        } catch (_) {}
      };

      connectElement(dryAudioRef.current);
      connectElement(tunedAudioRef.current);
      connectElement(wetAudioRef.current);
      connectElement(voiceoverAudioRef.current);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;
    } catch (_) {}
  }, []);

  // Pre-fetch Neural TTS Voiceover for all scenes
  useEffect(() => {
    scenes.forEach(async (scene, idx) => {
      const textToSpeak = scene.voiceoverScript || (scene.subtitles ? scene.subtitles.join(' ') : scene.headline);
      if (!textToSpeak) return;

      const ttsUrl = `/api/founder/tts?pin=8492&text=${encodeURIComponent(textToSpeak)}`;
      try {
        const res = await fetch(ttsUrl);
        if (res.ok) {
          const blob = await res.blob();
          voiceoverBuffersRef.current[idx] = URL.createObjectURL(blob);
        }
      } catch (_) {}
    });
  }, [scenes]);

  // Handle Scene Switching & Audio Routing
  useEffect(() => {
    const activeScene = scenes[currentSceneIdx];
    if (!isPlaying) {
      dryAudioRef.current?.pause();
      tunedAudioRef.current?.pause();
      wetAudioRef.current?.pause();
      voiceoverAudioRef.current?.pause();
      return;
    }

    initWebAudio();
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    // Play appropriate music stem
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

    // Play scene voiceover
    if (isVoiceoverEnabled && voiceoverAudioRef.current) {
      const voSrc = voiceoverBuffersRef.current[currentSceneIdx];
      if (voSrc) {
        voiceoverAudioRef.current.src = voSrc;
        voiceoverAudioRef.current.currentTime = 0;
        voiceoverAudioRef.current.play().catch(() => {});
      } else {
        // Fallback: Web Speech API
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const spokenText = activeScene?.voiceoverScript || (activeScene?.subtitles ? activeScene.subtitles.join(' ') : activeScene?.headline);
          if (spokenText) {
            const utter = new SpeechSynthesisUtterance(spokenText);
            utter.rate = 1.05;
            utter.pitch = 0.95;
            window.speechSynthesis.speak(utter);
          }
        }
      }
    }
  }, [isPlaying, currentSceneIdx, scenes, isVoiceoverEnabled, initWebAudio]);

  // Main Timeline Playback Timer
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
        if (currentSceneIdx !== i) {
          setCurrentSceneIdx(i);
        }
        break;
      }
    }
  }, [currentTime, scenes, currentSceneIdx]);

  // Calculate animated knob target for active scene
  useEffect(() => {
    const activeScene = scenes[currentSceneIdx];
    if (!activeScene || activeScene.knobTarget === undefined) {
      setActiveKnobVal(0);
      return;
    }
    const sceneElapsed = getSceneElapsed(currentTime, scenes, currentSceneIdx);
    const progress = Math.min(Math.max((sceneElapsed - 0.5) / (activeScene.durationSec - 1.0), 0), 1);
    const eased = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
    setActiveKnobVal(eased * activeScene.knobTarget);
  }, [currentTime, currentSceneIdx, scenes]);

  // CANVAS RENDER LOOP (Native 1080x1920 Studio Quality)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width; // 1080
    const height = canvas.height; // 1920
    const activeScene = scenes[currentSceneIdx] || scenes[0];

    // Read real-time frequency data from Web Audio Analyser
    if (analyserRef.current && isPlaying) {
      analyserRef.current.getByteFrequencyData(freqDataRef.current as any);
    } else if (!isPlaying) {
      // Smooth decay when paused
      for (let i = 0; i < freqDataRef.current.length; i++) {
        freqDataRef.current[i] = Math.max(0, freqDataRef.current[i] - 5);
      }
    }

    // 1. Studio Backdrop (Dark Deep Cyber Slate)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#020617');
    bgGrad.addColorStop(0.4, '#080d1a');
    bgGrad.addColorStop(0.8, '#040711');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Subtle Precision DAW Grid
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.035)';
    ctx.lineWidth = 1.5;
    const gridSize = 60;
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

    // 3. Header: Brand Identifier & Rig Status
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 30px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PLUGGEDIN AUDIO • C++ DSP STUDIO', width / 2, 85);

    // 4. Scene Status Pill Badge (BEFORE vs STEP 1 vs RADIO READY)
    const isDry = activeScene.audioMode === 'dry';
    const isTuned = activeScene.audioMode === 'tuned';
    const badgeText = activeScene.badgeText || (isDry ? 'BEFORE: RAW DEMO' : isTuned ? 'STEP 1: SNAP ENGAGED' : 'FULL CHAIN (RADIO READY)');

    ctx.save();
    ctx.font = '900 34px system-ui, -apple-system, sans-serif';
    const badgeW = ctx.measureText(badgeText).width + 64;
    const badgeH = 68;
    const badgeX = (width - badgeW) / 2;
    const badgeY = 120;

    ctx.fillStyle = isDry ? 'rgba(244, 63, 94, 0.22)' : isTuned ? 'rgba(0, 240, 255, 0.22)' : 'rgba(52, 211, 153, 0.22)';
    ctx.strokeStyle = isDry ? '#f43f5e' : isTuned ? '#00f0ff' : '#34d399';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 34);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isDry ? '#f43f5e' : isTuned ? '#00f0ff' : '#34d399';
    ctx.textAlign = 'center';
    ctx.fillText(badgeText, width / 2, badgeY + 47);
    ctx.restore();

    // 5. Main Hook Headline (Bold, High-Impact 46px)
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 46px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    wrapText(ctx, activeScene.headline, width / 2, 260, width - 120, 58);

    // 6. Center Stage: Authentic Plugin UI Screenshot with Neon Halo
    const activePluginId = (activeScene.pluginId || videoAd.pluginId || 'plugtne').toLowerCase().replace(/[^a-z0-9_]/g, '');
    const img = imageCacheRef.current[activePluginId] || imageCacheRef.current['plugtne'];

    if (showPluginImage && img && img.complete) {
      const imgMaxW = width - 120;
      const imgMaxH = height * 0.32;
      let drawW = img.width || 600;
      let drawH = img.height || 380;
      const scale = Math.min(imgMaxW / drawW, imgMaxH / drawH, 1);
      drawW = drawW * scale;
      drawH = drawH * scale;
      const drawX = (width - drawW) / 2;
      const drawY = 440;

      // Outer Glowing Halo
      ctx.save();
      ctx.shadowColor = isDry ? 'rgba(244, 63, 94, 0.5)' : isTuned ? 'rgba(0, 240, 255, 0.6)' : 'rgba(52, 211, 153, 0.6)';
      ctx.shadowBlur = 40;
      ctx.strokeStyle = isDry ? 'rgba(244, 63, 94, 0.7)' : isTuned ? 'rgba(0, 240, 255, 0.7)' : 'rgba(52, 211, 153, 0.7)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(drawX - 8, drawY - 8, drawW + 16, drawH + 16, 24);
      ctx.stroke();
      ctx.restore();

      // Draw clipped image
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(drawX, drawY, drawW, drawH, 18);
      ctx.clip();
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();
    }

    // 7. Dynamic 3D/Skeuomorphic Rotating Knob (When Scene has a Knob Parameter)
    if (activeScene.knobLabel) {
      const knobY = 1140;
      drawSkeuomorphicKnob(
        ctx,
        width / 2,
        knobY,
        110,
        activeKnobVal,
        activeScene.knobLabel,
        activeScene.knobTarget !== undefined ? `${Math.round(activeKnobVal)}%` : 'ACTIVE',
        isTuned ? '#00f0ff' : '#34d399'
      );
    }

    // 8. Real-Time 32-Band FFT Frequency Spectrum Analyzer
    const waveY = 1380;
    const barCount = 32;
    const barWidth = 18;
    const barGap = 10;
    const totalWaveW = barCount * (barWidth + barGap);
    const startX = (width - totalWaveW) / 2;

    for (let i = 0; i < barCount; i++) {
      const rawVal = freqDataRef.current[i] || 0;
      const amplitude = isPlaying ? Math.max((rawVal / 255) * 120, 12) : 10;
      const barX = startX + i * (barWidth + barGap);

      const barGrad = ctx.createLinearGradient(0, waveY - amplitude, 0, waveY + amplitude);
      if (isDry) {
        barGrad.addColorStop(0, '#f43f5e');
        barGrad.addColorStop(1, '#881337');
      } else if (isTuned) {
        barGrad.addColorStop(0, '#00f0ff');
        barGrad.addColorStop(1, '#1e40af');
      } else {
        barGrad.addColorStop(0, '#34d399');
        barGrad.addColorStop(1, '#065f46');
      }
      ctx.fillStyle = barGrad;
      ctx.beginPath();
      ctx.roundRect(barX, waveY - amplitude / 2, barWidth, amplitude, 6);
      ctx.fill();
    }

    // 9. Alex Hormozi-Style Kinetic Captions (Karaoke Highlight with 1.25x Active Zoom)
    const subtitles = activeScene.subtitles && activeScene.subtitles.length > 0
      ? activeScene.subtitles
      : [activeScene.headline];

    const sceneElapsed = getSceneElapsed(currentTime, scenes, currentSceneIdx);
    const sceneDuration = activeScene.durationSec;
    const captionIdx = Math.min(
      Math.floor((sceneElapsed / sceneDuration) * subtitles.length),
      subtitles.length - 1
    );
    const activeSentence = subtitles[captionIdx] || '';
    const words = activeSentence.split(/\s+/).filter(Boolean);

    if (words.length > 0) {
      const sentenceProgress = ((sceneElapsed / sceneDuration) * subtitles.length) % 1;
      const activeWordIdx = Math.min(Math.floor(sentenceProgress * words.length), words.length - 1);

      drawHormoziCaptions(ctx, width, 1580, words, activeWordIdx, isTuned ? '#00f0ff' : '#facc15');
    }

    // 10. High-Converting Call to Action Banner
    ctx.fillStyle = '#00f0ff';
    ctx.font = '900 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(videoAd.callToAction || '👉 Grab it at pluggedin.studio • Link in bio', width / 2, 1790);

    // 11. Bottom Video Scrubbing Progress Bar
    const progressPct = currentTime / totalDuration;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(0, height - 16, width, 16);
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(0, height - 16, width * progressPct, 16);

  }, [currentTime, currentSceneIdx, showPluginImage, isPlaying, scenes, totalDuration, videoAd, activeKnobVal]);

  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReplay = () => {
    setCurrentTime(0);
    setCurrentSceneIdx(0);
    setIsPlaying(true);
  };

  // High-Bitrate Native Video Export Engine (Multi-Track Audio Bus + 6000kbps Canvas)
  const handleExportVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsExporting(true);
    setExportProgress(10);
    setIsPlaying(false);
    setCurrentTime(0);

    try {
      const stream = canvas.captureStream(30);

      // Mix all audio tracks into a master Web Audio stream destination
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const actx = new AudioContextClass();
          const dest = actx.createMediaStreamDestination();

          // Connect Wet Audio
          if (wetAudioRef.current) {
            const wetSrc = actx.createMediaElementSource(wetAudioRef.current);
            wetSrc.connect(dest);
            wetSrc.connect(actx.destination);
          }
          // Connect Voiceover Audio
          if (voiceoverAudioRef.current && isVoiceoverEnabled) {
            const voSrc = actx.createMediaElementSource(voiceoverAudioRef.current);
            voSrc.connect(dest);
            voSrc.connect(actx.destination);
          }

          dest.stream.getAudioTracks().forEach((track) => stream.addTrack(track));
        }
      } catch (_) {}

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 6000000, // 6 Mbps studio crisp
      });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${videoAd.pluginId}_TikTok_Ad_Studio.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsExporting(false);
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 5000);
      };

      recorder.start();
      setIsPlaying(true);

      const checkInterval = setInterval(() => {
        setExportProgress((prev) => Math.min(prev + 8, 95));
      }, 500);

      setTimeout(() => {
        clearInterval(checkInterval);
        recorder.stop();
        setIsPlaying(false);
        setCurrentTime(0);
      }, (totalDuration + 0.5) * 1000);

    } catch (err: any) {
      alert(`Export error: ${err.message}`);
      setIsExporting(false);
    }
  };

  const activeScene = scenes[currentSceneIdx] || scenes[0];

  return (
    <div className="w-full rounded-3xl border border-cyber-cyan/40 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-4 sm:p-6 shadow-[0_0_50px_rgba(0,240,255,0.2)] my-4 text-left">
      {/* Studio Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4 flex-wrap gap-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-cyber-cyan flex items-center justify-center text-black shadow-glow-cyan font-black">
            <Video className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-black text-white">{videoAd.pluginName} Studio</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold">
                Remotion Studio Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Audience: <strong className="text-slate-300">{videoAd.targetAudience || 'FL Studio Music Producers'}</strong>
            </p>
          </div>
        </div>

        {/* Toggles: Voiceover & GUI Photo */}
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIsVoiceoverEnabled(!isVoiceoverEnabled)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center space-x-1.5 ${
              isVoiceoverEnabled
                ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{isVoiceoverEnabled ? 'Voiceover: ON' : 'Voiceover: OFF'}</span>
          </button>

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
        {/* Render Canvas (9:16 Vertical TikTok 1080x1920 scaled to 320x569) */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-cyber-cyan/40 bg-black shrink-0 max-w-[300px] sm:max-w-[320px] w-full aspect-[9/16]">
          <canvas
            ref={canvasRef}
            width={1080}
            height={1920}
            className="w-full h-full object-cover block"
          />

          {/* Overlay Play Indicator */}
          {!isPlaying && (
            <div
              onClick={handlePlayToggle}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center cursor-pointer group transition-all"
            >
              <div className="w-16 h-16 rounded-full bg-cyber-cyan text-black flex items-center justify-center shadow-glow-cyan transform group-hover:scale-110 transition-all">
                <Play className="w-8 h-8 fill-black ml-1" />
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Timeline Scenes & Studio Controls */}
        <div className="flex-1 w-full space-y-4">
          {/* Active Audio & Voiceover Indicator */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-black/60 border border-slate-800 text-xs font-mono">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Audio Mode:</span>
              <span
                className={`font-bold px-2.5 py-0.5 rounded-full ${
                  activeScene.audioMode === 'dry'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : activeScene.audioMode === 'tuned'
                    ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {activeScene.badgeText || (activeScene.audioMode === 'dry' ? 'Raw Demo (Dry)' : 'Harmonics Active')}
              </span>
            </div>
            <div className="text-slate-400 font-bold">
              {currentTime.toFixed(1)}s / {totalDuration.toFixed(1)}s
            </div>
          </div>

          {/* Scene Breakdown List */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
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
                  {scene.knobLabel && (
                    <div className="mt-1 flex items-center space-x-1.5 text-[11px] font-mono text-cyan-400">
                      <Sliders className="w-3 h-3" />
                      <span>Param: {scene.knobLabel} &rarr; {scene.knobTarget}%</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Playback Controls & High-Bitrate Export */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handlePlayToggle}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-cyber-cyan text-black font-black text-sm flex items-center justify-center space-x-2 shadow-glow-cyan hover:brightness-110 active:scale-95 transition-all"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-black" />
                  <span>Pause Video</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-black" />
                  <span>Play Studio Video</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReplay}
              className="p-3.5 rounded-2xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 active:scale-95 transition-all"
              title="Replay from beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleExportVideo}
              disabled={isExporting}
              className="py-3.5 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm flex items-center justify-center space-x-2 shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? `Rendering (${exportProgress}%)` : exportSuccess ? 'Downloaded!' : 'Export Studio Video'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// SKEUOMORPHIC 3D METALLIC ROTATING KNOB WITH LED TICKS
// --------------------------------------------------------------------------
function drawSkeuomorphicKnob(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  currentValue: number, // 0 to 100
  label: string,
  valueText: string,
  accentColor: string
) {
  ctx.save();

  // 1. Outer Bezel Shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 15;

  // Outer Bezel Rim
  const rimGrad = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
  rimGrad.addColorStop(0, '#334155');
  rimGrad.addColorStop(0.5, '#0f172a');
  rimGrad.addColorStop(1, '#1e293b');
  ctx.fillStyle = rimGrad;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // 2. 270-Degree Perimeter LED Ticks (-135 deg to +135 deg)
  const startAngle = (135 * Math.PI) / 180;
  const totalSweep = (270 * Math.PI) / 180;
  const tickCount = 28;
  const activeTickIndex = Math.floor((currentValue / 100) * tickCount);

  for (let i = 0; i <= tickCount; i++) {
    const angle = startAngle + (i / tickCount) * totalSweep;
    const isLit = i <= activeTickIndex;

    const rInner = radius + 14;
    const rOuter = radius + (isLit ? 26 : 22);

    const x1 = centerX + Math.cos(angle) * rInner;
    const y1 = centerY + Math.sin(angle) * rInner;
    const x2 = centerX + Math.cos(angle) * rOuter;
    const y2 = centerY + Math.sin(angle) * rOuter;

    ctx.strokeStyle = isLit ? accentColor : 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = isLit ? 4.5 : 2.5;
    ctx.lineCap = 'round';
    if (isLit) {
      ctx.shadowColor = accentColor;
      ctx.shadowBlur = 10;
    } else {
      ctx.shadowBlur = 0;
    }
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // 3. Inner Brushed Metal Cap
  const innerRadius = radius * 0.82;
  const metalGrad = ctx.createRadialGradient(
    centerX - innerRadius * 0.3,
    centerY - innerRadius * 0.3,
    innerRadius * 0.1,
    centerX,
    centerY,
    innerRadius
  );
  metalGrad.addColorStop(0, '#64748b');
  metalGrad.addColorStop(0.5, '#1e293b');
  metalGrad.addColorStop(1, '#090d16');
  ctx.fillStyle = metalGrad;
  ctx.beginPath();
  ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
  ctx.fill();

  // 4. Rotating Indicator Notch with Spring Angle
  const indicatorAngle = startAngle + (currentValue / 100) * totalSweep;
  const notchInner = innerRadius * 0.35;
  const notchOuter = innerRadius * 0.9;
  const notchX1 = centerX + Math.cos(indicatorAngle) * notchInner;
  const notchY1 = centerY + Math.sin(indicatorAngle) * notchInner;
  const notchX2 = centerX + Math.cos(indicatorAngle) * notchOuter;
  const notchY2 = centerY + Math.sin(indicatorAngle) * notchOuter;

  ctx.strokeStyle = accentColor;
  ctx.shadowColor = accentColor;
  ctx.shadowBlur = 15;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(notchX1, notchY1);
  ctx.lineTo(notchX2, notchY2);
  ctx.stroke();

  // 5. Digital LCD Parameter Readout Beneath Knob
  ctx.shadowBlur = 0;
  const pillW = 260;
  const pillH = 52;
  const pillX = centerX - pillW / 2;
  const pillY = centerY + radius + 40;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = accentColor;
  ctx.font = '900 24px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`${label}: ${valueText}`, centerX, pillY + 35);

  ctx.restore();
}

// --------------------------------------------------------------------------
// ALEX HORMOZI KINETIC SUBTITLES (Karaoke with Active Word 1.25x Scale)
// --------------------------------------------------------------------------
function drawHormoziCaptions(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  baselineY: number,
  words: string[],
  activeWordIdx: number,
  accentColor: string
) {
  ctx.save();

  // Measure word widths to compute total centered pill width
  const normalFont = '900 40px system-ui, -apple-system, sans-serif';
  const activeFont = '900 50px system-ui, -apple-system, sans-serif';
  const wordSpacings = 18;

  let totalWidth = 0;
  const measured: Array<{ text: string; width: number; isActive: boolean }> = [];

  for (let i = 0; i < words.length; i++) {
    const isActive = i === activeWordIdx;
    ctx.font = isActive ? activeFont : normalFont;
    const w = ctx.measureText(words[i].toUpperCase()).width;
    measured.push({ text: words[i].toUpperCase(), width: w, isActive });
    totalWidth += w + (i < words.length - 1 ? wordSpacings : 0);
  }

  // Draw Frosted Dark Glass Pill Backdrop
  const pillW = Math.max(totalWidth + 60, 480);
  const pillH = 90;
  const pillX = (canvasWidth - pillW) / 2;
  const pillY = baselineY - 60;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, 24);
  ctx.fill();
  ctx.stroke();

  // Draw Words with 6px Black Stroke and Neon Active Word Highlight
  let curX = (canvasWidth - totalWidth) / 2;
  for (const m of measured) {
    ctx.font = m.isActive ? activeFont : normalFont;
    ctx.textAlign = 'left';

    // 1. Black Drop Outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = m.isActive ? 8 : 6;
    ctx.lineJoin = 'miter';
    ctx.strokeText(m.text, curX, baselineY);

    // 2. Interior Fill
    if (m.isActive) {
      ctx.fillStyle = accentColor;
      ctx.shadowColor = accentColor;
      ctx.shadowBlur = 18;
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 0;
    }
    ctx.fillText(m.text, curX, baselineY);

    curX += m.width + wordSpacings;
  }

  ctx.restore();
}

// --------------------------------------------------------------------------
// GENERAL HELPERS
// --------------------------------------------------------------------------
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
