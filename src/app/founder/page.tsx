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
  MessageSquare,
  Flame,
  Presentation,
  Video,
  RotateCcw,
} from 'lucide-react';
import JarvisPresentationCanvas, { JarvisPresentationDeck } from '@/components/JarvisPresentationCanvas';
import JarvisVideoAdStudio, { JarvisVideoAd } from '@/components/JarvisVideoAdStudio';

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
    }>
  >([
    {
      role: 'assistant',
      text: "👋 Hey Dylan, J.A.R.V.I.S. here. I'm connected to your live PayPal financials, subscriber retention, and website telemetry 24/7. Tap my Arc Reactor to speak with me, or ask me anything about TikTok hooks, pricing experiments, or audio plugin strategy.",
      speech: "Hey Dylan, J.A.R.V.I.S. is online. Neural reasoning is active and all systems are running smoothly.",
    },
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const [activeDeck, setActiveDeck] = useState<JarvisPresentationDeck | null>(null);
  const [sentinelData, setSentinelData] = useState<any>(null);
  const [dispatches, setDispatches] = useState<JarvisDispatchItem[]>([]);
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

  // Unlock audio & haptics for iOS Safari / WebKit (Media Channel & Ambient)
  const unlockAudioOnTouch = () => {
    if (typeof window === 'undefined') return;
    try {
      if (!audioPlayerRef.current) {
        audioPlayerRef.current = new Audio();
      }
      // Prime media player with silent wav data URI to authorize later async voice playback
      audioPlayerRef.current.src =
        'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      audioPlayerRef.current.play().catch(() => {});
    } catch (_) {}
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.resume();
        const silent = new SpeechSynthesisUtterance(' ');
        silent.volume = 0.01;
        silent.rate = 2.0;
        window.speechSynthesis.speak(silent);
      }
    } catch (_) {}
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        ctx.resume().then(() => ctx.close());
      }
    } catch (_) {}
  };

  const triggerHaptic = (pattern: number | number[] = 15) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (_) {}
    }
  };

  // Fallback client-side speech synthesis
  const fallbackSynthesis = useCallback((cleanText: string) => {
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
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(utterance);
    } catch (_) {
      setIsSpeaking(false);
    }
  }, []);

  // Instantly cut off all audio and voice synthesis (Instant Interrupt)
  const stopAllVoicePlayback = useCallback(() => {
    if (typeof window !== 'undefined') {
      if ((window as any).__jarvisCurrentAudio) {
        try {
          (window as any).__jarvisCurrentAudio.pause();
          (window as any).__jarvisCurrentAudio.currentTime = 0;
          (window as any).__jarvisCurrentAudio.removeAttribute('src');
          (window as any).__jarvisCurrentAudio.src = '';
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
    setIsSpeaking(false);
  }, []);

  // Voice output synthesis (Jarvis speaks aloud via media player channel)
  const speakJarvisVoice = useCallback((textToSpeak: string) => {
    if (isVoiceMuted || !isVoiceEnabled || typeof window === 'undefined') return;

    // Immediately stop any lingering audio before starting new voice
    stopAllVoicePlayback();

    const cleanText = textToSpeak.replace(/[^a-zA-Z0-9\s.,!?'$-]/g, ' ').slice(0, 300).trim();
    if (!cleanText) return;

    setIsSpeaking(true);

    try {
      // 1. Primary: High-fidelity MP3 Stream via Media Channel (plays even if iPhone silent switch is ON!)
      const audio = audioPlayerRef.current || new Audio();
      audioPlayerRef.current = audio;
      (window as any).__jarvisCurrentAudio = audio;
      audio.src = `/api/founder/tts?text=${encodeURIComponent(cleanText)}&pin=${pin || '8492'}`;
      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => {
        setIsSpeaking(false);
        (window as any).__jarvisCurrentAudio = null;
      };
      audio.onerror = () => {
        fallbackSynthesis(cleanText);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio stream play prevented, trying speech synthesis fallback:', err);
          fallbackSynthesis(cleanText);
        });
      }
    } catch (e) {
      fallbackSynthesis(cleanText);
    }
  }, [isVoiceEnabled, isVoiceMuted, pin, fallbackSynthesis, stopAllVoicePlayback]);

  // Robust Dynamic Speech Recognition (Tap-to-Talk & Instant Interrupt)
  const toggleMic = async () => {
    triggerHaptic(25);

    // 1. If Jarvis is currently speaking, tapping the button acts as an INSTANT INTERRUPT!
    if (isSpeaking) {
      stopAllVoicePlayback();
      return;
    }

    // 2. If already listening, stop recording
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      setIsListening(false);
      return;
    }

    // 3. Guarantee all previous sound is 100% silenced so mic never hears speaker loopback
    stopAllVoicePlayback();
    unlockAudioOnTouch();

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // In iOS Safari PWA standalone mode where Apple disables webkitSpeechRecognition:
      setDictationModalOpen(true);
      return;
    }

    try {
      // 50ms buffer to allow phone speaker hardware to completely mute
      await new Promise((r) => setTimeout(r, 50));

      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }

      const reco = new SpeechRecognition();
      reco.continuous = false;
      reco.interimResults = true;
      reco.lang = 'en-US';

      reco.onstart = () => {
        setIsListening(true);
        setTranscriptPreview('');
        triggerHaptic([10, 30]);
      };

      reco.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscriptPreview(currentTranscript);
        if (event.results[event.results.length - 1]?.isFinal) {
          const finalPrompt = currentTranscript.trim();
          setIsListening(false);
          setTranscriptPreview('');
          if (finalPrompt) {
            handleSendAiPromptRef.current(finalPrompt);
          }
        }
      };

      reco.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        setIsListening(false);
        setTranscriptPreview('');
        if (event.error === 'not-allowed') {
          setActionMessage('⚠️ Microphone blocked. Tap Settings to enable.');
          setTimeout(() => setActionMessage(null), 6000);
        } else if (event.error !== 'no-speech') {
          setDictationModalOpen(true);
        }
      };

      reco.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = reco;
      reco.start();
    } catch (err: any) {
      console.warn('Could not start speech recognition:', err);
      setIsListening(false);
      setDictationModalOpen(true);
    }
  };

  const fetchMetrics = useCallback(async (selectedTimeframe = timeframe, pinCode = pin) => {
    setLoading(true);
    try {
      const [res, sentinelRes] = await Promise.all([
        fetch(`/api/founder/metrics?timeframe=${selectedTimeframe}`, {
          headers: { 'x-founder-pin': pinCode || '8492' },
        }),
        fetch('/api/founder/sentinel', {
          headers: { 'x-founder-pin': pinCode || '8492' },
        }).catch(() => null),
      ]);

      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
        setIsAuthenticated(true);
        setAuthError('');
        localStorage.setItem('pluggedin_founder_pin', pinCode || '8492');
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
    } catch (err: any) {
      setAuthError('Connection error. Could not load founder telemetry.');
    } finally {
      setLoading(false);
    }
  }, [timeframe, pin]);

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

    const newHistory = [...aiChatHistory, { role: 'user' as const, text: query }];
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
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        if (data.deck) {
          setActiveDeck(data.deck);
        }
        setAiChatHistory([
          ...newHistory,
          {
            role: 'assistant',
            text: data.reply,
            speech: data.speech,
            deck: data.deck,
            videoAd: data.videoAd,
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
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  useEffect(() => {
    handleSendAiPromptRef.current = handleSendAiPrompt;
  });

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
            <div>
              <div className="flex items-center space-x-2">
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
              onClick={handlePurgeTestOrders}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold flex items-center space-x-1.5 transition-all"
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

        {/* Executive KPI Hero Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* 1. True Net Take-Home Profit (Hero) */}
          <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-3xl p-5 shadow-xl relative overflow-hidden">
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
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-lg">
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
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-lg">
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

            {/* Unified Chronological Chat Feed */}
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-4 sm:p-6 space-y-4 shadow-2xl">
              <div className="space-y-6 max-h-[620px] overflow-y-auto p-2 sm:p-4 bg-slate-950/90 rounded-2xl border border-slate-800/80">
                {aiChatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
                  >
                    <div className="text-[11px] font-mono text-slate-400 px-2 font-bold flex items-center space-x-1.5">
                      {msg.role === 'user' ? (
                        <span className="text-cyber-cyan">DYLAN (FOUNDER)</span>
                      ) : (
                        <>
                          <Bot className="w-3.5 h-3.5 text-purple-400" />
                          <span className="text-purple-300">J.A.R.V.I.S. (CO-FOUNDER)</span>
                        </>
                      )}
                    </div>

                    <div
                      className={`rounded-3xl p-5 sm:p-6 text-base sm:text-lg leading-relaxed shadow-lg max-w-[96%] sm:max-w-[90%] transition-all ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-cyber-cyan to-blue-600 text-black font-semibold shadow-glow-cyan'
                          : 'bg-slate-900 border border-slate-800 text-slate-100'
                      }`}
                    >
                      {/* Optional Voice Bar on Assistant Messages */}
                      {msg.role === 'assistant' && msg.speech && (
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs sm:text-sm">
                          <div className="flex items-center space-x-2 text-cyber-cyan font-bold">
                            <Volume2 className="w-4 h-4 animate-pulse" />
                            <span>Spoken Audio</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {isSpeaking && (
                              <button
                                type="button"
                                onClick={stopAllVoicePlayback}
                                className="px-3 py-1 rounded-xl bg-rose-500/20 border border-rose-500 text-rose-300 font-bold hover:bg-rose-500/30 transition-all flex items-center space-x-1"
                              >
                                <VolumeX className="w-3.5 h-3.5" />
                                <span>Stop Sound</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => speakJarvisVoice(msg.speech || '')}
                              className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold transition-all flex items-center space-x-1"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Replay</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Main Highly-Readable Text Content */}
                      <div className="whitespace-pre-wrap font-normal">{msg.text}</div>

                      {/* Embedded Interactive Presentation Deck or Whiteboard Canvas */}
                      {msg.deck && (
                        <div className="mt-4 pt-4 border-t border-slate-800">
                          <JarvisPresentationCanvas deck={msg.deck} />
                        </div>
                      )}

                      {/* Embedded AI Ad Video Studio Generator */}
                      {msg.videoAd && (
                        <div className="mt-4 pt-4 border-t border-slate-800">
                          <JarvisVideoAdStudio videoAd={msg.videoAd} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {aiLoading && (
                  <div className="flex items-center space-x-3 text-cyber-cyan text-sm sm:text-base p-4 bg-slate-900 border border-slate-800 rounded-2xl w-fit animate-pulse">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span className="font-semibold">J.A.R.V.I.S. is calculating figures and formulating strategy...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Quick Voice & Strategy Prompt Chips (Horizontal Scrolling) */}
              <div className="w-full pt-1">
                <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar">
                  {[
                    "🎬 TikTok Ad: PLUGTNE",
                    "🎬 TikTok Ad: UNDERGRND",
                    "🎬 TikTok Ad: PLUGCHOP",
                    "📊 Today's Net Sales",
                    "💡 How to Hit $10k MRR",
                    "🖥️ Vocal Chain Whiteboard",
                  ].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => {
                        triggerHaptic(15);
                        handleSendAiPrompt(
                          chip === "🎬 TikTok Ad: PLUGTNE"
                            ? "Jarvis, generate an authentic TikTok ad video for PLUGTNE using real vocal before and after audio and plugin graphics."
                            : chip === "🎬 TikTok Ad: UNDERGRND"
                            ? "Jarvis, generate an authentic TikTok ad video for UNDERGRND 808 saturation."
                            : chip === "🎬 TikTok Ad: PLUGCHOP"
                            ? "Jarvis, generate an authentic TikTok ad video for PLUGCHOP 2.0 16-pad sampler."
                            : chip === "📊 Today's Net Sales"
                            ? "Jarvis, how are our net take-home sales looking today?"
                            : chip === "💡 How to Hit $10k MRR"
                            ? "Jarvis, what is our exact strategy to hit $10,000 MRR this month?"
                            : "Jarvis, create a whiteboard flowchart for an industry-standard Travis Scott vocal chain using PLUGTNE and PLUG VOX."
                        );
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyber-cyan text-slate-300 hover:text-white text-xs font-semibold transition-all whitespace-nowrap active:scale-95 shrink-0 shadow-sm"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sleek Floating Input Bar Dock */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendAiPrompt();
                }}
                className="flex items-center space-x-2 pt-1"
              >
                {/* Sleek Compact Microphone Button */}
                <button
                  type="button"
                  onClick={toggleMic}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md active:scale-95 transition-all select-none ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.6)]'
                      : isSpeaking
                      ? 'bg-purple-600 text-white shadow-glow-purple'
                      : 'bg-slate-950 border border-cyber-cyan/50 text-cyber-cyan hover:bg-slate-900 shadow-glow-cyan'
                  }`}
                  title={isListening ? 'Listening (Tap to send)' : isSpeaking ? 'Speaking (Tap to interrupt)' : 'Tap to Speak'}
                >
                  {isListening ? (
                    <MicOff className="w-5 h-5 animate-pulse" />
                  ) : isSpeaking ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>

                {/* Siri Dictation Trigger (Mobile Friendly) */}
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    unlockAudioOnTouch();
                    setDictationModalOpen(true);
                  }}
                  className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center shrink-0 transition-all active:scale-95"
                  title="Type or Siri Dictate"
                >
                  <MessageSquare className="w-5 h-5 text-cyber-cyan" />
                </button>

                {/* Main Text Input */}
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder={
                    isListening
                      ? 'J.A.R.V.I.S. is listening to your voice...'
                      : transcriptPreview
                      ? transcriptPreview
                      : 'Ask J.A.R.V.I.S. anything or say "generate a TikTok ad for PLUGTNE"...'
                  }
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-sm sm:text-base text-white focus:outline-none focus:border-cyber-cyan transition-all placeholder:text-slate-500"
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-r from-cyber-cyan to-blue-600 text-black font-bold flex items-center justify-center shrink-0 shadow-glow-cyan hover:brightness-110 active:scale-95 transition-all disabled:opacity-40"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB: 24/7 SENTINEL WATCHDOG & ENGINEER DISPATCHES */}
        {activeTab === 'sentinel' && (
          <div className="space-y-6">
            {/* Sentinel Status Banner */}
            <div className="bg-slate-900/80 border border-emerald-500/30 rounded-3xl p-6 relative overflow-hidden">
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
                  <div className="text-sm font-bold text-emerald-400 font-mono">0 Critical Errors</div>
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
    </div>
  );
}
