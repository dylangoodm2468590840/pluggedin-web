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

const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || 'PLUGGEDIN_SECURE_ADMIN_DYLAN_8492_KEY';

function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const adminKey = req.headers.get('x-admin-key');
  return authHeader === ADMIN_SECRET || adminKey === ADMIN_SECRET;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }
  return handleCleanup();
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }
  let deleteEmail: string | undefined;
  try {
    const body = await req.json();
    deleteEmail = body?.deleteEmail;
  } catch {}
  return handleCleanup(deleteEmail);
}

async function handleCleanup(deleteEmail?: string) {
  try {
    // Permanent safeguard: dylangoodm@gmail.com can NEVER be deleted
    if (deleteEmail && deleteEmail.trim().toLowerCase() === 'dylangoodm@gmail.com') {
      return NextResponse.json(
        { success: false, error: 'Founder account cannot be modified or deleted.' },
        { status: 403 }
      );
    }
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

    if (deleteEmail) {
      currentUsers = currentUsers.filter(
        (u) => u.email.toLowerCase() !== deleteEmail.trim().toLowerCase()
      );
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
