import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '../../../../lib/auth';

function getRedis(): any {
  try {
    if (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL) {
      const { Redis } = require('@upstash/redis');
      return Redis.fromEnv();
    }
  } catch {}
  return null;
}

const FOUNDER_EMAILS = ['dylangoodm@gmail.com', 'dylan@pluggedin.studio'];
const FOUNDER_PINS = ['8492', 'PluggedIn2026!', 'pluggedin_studio_secret_key_2026_launch'];

function isAuthorized(req: NextRequest): boolean {
  const secretHeader = req.headers.get('x-founder-secret') || req.headers.get('x-founder-pin');
  const urlPin = req.nextUrl.searchParams.get('pin');
  if (secretHeader && FOUNDER_PINS.includes(secretHeader.trim())) return true;
  if (urlPin && FOUNDER_PINS.includes(urlPin.trim())) return true;

  const token =
    req.cookies.get('pluggedin_auth_token')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '');

  if (token) {
    const payload = verifySessionToken(token);
    if (payload && FOUNDER_EMAILS.includes(payload.email.toLowerCase())) {
      return true;
    }
  }
  return false;
}

export interface SocialBrandProfile {
  platform: 'tiktok' | 'instagram' | 'youtube' | 'twitter';
  name: string;
  handle: string;
  avatarUrl: string;
  bio: string;
  websiteLink: string;
  category: string;
  status: 'CONNECTED' | 'READY';
  updatedAt: string;
}

const DEFAULT_PROFILES: Record<string, SocialBrandProfile> = {
  tiktok: {
    platform: 'tiktok',
    name: 'PluggedIN Studio',
    handle: '@pluggedin.studio',
    avatarUrl: '/images/plugins/plugchop.png',
    bio: '15 Studio-Grade Plugins Engineered for Modern Hitmakers • 0ms Latency FL/Ableton/Logic • Claim Founder Pass ⬇️',
    websiteLink: 'https://pluggedin.studio?utm_source=tiktok',
    category: 'Music Tech & Audio Software',
    status: 'READY',
    updatedAt: new Date().toISOString(),
  },
  instagram: {
    platform: 'instagram',
    name: 'PluggedIN Studio',
    handle: '@pluggedin.studio',
    avatarUrl: '/images/plugins/plugtne.png',
    bio: 'Boutique Audio DSP for FL Studio & Ableton • 15 Native Audio Plugins • Zero-Latency Tracking • Download Free Below ⬇️',
    websiteLink: 'https://pluggedin.studio?utm_source=instagram',
    category: 'Music Production Software',
    status: 'READY',
    updatedAt: new Date().toISOString(),
  },
  youtube: {
    platform: 'youtube',
    name: 'PluggedIN Studio',
    handle: '@pluggedinstudio',
    avatarUrl: '/images/plugins/underground.png',
    bio: 'Audio Plugin Shootouts, Modern 808 Sound Design & Secret FL Studio Vocal Chains. 15 Native DSP Tools.',
    websiteLink: 'https://pluggedin.studio?utm_source=youtube',
    category: 'Music Production Tutorials',
    status: 'READY',
    updatedAt: new Date().toISOString(),
  },
  twitter: {
    platform: 'twitter',
    name: 'PluggedIN Studio',
    handle: '@pluggedinstudio',
    avatarUrl: '/images/plugins/pluggedin_plugged1.png',
    bio: 'Official DSP Devlogs & Studio Audio Tools for Producers. Zero-Latency C++ JUCE Audio Engineering.',
    websiteLink: 'https://pluggedin.studio?utm_source=twitter',
    category: 'Audio Software Development',
    status: 'READY',
    updatedAt: new Date().toISOString(),
  },
};

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized founder operation' }, { status: 401 });
  }

  const redis = getRedis();
  let profiles = { ...DEFAULT_PROFILES };
  let queue: any[] = [];

  if (redis) {
    try {
      const [savedProfiles, savedQueue] = await Promise.all([
        redis.get('pluggedin_social_brand_profiles'),
        redis.get('pluggedin_social_staged_posts'),
      ]);

      if (savedProfiles) {
        const parsed = typeof savedProfiles === 'string' ? JSON.parse(savedProfiles) : savedProfiles;
        profiles = { ...DEFAULT_PROFILES, ...parsed };
      }
      if (savedQueue) {
        queue = typeof savedQueue === 'string' ? JSON.parse(savedQueue) : savedQueue;
      }
    } catch (e) {
      console.warn('Error reading social data from Redis:', e);
    }
  }

  return NextResponse.json({
    success: true,
    profiles,
    queue,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized founder operation' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, platform, profile, post } = body;
    const redis = getRedis();

    if (action === 'update_profile') {
      if (!platform || !profile) {
        return NextResponse.json({ error: 'Missing platform or profile payload' }, { status: 400 });
      }

      let currentProfiles = { ...DEFAULT_PROFILES };
      if (redis) {
        const saved = await redis.get('pluggedin_social_brand_profiles');
        if (saved) {
          currentProfiles = {
            ...currentProfiles,
            ...(typeof saved === 'string' ? JSON.parse(saved) : saved),
          };
        }
      }

      currentProfiles[platform] = {
        ...currentProfiles[platform],
        ...profile,
        updatedAt: new Date().toISOString(),
      };

      if (redis) {
        await redis.set('pluggedin_social_brand_profiles', JSON.stringify(currentProfiles));
      }

      return NextResponse.json({
        success: true,
        message: `Profile for ${platform.toUpperCase()} updated successfully`,
        profiles: currentProfiles,
      });
    }

    if (action === 'stage_post' || action === 'approve_post') {
      let currentQueue: any[] = [];
      if (redis) {
        const saved = await redis.get('pluggedin_social_staged_posts');
        if (saved) {
          currentQueue = typeof saved === 'string' ? JSON.parse(saved) : saved;
        }
      }

      if (action === 'stage_post' && post) {
        currentQueue.unshift({
          ...post,
          id: post.id || `post_${Date.now()}`,
          createdAt: new Date().toISOString(),
        });
      } else if (action === 'approve_post' && post?.id) {
        const idx = currentQueue.findIndex((p) => p.id === post.id);
        if (idx >= 0) {
          currentQueue[idx].status = 'dispatched';
          currentQueue[idx].dispatchedAt = new Date().toISOString();
        }
      }

      if (redis) {
        await redis.set('pluggedin_social_staged_posts', JSON.stringify(currentQueue.slice(0, 50)));
      }

      return NextResponse.json({
        success: true,
        queue: currentQueue,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
