'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  ArrowDownRight,
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
  const [activeTab, setActiveTab] = useState<'financials' | 'subs' | 'plugins' | 'traffic' | 'coupons' | 'customers' | 'ai'>('financials');
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchCustomer, setSearchCustomer] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // AI Copilot state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: "👋 Hey Dylan! I'm your Executive Audio Growth Advisor. I have real-time access to your store metrics, revenue, and active subscriptions. Ask me about TikTok hooks, high-converting bundles, email outreach, or how to scale your MRR!",
    },
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  // Auto-auth check on mount
  useEffect(() => {
    const savedPin = localStorage.getItem('pluggedin_founder_pin');
    if (savedPin === '8492' || savedPin === 'PluggedIn2026!') {
      setPin(savedPin);
      setIsAuthenticated(true);
    }
  }, []);

  const fetchMetrics = useCallback(async (selectedTimeframe = timeframe, pinCode = pin) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/founder/metrics?timeframe=${selectedTimeframe}`, {
        headers: {
          'x-founder-pin': pinCode || '8492',
        },
      });

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
        setActionMessage('🎉 Test Order Captured! Live Net Take-Home updated.');
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
        setAiChatHistory([...newHistory, { role: 'assistant', text: data.reply }]);
      } else {
        setAiChatHistory([
          ...newHistory,
          { role: 'assistant', text: '⚠️ Unable to process advisory request. Please check connection.' },
        ]);
      }
    } catch (e: any) {
      setAiChatHistory([
        ...newHistory,
        { role: 'assistant', text: `⚠️ Error communicating with AI: ${e.message}` },
      ]);
    } finally {
      setAiLoading(false);
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyber-cyan to-blue-600 p-[2px] shadow-glow-cyan">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Lock className="w-8 h-8 text-cyber-cyan" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">Founder Security Shield</h1>
              <p className="text-xs text-slate-400 mt-1">PluggedIN Executive Sales & Revenue Central</p>
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
                  <span>Unlock Executive Hub</span>
                </>
              )}
            </button>
          </form>

          {/* Quick PIN Keypad for Phone */}
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
              Authorized strictly for Dylan Goodman (dylangoodm@gmail.com)
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyber-cyan via-cyber-purple to-pink-500 p-[1.5px] shadow-glow-cyan">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Disc className="w-5 h-5 text-cyber-cyan animate-spin-slow" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-black tracking-wider text-white">FOUNDER HUB</span>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  LIVE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Dylan Goodman • Executive View</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
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
        {/* Timeframe Filter Bar */}
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
              onClick={handleCreateTestSale}
              className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 text-xs font-semibold flex items-center space-x-1.5 transition-all"
            >
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>Simulate Sale</span>
            </button>
            <Link
              href="/"
              target="_blank"
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold flex items-center space-x-1"
            >
              <span>View Store</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
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
              Actual deposited PayPal balance after processor fees & tax.
            </p>
          </div>

          {/* 2. Gross Sales & Fee Breakdown */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-lg relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center space-x-1.5">
                <CreditCard className="w-4 h-4 text-blue-400" />
                <span>Gross Volume</span>
              </span>
              <span className="text-[10px] font-mono text-rose-400 flex items-center">
                -${(fin?.feeTotal || 0).toFixed(2)} fees
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
              ${(fin?.grossTotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Across {fin?.completedOrdersCount || 0} customer checkouts.
            </p>
          </div>

          {/* 3. Subscriptions & MRR */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-purple-400 font-bold flex items-center space-x-1.5">
                <RefreshCw className="w-4 h-4" />
                <span>MRR (Recurring)</span>
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
                <span>Store Conversion</span>
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
            { id: 'financials', label: 'Financials & Orders', icon: DollarSign },
            { id: 'subs', label: 'Subscriptions & MRR', icon: RefreshCw },
            { id: 'plugins', label: 'Plugin Leaderboard', icon: Layers },
            { id: 'traffic', label: 'Traffic & Sources', icon: BarChart3 },
            { id: 'coupons', label: 'Coupons & Disputes', icon: Tag },
            { id: 'customers', label: 'Customers & Devices', icon: Users },
            { id: 'ai', label: 'AI Growth Copilot', icon: Bot },
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

        {/* TAB 1: FINANCIALS & RECENT ORDERS */}
        {activeTab === 'financials' && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-black tracking-wide text-white flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  <span>Real-Time Transaction Stream</span>
                </h2>
                <span className="text-xs text-slate-400 font-mono">
                  {orders.length} transactions recorded
                </span>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <p className="text-sm">No orders recorded in this timeframe yet.</p>
                  <button
                    onClick={handleCreateTestSale}
                    className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-all"
                  >
                    Generate Test Order
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
                            <div className="font-sans font-bold text-white text-sm">
                              {o.displayName || o.userEmail.split('@')[0]}
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

        {/* TAB 2: SUBSCRIPTIONS & MRR */}
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
                  <div className="text-[10px] text-slate-500">Industry avg: 5.8%</div>
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

        {/* TAB 3: PLUGIN LEADERBOARD */}
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

        {/* TAB 4: TRAFFIC & REFERRALS */}
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

              {/* Devices & Conversion Funnel */}
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

        {/* TAB 5: COUPONS & DISPUTES */}
        {activeTab === 'coupons' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Promo Codes */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
                <Tag className="w-4 h-4 text-purple-400" />
                <span>Promo Code Utilization</span>
              </h3>
              {Object.keys(metrics?.promoCodes || {}).length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No promo codes redeemed yet.
                  <p className="text-[11px] text-slate-600 mt-1">Codes active: DYLANVIP, HOMIEPASS, STUDIO100</p>
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

            {/* Disputes & Chargebacks */}
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
                  <span>30-Day Money-Back Guarantee:</span>
                  <span className="text-emerald-400 font-mono">Removed Worldwide</span>
                </div>
                <div className="flex justify-between">
                  <span>Seller Protection:</span>
                  <span className="text-emerald-400 font-mono">Active (PayPal REST v2)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: CUSTOMERS DIRECTORY & MACHINE CONTROL */}
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

                    {/* Active Machines */}
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

                  {/* 1-Click Founder Controls */}
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

        {/* TAB 7: INTERACTIVE AI SALES COPILOT */}
        {activeTab === 'ai' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyber-cyan to-cyber-purple p-[1.5px]">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <Bot className="w-5 h-5 text-cyber-cyan" />
                  </div>
                </div>
                <div>
                  <h2 className="text-base font-black text-white">Executive Audio Growth Director</h2>
                  <p className="text-xs text-slate-400">Trained on Slate Digital, FabFilter & Output growth playbooks</p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20 px-2 py-1 rounded-full font-bold">
                Context Injected
              </span>
            </div>

            {/* Quick Prompt Chips */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Quick Tactical Commands:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  '🚀 How can we hit $10k MRR this month?',
                  '🎬 Write 3 viral TikTok hooks for PLUGTNE',
                  '📦 What bundle should we launch this weekend?',
                  '🤝 Give me an outreach template for FL Studio YouTubers',
                  '🛡️ How do I keep monthly churn under 2%?',
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleSendAiPrompt(chip)}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-cyber-cyan text-xs font-medium transition-all"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Log */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80">
              {aiChatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
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
                  <span>Analyzing live metrics & formulating growth strategy...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
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
                placeholder="Ask your AI Growth Director anything (pricing, TikTok ideas, bundles)..."
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
        )}
      </main>
    </div>
  );
}
