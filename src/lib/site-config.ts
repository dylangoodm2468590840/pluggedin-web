export interface SiteConfig {
  version: number;
  updatedAt: string;
  updatedBy: string;
  banner: {
    enabled: boolean;
    text: string;
    ctaText: string;
    ctaLink: string;
    style: 'cyan' | 'purple' | 'amber' | 'emerald';
  };
  hero: {
    badgeText: string;
    badgeLink: string;
    headlineStart: string;
    headlineGradient: string;
    subheadline: string;
    primaryCtaText: string;
    primaryCtaLink: string;
    secondaryCtaText: string;
    secondaryCtaLink: string;
  };
  featuredPluginId: string;
  promoNotice: {
    enabled: boolean;
    headline: string;
    code: string;
    discountPercent: number;
  };
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  version: 1,
  updatedAt: new Date().toISOString(),
  updatedBy: 'system',
  banner: {
    enabled: true,
    text: "FOUNDER'S PASS: Only 12 of 100 spots left @ $14.99/mo",
    ctaText: "CLAIM SPOT",
    ctaLink: "/pricing",
    style: 'cyan',
  },
  hero: {
    badgeText: "PLUGGEDIN STUDIO SUITE • ALL 15 PLUGINS OFFICIALLY RELEASED",
    badgeLink: "/pricing",
    headlineStart: "Studio-Grade Plugins Built for",
    headlineGradient: "Modern Hitmakers.",
    subheadline: "From the new PlugChop 16-pad playable sampler to zero-latency pitch correction and analog tube heat. 15 plugins engineered natively for FL Studio, Pro Tools, Logic Pro, and Ableton.",
    primaryCtaText: "Download PluggedIN Central (Free)",
    primaryCtaLink: "/download",
    secondaryCtaText: "Get All-Access Pass • $14.99",
    secondaryCtaLink: "/pricing",
  },
  featuredPluginId: "PlugChop",
  promoNotice: {
    enabled: true,
    headline: "Pre-Launch Founder Early Access Live",
    code: "FOUNDERVIP",
    discountPercent: 20,
  },
};

// Layer-1 Schema Validator: Rejects harmful scripts, broken URLs, and excessive strings
export function validateSiteConfigUpdate(partial: any): { valid: boolean; error?: string } {
  if (!partial || typeof partial !== 'object') {
    return { valid: false, error: 'Invalid update payload: must be an object' };
  }

  const isSafeText = (txt: any, maxLen = 300) =>
    typeof txt === 'string' &&
    txt.trim().length > 0 &&
    txt.length <= maxLen &&
    !/<script|javascript:|onload=|onerror=/i.test(txt);

  const isSafeLink = (lnk: any) =>
    typeof lnk === 'string' &&
    (lnk.startsWith('/') || lnk.startsWith('https://')) &&
    !/javascript:|data:/i.test(lnk);

  if (partial.banner) {
    const b = partial.banner;
    if (b.text !== undefined && !isSafeText(b.text, 200)) {
      return { valid: false, error: 'Banner text contains invalid characters or exceeds 200 characters' };
    }
    if (b.ctaLink !== undefined && !isSafeLink(b.ctaLink)) {
      return { valid: false, error: 'Banner link must be a safe internal path (e.g. /pricing) or https URL' };
    }
    if (b.style !== undefined && !['cyan', 'purple', 'amber', 'emerald'].includes(b.style)) {
      return { valid: false, error: 'Banner style must be one of: cyan, purple, amber, emerald' };
    }
  }

  if (partial.hero) {
    const h = partial.hero;
    if (h.headlineStart !== undefined && !isSafeText(h.headlineStart, 100)) {
      return { valid: false, error: 'Hero headline start invalid or exceeds 100 characters' };
    }
    if (h.headlineGradient !== undefined && !isSafeText(h.headlineGradient, 100)) {
      return { valid: false, error: 'Hero headline gradient invalid or exceeds 100 characters' };
    }
    if (h.subheadline !== undefined && !isSafeText(h.subheadline, 400)) {
      return { valid: false, error: 'Hero subheadline invalid or exceeds 400 characters' };
    }
    if (h.primaryCtaLink !== undefined && !isSafeLink(h.primaryCtaLink)) {
      return { valid: false, error: 'Primary CTA link must be a safe path' };
    }
  }

  if (partial.promoNotice) {
    const p = partial.promoNotice;
    if (p.discountPercent !== undefined) {
      const num = Number(p.discountPercent);
      if (isNaN(num) || num < 0 || num > 100) {
        return { valid: false, error: 'Discount percent must be between 0 and 100' };
      }
    }
  }

  return { valid: true };
}

function getRedis(): any {
  try {
    if (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL) {
      const { Redis } = require('@upstash/redis');
      return Redis.fromEnv();
    }
  } catch {}
  return null;
}

let inMemorySiteConfig: SiteConfig = { ...DEFAULT_SITE_CONFIG };
const inMemoryHistory: SiteConfig[] = [];

export async function fetchSiteConfig(): Promise<SiteConfig> {
  const redis = getRedis();
  if (redis) {
    try {
      const data = await redis.get('pluggedin:site_config');
      if (data) {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        return {
          ...DEFAULT_SITE_CONFIG,
          ...parsed,
          banner: { ...DEFAULT_SITE_CONFIG.banner, ...(parsed.banner || {}) },
          hero: { ...DEFAULT_SITE_CONFIG.hero, ...(parsed.hero || {}) },
          promoNotice: { ...DEFAULT_SITE_CONFIG.promoNotice, ...(parsed.promoNotice || {}) },
        };
      }
    } catch (e) {
      console.warn('[SiteConfig] Error reading from Redis, using fallback:', e);
    }
  }
  return inMemorySiteConfig;
}

export async function saveSiteConfig(
  partial: Partial<SiteConfig>,
  author: string = 'founder'
): Promise<{ success: boolean; config: SiteConfig; error?: string }> {
  const validation = validateSiteConfigUpdate(partial);
  if (!validation.valid) {
    return { success: false, config: await fetchSiteConfig(), error: validation.error };
  }

  const current = await fetchSiteConfig();
  const nextVersion = (current.version || 1) + 1;

  const updatedConfig: SiteConfig = {
    ...current,
    ...partial,
    version: nextVersion,
    updatedAt: new Date().toISOString(),
    updatedBy: author,
    banner: {
      ...current.banner,
      ...(partial.banner || {}),
    },
    hero: {
      ...current.hero,
      ...(partial.hero || {}),
    },
    promoNotice: {
      ...current.promoNotice,
      ...(partial.promoNotice || {}),
    },
  };

  const redis = getRedis();
  if (redis) {
    try {
      await redis.lpush('pluggedin:site_config:history', JSON.stringify(current));
      await redis.ltrim('pluggedin:site_config:history', 0, 9);
      await redis.set('pluggedin:site_config', JSON.stringify(updatedConfig));
    } catch (e) {
      console.warn('[SiteConfig] Error saving to Redis:', e);
    }
  }

  inMemoryHistory.unshift(current);
  if (inMemoryHistory.length > 10) inMemoryHistory.pop();
  inMemorySiteConfig = updatedConfig;

  return { success: true, config: updatedConfig };
}

export async function rollbackSiteConfig(): Promise<{ success: boolean; config: SiteConfig; error?: string }> {
  const redis = getRedis();
  let previous: SiteConfig | null = null;

  if (redis) {
    try {
      const item = await redis.lpop('pluggedin:site_config:history');
      if (item) {
        previous = typeof item === 'string' ? JSON.parse(item) : item;
        if (previous) {
          previous.version = (previous.version || 1) + 1;
          previous.updatedAt = new Date().toISOString();
          previous.updatedBy = 'revert';
          await redis.set('pluggedin:site_config', JSON.stringify(previous));
        }
      }
    } catch (e) {
      console.warn('[SiteConfig] Error popping rollback from Redis:', e);
    }
  }

  if (!previous && inMemoryHistory.length > 0) {
    previous = inMemoryHistory.shift()!;
    previous.version = (previous.version || 1) + 1;
    previous.updatedAt = new Date().toISOString();
    previous.updatedBy = 'revert';
    inMemorySiteConfig = previous;
  }

  if (!previous) {
    return { success: false, config: await fetchSiteConfig(), error: 'No previous site configuration snapshot available to rollback.' };
  }

  return { success: true, config: previous };
}
