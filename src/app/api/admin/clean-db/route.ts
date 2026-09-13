import { NextRequest, NextResponse } from 'next/server';
import {
  deduplicateUsers,
  findUserByEmail,
  toSafeProfile,
  UserRecord,
} from '../../../../lib/auth';

// Helper to access Upstash directly
function getRedis(): any {
  try {
    if (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL) {
      const { Redis } = require('@upstash/redis');
      return Redis.fromEnv();
    }
  } catch (e) {
    console.warn('Redis init error:', e);
  }
  return null;
}

export async function GET(req: NextRequest) {
  return handleCleanup();
}

export async function POST(req: NextRequest) {
  return handleCleanup();
}

async function handleCleanup() {
  try {
    const redis = getRedis();
    let currentUsers: UserRecord[] = [];

    if (redis) {
      const data = await redis.get('pluggedin_users');
      if (Array.isArray(data)) {
        currentUsers = data;
      } else if (typeof data === 'string') {
        try {
          currentUsers = JSON.parse(data);
        } catch {}
      }
    }

    // Run strict deduplication & founder migration
    const cleanedUsers = deduplicateUsers(currentUsers);

    // Save back to Upstash
    if (redis) {
      await redis.set('pluggedin_users', cleanedUsers);
    }

    const safeProfiles = cleanedUsers.map(toSafeProfile);
    const dylanUser = safeProfiles.find((u) => u.email.toLowerCase() === 'dylangoodm@gmail.com');

    return NextResponse.json({
      success: true,
      message: 'Cloud database cleaned and deduplicated successfully.',
      totalUniqueUsers: safeProfiles.length,
      users: safeProfiles.map((u) => ({
        email: u.email,
        displayName: u.displayName,
        tier: u.tier,
        isLifetimeVIP: u.isLifetimeVIP,
        activeDeviceCount: u.activeDeviceCount,
        maxDevices: u.maxDevices,
        machines: u.machines,
      })),
      dylanAccount: dylanUser || null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to clean database' },
      { status: 500 }
    );
  }
}
