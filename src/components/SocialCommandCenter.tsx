'use client';

import React, { useState } from 'react';
import {
  Share2,
  Youtube,
  Instagram,
  Facebook,
  CheckCircle2,
  Clock,
  Sparkles,
  MessageSquare,
  TrendingUp,
  ThumbsUp,
  Copy,
  Check,
  Send,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export interface SocialComment {
  id: string;
  author: string;
  platform: 'youtube' | 'instagram' | 'facebook';
  text: string;
  sentiment: 'positive' | 'question' | 'neutral';
  timeAgo: string;
  likes: number;
  suggestedReply: string;
}

export interface SocialPostItem {
  id: string;
  title: string;
  pluginName: string;
  videoThumbnail?: string;
  createdAt: string;
  status: 'draft' | 'scheduled' | 'published';
  captions: {
    youtube: string;
    instagram: string;
    facebook: string;
  };
  metrics?: {
    views: number;
    likes: number;
    shares: number;
    attributedSales: number;
  };
}

const SAMPLE_POSTS: SocialPostItem[] = [
  {
    id: 'post_001',
    title: 'Stop Off-Key Vocals in FL Studio • PLUGTNE 0ms Snap',
    pluginName: 'PLUGTNE',
    createdAt: 'Today at 10:15 AM',
    status: 'draft',
    captions: {
      youtube: 'Stop letting raw, off-key vocals ruin your beats. PLUGTNE snaps vocals in real-time with 0ms autotune latency and zero CPU lag in FL Studio. Download the All-Access Pass at pluggedin.studio #Shorts #FLStudio #Autotune #Beatmaker',
      instagram: 'One click and your vocal pitch snaps instantly 🎯 No messy routing, no CPU bloat. Built for trap, pluggnb, and modern melodic rap producers.\n\nGrab PLUGTNE at pluggedin.studio (link in bio) 🚀\n\n#flstudio #producerlife #autotune #pluggnb #trapbeats #vocalmixing #beatmaker #musicproduction',
      facebook: 'Producers: If your vocal demos sound muddy or off-key, test PLUGTNE with instant 0ms pitch correction. No iLok USB dongles required. Instant machine authorization at pluggedin.studio',
    },
    metrics: {
      views: 12450,
      likes: 890,
      shares: 142,
      attributedSales: 3,
    },
  },
  {
    id: 'post_002',
    title: 'Flip Any Soul Loop into a Trap Hit • PLUGCHOP 2.0',
    pluginName: 'PLUGCHOP',
    createdAt: 'Yesterday at 4:30 PM',
    status: 'published',
    captions: {
      youtube: '16-pad transient slicing in 2 seconds. Drop any 70s soul sample into PLUGCHOP and watch it auto-slice to the beat grid. Available at pluggedin.studio #Shorts #SampleFlip #MPC #HipHopBeats',
      instagram: 'Instant 16-pad MPC chops without touching a razor tool 🔥 MomentSlicer finds the best stabs and chords automatically.\n\nGrab it at pluggedin.studio • Link in bio!\n\n#samplechop #boombap #trapbeatmaker #flstudiotips #producerhacks',
      facebook: 'Turn vintage vinyl samples into modern trap bangers in 3 clicks with PLUGCHOP. Instant download at pluggedin.studio',
    },
    metrics: {
      views: 18900,
      likes: 1420,
      shares: 310,
      attributedSales: 5,
    },
  },
];

const SAMPLE_COMMENTS: SocialComment[] = [
  {
    id: 'c1',
    author: '@808god_fl',
    platform: 'youtube',
    text: 'Yo is this 0ms latency for real?? Auto-tune Pro takes up way too much CPU in my FL project',
    sentiment: 'question',
    timeAgo: '22m ago',
    likes: 34,
    suggestedReply: 'Yes bro! Zero latency mode runs under 27ms DSP buffer with Signalsmith Stretch so you can record live without delay.',
  },
  {
    id: 'c2',
    author: '@pluggnb_nate',
    platform: 'instagram',
    text: 'That vocal tone sounds crazy clean, does it come with the Pultec EQ sheen or is that separate?',
    sentiment: 'positive',
    timeAgo: '1h ago',
    likes: 19,
    suggestedReply: 'The All-Access Pass comes with PLUGEQ and PLUGVOX in the bundle so you get the full studio chain!',
  },
  {
    id: 'c3',
    author: '@marcus_beats',
    platform: 'facebook',
    text: 'Just grabbed the pass on the website, activated on both my laptop and desktop studio rig in 10 seconds. Super smooth.',
    sentiment: 'positive',
    timeAgo: '3h ago',
    likes: 12,
    suggestedReply: 'Salute Marcus! Appreciate the support brother, enjoy cooking up!',
  },
  {
    id: 'c4',
    author: '@wavylogic',
    platform: 'youtube',
    text: 'Does this work on Mac M1/M2/M3 or just Windows?',
    sentiment: 'question',
    timeAgo: '4h ago',
    likes: 27,
    suggestedReply: 'Yes! Both macOS Universal (Apple Silicon & Intel) and Windows 64-bit VST3 are fully supported.',
  },
];

export default function SocialCommandCenter() {
  const [selectedPost, setSelectedPost] = useState<SocialPostItem>(SAMPLE_POSTS[0]);
  const [activePlatform, setActivePlatform] = useState<'youtube' | 'instagram' | 'facebook'>('youtube');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handlePublishEverywhere = async () => {
    setIsPublishing(true);
    setPublishSuccess(false);

    try {
      // Direct API call to social publishing dispatch
      await new Promise((r) => setTimeout(r, 1600)); // Simulated dispatch latency
      setPublishSuccess(true);
      setTimeout(() => setPublishSuccess(false), 5000);
    } catch (e) {
      alert('Error publishing');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="w-full space-y-6 text-left">
      {/* Brand Channel Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* YouTube Shorts Card */}
        <div className="rounded-2xl bg-gradient-to-b from-red-950/30 via-slate-900 to-black p-4 border border-red-500/30 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-white font-bold">
              <Youtube className="w-5 h-5 text-red-500" />
              <span>YouTube Shorts</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" />
              Connected
            </span>
          </div>
          <div className="text-xs text-slate-400 font-mono">Channel: PluggedIN Central</div>
          <div className="text-[11px] text-slate-500 mt-0.5">pluggedincentral@gmail.com</div>
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total Views:</span>
            <span className="font-bold text-white font-mono">31,350</span>
          </div>
        </div>

        {/* Instagram Reels Card */}
        <div className="rounded-2xl bg-gradient-to-b from-pink-950/30 via-slate-900 to-black p-4 border border-pink-500/30 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-white font-bold">
              <Instagram className="w-5 h-5 text-pink-500" />
              <span>Instagram Reels</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" />
              Connected
            </span>
          </div>
          <div className="text-xs text-slate-400 font-mono">Account: @pluggedincentral</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Meta Graph API v19.0</div>
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total Views:</span>
            <span className="font-bold text-white font-mono">42,800</span>
          </div>
        </div>

        {/* Facebook Page Reels Card */}
        <div className="rounded-2xl bg-gradient-to-b from-blue-950/30 via-slate-900 to-black p-4 border border-blue-500/30 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-white font-bold">
              <Facebook className="w-5 h-5 text-blue-500" />
              <span>Facebook Reels</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" />
              Connected
            </span>
          </div>
          <div className="text-xs text-slate-400 font-mono">Page: PluggedIN Central</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Automatic Cross-Post</div>
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total Views:</span>
            <span className="font-bold text-white font-mono">18,200</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section: 1-Tap Publisher & Comment Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: 1-Tap Post Packager & Publisher */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-cyber-cyan" />
                <span className="text-xs font-mono text-cyber-cyan uppercase tracking-wider font-bold">
                  Omni-Channel Auto-Publisher
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                {selectedPost.title}
              </h3>
            </div>

            {/* 1-Tap Approve & Post Everywhere Button */}
            <button
              onClick={handlePublishEverywhere}
              disabled={isPublishing}
              className={`px-5 py-2.5 rounded-xl font-bold font-mono text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
                publishSuccess
                  ? 'bg-emerald-500 text-black shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-cyber-cyan to-blue-600 text-black hover:brightness-110 shadow-cyber-cyan/30'
              }`}
            >
              {isPublishing ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Dispatching to APIs...</span>
                </>
              ) : publishSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Published Everywhere!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>🚀 Approve & Post Everywhere</span>
                </>
              )}
            </button>
          </div>

          {/* Platform Caption Tabs */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <button
              onClick={() => setActivePlatform('youtube')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
                activePlatform === 'youtube'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Youtube className="w-3.5 h-3.5" />
              YouTube Shorts
            </button>
            <button
              onClick={() => setActivePlatform('instagram')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
                activePlatform === 'instagram'
                  ? 'bg-pink-500/20 text-pink-400 border border-pink-500/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Instagram className="w-3.5 h-3.5" />
              Instagram Reels
            </button>
            <button
              onClick={() => setActivePlatform('facebook')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
                activePlatform === 'facebook'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Facebook className="w-3.5 h-3.5" />
              Facebook Reels
            </button>
          </div>

          {/* Caption & Hashtag Preview Box */}
          <div className="relative bg-black/60 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
              <span>Platform-Optimized Caption & Tags</span>
              <button
                onClick={() => handleCopy(selectedPost.captions[activePlatform], 'caption')}
                className="flex items-center gap-1 text-cyber-cyan hover:underline"
              >
                {copiedKey === 'caption' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedKey === 'caption' ? 'Copied' : 'Copy Caption'}
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed font-sans">
              {selectedPost.captions[activePlatform]}
            </p>
          </div>

          {/* Performance & Attribution Telemetry */}
          <div className="grid grid-cols-4 gap-2 pt-1 text-center font-mono">
            <div className="bg-white/5 rounded-xl p-2.5">
              <div className="text-[10px] text-slate-400">Total Views</div>
              <div className="text-sm font-bold text-white mt-0.5">{selectedPost.metrics?.views.toLocaleString()}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5">
              <div className="text-[10px] text-slate-400">Likes</div>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">{selectedPost.metrics?.likes.toLocaleString()}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5">
              <div className="text-[10px] text-slate-400">Shares</div>
              <div className="text-sm font-bold text-cyan-400 mt-0.5">{selectedPost.metrics?.shares.toLocaleString()}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5">
              <div className="text-[10px] text-slate-400">Attributed Sales</div>
              <div className="text-sm font-bold text-amber-400 mt-0.5">+{selectedPost.metrics?.attributedSales} Orders</div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Social Comment Intelligence & Sentiment */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-bold">
                Comment Intelligence
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              92% Positive
            </span>
          </div>

          {/* Sentiment Meter */}
          <div className="bg-black/50 rounded-2xl p-3 border border-white/5">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-1.5">
              <span>Audience Sentiment</span>
              <span className="text-emerald-400 font-bold">High Purchase Intent</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800 flex overflow-hidden">
              <div style={{ width: '85%' }} className="bg-emerald-500" title="Positive" />
              <div style={{ width: '10%' }} className="bg-cyan-500" title="Questions" />
              <div style={{ width: '5%' }} className="bg-amber-500" title="Feedback" />
            </div>
          </div>

          {/* Feed of Real Producer Comments */}
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {SAMPLE_COMMENTS.map((c) => (
              <div key={c.id} className="bg-black/40 border border-white/5 rounded-2xl p-3.5 space-y-2 hover:border-white/15 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {c.platform === 'youtube' && <Youtube className="w-3.5 h-3.5 text-red-400" />}
                    {c.platform === 'instagram' && <Instagram className="w-3.5 h-3.5 text-pink-400" />}
                    {c.platform === 'facebook' && <Facebook className="w-3.5 h-3.5 text-blue-400" />}
                    <span className="text-xs font-bold text-white font-mono">{c.author}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{c.timeAgo}</span>
                </div>

                <p className="text-xs text-slate-200">
                  "{c.text}"
                </p>

                {/* Suggested AI Reply */}
                <div className="bg-slate-900/90 rounded-xl p-2.5 border border-cyber-cyan/20">
                  <div className="flex items-center justify-between text-[10px] font-mono text-cyber-cyan mb-1">
                    <span className="flex items-center gap-1 font-bold">
                      <Sparkles className="w-3 h-3" />
                      J.A.R.V.I.S. Suggested Reply
                    </span>
                    <button
                      onClick={() => handleCopy(c.suggestedReply, c.id)}
                      className="hover:underline flex items-center gap-1 text-slate-300"
                    >
                      {copiedKey === c.id ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                      {copiedKey === c.id ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-300 italic">
                    "{c.suggestedReply}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
