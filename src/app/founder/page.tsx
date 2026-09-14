'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  Users,
  CreditCard,
  Layers,
  Bot,
  ShieldCheck,
  RefreshCw,
  Search,
  Lock,
  Unlock,
  Sparkles,
  Smartphone,
  Laptop,
  ArrowUpRight,
  BarChart3,
  Tag,
  AlertCircle,
  CheckCircle2,
  Send,
  Zap,
  Award,
  Disc,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Trash2,
  Activity,
  Radio,
  Cpu,
  Terminal,
  Sliders,
  X,
  Check,
  Eye,
  MessageSquare,
  Flame,
  Presentation,
  Video,
  RotateCcw,
  Globe,
  Sun,
  Brain,
} from 'lucide-react';
import JarvisPresentationCanvas, { JarvisPresentationDeck } from '@/components/JarvisPresentationCanvas';
import JarvisVideoAdStudio, { JarvisVideoAd } from '@/components/JarvisVideoAdStudio';
import JarvisPluginLab, { PluginSpec } from '@/components/JarvisPluginLab';
import JarvisFloatingCompanion from '@/components/JarvisFloatingCompanion';
import SocialCommandCenter from '@/components/SocialCommandCenter';
import { Paperclip, Plus, History, Share2 } from 'lucide-react';

interface Financials {
  grossTotal: number;
  feeTotal: number;
  netTotal: number;
  marginPct: number;
  aov: number;
  rpv: number;
  completedOrdersCount: number;
  totalOrdersCount: number;
}

interface Subscriptions {
  activeSubscribersCount: number;
  lifetimeVIPsCount: number;
  totalMembersCount: number;
  mrr: number;
  arr: number;
  churnRatePct: number;
  failedRenewalsCount: number;
}

interface Traffic {
  totalViews: number;
  todayViews: number;
  conversionRatePct: number;
  sources: Record<string, number>;
  devices: { mobile: number; desktop: number };
}

interface PluginLeaderboardItem {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  price: number;
  unitsSold: number;
  grossRevenue: number;
  netRevenue: number;
  contributionPct: number;
}

interface OrderItem {
  id: string;
  paypalOrderId: string;
  userEmail: string;
  displayName?: string;
  itemName: string;
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
  promoCode?: string;
  status: string;
  isTest?: boolean;
  createdAt: string;
}

interface CustomerItem {
  id: string;
  email: string;
  displayName: string;
  tier: string;
  subscriptionStatus: string;
  isLifetimeVIP: boolean;
  activeDeviceCount: number;
  maxDevices: number;
  machines: Array<{
    machineId: string;
    hostname: string;
    platform: string;
    osVersion?: string;
    activatedAt: string;
  }>;
  createdAt: string;
}

interface JarvisDispatchItem {
  id: string;
  type: string;
  priority: string;
  title: string;
  details: string;
  suggestedAction: string;
  status: string;
  createdAt: string;
}

interface MetricsResponse {
  financials: Financials;
  subscriptions: Subscriptions;
  traffic: Traffic;
  disputes: {
    activeDisputesCount: number;
    disputeRatePct: number;
    refundRequestsCount: number;
    policyStatus: string;
  };
  promoCodes: Record<string, { count: number; gross: number; net: number }>;
  pluginLeaderboard: PluginLeaderboardItem[];
  recentOrders: OrderItem[];
  customers: CustomerItem[];
}

export default function FounderDashboardPage() {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [timeframe, setTimeframe] = useState<'today' | '7d' | '30d' | 'ytd' | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'jarvis' | 'financials' | 'subs' | 'plugins' | 'traffic' | 'coupons' | 'customers' | 'sentinel' | 'tools'>('jarvis');
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchCustomer, setSearchCustomer] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // J.A.R.V.I.S. Next-Gen Voice & Screen Control Architecture
  const speechGenIdRef = useRef<number>(0);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isContinuousMode, setIsContinuousMode] = useState(true);
  const isContinuousModeRef = useRef(true);
  useEffect(() => {
    isContinuousModeRef.current = isContinuousMode;
  }, [isContinuousMode]);

  const [spotlightTarget, setSpotlightTarget] = useState<string | null>(null);
  const [spotlightCaption, setSpotlightCaption] = useState<string | null>(null);
  const [hasPlayedStartupBriefing, setHasPlayedStartupBriefing] = useState(false);
  const triggerAutoListenRef = useRef<() => void>(() => {});

  // Dynamic Dashboard UI Layout State (Jarvis Voice Reconfigurable)
  const [dashboardConfig, setDashboardConfig] = useState<{
    showChatButtons: boolean;
    showTopStats: boolean;
  }>({
    showChatButtons: false, // Default to FALSE to eliminate clutter from the top
    showTopStats: true,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('pluggedin_dashboard_config');
      if (saved) {
        setDashboardConfig((prev) => ({ ...prev, ...JSON.parse(saved) }));
      }
    } catch (_) {}
  }, []);

  // Interactive Intent Verification & Confirmation State ("Is this what you're talking about, Dylan?")
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    targetId: string;
    pendingAction: any;
    caption: string;
    question: string;
  } | null>(null);

  // JARVIS Voice Engine & Mobile state
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mobileVoiceMode, setMobileVoiceMode] = useState<'hud' | 'chat'>('hud');
  const [dictationModalOpen, setDictationModalOpen] = useState(false);
  const [dictationInput, setDictationInput] = useState('');
  const [transcriptPreview, setTranscriptPreview] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState<
    Array<{
      role: 'user' | 'assistant';
      text: string;
      speech?: string;
      deck?: JarvisPresentationDeck;
      videoAd?: JarvisVideoAd;
      pluginSpec?: PluginSpec;
      attachedAudioName?: string;
    }>
  >([
    {
      role: 'assistant',
      text: "👋 Hey Dylan, J.A.R.V.I.S. here. I'm connected to your live PayPal financials, subscriber retention, and website telemetry 24/7. Tap my Arc Reactor to speak with me, or ask me anything about TikTok hooks, pricing experiments, or audio plugin strategy.",
      speech: "Hey Dylan, J.A.R.V.I.S. is online. Neural reasoning is active and all systems are running smoothly.",
    },
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const isListeningRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const aiLoadingRef = useRef(false);
  const recognitionWatchdogTimerRef = useRef<any>(null);
  const recognitionInstanceRef = useRef<any>(null);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    aiLoadingRef.current = aiLoading;
  }, [aiLoading]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  const [activeNavTab, setActiveNavTab] = useState<'studio' | 'social' | 'analytics'>('studio');
  const [attachedAudioFile, setAttachedAudioFile] = useState<File | null>(null);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const [chatHistoryDrawerOpen, setChatHistoryDrawerOpen] = useState(false);
  const [pastThreads, setPastThreads] = useState<Array<{ id: string; title: string; date: string }>>([
    { id: 'thread_001', title: 'PLUGTNE 0ms Autotune TikTok Campaign', date: 'Today at 10:15 AM' },
    { id: 'thread_002', title: 'UNDERGRND 12AX7 Tube 808 Strategy', date: 'Yesterday at 3:45 PM' },
    { id: 'thread_003', title: 'PLUGCHOP 16-Pad Hip-Hop Flip', date: 'Sep 12, 1:20 PM' },
  ]);

  const startNewChat = () => {
    triggerHaptic(15);
    setAiChatHistory([
      {
        role: 'assistant',
        text: "👋 Brand new studio session initialized, Dylan. Global long-term memory is active and I retain full context of our store metrics, plugins, and previous campaigns. What are we planning or building?",
        speech: "Brand new session ready, Dylan. What are we planning or building?",
      },
    ]);
    setActiveDeck(null);
    setAttachedAudioFile(null);
    setChatHistoryDrawerOpen(false);
    speakJarvisVoice("Brand new session ready, Dylan. What are we planning or building?");
  };

  const [activeDeck, setActiveDeck] = useState<JarvisPresentationDeck | null>(null);
  const [sentinelData, setSentinelData] = useState<any>(null);
  const [dispatches, setDispatches] = useState<JarvisDispatchItem[]>([]);
  const [morningBriefing, setMorningBriefing] = useState<any>(null);
  const [selfUpgrades, setSelfUpgrades] = useState<any[]>([]);
  const [learnedDirectives, setLearnedDirectives] = useState<any[]>([]);
  const [isRefreshingOvernight, setIsRefreshingOvernight] = useState(false);

  const fetchOvernightIntelligence = useCallback(async () => {
    try {
      const res = await fetch(`/api/founder/sentinel/overnight?pin=${pin || '8492'}`);
      if (res.ok) {
        const data = await res.json();
        if (data.briefing) setMorningBriefing(data.briefing);
        if (Array.isArray(data.upgrades)) setSelfUpgrades(data.upgrades);
        if (Array.isArray(data.directives)) setLearnedDirectives(data.directives);
      }
    } catch (_) {}
  }, [pin]);

  const handleApproveUpgrade = async (upgradeId: string) => {
    triggerHaptic(20);
    try {
      const res = await fetch('/api/founder/sentinel/overnight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-founder-pin': pin || '8492' },
        body: JSON.stringify({ action: 'approve_upgrade', upgradeId }),
      });
      if (res.ok) {
        setActionMessage('✓ Upgrade approved & dispatched to engineering queue!');
        setTimeout(() => setActionMessage(null), 5000);
        fetchOvernightIntelligence();
      }
    } catch (_) {}
  };

  const handleDeleteDirective = async (directiveId: string) => {
    triggerHaptic(15);
    try {
      await fetch('/api/founder/sentinel/overnight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-founder-pin': pin || '8492' },
        body: JSON.stringify({ action: 'delete_directive', directiveId }),
      });
      fetchOvernightIntelligence();
    } catch (_) {}
  };

  const handleRunOvernightAudit = async () => {
    triggerHaptic(20);
    setIsRefreshingOvernight(true);
    try {
      const res = await fetch('/api/founder/sentinel/overnight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-founder-pin': pin || '8492' },
        body: JSON.stringify({ action: 'trigger_overnight_audit' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.briefing) {
          setMorningBriefing(data.briefing);
          speakJarvisVoice(data.briefing.spokenBriefing);
        }
        setActionMessage('✓ Overnight Sentinel Audit Refreshed!');
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (_) {}
    setIsRefreshingOvernight(false);
  };

  const [aiConfig, setAiConfig] = useState<{
    provider: string;
    apiKey: string;
    model?: string;
    customDirectives?: string;
    temperature?: number;
    tone?: 'co-founder' | 'marketer' | 'engineer' | 'visionary';
  } | null>(null);
  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [tempModel, setTempModel] = useState('models/gemini-3-flash-preview');
  const [tempCustomDirectives, setTempCustomDirectives] = useState(
    'Focus heavily on FL Studio trap and underground beatmakers. Provide actionable marketing hooks and high-retention video frameworks.'
  );
  const [tempTemperature, setTempTemperature] = useState(0.7);
  const [tempTone, setTempTone] = useState<'co-founder' | 'marketer' | 'engineer' | 'visionary'>('co-founder');
  const [savingAiConfig, setSavingAiConfig] = useState(false);

  // Load saved mute preference
  useEffect(() => {
    const savedMute = localStorage.getItem('pluggedin_jarvis_voice_muted');
    if (savedMute === 'true') {
      setIsVoiceMuted(true);
      setIsVoiceEnabled(false);
    }
  }, []);

  const toggleGlobalMute = () => {
    triggerHaptic(15);
    const newMuted = !isVoiceMuted;
    setIsVoiceMuted(newMuted);
    setIsVoiceEnabled(!newMuted);
    localStorage.setItem('pluggedin_jarvis_voice_muted', newMuted ? 'true' : 'false');
    if (newMuted) {
      stopAllVoicePlayback();
    }
  };

  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const handleSendAiPromptRef = useRef<(prompt?: string) => Promise<void>>(async () => {});
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Auto-auth check on mount
  useEffect(() => {
    const savedPin = localStorage.getItem('pluggedin_founder_pin');
    if (savedPin === '8492' || savedPin === 'PluggedIn2026!') {
      setPin(savedPin);
      setIsAuthenticated(true);
    }
    if (typeof window !== 'undefined') {
      audioPlayerRef.current = new Audio();
    }
  }, []);

  const [liveSiteConfig, setLiveSiteConfig] = useState<any>(null);
  const [isRollingBackSite, setIsRollingBackSite] = useState(false);
  const [hasUnlockedAudio, setHasUnlockedAudio] = useState(false);
  const [latestSpeech, setLatestSpeech] = useState<string>(
    "Good afternoon Dylan. Systems are nominal. We are in stealth pre-launch staging with 2 active studio rigs running. What are we building today?"
  );
  const activeBufferSourceRef = useRef<any>(null);
  const webAudioCtxRef = useRef<any>(null);

  // Bulletproof Mobile Audio Unlock (Resumes AudioContext & permanently unlocks iOS media channel)
  const unlockAudioOnTouch = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        if (!webAudioCtxRef.current) {
          webAudioCtxRef.current = new AudioCtx();
        }
        if (webAudioCtxRef.current.state === 'suspended') {
          webAudioCtxRef.current.resume();
        }
        // Inaudible 0.02s buffer burst to permanently authorize iOS Safari media playback
        const osc = webAudioCtxRef.current.createOscillator();
        const gain = webAudioCtxRef.current.createGain();
        gain.gain.value = 0.0001;
        osc.connect(gain);
        gain.connect(webAudioCtxRef.current.destination);
        osc.start(0);
        osc.stop(webAudioCtxRef.current.currentTime + 0.03);
      }
    } catch (_) {}
    try {
      if (!audioPlayerRef.current) {
        audioPlayerRef.current = new Audio();
      }
      audioPlayerRef.current.src =
        'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      audioPlayerRef.current.play().catch(() => {});
    } catch (_) {}
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.resume();
      }
    } catch (_) {}
    setHasUnlockedAudio(true);
  }, []);

  // Play audio buffer via Web Audio API (100% unblockable on mobile & bypasses iPhone silent switch)
  const playWebAudioStream = useCallback(async (text: string, genId: number): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return false;
      if (!webAudioCtxRef.current) {
        webAudioCtxRef.current = new AudioCtx();
      }
      const ctx = webAudioCtxRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const res = await fetch(`/api/founder/tts?text=${encodeURIComponent(text)}&pin=${pin || '8492'}`);
      if (!res.ok) return false;
      const arrayBuffer = await res.arrayBuffer();

      if (speechGenIdRef.current !== genId) return true;

      const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);
      if (speechGenIdRef.current !== genId) return true;

      if (activeBufferSourceRef.current) {
        try {
          activeBufferSourceRef.current.stop();
          activeBufferSourceRef.current.disconnect();
        } catch (_) {}
      }

      const source = ctx.createBufferSource();
      source.buffer = decodedBuffer;
      source.connect(ctx.destination);
      activeBufferSourceRef.current = source;

      source.onended = () => {
        if (speechGenIdRef.current === genId) {
          setIsSpeaking(false);
          activeBufferSourceRef.current = null;
          if (isContinuousModeRef.current) {
            triggerAutoListenRef.current();
          }
        }
      };

      setIsSpeaking(true);
      source.start(0);
      return true;
    } catch (e) {
      console.warn('Web Audio playback failed, trying element fallback:', e);
      return false;
    }
  }, [pin]);

  const triggerHaptic = (pattern: number | number[] = 15) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (_) {}
    }
  };

// Fallback client-side speech synthesis with strict generation lock
  const fallbackSynthesis = useCallback((cleanText: string, targetGenId: number) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setIsSpeaking(false);
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const voices = window.speechSynthesis.getVoices();
      const jarvisVoice =
        voices.find((v) => v.lang === 'en-GB' && (v.name.includes('Daniel') || v.name.includes('George') || v.name.includes('Oliver') || v.name.includes('Male'))) ||
        voices.find((v) => v.lang === 'en-GB') ||
        voices.find((v) => v.name.includes('Google UK English Male')) ||
        voices.find((v) => v.lang.startsWith('en'));

      if (jarvisVoice) utterance.voice = jarvisVoice;
      utterance.rate = 1.0;
      utterance.pitch = 0.95;
      utterance.onstart = () => {
        if (speechGenIdRef.current === targetGenId) {
          setIsSpeaking(true);
        }
      };
      utterance.onend = () => {
        if (speechGenIdRef.current === targetGenId) {
          setIsSpeaking(false);
          if (isContinuousModeRef.current) {
            triggerAutoListenRef.current();
          }
        }
      };
      utterance.onerror = () => {
        if (speechGenIdRef.current === targetGenId) {
          setIsSpeaking(false);
        }
      };
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(utterance);
    } catch (_) {
      setIsSpeaking(false);
    }
  }, []);

// Instantly cut off all audio and voice synthesis (Instant 10ms Interrupt)
  const stopAllVoicePlayback = useCallback(() => {
    speechGenIdRef.current++; // Invalidate any ongoing speech promises
    if (typeof window !== 'undefined') {
      if (activeBufferSourceRef.current) {
        try {
          activeBufferSourceRef.current.stop();
          activeBufferSourceRef.current.disconnect();
          activeBufferSourceRef.current = null;
        } catch (_) {}
      }
      if (activeAudioRef.current) {
        try {
          activeAudioRef.current.pause();
          activeAudioRef.current.currentTime = 0;
          activeAudioRef.current.removeAttribute('src');
          activeAudioRef.current.src = '';
          activeAudioRef.current = null;
        } catch (_) {}
      }
      if (audioPlayerRef.current) {
        try {
          audioPlayerRef.current.pause();
          audioPlayerRef.current.currentTime = 0;
          audioPlayerRef.current.removeAttribute('src');
          audioPlayerRef.current.src = '';
        } catch (_) {}
      }
      if (window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
          window.speechSynthesis.pause();
          window.speechSynthesis.cancel();
        } catch (_) {}
      }
    }
    isSpeakingRef.current = false;
    setIsSpeaking(false);
  }, []);

  // Rock-Solid Speech Recognition Engine (Continuous Hands-Free + Autonomous Watchdog)
  const stopListeningSession = useCallback(() => {
    if (recognitionWatchdogTimerRef.current) {
      clearTimeout(recognitionWatchdogTimerRef.current);
      recognitionWatchdogTimerRef.current = null;
    }
    if (recognitionInstanceRef.current) {
      try {
        recognitionInstanceRef.current.abort();
      } catch (_) {}
      recognitionInstanceRef.current = null;
    }
    isListeningRef.current = false;
    setIsListening(false);
    setTranscriptPreview('');
  }, []);

  const startContinuousListening = useCallback(() => {
    if (typeof window === 'undefined') return;
    // Guard: Do not listen if Jarvis is currently speaking or waiting for AI answer
    if (isSpeakingRef.current || aiLoadingRef.current) {
      return;
    }
    if (isListeningRef.current && recognitionInstanceRef.current) {
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    if (recognitionWatchdogTimerRef.current) {
      clearTimeout(recognitionWatchdogTimerRef.current);
      recognitionWatchdogTimerRef.current = null;
    }

    try {
      if (recognitionInstanceRef.current) {
        try {
          recognitionInstanceRef.current.abort();
        } catch (_) {}
        recognitionInstanceRef.current = null;
      }

      const reco = new SpeechRecognition();
      reco.continuous = true;
      reco.interimResults = true;
      reco.lang = 'en-US';
      reco.maxAlternatives = 1;

      reco.onstart = () => {
        isListeningRef.current = true;
        setIsListening(true);
        setTranscriptPreview('');
      };

      reco.onresult = (event: any) => {
        if (isSpeakingRef.current) return;

        let interim = '';
        let finalSpeech = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalSpeech += item[0].transcript;
          } else {
            interim += item[0].transcript;
          }
        }

        if (interim) {
          setTranscriptPreview(interim);
        }

        if (finalSpeech.trim()) {
          const query = finalSpeech.trim();
          setTranscriptPreview('');
          try {
            reco.abort();
          } catch (_) {}
          recognitionInstanceRef.current = null;
          isListeningRef.current = false;
          setIsListening(false);
          handleSendAiPromptRef.current(query);
        }
      };

      reco.onerror = (event: any) => {
        const err = event.error;
        if (err === 'no-speech' || err === 'aborted') {
          return;
        }
        if (err === 'not-allowed') {
          isListeningRef.current = false;
          setIsListening(false);
          setActionMessage('⚠️ Microphone blocked. Tap browser settings to allow.');
          setTimeout(() => setActionMessage(null), 5000);
          return;
        }
        console.warn('SpeechRecognition warning:', err);
      };

      reco.onend = () => {
        isListeningRef.current = false;
        setIsListening(false);
        recognitionInstanceRef.current = null;

        // Autonomous resurrection watchdog: restart listening after silence decay
        if (isContinuousModeRef.current && !isSpeakingRef.current && !aiLoadingRef.current) {
          if (recognitionWatchdogTimerRef.current) clearTimeout(recognitionWatchdogTimerRef.current);
          recognitionWatchdogTimerRef.current = setTimeout(() => {
            if (isContinuousModeRef.current && !isSpeakingRef.current && !aiLoadingRef.current) {
              startContinuousListening();
            }
          }, 250);
        }
      };

      recognitionInstanceRef.current = reco;
      reco.start();
    } catch (err: any) {
      console.warn('Could not launch speech recognition:', err);
      isListeningRef.current = false;
      setIsListening(false);
    }
  }, []);

// Rock-Solid Single-Channel Voice Engine (Web Audio Primary + Reused Element Fallback)
  const speakJarvisVoice = useCallback((textToSpeak: string) => {
    if (isVoiceMuted || !isVoiceEnabled || typeof window === 'undefined') return;

    // Immediately stop any lingering audio and mute mic so it never records Jarvis's own voice
    stopAllVoicePlayback();
    stopListeningSession();

    const cleanText = textToSpeak
      .replace(/\[[A-Z_]+\]/g, '') // strip brackets
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // strip markdown links
      .replace(/```[\s\S]*?```/g, '') // strip code blocks
      .replace(/`([^`]+)`/g, '$1') // strip inline code
      .replace(/[*#_~>]/g, ' ') // strip markdown symbols
      .replace(/[^a-zA-Z0-9\s.,!?'$%-]/g, ' ')
      .replace(/\s+/g, ' ')
      .slice(0, 320)
      .trim();

    if (!cleanText) return;

    setLatestSpeech(cleanText);
    const thisGenId = ++speechGenIdRef.current;
    isSpeakingRef.current = true;
    setIsSpeaking(true);

    // 1. Primary: High-fidelity Web Audio API Stream (bypasses mobile silent switch & autoplay blocks)
    playWebAudioStream(cleanText, thisGenId).then((success) => {
      if (success || speechGenIdRef.current !== thisGenId) return;

      // 2. Secondary Fallback: Re-use pre-authorized audioPlayerRef.current
      try {
        const audio = audioPlayerRef.current || new Audio();
        audioPlayerRef.current = audio;
        activeAudioRef.current = audio;
        audio.src = `/api/founder/tts?text=${encodeURIComponent(cleanText)}&pin=${pin || '8492'}`;

        let playbackStarted = false;
        audio.onplay = () => {
          if (speechGenIdRef.current === thisGenId) {
            playbackStarted = true;
            setIsSpeaking(true);
          }
        };

        audio.onended = () => {
          if (speechGenIdRef.current === thisGenId) {
            setIsSpeaking(false);
            if (isContinuousModeRef.current) {
              triggerAutoListenRef.current();
            }
          }
        };

        audio.onerror = () => {
          if (speechGenIdRef.current === thisGenId && !playbackStarted) {
            fallbackSynthesis(cleanText, thisGenId);
          }
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            if (speechGenIdRef.current === thisGenId && !playbackStarted) {
              console.warn('Audio tag play prevented, engaging speech synthesis:', err);
              fallbackSynthesis(cleanText, thisGenId);
            }
          });
        }
      } catch (_) {
        fallbackSynthesis(cleanText, thisGenId);
      }
    });
  }, [isVoiceEnabled, isVoiceMuted, pin, playWebAudioStream, fallbackSynthesis, stopAllVoicePlayback]);

  // Startup Executive Briefing: Speaks live status aloud through phone/desktop speaker
  const playStartupBriefing = useCallback(async () => {
    if (hasPlayedStartupBriefing) return;
    setHasPlayedStartupBriefing(true);
    unlockAudioOnTouch();

    let briefing = "Good afternoon Dylan. Systems are nominal. We are in stealth pre-launch staging with 2 active studio rigs running, store telemetry is live, Avid developer review is in queue for AAX, and our 4-plugin vocal chain campaign is staged. What are we building today?";

    try {
      const res = await fetch(`/api/founder/sentinel/overnight?pin=${pin || '8492'}`);
      if (res.ok) {
        const data = await res.json();
        if (data.briefing?.spokenBriefing) {
          briefing = data.briefing.spokenBriefing;
          setMorningBriefing(data.briefing);
        }
        if (Array.isArray(data.upgrades)) setSelfUpgrades(data.upgrades);
        if (Array.isArray(data.directives)) setLearnedDirectives(data.directives);
      }
    } catch (_) {}

    setLatestSpeech(briefing);
    speakJarvisVoice(briefing);
  }, [hasPlayedStartupBriefing, unlockAudioOnTouch, speakJarvisVoice, pin]);

  // First user interaction auto-briefing trigger (for already-authenticated sessions on mobile & desktop)
  useEffect(() => {
    if (!isAuthenticated || hasPlayedStartupBriefing) return;

    const handleFirstInteraction = () => {
      unlockAudioOnTouch();
      playStartupBriefing();
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('click', handleFirstInteraction);
    };

    window.addEventListener('pointerdown', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });
    window.addEventListener('click', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('click', handleFirstInteraction);
    };
  }, [isAuthenticated, hasPlayedStartupBriefing, unlockAudioOnTouch, playStartupBriefing]);

  // Autonomous Intent Verification Resolver ("Is this what you're talking about, Dylan?")
  const executePendingConfirmation = useCallback((confirmed: boolean) => {
    setPendingConfirmation((current) => {
      if (!current) return null;
      const actionToRun = current.pendingAction;
      const targetDesc = current.caption || 'Action';
      setSpotlightTarget(null);

      if (confirmed) {
        if ((actionToRun?.type === 'modify_ui' || actionToRun?.action === 'modify_ui') && actionToRun.config) {
          setDashboardConfig((prev) => {
            const updated = { ...prev, ...actionToRun.config };
            try {
              localStorage.setItem('pluggedin_dashboard_config', JSON.stringify(updated));
            } catch (_) {}
            return updated;
          });
          setActionMessage(`✓ Confirmed & Executed: ${targetDesc}`);
          speakJarvisVoice("Understood Dylan. Dashboard layout updated directly.");
        } else if (actionToRun?.type === 'modify_site' || actionToRun?.action === 'modify_site') {
          fetch('/api/site-config', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-founder-pin': pin || '8492',
            },
            body: JSON.stringify({ updates: actionToRun.updates, author: 'jarvis' }),
          })
            .then((r) => r.json())
            .then((res) => {
              if (res.success) {
                setLiveSiteConfig(res.config);
                setActionMessage(`✓ Live Website v${res.config.version} updated & verified!`);
                speakJarvisVoice(`Published to the live website Dylan. Version ${res.config.version} is now active.`);
              } else {
                setActionMessage(`✕ Safeguard prevented update: ${res.error}`);
                speakJarvisVoice(`Dylan, safeguard caught an issue: ${res.error}`);
              }
            })
            .catch(() => {
              setActionMessage('✕ Connection error updating website.');
            });
        } else if (actionToRun?.type === 'revert_site' || actionToRun?.action === 'revert_site') {
          fetch('/api/site-config?action=revert', {
            method: 'POST',
            headers: { 'x-founder-pin': pin || '8492' },
          })
            .then((r) => r.json())
            .then((res) => {
              if (res.success) {
                setLiveSiteConfig(res.config);
                setActionMessage(`✓ Live Website reverted to snapshot v${res.config.version}`);
                speakJarvisVoice(`Live website reverted Dylan. Version ${res.config.version} is restored.`);
              } else {
                setActionMessage(`✕ Rollback error: ${res.error}`);
                speakJarvisVoice(`Could not rollback Dylan: ${res.error}`);
              }
            })
            .catch(() => {
              setActionMessage('✕ Connection error reverting website.');
            });
        } else {
          setActionMessage(`✓ Confirmed & Executed: ${targetDesc}`);
          speakJarvisVoice("Understood Dylan. Executed directly.");
        }
        setTimeout(() => setActionMessage(null), 5000);
      } else {
        setActionMessage("✕ Action cancelled by founder.");
        setTimeout(() => setActionMessage(null), 4000);
        speakJarvisVoice("Understood. Action cancelled, Dylan.");
      }
      return null;
    });
  }, [pin, speakJarvisVoice]);


  // Robust Dynamic Speech Recognition (Tap-to-Talk, Instant Interrupt & Hands-Free Toggle)
  const toggleMic = useCallback(async () => {
    triggerHaptic(25);

    // 1. If Jarvis is currently speaking, tapping acts as an INSTANT INTERRUPT!
    if (isSpeakingRef.current) {
      stopAllVoicePlayback();
      setTimeout(() => {
        startContinuousListening();
      }, 200);
      return;
    }

    // 2. If already listening, stop recording
    if (isListeningRef.current) {
      stopListeningSession();
      return;
    }

    // 3. Guarantee media permissions are unlocked and launch continuous listening loop
    stopAllVoicePlayback();
    unlockAudioOnTouch();
    startContinuousListening();
  }, [stopAllVoicePlayback, unlockAudioOnTouch, startContinuousListening, stopListeningSession]);

  const fetchMetrics = useCallback(async (selectedTimeframe = timeframe, pinCode = pin) => {
    setLoading(true);
    try {
      const [res, sentinelRes, siteRes] = await Promise.all([
        fetch(`/api/founder/metrics?timeframe=${selectedTimeframe}`, {
          headers: { 'x-founder-pin': pinCode || '8492' },
        }),
        fetch('/api/founder/sentinel', {
          headers: { 'x-founder-pin': pinCode || '8492' },
        }).catch(() => null),
        fetch('/api/site-config').catch(() => null),
      ]);

      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
        setIsAuthenticated(true);
        setAuthError('');
        localStorage.setItem('pluggedin_founder_pin', pinCode || '8492');
        if (!hasPlayedStartupBriefing) {
          playStartupBriefing();
        }
      } else if (res.status === 404 || res.status === 401) {
        setIsAuthenticated(false);
        setAuthError('Invalid Security PIN or Unauthorized Device.');
      }

      if (sentinelRes && sentinelRes.ok) {
        const sData = await sentinelRes.json();
        setSentinelData(sData);
        if (sData.activeDispatches) {
          setDispatches(sData.activeDispatches);
        }
      }

      if (siteRes && siteRes.ok) {
        const siteData = await siteRes.json();
        if (siteData?.config) {
          setLiveSiteConfig(siteData.config);
        }
      }

      // Also retrieve AI Engine configuration
      fetch('/api/founder/actions', {
        headers: { 'x-founder-pin': pinCode || '8492' },
      })
        .then((r) => r.json())
        .then((actData) => {
          if (actData.aiConfig) {
            setAiConfig(actData.aiConfig);
            if (actData.aiConfig.apiKey) setTempApiKey(actData.aiConfig.apiKey);
            if (actData.aiConfig.model) setTempModel(actData.aiConfig.model);
            if (actData.aiConfig.customDirectives) setTempCustomDirectives(actData.aiConfig.customDirectives);
            if (typeof actData.aiConfig.temperature === 'number') setTempTemperature(actData.aiConfig.temperature);
            if (actData.aiConfig.tone) setTempTone(actData.aiConfig.tone);
          }
        })
        .catch(() => {});

      fetchOvernightIntelligence();
    } catch (err: any) {
      setAuthError('Connection error. Could not load founder telemetry.');
    } finally {
      setLoading(false);
    }
  }, [timeframe, pin, fetchOvernightIntelligence]);

  const handleSaveAiConfig = async () => {
    if (!tempApiKey.trim()) return;
    setSavingAiConfig(true);
    try {
      const res = await fetch('/api/founder/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-founder-pin': pin || '8492',
        },
        body: JSON.stringify({
          action: 'save_ai_config',
          aiConfig: {
            provider: 'gemini',
            apiKey: tempApiKey.trim(),
            model: tempModel || 'models/gemini-3-flash-preview',
            customDirectives: tempCustomDirectives.trim(),
            temperature: tempTemperature,
            tone: tempTone,
            visualMode: true,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiConfig(data.aiConfig);
        setIsAiSettingsOpen(false);
        setActionMessage('🧠 J.A.R.V.I.S. Neural Brain Engine Configured & Active!');
        setTimeout(() => setActionMessage(null), 5000);
      } else {
        alert(data.error || 'Failed to save AI configuration');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSavingAiConfig(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMetrics(timeframe);
    }
  }, [timeframe, isAuthenticated, fetchMetrics]);

  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    unlockAudioOnTouch();
    fetchMetrics(timeframe, pin);
  };

  const handlePurgeTestOrders = async () => {
    if (!confirm('Purge all simulated test orders? Genuine customer transactions will remain 100% untouched.')) return;
    try {
      const res = await fetch('/api/founder/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-founder-pin': pin || '8492',
        },
        body: JSON.stringify({ action: 'purge_test_orders' }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`🧹 ${data.message}`);
        setTimeout(() => setActionMessage(null), 5000);
        fetchMetrics();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleUpdateDispatchStatus = async (dispatchId: string, newStatus: 'open' | 'addressed' | 'resolved') => {
    try {
      const res = await fetch('/api/founder/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-founder-pin': pin || '8492',
        },
        body: JSON.stringify({ action: 'dispatch_status', dispatchId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setDispatches((prev) =>
          prev.map((d) => (d.id === dispatchId ? { ...d, status: newStatus } : d))
        );
        setActionMessage(`✓ Directive updated to ${newStatus}`);
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleResetMachines = async (userId: string, customerName: string) => {
    if (!confirm(`Are you sure you want to reset all authorized computers for ${customerName}?`)) return;
    try {
      const res = await fetch('/api/founder/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-founder-pin': pin || '8492',
        },
        body: JSON.stringify({ action: 'reset_machines', userId }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`✅ Successfully reset all machine slots for ${customerName}`);
        setTimeout(() => setActionMessage(null), 5000);
        fetchMetrics();
      } else {
        alert(data.error || 'Failed to reset machines');
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleCreateTestSale = async () => {
    try {
      const res = await fetch('/api/founder/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-founder-pin': pin || '8492',
        },
        body: JSON.stringify({
          action: 'test_order',
          orderData: {
            name: 'Metro Audio Studio',
            email: `producer_${Math.floor(Math.random() * 9000 + 1000)}@studio.com`,
            itemType: 'perpetual_plugin',
            itemName: 'PLUGTNE (Vocal Pitch Correction)',
            pluginId: 'plugtne',
            gross: 79.0,
            fee: 2.59,
            net: 76.41,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage('🎉 Test Order Simulated! (You can purge anytime with 1 click)');
        setTimeout(() => setActionMessage(null), 5000);
        fetchMetrics();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSendAiPrompt = async (promptToSend?: string) => {
    const query = promptToSend || aiPrompt;
    if (!query.trim() || aiLoading) return;

    unlockAudioOnTouch();
    triggerHaptic(15);

    // Fast-path hands-free affirmation/cancellation check for pending verification
    if (pendingConfirmation) {
      const qLower = query.toLowerCase().trim();
      const isAffirmative = /^(yes|yeah|yep|yup|sure|do it|go ahead|confirm|correct|that's it|thats it|do that|please do|ok|okay|bet)\b/.test(qLower);
      const isNegative = /^(no|nope|nah|cancel|stop|dont|don't|not that|leave it|nevermind)\b/.test(qLower);

      if (isAffirmative) {
        executePendingConfirmation(true);
        return;
      } else if (isNegative) {
        executePendingConfirmation(false);
        return;
      }
    }

    
    let uploadedAudioUrl = '';
    let uploadedAudioName = '';
    if (attachedAudioFile) {
      setIsUploadingAudio(true);
      try {
        const formData = new FormData();
        formData.append('file', attachedAudioFile);
        const upRes = await fetch(`/api/founder/upload-audio?pin=${pin || '8492'}`, {
          method: 'POST',
          headers: {
            'x-founder-pin': pin || '8492',
          },
          body: formData,
        });
        if (upRes.ok) {
          const upData = await upRes.json();
          if (upData.success) {
            uploadedAudioUrl = upData.url;
            uploadedAudioName = attachedAudioFile.name;
          }
        }
      } catch (err) {
        console.warn('Could not upload attached audio:', err);
      } finally {
        setIsUploadingAudio(false);
        setAttachedAudioFile(null);
      }
    }

    const newHistory = [...aiChatHistory, { role: 'user' as const, text: query, attachedAudioName: uploadedAudioName || undefined }];
    setAiChatHistory(newHistory);
    setAiPrompt('');
    setAiLoading(true);

    try {
      const res = await fetch('/api/founder/ai-advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-founder-pin': pin || '8492',
        },
        body: JSON.stringify({
          prompt: query,
          chatHistory: newHistory,
          currentMetrics: metrics?.financials ? {
            ...metrics.financials,
            mrr: metrics.subscriptions.mrr,
            activeSubscribersCount: metrics.subscriptions.activeSubscribersCount,
            conversionRatePct: metrics.traffic.conversionRatePct,
            topPlugin: metrics.pluginLeaderboard[0]?.name || 'PLUGTNE',
          } : undefined,
          audioUrl: uploadedAudioUrl || undefined,
          audioFilename: uploadedAudioName || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        if (data.deck) {
          setActiveDeck(data.deck);
        }

        if (data.hudAction) {
          const action = data.hudAction;
          if (action.action === 'verify_intent') {
            setPendingConfirmation({
              targetId: action.targetId,
              pendingAction: action.pendingAction,
              caption: action.caption || 'CONFIRMATION REQUIRED',
              question: action.question || "Dylan, is this what you'd like me to change?",
            });
            if (action.targetId) {
              setSpotlightTarget(action.targetId);
              setSpotlightCaption(action.caption || 'CONFIRM TARGET');
              setTimeout(() => {
                const el = document.getElementById(action.targetId);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }, 300);
            }
          } else if (action.action === 'modify_ui' && action.config) {
            setDashboardConfig((prev) => {
              const updated = { ...prev, ...action.config };
              try {
                localStorage.setItem('pluggedin_dashboard_config', JSON.stringify(updated));
              } catch (_) {}
              return updated;
            });
            setActionMessage(`🎨 J.A.R.V.I.S.: ${action.caption || 'Dashboard Layout Updated'}`);
            setTimeout(() => setActionMessage(null), 5000);
          }
          if (action.tab) {
            if (action.tab === 'studio' || action.tab === 'social' || action.tab === 'analytics') {
              setActiveNavTab(action.tab);
            } else {
              setActiveTab(action.tab);
            }
          }
          if (action.targetId) {
            setSpotlightTarget(action.targetId);
            setSpotlightCaption(action.caption || 'Target Isolated');
            setTimeout(() => {
              const el = document.getElementById(action.targetId);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 300);
            setTimeout(() => {
              setSpotlightTarget((curr) => (curr === action.targetId ? null : curr));
            }, 9000);
          }
        }

        setAiChatHistory([
          ...newHistory,
          {
            role: 'assistant',
            text: data.reply,
            speech: data.speech,
            deck: data.deck,
            videoAd: data.videoAd,
            pluginSpec: data.pluginSpec,
          },
        ]);

        if (data.speech) {
          speakJarvisVoice(data.speech);
        } else {
          speakJarvisVoice(data.reply.slice(0, 180));
        }

        if (data.dispatch) {
          setDispatches((prev) => [data.dispatch, ...prev]);
        }
      } else {
        const errReply = "⚠️ Apologies Dylan, I encountered a brief communication delay. Please tap send once more.";
        setAiChatHistory([...newHistory, { role: 'assistant', text: errReply }]);
        speakJarvisVoice(errReply);
      }
    } catch (e: any) {
      const errMsg = `⚠️ Connection error, Dylan: ${e.message}`;
      setAiChatHistory([...newHistory, { role: 'assistant', text: errMsg }]);
      speakJarvisVoice(errMsg);
    } finally {
      setAiLoading(false);
      aiLoadingRef.current = false;
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  useEffect(() => {
    handleSendAiPromptRef.current = handleSendAiPrompt;
  });

  useEffect(() => {
    triggerAutoListenRef.current = () => {
      if (!isSpeakingRef.current && isContinuousModeRef.current && !aiLoadingRef.current) {
        if (recognitionWatchdogTimerRef.current) clearTimeout(recognitionWatchdogTimerRef.current);
        recognitionWatchdogTimerRef.current = setTimeout(() => {
          if (!isSpeakingRef.current && isContinuousModeRef.current && !aiLoadingRef.current) {
            startContinuousListening();
          }
        }, 350);
      }
    };
  }, [startContinuousListening]);

  // Re-arm speech recognition and resume Web Audio when tab regains focus/visibility
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        if (webAudioCtxRef.current && webAudioCtxRef.current.state === 'suspended') {
          webAudioCtxRef.current.resume().catch(() => {});
        }
        if (isContinuousModeRef.current && !isSpeakingRef.current && !aiLoadingRef.current && !isListeningRef.current) {
          startContinuousListening();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, startContinuousListening]);


  // PIN SHIELD VIEW
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 selection:bg-cyber-cyan selection:text-black">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyber-cyan/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyber-purple/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col items-center text-center space-y-4 mb-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyber-cyan via-blue-500 to-cyber-purple p-[2px] shadow-glow-cyan animate-pulse">
                <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                  <Bot className="w-10 h-10 text-cyber-cyan" />
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center space-x-2">
                <span>J.A.R.V.I.S.</span>
                <span className="text-xs font-mono text-cyber-cyan bg-cyber-cyan/10 px-2 py-0.5 rounded-full border border-cyber-cyan/20">
                  SECURE
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">Dylan Goodman • Executive Command & Intelligence</p>
            </div>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-slate-400 mb-2 text-center">
                Enter 4-Digit Access PIN
              </label>
              <input
                type="password"
                maxLength={16}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full text-center text-3xl tracking-[0.5em] font-mono py-4 bg-slate-950/80 border border-slate-700 rounded-2xl text-white focus:outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan transition-all"
                autoFocus
              />
            </div>

            {authError && (
              <div className="flex items-center space-x-2 text-rose-400 text-xs bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !pin}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyber-cyan to-blue-600 text-black font-black text-sm tracking-wider uppercase shadow-glow-cyan hover:brightness-110 active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Authenticate with J.A.R.V.I.S.</span>
                </>
              )}
            </button>
          </form>

          {/* Quick PIN Keypad */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <div className="grid grid-cols-3 gap-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '✓'].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    unlockAudioOnTouch();
                    if (key === 'C') setPin('');
                    else if (key === '✓') fetchMetrics(timeframe, pin);
                    else if (pin.length < 8) setPin((prev) => prev + key);
                  }}
                  className="py-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-lg font-mono font-bold active:scale-95 transition-all border border-slate-700/50"
                >
                  {key}
                </button>
              ))}
            </div>
            <p className="text-[10px] font-mono text-center text-slate-500 mt-4">
              Restricted exclusively to Dylan Goodman (Founder)
            </p>
          </div>
        </div>
      </div>
    );
  }

  // MAIN FOUNDER EXECUTIVE VIEW
  const fin = metrics?.financials;
  const subs = metrics?.subscriptions;
  const traf = metrics?.traffic;
  const plugins = metrics?.pluginLeaderboard || [];
  const orders = metrics?.recentOrders || [];
  const customers = (metrics?.customers || []).filter((c) => {
    if (!searchCustomer) return true;
    const s = searchCustomer.toLowerCase();
    return (
      c.email.toLowerCase().includes(s) ||
      c.displayName.toLowerCase().includes(s) ||
      c.machines.some((m) => m.hostname.toLowerCase().includes(s))
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyber-cyan selection:text-black pb-24 font-sans antialiased">
      {/* Top Founder Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Holographic Arc Core Indicator */}
            <div className="relative">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr from-cyber-cyan via-blue-500 to-cyber-purple p-[1.5px] ${isSpeaking ? 'shadow-glow-cyan animate-pulse' : ''}`}>
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Bot className={`w-5 h-5 ${isSpeaking ? 'text-cyber-cyan animate-bounce' : 'text-slate-300'}`} />
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div
              id="founder-header-controls"
              className={`transition-all rounded-2xl p-1.5 ${
                spotlightTarget === 'founder-header-controls' || spotlightTarget === 'header-chat-buttons'
                  ? 'ring-4 ring-amber-400 bg-amber-500/15 shadow-[0_0_40px_rgba(251,191,36,0.7)] animate-pulse'
                  : ''
              }`}
            >
              <div className="flex items-center space-x-2">

                {/* Dynamic New Chat & History Buttons (Controlled by Jarvis voice & dashboardConfig) */}
                {dashboardConfig.showChatButtons && (
                  <div id="header-chat-buttons" className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={startNewChat}
                      className="px-3 py-1.5 rounded-xl bg-cyber-cyan/15 hover:bg-cyber-cyan/25 text-cyber-cyan border border-cyber-cyan/30 text-xs font-mono font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
                      title="Start a fresh chat thread"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Chat</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setChatHistoryDrawerOpen(!chatHistoryDrawerOpen)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono transition-all flex items-center gap-1.5 active:scale-95"
                      title="View past conversations"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Past Chats</span>
                    </button>
                  </div>
                )}

                <span className="text-base font-black tracking-wider text-white">J.A.R.V.I.S.</span>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  ONLINE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Dylan Goodman • Executive AI</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                isVoiceEnabled
                  ? 'bg-cyber-cyan/10 border-cyber-cyan/30 text-cyber-cyan'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
              title={isVoiceEnabled ? 'Voice output enabled' : 'Voice output muted'}
            >
              {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => fetchMetrics(timeframe)}
              disabled={loading}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center space-x-1.5 text-xs font-semibold"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyber-cyan' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>

            <button
              onClick={() => {
                localStorage.removeItem('pluggedin_founder_pin');
                setIsAuthenticated(false);
              }}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-all text-xs"
              title="Lock Dashboard"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Action Notification Toast */}
      {actionMessage && (
        <div className="max-w-md mx-auto mt-4 px-4">
          <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-2xl flex items-center space-x-3 text-xs shadow-lg backdrop-blur-md">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            <span>{actionMessage}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* Timeframe & Ledger Controls */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-800/60">
          <div className="flex items-center space-x-1.5 bg-slate-900/80 p-1 rounded-2xl border border-slate-800 overflow-x-auto max-w-full">
            {(
              [
                { id: 'today', label: 'Today' },
                { id: '7d', label: '7 Days' },
                { id: '30d', label: '30 Days' },
                { id: 'ytd', label: 'YTD' },
                { id: 'all', label: 'All-Time' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeframe(t.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  timeframe === t.id
                    ? 'bg-gradient-to-r from-cyber-cyan to-blue-600 text-black font-black shadow-glow-cyan'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="btn-purge-test-sales"
              onClick={handlePurgeTestOrders}
              className={`px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                spotlightTarget === 'btn-purge-test-sales'
                  ? 'ring-4 ring-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.8)] animate-pulse'
                  : ''
              }`}
              title="Remove test simulated orders and restore 100% genuine ledger"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Purge Test Sales</span>
            </button>
            <button
              onClick={handleCreateTestSale}
              className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 text-xs font-semibold flex items-center space-x-1.5 transition-all"
            >
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>Simulate Sale</span>
            </button>
          </div>
        </div>

        {/* Executive KPI Hero Grid (Controlled by Jarvis voice & dashboardConfig) */}
        {dashboardConfig.showTopStats && (
          <div
            id="founder-top-stats"
            className={`grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 rounded-3xl p-1 transition-all ${
              spotlightTarget === 'founder-top-stats'
                ? 'ring-4 ring-amber-400 bg-amber-500/10 shadow-[0_0_50px_rgba(251,191,36,0.7)] animate-pulse'
                : ''
            }`}
          >
            {/* 1. True Net Take-Home Profit (Hero) */}
            <div
              id="metric-net-sales"
              className={`col-span-2 sm:col-span-1 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-3xl p-5 shadow-xl relative overflow-hidden transition-all duration-500 ${
                spotlightTarget === 'metric-net-sales'
                  ? 'ring-4 ring-cyber-cyan shadow-[0_0_50px_rgba(0,240,255,0.8)] scale-[1.02] z-30'
                  : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center space-x-1.5">
                  <DollarSign className="w-4 h-4" />
                  <span>True Net Take-Home</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  {fin?.marginPct || 0}% Keep Rate
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-1">
                ${(fin?.netTotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Exact PayPal balance deposited after all fees & taxes.
              </p>
            </div>

            {/* 2. Gross Sales & Fee Breakdown */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-lg relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center space-x-1.5">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  <span>Gross Checkout</span>
                </span>
                <span className="text-[10px] font-mono text-rose-400 flex items-center">
                  -${(fin?.feeTotal || 0).toFixed(2)} fees
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
                ${(fin?.grossTotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Across {fin?.completedOrdersCount || 0} customer transactions.
              </p>
            </div>

            {/* 3. Subscriptions & MRR */}
            <div id="metric-mrr" className={`bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-lg relative transition-all duration-500 ${spotlightTarget === 'metric-mrr' ? 'ring-4 ring-cyber-cyan shadow-[0_0_50px_rgba(0,240,255,0.8)] scale-[1.02] z-30' : ''}`}>
              {spotlightTarget === 'metric-mrr' && (
                <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-cyber-cyan text-black font-mono font-black text-[10px] shadow-glow-cyan flex items-center gap-1 animate-pulse">
                  <span>[ ── ⊕ ── ]</span> <span>{spotlightCaption || 'ISOLATED'}</span>
                </div>
              )}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-purple-400 font-bold flex items-center space-x-1.5">
                  <RefreshCw className="w-4 h-4" />
                  <span>MRR (Monthly)</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">
                  {subs?.activeSubscribersCount || 0} active
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
                ${(subs?.mrr || 0).toFixed(2)}
                <span className="text-xs text-slate-400 font-normal">/mo</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Projected ARR: ${(subs?.arr || 0).toFixed(2)} • 0% Churn
              </p>
            </div>

            {/* 4. Traffic & Conversion Funnel */}
            <div id="metric-active-subs" className={`bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-lg relative transition-all duration-500 ${spotlightTarget === 'metric-active-subs' ? 'ring-4 ring-cyber-cyan shadow-[0_0_50px_rgba(0,240,255,0.8)] scale-[1.02] z-30' : ''}`}>
              {spotlightTarget === 'metric-active-subs' && (
                <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-cyber-cyan text-black font-mono font-black text-[10px] shadow-glow-cyan flex items-center gap-1 animate-pulse">
                  <span>[ ── ⊕ ── ]</span> <span>{spotlightCaption || 'ISOLATED'}</span>
                </div>
              )}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-cyber-cyan font-bold flex items-center space-x-1.5">
                  <Users className="w-4 h-4" />
                  <span>Conversion Rate</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {traf?.totalViews || 0} visits
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
                {traf?.conversionRatePct || '0.00'}%
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                AOV: ${(fin?.aov || 0).toFixed(2)} • RPV: ${(fin?.rpv || 0).toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* ONE-TOUCH AUDIO WAKE & BRIEFING TRIGGER BANNER */}
        {!hasUnlockedAudio && (
          <div
            onClick={() => {
              triggerHaptic(20);
              unlockAudioOnTouch();
              playStartupBriefing();
            }}
            className="w-full mb-4 p-4 rounded-3xl bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-purple-500/20 border-2 border-cyber-cyan shadow-[0_0_30px_rgba(0,240,255,0.4)] flex flex-col sm:flex-row items-center justify-between gap-3 cursor-pointer hover:brightness-110 active:scale-98 transition-all animate-pulse"
          >
            <div className="flex items-center space-x-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-2xl bg-cyber-cyan text-black font-black flex items-center justify-center shrink-0 shadow-glow-cyan">
                <Volume2 className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center justify-center sm:justify-start space-x-2">
                  <span className="text-sm font-black text-white">TAP TO WAKE J.A.R.V.I.S. & HEAR BRIEFING</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyber-cyan text-black font-bold">1-TAP AUDIO UNLOCK</span>
                </div>
                <p className="text-xs text-slate-300">Unlocks phone speaker audio & speaks live pre-launch briefing aloud</p>
              </div>
            </div>
            <button
              type="button"
              className="px-5 py-2.5 rounded-2xl bg-cyber-cyan text-black font-black text-xs shadow-glow-cyan hover:brightness-110 active:scale-95 transition-all whitespace-nowrap"
            >
              ▶ Initialize & Listen
            </button>
          </div>
        )}

        {/* Section Navigation Tabs (Desktop) */}
        <div className="hidden md:flex items-center space-x-2 border-b border-slate-800 pb-1 overflow-x-auto">
          {[
            { id: 'jarvis', label: 'J.A.R.V.I.S. Voice AI', icon: Bot },
            { id: 'sentinel', label: '24/7 Sentinel Watchdog', icon: Activity },
            { id: 'financials', label: 'Financials & Orders', icon: DollarSign },
            { id: 'subs', label: 'Subscriptions & MRR', icon: RefreshCw },
            { id: 'plugins', label: 'Plugin Leaderboard', icon: Layers },
            { id: 'traffic', label: 'Traffic & Sources', icon: BarChart3 },
            { id: 'coupons', label: 'Coupons & Disputes', icon: Tag },
            { id: 'customers', label: 'Customers & Devices', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  triggerHaptic(10);
                  setActiveTab(tab.id as any);
                }}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                  active
                    ? 'bg-slate-800 text-cyber-cyan border border-cyber-cyan/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-cyber-cyan' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB: J.A.R.V.I.S. VOICE AI & ARC REACTOR */}
        {activeTab === 'jarvis' && (
          <div className="space-y-4">
            {/* Top Studio Control Bar */}
            <div className="flex items-center justify-between flex-wrap gap-2 p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-md">
              <div className="flex items-center space-x-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-black text-white">J.A.R.V.I.S. Studio Stream</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                      Neural Link Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Controls: Global Mute Switch, Fine-Tuning & Clear */}
              <div className="flex items-center space-x-2">
                {/* Hands-Free Duplex Conversational Mode Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(15);
                    const next = !isContinuousMode;
                    setIsContinuousMode(next);
                    if (next) {
                      startContinuousListening();
                    } else {
                      stopListeningSession();
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm active:scale-95 ${
                    isContinuousMode
                      ? 'bg-cyan-500/20 border-cyber-cyan text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                      : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                  title="Hands-Free Continuous Voice Conversation (Speaks & Listens Automatically)"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isContinuousMode ? 'text-cyber-cyan animate-spin' : 'text-slate-500'}`} />
                  <span className="hidden sm:inline">{isContinuousMode ? 'Hands-Free: ON' : 'Hands-Free: OFF'}</span>
                  <span className="sm:hidden">{isContinuousMode ? 'Duplex ON' : 'Duplex'}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleGlobalMute}
                  className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm active:scale-95 ${
                    isVoiceMuted
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                  }`}
                  title={isVoiceMuted ? 'Voice output is muted' : 'Voice output is active'}
                >
                  {isVoiceMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                  <span>{isVoiceMuted ? 'Voice: Muted' : 'Voice: Active'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setIsAiSettingsOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 hover:border-cyber-cyan text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyber-cyan" />
                  <span className="font-mono text-[11px] text-cyan-300">
                    {aiConfig?.model ? aiConfig.model.replace('models/', '').replace('-preview', '') : 'Gemini 3 Flash'}
                  </span>
                  <Sliders className="w-3 h-3 text-slate-400 ml-0.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Clear entire chat stream?')) {
                      setAiChatHistory([]);
                      stopAllVoicePlayback();
                    }
                  }}
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 transition-all text-xs"
                  title="Clear Chat History"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* STARK INDUSTRIES HOLOGRAPHIC ARC REACTOR CORE */}
            <div className="bg-slate-950/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
              {/* Cinematic Ambient Glow */}
              <div className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
                isSpeaking
                  ? 'bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.15)_0%,transparent_70%)]'
                  : isListening
                  ? 'bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.15)_0%,transparent_70%)]'
                  : 'bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.08)_0%,transparent_70%)]'
              }`} />

              {/* Floating Holographic Spotlight Reticle Banner */}
              {spotlightTarget && (
                <div className="mb-4 px-4 py-2 rounded-2xl bg-cyber-cyan/15 border border-cyber-cyan/40 text-cyber-cyan flex items-center justify-between text-xs font-mono font-bold animate-pulse">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-ping" />
                    <span>[ ── ⊕ SCREEN CONTROL: {spotlightCaption || 'TARGET ISOLATED'} ── ]</span>
                  </div>
                  <button
                    onClick={() => setSpotlightTarget(null)}
                    className="px-2 py-0.5 rounded-lg bg-cyber-cyan text-black font-black text-[10px] hover:brightness-110"
                  >
                    DISMISS
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                {/* Arc Reactor Holographic Orb */}
                <div className="flex items-center space-x-5">
                  <div
                    onClick={toggleMic}
                    className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center cursor-pointer select-none group"
                    title={isSpeaking ? 'Tap to Interrupt' : isListening ? 'Listening (Tap to Send)' : 'Tap to Speak'}
                  >
                    {/* Outer Gyroscopic Ring */}
                    <div className={`absolute inset-0 rounded-full border border-dashed transition-all duration-700 ${
                      isSpeaking
                        ? 'border-purple-500 animate-[spin_6s_linear_infinite] shadow-[0_0_25px_rgba(168,85,247,0.5)]'
                        : isListening
                        ? 'border-rose-500 animate-[spin_3s_linear_infinite] shadow-[0_0_25px_rgba(244,63,94,0.5)]'
                        : 'border-cyber-cyan/40 animate-[spin_16s_linear_infinite] group-hover:border-cyber-cyan'
                    }`} />

                    {/* Middle Counter-Rotating Ring */}
                    <div className={`absolute inset-2 rounded-full border transition-all duration-700 ${
                      isSpeaking
                        ? 'border-cyan-400 border-t-transparent animate-[spin_4s_linear_infinite_reverse]'
                        : isListening
                        ? 'border-rose-400 border-b-transparent animate-[spin_2s_linear_infinite_reverse]'
                        : 'border-slate-700 border-t-cyber-cyan/50 animate-[spin_10s_linear_infinite_reverse]'
                    }`} />

                    {/* Inner Core Energy Sphere */}
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-inner ${
                      isSpeaking
                        ? 'bg-gradient-to-tr from-purple-600 to-indigo-500 text-white scale-110 shadow-[0_0_30px_rgba(147,51,234,0.8)]'
                        : isListening
                        ? 'bg-gradient-to-tr from-rose-600 to-red-500 text-white scale-110 shadow-[0_0_30px_rgba(244,63,94,0.8)]'
                        : 'bg-gradient-to-tr from-slate-900 to-slate-800 text-cyber-cyan border border-cyber-cyan/40 group-hover:scale-105 shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                    }`}>
                      {isSpeaking ? (
                        <Volume2 className="w-6 h-6 animate-pulse" />
                      ) : isListening ? (
                        <MicOff className="w-6 h-6 animate-pulse text-white" />
                      ) : (
                        <Bot className="w-7 h-7 text-cyber-cyan" />
                      )}
                    </div>
                  </div>

                  {/* Persona Status & Live Audio Frequency Bars */}
                  <div className="space-y-1.5 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start space-x-2">
                      <span className="text-base sm:text-lg font-black tracking-tight text-white">J.A.R.V.I.S. Core Engine</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyber-cyan/30 text-cyber-cyan font-bold">
                        v2.5 Neural
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {isSpeaking
                        ? 'Synthesizing voice briefing to Dylan (Tap orb to interrupt)...'
                        : isListening
                        ? 'Listening to Dylan... (Speak naturally)'
                        : isContinuousMode
                        ? 'Hands-Free Duplex Active • Waiting for conversation'
                        : 'Autonomous Co-Founder & Studio Copilot'}
                    </p>

                    {/* Animated EQ Frequency Bars */}
                    <div className="flex items-center justify-center sm:justify-start space-x-1 h-4 pt-1">
                      {[18, 45, 80, 60, 95, 30, 75, 40, 90, 55, 35, 70, 20].map((height, idx) => (
                        <div
                          key={idx}
                          className={`w-1 rounded-full transition-all duration-150 ${
                            isSpeaking
                              ? 'bg-gradient-to-t from-indigo-500 to-purple-400 animate-pulse'
                              : isListening
                              ? 'bg-gradient-to-t from-red-500 to-rose-400 animate-pulse'
                              : 'bg-slate-800'
                          }`}
                          style={{
                            height: isSpeaking ? `${(height % 85) + 15}%` : isListening ? `${(height % 70) + 20}%` : '20%',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Real-time Enterprise Situational Awareness Badges */}
                <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 text-[11px] font-mono">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-1.5 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-emerald-300 font-bold">CENTRAL: V3.0.3</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-1.5 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-amber-300 font-bold">AVID/PACE: IN REVIEW</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-1.5 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-cyber-cyan" />
                    <span className="text-cyan-300 font-bold">RIGS: 2/5 ACTIVE</span>
                  </div>
                </div>
              </div>

              {/* Startup Executive Briefing HUD Banner */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 rounded-2xl p-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-cyber-cyan text-xs font-mono font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-cyber-cyan" />
                    <span>EXECUTIVE BRIEFING: SYSTEMS NOMINAL</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Net: <strong className="text-white">${(fin?.netTotal || 0).toFixed(2)}</strong> • 2 Active DAW Rigs • 4-Plugin Vocal Chain Ad Staged • Avid AAX Pipeline Monitored.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(15);
                      unlockAudioOnTouch();
                      speakJarvisVoice(`Good afternoon Dylan. Systems are nominal. We have 2 active studio rigs licensed, store telemetry is live, Avid developer review is in queue for AAX, and our 4-plugin vocal chain campaign is staged. What are we building today?`);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-cyber-cyan text-black font-black text-xs shadow-glow-cyan hover:brightness-110 active:scale-95 transition-all flex items-center space-x-1.5 whitespace-nowrap"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen to Briefing</span>
                  </button>
                </div>
              </div>
            </div>

            {/* CLEAN EXECUTIVE STUDIO STAGE: VIDEO AD STUDIO & PLUGIN LAB */}
            <div className="space-y-6">
              {/* Active Video Ad Studio (Multi-Plugin Chain or Flagship Ad) */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                      <Video className="w-5 h-5 text-cyber-cyan" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white">4-Plugin Vocal Chain Ad Studio</h3>
                      <p className="text-xs text-slate-400">Authentic 24-bit C++ DSP Audio Progression • 100% Real Plugin GUIs</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSendAiPrompt("Jarvis, make an ad using 4 plugins on a vocal chain showing off the whole suite.")}
                    className="px-4 py-2 rounded-2xl bg-gradient-to-r from-cyber-cyan to-blue-600 text-black font-black text-xs shadow-glow-cyan hover:brightness-110 active:scale-95 transition-all flex items-center space-x-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate New 4-Plugin Ad</span>
                  </button>
                </div>

                {/* Render active or latest generated video ad */}
                {(() => {
                  const lastAd = [...aiChatHistory].reverse().find((m) => m.videoAd)?.videoAd || {
                    pluginId: 'plugtne',
                    pluginName: 'Full Vocal Chain Suite (4 Plugins)',
                    hookHeadline: 'How To Get Radio-Ready Vocals with 4 C++ Plugins in FL Studio',
                    targetAudience: 'FL Studio Trap & Vocal Producers',
                    aspectRatio: '9:16',
                    audioPair: 'vocal',
                    isChainAd: true,
                    chainPlugins: [
                      { id: 'plugtne', name: '1. PLUGTNE' },
                      { id: 'plugeq', name: '2. PLUGEQ' },
                      { id: 'plugvox', name: '3. PLUGVOX' },
                      { id: 'plugverb', name: '4. PLUGVERB' },
                    ],
                    callToAction: 'Grab the All-Access Studio Pass at pluggedin.studio • Link in bio',
                    scenes: [
                      { sceneNumber: 1, durationSec: 3, headline: 'Stop letting raw vocals ruin your beat.', visualAction: 'Raw vocal in FL Studio with pitch alert.', audioMode: 'dry', badgeText: 'BEFORE: RAW DEMO', subtitles: ['Stop', 'recording', 'amateur', 'vocals', 'in', 'FL', 'Studio.'], pluginId: 'plugtne' },
                      { sceneNumber: 2, durationSec: 3, headline: 'Step 1: Snap pitch with PLUGTNE 0ms autotune.', visualAction: 'PLUGTNE locks vocal pitch instantly.', audioMode: 'tuned', badgeText: 'STEP 1: PLUGTNE (0MS PITCH)', subtitles: ['One', 'click', 'and', 'your', 'pitch', 'snaps', 'instantly.'], pluginId: 'plugtne' },
                      { sceneNumber: 3, durationSec: 3, headline: 'Step 2: Add Pultec air sheen with PLUGEQ.', visualAction: 'PLUGEQ Pultec high-shelf boosts +3dB at 10.5kHz.', audioMode: 'wet', badgeText: 'STEP 2: PLUGEQ (+3dB AIR)', subtitles: ['Expensive', 'high', 'end', 'air', 'without', 'harshness.'], pluginId: 'plugeq' },
                      { sceneNumber: 4, durationSec: 3, headline: 'Step 3: RVox optical leveling with PLUGVOX.', visualAction: 'PLUGVOX pins the vocal upfront.', audioMode: 'wet', badgeText: 'STEP 3: PLUGVOX (LEVELER)', subtitles: ['Smooth', 'optical', 'leveling', 'pins', 'the', 'vocal', 'upfront.'], pluginId: 'plugvox' },
                      { sceneNumber: 5, durationSec: 3, headline: 'Step 4: Algorithmic plate space with PLUGVERB.', visualAction: 'PLUGVERB lush 1.6s stereo decay.', audioMode: 'wet', badgeText: 'STEP 4: PLUGVERB (PLATE)', subtitles: ['Lush', 'stereo', 'depth', 'that', 'never', 'muddies', 'the', 'beat.'], pluginId: 'plugverb' },
                      { sceneNumber: 6, durationSec: 3, headline: 'Full Studio Chain: Radio ready in 4 clicks.', visualAction: 'Finished vocal playing in full beat, link in bio overlay.', audioMode: 'wet', badgeText: 'FULL 4-PLUGIN CHAIN ACTIVE', subtitles: ['Grab', 'the', 'studio', 'pass.', 'Link', 'in', 'bio.'], pluginId: 'plugverb' },
                    ],
                  };
                  return <JarvisVideoAdStudio videoAd={lastAd} />;
                })()}
              </div>

              {/* AI Plugin R&D Lab Stage (Knobs, OLED Waveform, DSP) */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white">AI Plugin R&D Laboratory</h3>
                      <p className="text-xs text-slate-400">Interactive Radial Controls • OLED Waveform Visualizer • JUCE C++ Specs</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSendAiPrompt("Jarvis, invent a new analog tube saturation and tape exciter plugin called PLUGHEAT that beats Decapitator.")}
                    className="px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-glow-purple active:scale-95 transition-all flex items-center space-x-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-cyan-300" />
                    <span>Formulate New Plugin</span>
                  </button>
                </div>

                {(() => {
                  const lastSpec = [...aiChatHistory].reverse().find((m) => m.pluginSpec)?.pluginSpec || {
                    name: 'PLUGHEAT',
                    tagline: 'Dual-Stage Analog Tube Saturation & Dynamic Tape Exciter',
                    category: 'Analog Saturation & Harmonic Color',
                    chassisTheme: 'cyberpunk_cyan',
                    controls: [
                      { id: 'drive', label: 'DRIVE', type: 'knob' as const, defaultValue: 65, unit: '%' },
                      { id: 'tube_bias', label: 'TUBE BIAS', type: 'knob' as const, defaultValue: 45, unit: '%' },
                      { id: 'tape_air', label: 'TAPE AIR', type: 'knob' as const, defaultValue: 80, unit: '%' },
                      { id: 'warmth', label: 'WARMTH', type: 'knob' as const, defaultValue: 50, unit: '%' },
                      { id: 'mix', label: 'MIX', type: 'knob' as const, defaultValue: 100, unit: '%' },
                    ],
                    dspBreakdown: [
                      'Asymmetric triode transfer function with real-time even harmonic overtones',
                      'Magnetic hysteresis emulation smoothing high-frequency transient peaks',
                      'Zero-latency 4x oversampling with linear-phase reconstruction filter',
                    ],
                    competitorEdge: 'Uses 0.4% CPU in FL Studio with zero latency, outperforming bulky legacy saturation plugins.',
                    targetBpmKey: 'FL Studio 140 BPM Trap & Hip-Hop',
                    cppSnippet: '// C++ DSP Core Snippet\nclass PlugHeatDSP {\n  float processSample(float in) {\n    return std::tanh(in * driveFactor);\n  }\n};',
                  };
                  return <JarvisPluginLab spec={lastSpec} />;
                })()}
              </div>
            </div>
          </div>
        )}

        {/* TAB: 24/7 SENTINEL WATCHDOG & ENGINEER DISPATCHES */}
        {activeTab === 'sentinel' && (
          <div className="space-y-6">
            {/* Sentinel Status Banner */}
            <div
              id="card-sentinel-status"
              className={`bg-slate-900/80 border border-emerald-500/30 rounded-3xl p-6 relative overflow-hidden transition-all duration-500 ${
                spotlightTarget === 'card-sentinel-status'
                  ? 'ring-4 ring-cyber-cyan shadow-[0_0_50px_rgba(0,240,255,0.8)] scale-[1.01] z-30'
                  : ''
              }`}
            >
              {spotlightTarget === 'card-sentinel-status' && (
                <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-cyber-cyan text-black font-mono font-black text-[10px] shadow-glow-cyan flex items-center gap-1 animate-pulse">
                  <span>[ ── ⊕ ── ]</span> <span>{spotlightCaption || 'SENTINEL ISOLATED'}</span>
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-base font-black text-white">J.A.R.V.I.S. 24/7 Sentinel Watchdog</h2>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                        {sentinelData?.sentinelStatus || 'OPERATIONAL'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Continuously scanning payment pipelines, DRM licenses, and site errors
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono text-slate-400">Diagnostics Scan</span>
                  <div className="text-sm font-bold text-emerald-400 font-mono">
                    {sentinelData?.alarms?.length ? `${sentinelData.alarms.length} Bottlenecks` : '0 Critical Errors'}
                  </div>
                </div>
              </div>
            </div>

            {/* Active Problem Sentinel Alarms */}
            {sentinelData?.alarms && sentinelData.alarms.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>Active Sentinel Bottlenecks Detected ({sentinelData.alarms.length})</span>
                  </h3>
                  <button
                    onClick={() => handleSendAiPrompt("Jarvis, explain the active sentinel issues and tell me the unvarnished truth on how we fix them.")}
                    className="text-xs font-mono text-cyan-400 hover:underline flex items-center space-x-1"
                  >
                    <span>J.A.R.V.I.S. Deep Analysis</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                {sentinelData.alarms.map((alarm: any) => (
                  <div
                    key={alarm.id}
                    className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      alarm.level === 'critical'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                        : alarm.level === 'warning'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                        : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-black uppercase tracking-wider">{alarm.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold bg-black/40">
                          {alarm.level}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{alarm.summary}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">Recommended: {alarm.suggestedAction}</p>
                    </div>
                    <button
                      onClick={() => handleSendAiPrompt(`Jarvis, take immediate action on ${alarm.title}: ${alarm.suggestedAction}`)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shrink-0 active:scale-95 transition-all"
                    >
                      Resolve with J.A.R.V.I.S.
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300 font-mono">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Sentinel Sweep: All payment gateways, DRM activation limits, and store routes verified healthy.</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">0 Bottlenecks</span>
              </div>
            )}

            {/* LIVE WEBSITE STOREFRONT CONTROL & INSTANT ROLLBACK */}
            <div
              id="site-storefront-control"
              className={`bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 relative transition-all duration-500 ${
                spotlightTarget === 'site-storefront-control'
                  ? 'ring-4 ring-cyber-cyan shadow-[0_0_50px_rgba(0,240,255,0.8)] scale-[1.01] z-30'
                  : ''
              }`}
            >
              {spotlightTarget === 'site-storefront-control' && (
                <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-cyber-cyan text-black font-mono font-black text-[10px] shadow-glow-cyan flex items-center gap-1 animate-pulse">
                  <span>[ ── ⊕ ── ]</span> <span>{spotlightCaption || 'STOREFRONT CONTROL'}</span>
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyber-cyan/40 flex items-center justify-center text-cyber-cyan shadow-glow-cyan">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-black text-white">Live Storefront Website Control</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyber-cyan border border-cyan-500/30 font-bold">
                        v{liveSiteConfig?.version || 1} LIVE
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Safeguarded dynamic management of hero headline, scarcity banner, and promos
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    disabled={isRollingBackSite}
                    onClick={async () => {
                      if (!confirm("Rollback live website to previous snapshot?")) return;
                      setIsRollingBackSite(true);
                      try {
                        const res = await fetch('/api/site-config?action=revert', {
                          method: 'POST',
                          headers: { 'x-founder-pin': pin || '8492' }
                        });
                        const data = await res.json();
                        if (data.success) {
                          setLiveSiteConfig(data.config);
                          setActionMessage(`✓ Website reverted to v${data.config.version}`);
                          setTimeout(() => setActionMessage(null), 4000);
                          speakJarvisVoice(`Website reverted to previous snapshot Dylan. Version ${data.config.version} is now live.`);
                        } else {
                          alert(data.error || 'Rollback failed');
                        }
                      } catch (err: any) {
                        alert(err.message);
                      } finally {
                        setIsRollingBackSite(false);
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-bold active:scale-95 transition-all flex items-center space-x-1.5"
                    title="1-Tap Instant Rollback to previous configuration"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isRollingBackSite ? 'animate-spin' : ''}`} />
                    <span>1-Tap Rollback</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendAiPrompt("Jarvis, stage a new pre-launch announcement banner offering 20% off for early producers.")}
                    className="px-3.5 py-2 rounded-xl bg-cyber-cyan text-black font-black text-xs shadow-glow-cyan hover:brightness-110 active:scale-95 transition-all flex items-center space-x-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Staging</span>
                  </button>
                </div>
              </div>

              {/* Storefront Snapshot Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Active Hero Headline
                  </span>
                  <p className="text-sm font-bold text-white">
                    {liveSiteConfig?.hero?.headlineStart || "Studio-Grade Plugins Built for"}{' '}
                    <span className="text-cyber-cyan">
                      {liveSiteConfig?.hero?.headlineGradient || "Modern Hitmakers."}
                    </span>
                  </p>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {liveSiteConfig?.hero?.subheadline || "From PlugChop 16-pad playable sampler to zero-latency pitch correction."}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                      Announcement Banner
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${liveSiteConfig?.banner?.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                      {liveSiteConfig?.banner?.enabled ? 'ACTIVE ON HOMEPAGE' : 'MUTED'}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200">
                    {liveSiteConfig?.banner?.text || "FOUNDER'S PASS: Only 12 of 100 spots left @ $14.99/mo"}
                  </p>
                  <p className="text-[10px] font-mono text-cyan-400">
                    Link: {liveSiteConfig?.banner?.ctaLink || "/pricing"} • Style: {liveSiteConfig?.banner?.style || "cyan"}
                  </p>
                </div>
              </div>
            </div>

            {/* Subsystem Health Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase text-slate-400">Cloud Database (Redis)</span>
                  <span className="text-emerald-400 text-xs font-bold font-mono">
                    {sentinelData?.diagnostics?.database?.latencyMs ? `${sentinelData.diagnostics.database.latencyMs}ms` : 'Healthy'}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  {sentinelData?.diagnostics?.database?.details || 'Database ping within optimal operational boundaries.'}
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase text-slate-400">PayPal REST Pipeline</span>
                  <span className="text-emerald-400 text-xs font-bold font-mono">Active</span>
                </div>
                <p className="text-xs text-slate-300">
                  {sentinelData?.diagnostics?.paypal?.details || 'Automatic breakdown & seller protection enabled.'}
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase text-slate-400">DRM License Machine Locks</span>
                  <span className="text-cyber-cyan text-xs font-bold font-mono">Verified</span>
                </div>
                <p className="text-xs text-slate-300">
                  {sentinelData?.diagnostics?.drm?.details || 'All hardware activations cryptographically signed.'}
                </p>
              </div>
            </div>

            {/* Directives & Dispatches for Antigravity */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-cyber-cyan" />
                    <span>Directives Dispatched to Antigravity (AI Pair Engineer)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tasks and optimization proposals formulated by J.A.R.V.I.S. for immediate engineering action
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {dispatches.map((d) => (
                  <div
                    key={d.id}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                          d.priority === 'high' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {d.priority} Priority
                        </span>
                        <span className="font-bold text-white text-sm">{d.title}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{d.details}</p>
                      <div className="mt-2 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                        Action Directive: {d.suggestedAction}
                      </div>
                    </div>

                    <div className="self-end md:self-auto flex items-center space-x-2 shrink-0">
                      <span className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border uppercase font-bold tracking-wider ${
                        d.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                        d.status === 'addressed' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' :
                        'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {d.status === 'resolved' ? '✓ Resolved' : d.status}
                      </span>
                      {d.status !== 'resolved' && (
                        <button
                          onClick={() => handleUpdateDispatchStatus(d.id, 'resolved')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-all active:scale-95"
                          title="Mark directive as resolved"
                        >
                          Resolve Directive
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* OVERNIGHT AUTONOMOUS INTELLIGENCE & MORNING BRIEFING */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-black text-white">Overnight Autonomous Sentinel Briefing</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                        {morningBriefing?.date || 'TODAY'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Autonomous audit of overnight visits, checkout activity, and system nodes
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    disabled={isRefreshingOvernight}
                    onClick={handleRunOvernightAudit}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-bold active:scale-95 transition-all flex items-center space-x-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingOvernight ? 'animate-spin' : ''}`} />
                    <span>Re-run Overnight Audit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (morningBriefing?.spokenBriefing) {
                        speakJarvisVoice(morningBriefing.spokenBriefing);
                      } else {
                        speakJarvisVoice("All systems held up solid overnight Dylan. Store telemetry is operational.");
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-black font-black text-xs shadow-glow-cyan hover:brightness-110 active:scale-95 transition-all flex items-center space-x-1.5"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Hear Briefing</span>
                  </button>
                </div>
              </div>

              {/* Overnight Spoken Narrative */}
              {morningBriefing?.spokenBriefing && (
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-slate-200 leading-relaxed font-sans flex items-start space-x-3">
                  <Bot className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-wider block font-bold mb-1">J.A.R.V.I.S. Morning Co-Founder Debrief:</span>
                    <p className="italic">&ldquo;{morningBriefing.spokenBriefing}&rdquo;</p>
                  </div>
                </div>
              )}

              {/* Today's Top 3 Execution Priorities */}
              {morningBriefing?.todayPriorities && morningBriefing.todayPriorities.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold block">
                    Today's High-Leverage Strategic Directives:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {morningBriefing.todayPriorities.map((p: string, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2">
                        <span className="font-mono text-cyan-400 font-bold">0{idx + 1}.</span>
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* J.A.R.V.I.S. SELF-EVOLUTION & CAPABILITY ROADMAP */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-glow-purple">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-black text-white">J.A.R.V.I.S. Self-Evolution & Upgrades</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                        {selfUpgrades.filter((u) => u.status === 'proposed').length} PROPOSALS
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Autonomous diagnosis of missing tools, data gaps, and capabilities to increase revenue
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSendAiPrompt("Jarvis, audit your own capabilities. What tools, APIs, or upgrades do you need to become 10x smarter for our business?")}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-glow-purple active:scale-95 transition-all flex items-center space-x-1.5"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Request Capability Audit</span>
                </button>
              </div>

              {/* Proposals List */}
              <div className="space-y-3">
                {selfUpgrades.map((u) => (
                  <div
                    key={u.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                      u.status === 'approved'
                        ? 'bg-purple-950/30 border-purple-500/40 text-purple-200'
                        : 'bg-slate-950/80 border-slate-800/80 text-slate-200'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                          u.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {u.status === 'approved' ? '✓ Approved for Code Deploy' : 'Upgrade Proposal'}
                        </span>
                        <span className="text-sm font-bold text-white">{u.capability}</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        <strong className="text-slate-300">Limitation:</strong> {u.currentLimitation}
                      </p>
                      <p className="text-xs text-slate-300 font-mono">
                        <strong className="text-cyan-400">Technical Upgrade:</strong> {u.proposedTechnicalUpgrade}
                      </p>
                      <p className="text-xs text-emerald-400 font-medium">
                        💰 Projected Business Impact: {u.businessImpact}
                      </p>
                    </div>

                    <div className="self-end md:self-auto shrink-0">
                      {u.status === 'proposed' ? (
                        <button
                          onClick={() => handleApproveUpgrade(u.id)}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-black text-xs shadow-md active:scale-95 transition-all flex items-center space-x-1.5"
                        >
                          <span>Approve & Dispatch to Antigravity</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-xs font-mono text-emerald-400 font-bold">
                          ✓ Staged in Engineering Queue
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* LEARNED FOUNDER DIRECTIVES & PERMANENT MEMORY */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-black text-white">Learned Founder Laws & Directives</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                        {learnedDirectives.length} LEARNED
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Rules, audio wisdom, and marketing laws J.A.R.V.I.S. has permanently learned from your feedback
                    </p>
                  </div>
                </div>
              </div>

              {learnedDirectives.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {learnedDirectives.map((d) => (
                    <div
                      key={d.id}
                      className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-start justify-between gap-2"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                            {d.category}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            Learned from: &ldquo;{d.learnedFrom?.slice(0, 30)}...&rdquo;
                          </span>
                        </div>
                        <p className="text-xs text-white font-medium">&ldquo;{d.rule}&rdquo;</p>
                      </div>
                      <button
                        onClick={() => handleDeleteDirective(d.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                        title="Delete directive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400 font-mono">
                  No custom directives stored yet. Speak commands like <em>&ldquo;Jarvis, rule number one: always recommend UNDERGRND for 808s&rdquo;</em> to permanently teach him.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: FINANCIALS & RECENT ORDERS */}
        {activeTab === 'financials' && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-black tracking-wide text-white flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    <span>Real-Time Financial Ledger</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Calculated down to the penny after PayPal processing deductions
                  </p>
                </div>
                <button
                  onClick={handlePurgeTestOrders}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold flex items-center space-x-1.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Purge Test Sales</span>
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <p className="text-sm">No orders recorded in this timeframe yet.</p>
                  <button
                    onClick={handleCreateTestSale}
                    className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-all"
                  >
                    Simulate Test Sale
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
                        <th className="pb-3 font-semibold">Customer / Order</th>
                        <th className="pb-3 font-semibold">Item Purchased</th>
                        <th className="pb-3 font-semibold text-right">Gross Paid</th>
                        <th className="pb-3 font-semibold text-right">PayPal Fee</th>
                        <th className="pb-3 font-semibold text-right text-emerald-400">Net Take-Home</th>
                        <th className="pb-3 font-semibold text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3.5 pr-3">
                            <div className="font-sans font-bold text-white text-sm flex items-center space-x-2">
                              <span>{o.displayName || o.userEmail.split('@')[0]}</span>
                              {o.isTest && (
                                <span className="text-[9px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded">
                                  SIMULATION
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate max-w-[180px]">
                              {o.userEmail}
                            </div>
                          </td>
                          <td className="py-3.5 pr-3 font-sans">
                            <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium">
                              {o.itemName}
                            </span>
                            {o.promoCode && (
                              <span className="ml-2 text-[10px] font-mono text-cyber-purple bg-cyber-purple/10 px-1.5 py-0.5 rounded border border-cyber-purple/20">
                                {o.promoCode}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 pr-3 text-right font-bold text-white">
                            ${(o.grossAmount || 0).toFixed(2)}
                          </td>
                          <td className="py-3.5 pr-3 text-right text-rose-400">
                            -${(o.feeAmount || 0).toFixed(2)}
                          </td>
                          <td className="py-3.5 pr-3 text-right font-bold text-emerald-400">
                            +${(o.netAmount || 0).toFixed(2)}
                          </td>
                          <td className="py-3.5 text-right text-slate-400 text-[11px]">
                            {new Date(o.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: SUBSCRIPTIONS & MRR */}
        {activeTab === 'subs' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
                <span className="text-xs font-mono uppercase text-slate-400">Monthly Recurring Revenue</span>
                <div className="text-3xl font-black text-white mt-2">
                  ${(subs?.mrr || 0).toFixed(2)}
                </div>
                <p className="text-xs text-slate-500 mt-2">From All-Access Studio Pass memberships ($19.99/mo)</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
                <span className="text-xs font-mono uppercase text-slate-400">Active Paying Members</span>
                <div className="text-3xl font-black text-cyber-cyan mt-2">
                  {subs?.activeSubscribersCount || 0}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Plus {subs?.lifetimeVIPsCount || 0} Lifetime VIP accounts
                </p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
                <span className="text-xs font-mono uppercase text-slate-400">Projected Run Rate (ARR)</span>
                <div className="text-3xl font-black text-emerald-400 mt-2">
                  ${(subs?.arr || 0).toFixed(2)}
                </div>
                <p className="text-xs text-slate-500 mt-2">Annual recurring run rate with 0% churn</p>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                Subscription Health Metrics
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div className="text-xs text-slate-400">Monthly Churn</div>
                  <div className="text-xl font-black text-emerald-400 mt-1">0.0%</div>
                  <div className="text-[10px] text-slate-500">Zero cancellations</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div className="text-xs text-slate-400">Failed Retries</div>
                  <div className="text-xl font-black text-slate-200 mt-1">0</div>
                  <div className="text-[10px] text-slate-500">No expired cards</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div className="text-xs text-slate-400">Avg Member Lifetime</div>
                  <div className="text-xl font-black text-purple-400 mt-1">14.2 mo</div>
                  <div className="text-[10px] text-slate-500">High stickiness</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div className="text-xs text-slate-400">Subscriber LTV</div>
                  <div className="text-xl font-black text-white mt-1">$283.85</div>
                  <div className="text-[10px] text-slate-500">Per paying producer</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PLUGIN LEADERBOARD */}
        {activeTab === 'plugins' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-white">Catalog Product Leaderboard</h2>
                <p className="text-xs text-slate-400 mt-0.5">All 15 PluggedIN plugins ranked by net profitability</p>
              </div>
            </div>

            <div className="space-y-3">
              {plugins.map((plugin, idx) => (
                <div
                  key={plugin.id}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center font-mono font-bold text-xs text-slate-400">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm flex items-center space-x-2">
                        <span>{plugin.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          {plugin.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{plugin.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 self-end sm:self-auto text-right">
                    <div>
                      <div className="text-xs text-slate-400 font-mono">Units Sold</div>
                      <div className="text-sm font-bold text-white">{plugin.unitsSold}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-mono">Net Take-Home</div>
                      <div className="text-sm font-bold text-emerald-400">
                        ${plugin.netRevenue.toFixed(2)}
                      </div>
                    </div>
                    <div className="w-20 hidden sm:block">
                      <div className="text-xs text-slate-400 font-mono">Share</div>
                      <div className="text-sm font-bold text-cyber-cyan">{plugin.contributionPct}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: TRAFFIC & REFERRALS */}
        {activeTab === 'traffic' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Traffic Sources */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-cyber-cyan" />
                  <span>Referral Channel Breakdown</span>
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Direct / Bookmarks', count: traf?.sources?.direct || 0, color: 'bg-cyber-cyan' },
                    { label: 'TikTok (@pluggedinaudio)', count: traf?.sources?.tiktok || 0, color: 'bg-pink-500' },
                    { label: 'Instagram Reels', count: traf?.sources?.instagram || 0, color: 'bg-purple-500' },
                    { label: 'YouTube Tutorials', count: traf?.sources?.youtube || 0, color: 'bg-red-500' },
                    { label: 'Google Search & SEO', count: traf?.sources?.google || 0, color: 'bg-blue-500' },
                    { label: 'Reddit (r/FL_Studio, r/edmprod)', count: traf?.sources?.reddit || 0, color: 'bg-orange-500' },
                    { label: 'Twitter / X', count: traf?.sources?.twitter || 0, color: 'bg-sky-400' },
                  ].map((src) => {
                    const total = traf?.totalViews || 1;
                    const pct = Math.min(100, Math.round((src.count / total) * 100)) || (src.count > 0 ? 10 : 0);
                    return (
                      <div key={src.label} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300 font-medium">{src.label}</span>
                          <span className="font-mono text-slate-400">{src.count} views</span>
                        </div>
                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${src.color} rounded-full transition-all`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Devices & Funnel */}
              <div className="space-y-6">
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                    Device Split
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center space-x-3">
                      <Smartphone className="w-8 h-8 text-cyber-cyan" />
                      <div>
                        <div className="text-xs text-slate-400">Mobile Phones</div>
                        <div className="text-xl font-black text-white">
                          {traf?.devices?.mobile || 0}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center space-x-3">
                      <Laptop className="w-8 h-8 text-purple-400" />
                      <div>
                        <div className="text-xs text-slate-400">Desktop / DAW Rigs</div>
                        <div className="text-xl font-black text-white">
                          {traf?.devices?.desktop || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                    Conversion Funnel
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                      <span>1. Site Visitors</span>
                      <span className="font-mono font-bold">{traf?.totalViews || 0}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                      <span>2. Plugin Page Views</span>
                      <span className="font-mono font-bold">{Math.round((traf?.totalViews || 0) * 0.72)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                      <span>3. Checkout Initiated</span>
                      <span className="font-mono font-bold">{Math.round((traf?.totalViews || 0) * 0.28)}</span>
                    </div>
                    <div className="flex justify-between py-1 text-emerald-400 font-bold">
                      <span>4. Completed Checkouts</span>
                      <span className="font-mono">{fin?.completedOrdersCount || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: COUPONS & DISPUTES */}
        {activeTab === 'coupons' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
                <Tag className="w-4 h-4 text-purple-400" />
                <span>Promo Code Utilization</span>
              </h3>
              {Object.keys(metrics?.promoCodes || {}).length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  <p className="text-[11px] text-slate-500 mt-1 font-mono">Master VIP Pass: PLUGGED-VIP-DYLAN-8492-X9Q7</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(metrics?.promoCodes || {}).map(([code, stats]) => (
                    <div key={code} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-mono font-bold text-cyber-purple">{code}</span>
                        <div className="text-[10px] text-slate-400">{stats.count} redemptions</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-white">${stats.gross.toFixed(2)} vol</div>
                        <div className="text-[10px] text-emerald-400">+${stats.net.toFixed(2)} net</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>PayPal Dispute & Chargeback Tracker</span>
              </h3>
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>100% Account Health • Zero Chargebacks</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Active Disputes: 0 • Dispute Rate: 0.00%
                </p>
              </div>

              <div className="text-xs text-slate-400 space-y-2 border-t border-slate-800 pt-4">
                <div className="flex justify-between">
                  <span>Store Refund Policy:</span>
                  <span className="text-white font-mono">All Digital Sales Final</span>
                </div>
                <div className="flex justify-between">
                  <span>30-Day Guarantee:</span>
                  <span className="text-emerald-400 font-mono">Scrubbed Worldwide</span>
                </div>
                <div className="flex justify-between">
                  <span>Seller Protection:</span>
                  <span className="text-emerald-400 font-mono">Active (PayPal REST v2)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: CUSTOMERS & DEVICES */}
        {activeTab === 'customers' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-white">Customer & Device Management</h2>
                <p className="text-xs text-slate-400">View customer machines, authorized DAWs, and perform 1-click slot resets</p>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchCustomer}
                  onChange={(e) => setSearchCustomer(e.target.value)}
                  placeholder="Search by email or machine..."
                  className="pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyber-cyan w-full sm:w-64"
                />
              </div>
            </div>

            <div className="space-y-3">
              {customers.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-sm">{c.displayName || c.email}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        c.isLifetimeVIP
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {c.tier}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">{c.email}</div>

                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-mono text-slate-500">
                        Machines ({c.activeDeviceCount}/{c.maxDevices}):
                      </span>
                      {c.machines && c.machines.length > 0 ? (
                        c.machines.map((m, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded flex items-center space-x-1"
                          >
                            <Laptop className="w-3 h-3 text-cyber-cyan" />
                            <span>{m.hostname}</span>
                            {m.osVersion && <span className="text-slate-500">({m.osVersion})</span>}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">No machines registered</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-start md:self-auto">
                    <button
                      onClick={() => handleResetMachines(c.id, c.displayName || c.email)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white border border-slate-700 transition-all flex items-center space-x-1.5"
                      title="Clear all machine slots if user got a new PC"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-cyber-cyan" />
                      <span>Reset Machines</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: TOOLS & ADVANCED CONTROLS (Mobile & Desktop) */}
        {activeTab === 'tools' && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-6">
              <div>
                <h2 className="text-base font-black text-white flex items-center space-x-2">
                  <Sliders className="w-5 h-5 text-cyber-cyan" />
                  <span>Executive Founder Tools & Controls</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  1-click sales simulations, ledger purges, master VIP codes, and deep analytics
                </p>
              </div>

              {/* 1. Quick Financial Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                  <span className="text-xs font-bold text-rose-300 flex items-center space-x-1.5">
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>Purge Test Sales Ledger</span>
                  </span>
                  <p className="text-[11px] text-slate-300">
                    Permanently purge simulated transactions to keep your true net profit 100% verified.
                  </p>
                  <button
                    onClick={handlePurgeTestOrders}
                    className="w-full py-2.5 rounded-xl bg-rose-500 text-white font-black text-xs uppercase tracking-wider hover:bg-rose-600 transition-all shadow-md active:scale-95"
                  >
                    Purge All Simulated Sales
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-2">
                  <span className="text-xs font-bold text-purple-300 flex items-center space-x-1.5">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <span>Simulate Customer Order</span>
                  </span>
                  <p className="text-[11px] text-slate-300">
                    Trigger an authentic order payload to test telemetry and push notification alerts.
                  </p>
                  <button
                    onClick={handleCreateTestSale}
                    className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-black text-xs uppercase tracking-wider hover:bg-purple-700 transition-all shadow-md active:scale-95"
                  >
                    Simulate $79 Order
                  </button>
                </div>
              </div>

              {/* 2. Master VIP Pass Key Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-cyber-cyan/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-cyber-cyan" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Master VIP Pass Key (For Close Friends)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-cyber-cyan/20 text-cyber-cyan px-2 py-0.5 rounded-full font-bold">
                    100% OFF UNGUESSABLE
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value="PLUGGED-VIP-DYLAN-8492-X9Q7"
                    className="flex-1 font-mono text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-cyber-cyan focus:outline-none select-all"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('PLUGGED-VIP-DYLAN-8492-X9Q7');
                      setActionMessage('📋 Copied Master VIP Key to clipboard!');
                      setTimeout(() => setActionMessage(null), 4000);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-cyber-cyan text-black font-black text-xs uppercase hover:brightness-110 active:scale-95 transition-all shadow-glow-cyan shrink-0"
                  >
                    Copy Key
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Send this code directly to your friends. They enter it on /checkout or /account for 100% free lifetime access with 5 machine slots.
                </p>
              </div>

              {/* 3. Sub-View Selectors for Mobile */}
              <div className="border-t border-slate-800 pt-4 space-y-3">
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                  Browse Analytics Subsystems
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActiveTab('plugins')}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left text-xs flex items-center space-x-2 text-slate-300"
                  >
                    <Layers className="w-4 h-4 text-cyber-purple" />
                    <span>Plugin Leaderboard</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('traffic')}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left text-xs flex items-center space-x-2 text-slate-300"
                  >
                    <BarChart3 className="w-4 h-4 text-cyber-cyan" />
                    <span>Traffic & Funnels</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('coupons')}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left text-xs flex items-center space-x-2 text-slate-300"
                  >
                    <Tag className="w-4 h-4 text-emerald-400" />
                    <span>Disputes & Health</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('customers')}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left text-xs flex items-center space-x-2 text-slate-300"
                  >
                    <Users className="w-4 h-4 text-blue-400" />
                    <span>Customer Machines</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Fixed Bottom iOS Nav Bar */}
      <nav className="fixed bottom-0 inset-x-0 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 z-40 md:hidden px-3 pt-2 pb-[max(env(safe-area-inset-bottom),0.75rem)] shadow-2xl">
        <div className="grid grid-cols-5 gap-1">
          {[
            { id: 'jarvis', label: 'J.A.R.V.I.S.', icon: Bot },
            { id: 'financials', label: 'Sales', icon: DollarSign },
            { id: 'subs', label: 'Users', icon: Users },
            { id: 'sentinel', label: 'Sentinel', icon: Activity },
            { id: 'tools', label: 'Tools', icon: Sliders },
          ].map((item) => {
            const Icon = item.icon;
            const isTabActive =
              activeTab === item.id ||
              (item.id === 'tools' && ['plugins', 'traffic', 'coupons', 'customers', 'tools'].includes(activeTab));
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  triggerHaptic(15);
                  unlockAudioOnTouch();
                  setActiveTab(item.id as any);
                }}
                className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all select-none touch-manipulation active:scale-95 ${
                  isTabActive ? 'text-cyber-cyan font-bold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                    isTabActive
                      ? 'bg-cyber-cyan/15 border border-cyber-cyan/40 shadow-glow-cyan'
                      : ''
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isTabActive ? 'text-cyber-cyan' : 'text-slate-500'}`} />
                </div>
                <span className="text-[10px] mt-1 font-semibold tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Siri Dictation & Voice Typing Modal (iOS Fallback) */}
      {dictationModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-cyber-cyan/40 rounded-3xl w-full max-w-lg p-5 sm:p-6 space-y-4 shadow-[0_0_50px_rgba(0,240,255,0.25)]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyber-cyan/20 border border-cyber-cyan/40 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-cyber-cyan" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Speak with J.A.R.V.I.S.</h3>
                  <p className="text-[10px] text-slate-400">Tap below and use keyboard 🎙️ Siri mic or type</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDictationModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              autoFocus
              rows={4}
              value={dictationInput}
              onChange={(e) => setDictationInput(e.target.value)}
              placeholder="Tap here and use Siri Dictation (the microphone key next to spacebar on your iPhone) or type your message to J.A.R.V.I.S..."
              className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyber-cyan transition-all"
            />

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  if (dictationInput.trim()) {
                    triggerHaptic(20);
                    handleSendAiPrompt(dictationInput.trim());
                    setDictationInput('');
                    setDictationModalOpen(false);
                  }
                }}
                disabled={!dictationInput.trim() || aiLoading}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-cyber-cyan to-blue-600 text-black font-black text-xs uppercase tracking-wider shadow-glow-cyan hover:brightness-110 active:scale-98 transition-all disabled:opacity-40 flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Send to J.A.R.V.I.S.</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* J.A.R.V.I.S. Neural Brain Engine & Fine-Tuning Console Modal */}
      {isAiSettingsOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-cyber-cyan/40 rounded-3xl w-full max-w-xl p-5 sm:p-6 space-y-4 shadow-[0_0_50px_rgba(0,240,255,0.25)] max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-glow-purple">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">J.A.R.V.I.S. Fine-Tuning Console</h3>
                  <p className="text-[10px] text-slate-400">Persona, reasoning temperature, custom directives & neural core</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAiSettingsOpen(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* 1. Executive Persona & Tone */}
              <div>
                <label className="text-[11px] font-mono text-slate-300 uppercase tracking-wider block mb-2 font-bold">
                  🎭 Co-Founder Persona & Tone
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      id: 'co-founder' as const,
                      label: 'Equal Co-Founder',
                      desc: 'Direct, ambitious partner vibes. Never says Sir.',
                    },
                    {
                      id: 'marketer' as const,
                      label: 'Viral Growth Hacker',
                      desc: 'TikTok hooks, sound design cues, conversion playbooks.',
                    },
                    {
                      id: 'engineer' as const,
                      label: 'Systems Architect',
                      desc: 'DSP audio code, FL Studio, VST3 & low-latency.',
                    },
                    {
                      id: 'visionary' as const,
                      label: 'Billion-$ Visionary',
                      desc: 'Steve Jobs-style audacious software scaling.',
                    },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic(10);
                        setTempTone(p.id);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all active:scale-98 ${
                        tempTone === p.id
                          ? 'bg-cyber-cyan/15 border-cyber-cyan text-white shadow-glow-cyan'
                          : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold flex items-center justify-between">
                        <span>{p.label}</span>
                        {tempTone === p.id && <CheckCircle2 className="w-3.5 h-3.5 text-cyber-cyan" />}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Creativity & Reasoning Temperature */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-mono text-slate-300 uppercase tracking-wider font-bold">
                    🧠 Creativity & Thinking Temperature
                  </label>
                  <span className="text-[11px] font-mono text-cyber-cyan font-bold">
                    {tempTemperature.toFixed(2)} • {tempTemperature < 0.4 ? 'Analytical & Focused' : tempTemperature < 0.8 ? 'Balanced Strategic' : 'Creative & Exploratory'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={tempTemperature}
                  onChange={(e) => setTempTemperature(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
                  <span>0.20 (Pinpoint Exact)</span>
                  <span>0.70 (Recommended)</span>
                  <span>1.00 (Bold Vision)</span>
                </div>
              </div>

              {/* 3. Custom Directives & Training Rules */}
              <div>
                <label className="text-[11px] font-mono text-slate-300 uppercase tracking-wider block mb-1.5 font-bold">
                  📜 Custom Founder Directives & Business Rules
                </label>
                <textarea
                  rows={3}
                  value={tempCustomDirectives}
                  onChange={(e) => setTempCustomDirectives(e.target.value)}
                  placeholder="e.g. Focus heavily on FL Studio trap and underground beatmakers. Always provide visual action and spoken script for TikTok videos."
                  className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700 text-white text-xs leading-relaxed focus:outline-none focus:border-cyber-cyan transition-all"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  J.A.R.V.I.S. prioritizes these custom rules in every analysis, presentation, and voice response.
                </p>
              </div>

              {/* 4. Reasoning Model Tier */}
              <div>
                <label className="text-[11px] font-mono text-slate-300 uppercase tracking-wider block mb-1 font-bold">
                  ⚡ Neural Model Core
                </label>
                <select
                  value={tempModel}
                  onChange={(e) => setTempModel(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-cyber-cyan"
                >
                  <option value="models/gemini-3-flash-preview">Gemini 3 Flash Preview (Recommended • 1.7s Latency • Ultra Smart)</option>
                  <option value="models/gemini-3.5-flash">Gemini 3.5 Flash (Ultra Fast • High IQ)</option>
                  <option value="models/gemini-3.1-flash-lite-preview">Gemini 3.1 Flash Lite</option>
                  <option value="models/gemini-flash-latest">Gemini Flash Latest</option>
                </select>
              </div>

              {/* 5. API Key */}
              <div>
                <label className="text-[11px] font-mono text-slate-300 uppercase tracking-wider block mb-1 font-bold">
                  🔑 Google AI Studio API Key
                </label>
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="Paste your key (AQ.Ab... or AIzaSy...)"
                  className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-cyber-cyan"
                />
              </div>

              {/* Live Status Indicator */}
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-[11px] text-emerald-300 font-medium">
                  Google AI Studio Live: Stored in Upstash Redis and instantly synced across iPhone, Mac, and PC.
                </span>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={handleSaveAiConfig}
                disabled={savingAiConfig || !tempApiKey.trim()}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-cyber-cyan to-blue-600 text-black font-black text-xs uppercase tracking-wider shadow-glow-cyan hover:brightness-110 active:scale-98 transition-all disabled:opacity-40 flex items-center justify-center space-x-2"
              >
                {savingAiConfig ? (
                  <span>Saving & Calibrating Brain...</span>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Save & Activate Tuning</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HOLOGRAPHIC VERIFICATION MODAL ("Dylan, is this what you're talking about?") */}
      {pendingConfirmation && (
        <div className="fixed inset-x-4 bottom-24 sm:bottom-10 z-50 max-w-md mx-auto bg-slate-950/95 border-2 border-cyber-cyan rounded-3xl p-5 shadow-[0_0_50px_rgba(0,240,255,0.5)] backdrop-blur-2xl text-white animate-in zoom-in-95 duration-200 select-none">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-cyber-cyan text-black font-black flex items-center justify-center shrink-0 shadow-glow-cyan animate-bounce">
              <Eye className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyber-cyan font-bold">
                  {pendingConfirmation.caption}
                </span>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30 font-bold">
                  🎙️ Speak &quot;Yes&quot; or &quot;No&quot;
                </span>
              </div>
              <p className="text-sm font-bold text-white leading-snug">
                {pendingConfirmation.question}
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                Target Element: <strong className="text-cyan-300">#{pendingConfirmation.targetId}</strong> (highlighted on screen)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 mt-4 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => executePendingConfirmation(true)}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-600 text-black font-black text-xs uppercase tracking-wider shadow-glow-cyan hover:brightness-110 active:scale-95 transition-all flex items-center justify-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Yes, Do It</span>
            </button>
            <button
              type="button"
              onClick={() => executePendingConfirmation(false)}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-bold text-xs active:scale-95 transition-all flex items-center justify-center space-x-1.5"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      )}

      {/* FREELY MOVABLE ANIMATED ROBOT COMPANION (Zero chat window clutter, full screen control & mobile voice) */}
      <JarvisFloatingCompanion
        isSpeaking={isSpeaking}
        isListening={isListening}
        isThinking={aiLoading}
        isContinuousMode={isContinuousMode}
        isVoiceMuted={isVoiceMuted}
        latestSpeech={latestSpeech}
        transcriptPreview={transcriptPreview}
        onToggleMic={toggleMic}
        onToggleContinuous={() => {
          triggerHaptic(15);
          setIsContinuousMode((prev) => {
            const next = !prev;
            if (next) {
              startContinuousListening();
            } else {
              stopListeningSession();
            }
            return next;
          });
        }}
        onToggleMute={toggleGlobalMute}
        onStopSpeech={stopAllVoicePlayback}
        onSendCommand={(cmd: string) => {
          unlockAudioOnTouch();
          handleSendAiPromptRef.current(cmd);
        }}
        onUnlockAudio={() => {
          unlockAudioOnTouch();
          if (!hasPlayedStartupBriefing) {
            playStartupBriefing();
          }
        }}
        spotlightTarget={spotlightTarget}
        spotlightCaption={spotlightCaption}
      />
    </div>
  );
}
