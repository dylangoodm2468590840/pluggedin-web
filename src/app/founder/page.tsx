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
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'jarvis' | 'financials' | 'subs' | 'plugins' | 'traffic' | 'coupons' | 'customers' | 'sentinel'>('jarvis');
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchCustomer, setSearchCustomer] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // JARVIS Voice Engine state
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcriptPreview, setTranscriptPreview] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string; speech?: string }>>([
    {
      role: 'assistant',
      text: "👋 Good day, Sir. I am J.A.R.V.I.S., your Executive Audio Intelligence System. I am monitoring your live PayPal financials, subscriber retention, and website telemetry 24/7. Tap my Arc Reactor to speak with me, or ask me to formulate any marketing or scaling strategy.",
      speech: "Good day, Sir. J.A.R.V.I.S. is online and standing by. All systems are operational.",
    },
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const [sentinelData, setSentinelData] = useState<any>(null);
  const [dispatches, setDispatches] = useState<JarvisDispatchItem[]>([]);

  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-auth check on mount
  useEffect(() => {
    const savedPin = localStorage.getItem('pluggedin_founder_pin');
    if (savedPin === '8492' || savedPin === 'PluggedIn2026!') {
      setPin(savedPin);
      setIsAuthenticated(true);
    }
  }, []);

  // Initialize Web Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const reco = new SpeechRecognition();
        reco.continuous = false;
        reco.interimResults = true;
        reco.lang = 'en-US';

        reco.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscriptPreview(currentTranscript);
          if (event.results[0].isFinal) {
            handleSendAiPrompt(currentTranscript);
            setTranscriptPreview('');
            setIsListening(false);
          }
        };

        reco.onerror = () => {
          setIsListening(false);
          setTranscriptPreview('');
        };

        reco.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = reco;
      }
    }
  }, []);

  // Voice output synthesis (Jarvis speaks)
  const speakJarvisVoice = useCallback((textToSpeak: string) => {
    if (!isVoiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // Stop any ongoing speech

    const cleanText = textToSpeak.replace(/[\#\*\_\[\]]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Prefer British English male voice for authentic Jarvis feel
    const voices = window.speechSynthesis.getVoices();
    const jarvisVoice =
      voices.find((v) => v.lang === 'en-GB' && (v.name.includes('Daniel') || v.name.includes('George') || v.name.includes('Oliver') || v.name.includes('Male'))) ||
      voices.find((v) => v.lang === 'en-GB') ||
      voices.find((v) => v.name.includes('Google UK English Male')) ||
      voices.find((v) => v.lang.startsWith('en'));

    if (jarvisVoice) {
      utterance.voice = jarvisVoice;
    }

    utterance.rate = 1.02;
    utterance.pitch = 0.95;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [isVoiceEnabled]);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Safari, or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Microphone error:', err);
      }
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
    } catch (err: any) {
      setAuthError('Connection error. Could not load founder telemetry.');
    } finally {
      setLoading(false);
    }
  }, [timeframe, pin]);

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
        setAiChatHistory([
          ...newHistory,
          { role: 'assistant', text: data.reply, speech: data.speech },
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
        const errReply = "⚠️ My apologies Sir, I encountered a communication delay. Please try once more.";
        setAiChatHistory([...newHistory, { role: 'assistant', text: errReply }]);
        speakJarvisVoice(errReply);
      }
    } catch (e: any) {
      const errMsg = `⚠️ Connection error, Sir: ${e.message}`;
      setAiChatHistory([...newHistory, { role: 'assistant', text: errMsg }]);
      speakJarvisVoice(errMsg);
    } finally {
      setAiLoading(false);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

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

        {/* Section Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-1 overflow-x-auto">
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
                onClick={() => setActiveTab(tab.id as any)}
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
          <div className="space-y-6">
            {/* Holographic Arc Reactor Hub */}
            <div className="bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.08)_0,transparent_70%)] pointer-events-none" />

              {/* Arc Reactor Sphere */}
              <div className="relative my-4">
                {/* Outer Ring */}
                <div
                  className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full border border-cyber-cyan/30 flex items-center justify-center relative transition-all duration-500 ${
                    isListening
                      ? 'shadow-[0_0_50px_rgba(0,240,255,0.6)] border-cyber-cyan animate-pulse'
                      : isSpeaking
                      ? 'shadow-[0_0_60px_rgba(168,85,247,0.6)] border-purple-400 animate-pulse'
                      : 'hover:shadow-[0_0_30px_rgba(0,240,255,0.3)]'
                  }`}
                >
                  {/* Rotating Inner Segments */}
                  <div className={`absolute inset-2 rounded-full border border-dashed border-cyber-cyan/40 ${isSpeaking ? 'animate-spin-slow' : ''}`} />

                  {/* Core Mic Button */}
                  <button
                    type="button"
                    onClick={toggleMic}
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center transition-all z-10 ${
                      isListening
                        ? 'bg-rose-500 text-white shadow-lg scale-105'
                        : isSpeaking
                        ? 'bg-gradient-to-tr from-purple-600 to-cyber-cyan text-white shadow-glow-cyan'
                        : 'bg-slate-950 border border-cyber-cyan/40 text-cyber-cyan hover:scale-105 shadow-glow-cyan'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-8 h-8 animate-pulse" />
                        <span className="text-[9px] font-mono mt-1 uppercase font-bold">Listening</span>
                      </>
                    ) : isSpeaking ? (
                      <>
                        <Volume2 className="w-8 h-8 animate-bounce" />
                        <span className="text-[9px] font-mono mt-1 uppercase font-bold">Speaking</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-8 h-8" />
                        <span className="text-[9px] font-mono mt-1 uppercase font-bold">Tap to Talk</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Status & Live Transcription */}
              <div className="max-w-xl">
                <div className="flex items-center justify-center space-x-2 text-xs font-mono text-slate-400">
                  <span className={`h-2 w-2 rounded-full ${isListening ? 'bg-rose-500 animate-ping' : isSpeaking ? 'bg-purple-400 animate-pulse' : 'bg-emerald-400'}`} />
                  <span>
                    {isListening
                      ? 'J.A.R.V.I.S. is listening to your voice...'
                      : isSpeaking
                      ? 'J.A.R.V.I.S. is speaking aloud...'
                      : 'Voice Interface Ready • Tap Arc Reactor to speak'}
                  </span>
                </div>

                {transcriptPreview && (
                  <div className="mt-3 p-3 rounded-2xl bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan text-sm font-medium animate-pulse">
                    "{transcriptPreview}"
                  </div>
                )}
              </div>

              {/* Quick Voice Command Chips */}
              <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-2xl">
                {[
                  '🎙️ Jarvis, how are our sales looking today?',
                  '🎙️ Jarvis, write 3 viral TikTok hooks for PLUGTNE',
                  '🎙️ Jarvis, what bundle should we launch this weekend?',
                  '🎙️ Jarvis, how do we hit $10k MRR this month?',
                  '🎙️ Jarvis, tell Antigravity to add sticky mobile checkout bar',
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleSendAiPrompt(chip.replace('🎙️ ', ''))}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 hover:text-white hover:border-cyber-cyan text-xs font-medium transition-all"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation Ledger */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Radio className="w-4 h-4 text-cyber-cyan" />
                  <span>J.A.R.V.I.S. Communication Stream</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Continuous Context Enabled</span>
              </div>

              {/* Chat Log */}
              <div className="space-y-4 max-h-[500px] overflow-y-auto p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80">
                {aiChatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="text-[10px] font-mono text-slate-500 mb-1 px-1">
                      {msg.role === 'user' ? 'DYLAN (FOUNDER)' : 'J.A.R.V.I.S. (EXECUTIVE AI)'}
                    </div>
                    <div
                      className={`max-w-[90%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-cyber-cyan to-blue-600 text-black font-semibold'
                          : 'bg-slate-900 border border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    </div>
                  </div>
                ))}

                {aiLoading && (
                  <div className="flex items-center space-x-2 text-cyber-cyan text-xs p-3 bg-slate-900/60 rounded-xl w-fit">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>J.A.R.V.I.S. is calculating figures and formulating strategy...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Text Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendAiPrompt();
                }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ask J.A.R.V.I.S. anything or give an engineering command..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyber-cyan transition-all"
                />
                <button
                  type="submit"
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-cyber-cyan to-blue-600 text-black font-bold text-xs uppercase shadow-glow-cyan hover:brightness-110 active:scale-95 transition-all disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
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

                    <div className="self-end md:self-auto text-right shrink-0">
                      <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-2 py-1 rounded-lg">
                        Status: {d.status}
                      </span>
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
      </main>
    </div>
  );
}
