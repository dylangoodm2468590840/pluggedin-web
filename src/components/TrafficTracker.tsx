'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function TrafficTracker() {
  const pathname = usePathname();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    // Avoid double counting identical paths in rapid succession
    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;

    // Don't track founder dashboard visits in customer traffic
    if (pathname?.startsWith('/founder')) return;

    try {
      const isMobile = window.innerWidth < 768;
      const referrer = typeof document !== 'undefined' ? document.referrer : '';

      fetch('/api/telemetry/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: pathname || '/',
          referrer: referrer || '',
          device: isMobile ? 'mobile' : 'desktop',
        }),
      }).catch(() => {});
    } catch {}
  }, [pathname]);

  return null;
}
