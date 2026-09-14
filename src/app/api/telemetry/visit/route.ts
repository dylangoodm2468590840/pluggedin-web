import { NextRequest, NextResponse } from 'next/server';

function getRedis(): any {
  try {
    if (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL) {
      const { Redis } = require('@upstash/redis');
      return Redis.fromEnv();
    }
  } catch {}
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { path = '/', referrer = '', device = 'desktop' } = body;

    // Categorize referral source
    let source = 'direct';
    const ref = (referrer || '').toLowerCase();
    if (ref.includes('tiktok.com')) source = 'tiktok';
    else if (ref.includes('instagram.com')) source = 'instagram';
    else if (ref.includes('youtube.com') || ref.includes('youtu.be')) source = 'youtube';
    else if (ref.includes('google.') || ref.includes('google.com')) source = 'google';
    else if (ref.includes('reddit.com')) source = 'reddit';
    else if (ref.includes('twitter.com') || ref.includes('x.com')) source = 'twitter';
    else if (ref && !ref.includes('pluggedin-web') && !ref.includes('localhost')) source = 'external';

    const cleanDevice = device === 'mobile' ? 'mobile' : 'desktop';
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const redis = getRedis();

    if (redis) {
      const dailyKey = `pluggedin_traffic:${today}`;
      await Promise.all([
        redis.hincrby(dailyKey, 'views', 1),
        redis.hincrby(dailyKey, `src_${source}`, 1),
        redis.hincrby(dailyKey, `dev_${cleanDevice}`, 1),
        redis.incr('pluggedin_traffic_total_views'),
      ]).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
