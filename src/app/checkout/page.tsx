'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Lock,
  Mail,
  User,
  CreditCard,
  Tag,
  Check,
  Laptop,
} from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { ALL_ACCESS_MONTHLY, ALL_ACCESS_ANNUAL, TOTAL_CATALOG_VALUE, PLUGINS_DATA } from '../../data/plugins';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';

export default function CheckoutPage() {
  const router = useRouter();

  const [plan, setPlan] = useState<'monthly' | 'annual'>('monthly');
  const [pluginId, setPluginId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  // Auth fields if user not logged in
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  // Promo code
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountPercent: number;
    message: string;
  } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Checkout process
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const planParam = params.get('plan');
      const pluginParam = params.get('plugin');

      if (pluginParam) {
        setPluginId(pluginParam);
      } else if (planParam === 'annual') {
        setPlan('annual');
      }

      const codeParam = params.get('code') || params.get('promo');
      if (codeParam) {
        setPromoCode(codeParam.toUpperCase());
        fetch('/api/promo/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: codeParam.trim() }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setAppliedPromo({
                code: data.code,
                discountPercent: data.discountPercent || 100,
                message: data.message,
              });
            }
          })
          .catch(() => {});
      }

      // Check active user
      fetch('/api/auth/me')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setCurrentUser(data.user);
            setEmail(data.user.email);
            setDisplayName(data.user.displayName);
          }
        })
        .catch(() => {});
    }
  }, []);

  const selectedPlugin = pluginId ? PLUGINS_DATA.find((p) => p.id === pluginId) : null;

  const basePrice = selectedPlugin
    ? selectedPlugin.salePrice
    : plan === 'monthly'
    ? ALL_ACCESS_MONTHLY
    : ALL_ACCESS_ANNUAL;

  const discountAmount = appliedPromo
    ? Math.round((basePrice * appliedPromo.discountPercent) / 100)
    : 0;
  const finalPrice = Math.max(0, basePrice - discountAmount);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    setPromoLoading(true);
    setPromoError(null);

    try {
      const res = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setAppliedPromo({
          code: data.code,
          discountPercent: data.discountPercent || 100,
          message: data.message,
        });
      } else {
        setPromoError(data.error || 'Invalid promo code.');
      }
    } catch {
      setPromoError('Network error applying promo code.');
    } finally {
      setPromoLoading(false);
    }
  };

  // Handler for 100% Free VIP promo checkout
  const handleFreeCheckout = async () => {
    setCheckoutError(null);
    setSubmitting(true);

    try {
      const targetEmail = (currentUser?.email || email).trim();
      if (!currentUser && (!targetEmail || !password)) {
        setCheckoutError('Please enter your email and choose a password on the left to claim your pass.');
        setSubmitting(false);
        return;
      }

      const activeCode = appliedPromo?.code || promoCode.trim() || 'DYLANVIP';

      const claimRes = await fetch('/api/promo/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: activeCode,
          email: targetEmail,
          password: password || undefined,
          displayName: displayName.trim() || currentUser?.displayName || undefined,
          pluginId,
        }),
      });

      const claimData = await claimRes.json();

      if (!claimRes.ok || !claimData.success) {
        setCheckoutError(claimData.error || 'Failed to claim VIP promo pass.');
        setSubmitting(false);
        return;
      }

      setCurrentUser(claimData.user);
      if (typeof window !== 'undefined') {
        localStorage.setItem('pluggedin_web_user', JSON.stringify(claimData.user));
      }
      setCheckoutSuccess(true);
      setTimeout(() => {
        router.push('/account?checkout=success');
      }, 1200);
    } catch (err: any) {
      setCheckoutError(err.message || 'Checkout failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[75vh]">
      {appliedPromo ? (
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 inline-flex items-center space-x-1.5 shadow-glow-cyan">
            <Sparkles className="w-3.5 h-3.5" />
            <span>VIP PASS UNLOCKED • 100% FREE FOREVER</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-3">
            Claim Your Lifetime VIP Studio Pass
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Full All-Access license with 5 computer authorizations. Enter your credentials on the left to claim immediately!
          </p>
        </div>
      ) : (
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30">
            STUDIO CHECKOUT
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-3">
            {selectedPlugin
              ? `Claim Perpetual License: ${selectedPlugin.name}`
              : 'Claim Your All-Access Studio Pass'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {selectedPlugin
              ? 'Lifetime perpetual license with free updates and 3 machine authorizations.'
              : 'Instant access to all 15 plugins, PluggedIN Central cloud licensing, and all future drops.'}
          </p>
        </div>
      )}

      {/* Prominent VIP promo banner if not yet applied */}
      {!appliedPromo && (
        <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-cyber-purple/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-300 block">Have a VIP or Friend Code?</span>
              <span className="text-[11px] text-slate-400 block">
                Enter your code in the order summary on the right to unlock 100% Free Lifetime Access!
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-500/30 shrink-0">
            e.g. DYLANVIP
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Plan & Account Details */}
        <div className="md:col-span-7 space-y-6">
          {/* Plan Duration Selector (Only shown if buying Pass, not single plugin) */}
          {!selectedPlugin ? (
            <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
              <h3 className="text-sm font-black uppercase text-white tracking-wider">
                1. Select Billing Period
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPlan('monthly')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    plan === 'monthly'
                      ? 'border-cyber-cyan bg-cyber-cyan/10 shadow-glow-cyan'
                      : 'border-white/10 bg-studio-900 hover:border-white/20'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-300 block">Monthly Pass</span>
                  <span className="text-2xl font-black text-white font-mono block mt-1">
                    ${ALL_ACCESS_MONTHLY}
                    <span className="text-xs text-slate-400 font-sans font-normal"> / mo</span>
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Billed monthly • Cancel anytime</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPlan('annual')}
                  className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                    plan === 'annual'
                      ? 'border-cyber-purple bg-cyber-purple/10 shadow-glow-purple'
                      : 'border-white/10 bg-studio-900 hover:border-white/20'
                  }`}
                >
                  <span className="absolute top-2 right-2 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-cyber-cyan text-black shadow">
                    SAVE 45%
                  </span>
                  <span className="text-xs font-bold text-slate-300 block">Annual Pass</span>
                  <span className="text-2xl font-black text-white font-mono block mt-1">
                    ${ALL_ACCESS_ANNUAL}
                    <span className="text-xs text-slate-400 font-sans font-normal"> / yr</span>
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Only $8.25/mo • 1 Year Unlimited</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30">
                  {selectedPlugin.category}
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">PERPETUAL LICENSE</span>
              </div>
              <h3 className="text-xl font-black text-white">{selectedPlugin.name}</h3>
              <p className="text-xs text-slate-400">{selectedPlugin.subtitle}</p>
              <div className="pt-2">
                <Link
                  href="/checkout"
                  className="text-xs text-cyber-cyan hover:underline font-semibold"
                >
                  &larr; Switch to All-Access Studio Pass ($14.99/mo)
                </Link>
              </div>
            </div>
          )}

          {/* Account Creation / Session Info */}
          <div className={`glass-panel rounded-3xl p-6 border transition-all space-y-4 ${
            finalPrice === 0
              ? 'border-emerald-500/40 bg-gradient-to-b from-emerald-500/5 to-transparent'
              : 'border-white/10'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase text-white tracking-wider">
                {selectedPlugin ? '1. Studio Account Credentials' : '2. Studio Account Credentials'}
              </h3>
              {finalPrice === 0 && (
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  No Payment Info Needed
                </span>
              )}
            </div>

            {currentUser ? (
              <div className="p-4 rounded-2xl bg-studio-900 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Signed in as</span>
                  <span className="text-sm font-bold text-white">{currentUser.email}</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Connected
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-400">
                  {finalPrice === 0
                    ? 'Enter your email & choose a password below. Your 100% Free Lifetime VIP license will be instantly attached to this account!'
                    : 'Enter your credentials below. Your master license will be permanently bound to this account.'}
                </p>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Display / Producer Name (Optional)</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Metro Beats"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-studio-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyber-cyan/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="producer@studio.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-studio-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyber-cyan/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-studio-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyber-cyan/50"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary & Checkout Action */}
        <div className="md:col-span-5 space-y-6">
          <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-5">
            <h3 className="text-sm font-black uppercase text-white tracking-wider border-b border-white/10 pb-3">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>
                  {selectedPlugin
                    ? `${selectedPlugin.name} (Perpetual)`
                    : `All-Access Studio Pass (${plan === 'monthly' ? 'Monthly' : 'Annual'})`}
                </span>
                <span className={`font-mono ${appliedPromo ? 'line-through text-slate-500' : 'text-white font-bold'}`}>
                  ${basePrice}
                </span>
              </div>

              {appliedPromo && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span className="flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>VIP Promo ({appliedPromo.code}):</span>
                  </span>
                  <span className="font-mono">-${discountAmount} (100% OFF)</span>
                </div>
              )}

              <div className="pt-3 border-t border-white/10 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Total Due Today:</span>
                <div className="text-right">
                  {appliedPromo ? (
                    <div>
                      <div className="flex items-center justify-end space-x-2">
                        <span className="line-through text-slate-500 text-xs font-mono">${basePrice}</span>
                        <span className="text-2xl font-black text-emerald-400 font-mono">$0.00</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                        Free Lifetime VIP Pass
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl font-black text-white font-mono">
                      ${finalPrice}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* VIP Promo Code Section - Always open & visible */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-300 flex items-center space-x-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  <span>VIP Promo / Friend Code</span>
                </label>
                {appliedPromo && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    100% OFF UNLOCKED
                  </span>
                )}
              </div>

              {!appliedPromo ? (
                <form onSubmit={handleApplyPromo} className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="e.g. DYLANVIP"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-studio-900 border border-amber-500/30 text-amber-300 placeholder-slate-600 text-xs font-mono uppercase focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="submit"
                      disabled={promoLoading || !promoCode.trim()}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-black text-xs font-black transition-all disabled:opacity-50 whitespace-nowrap shadow-glow-amber"
                    >
                      {promoLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                  {promoError && (
                    <p className="text-[11px] text-rose-400 flex items-center space-x-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{promoError}</span>
                    </p>
                  )}
                </form>
              ) : (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
                  <span className="flex items-center space-x-2 font-bold">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{appliedPromo.message}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedPromo(null);
                      setPromoCode('');
                    }}
                    className="text-[10px] text-slate-400 hover:text-white ml-2 underline shrink-0"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Error / Success Feedback */}
            {checkoutError && (
              <div className="p-3.5 rounded-xl text-xs bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{checkoutError}</span>
              </div>
            )}

            {checkoutSuccess && (
              <div className="p-3.5 rounded-xl text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Pass activated! Redirecting to your account dashboard...</span>
              </div>
            )}

            {/* Payment Section */}
            <div className="pt-2">
              {finalPrice === 0 ? (
                // 100% Free Promo (Dylan's friends)
                <button
                  type="button"
                  onClick={handleFreeCheckout}
                  disabled={submitting}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-400 via-cyber-cyan to-blue-500 hover:brightness-110 text-black text-sm font-black shadow-glow-cyan transition-all disabled:opacity-50 flex items-center justify-center space-x-2 active:scale-95"
                >
                  {submitting ? (
                    <span>Activating Free VIP Pass...</span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Claim Free Lifetime VIP Pass ($0.00) &rarr;</span>
                    </span>
                  )}
                </button>
              ) : PAYPAL_CLIENT_ID ? (
                // Official PayPal & Card Smart Buttons
                <div className="space-y-3">
                  {!currentUser && (!email || !password) && (
                    <p className="text-[11px] text-amber-300/90 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-center">
                      Please enter your email and password on the left so your license can be attached immediately.
                    </p>
                  )}

                  <PayPalScriptProvider
                    options={{
                      clientId: PAYPAL_CLIENT_ID,
                      currency: 'USD',
                      intent: 'capture',
                    }}
                  >
                    <PayPalButtons
                      style={{
                        layout: 'vertical',
                        color: 'gold',
                        shape: 'rect',
                        label: 'pay',
                      }}
                      disabled={!currentUser && (!email || !password)}
                      createOrder={async () => {
                        const res = await fetch('/api/paypal/create-order', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            plan: selectedPlugin ? undefined : plan,
                            pluginId: selectedPlugin ? selectedPlugin.id : undefined,
                            promoCode: appliedPromo?.code,
                          }),
                        });
                        const data = await res.json();
                        if (!data.success) {
                          throw new Error(data.error || 'Failed to create PayPal order');
                        }
                        return data.orderId;
                      }}
                      onApprove={async (data) => {
                        setSubmitting(true);
                        try {
                          const res = await fetch('/api/paypal/capture-order', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              orderId: data.orderID,
                              plan: selectedPlugin ? undefined : plan,
                              pluginId: selectedPlugin ? selectedPlugin.id : undefined,
                              accountInfo: currentUser
                                ? undefined
                                : {
                                    email: email.trim(),
                                    password,
                                    displayName: displayName.trim(),
                                  },
                            }),
                          });
                          const resData = await res.json();
                          if (resData.success) {
                            setCheckoutSuccess(true);
                            setTimeout(() => {
                              router.push('/account?checkout=success');
                            }, 1500);
                          } else {
                            setCheckoutError(resData.error || 'Payment capture failed');
                          }
                        } catch (err: any) {
                          setCheckoutError(err.message || 'Error completing checkout');
                        } finally {
                          setSubmitting(false);
                        }
                      }}
                      onError={(err) => {
                        console.error('PayPal Buttons Error:', err);
                        setCheckoutError('PayPal payment encountered an error. Please try again.');
                      }}
                    />
                  </PayPalScriptProvider>
                </div>
              ) : (
                // VIP Early Access Box when PayPal not configured
                <div className="p-4 rounded-2xl bg-studio-900 border border-cyber-cyan/30 text-center space-y-2">
                  <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-cyber-cyan">
                    <ShieldCheck className="w-4 h-4" />
                    <span>VIP Early Access Checkout</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Have a VIP / Friend Code (like <code className="text-amber-300 font-mono">DYLANVIP</code>)? Enter it above to unlock 100% Free Lifetime Access immediately!
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-3 border-t border-white/5 text-[11px] text-slate-400">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Instant license key &amp; Central cloud activation</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-3.5 h-3.5 text-cyber-cyan shrink-0" />
                <span>Official PayPal Buyer &amp; Seller Protection Included</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
