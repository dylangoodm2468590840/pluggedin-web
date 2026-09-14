'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Disc, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const pathname = usePathname();

  if (pathname?.startsWith('/founder')) {
    return null;
  }
  return (
    <footer className="border-t border-white/5 bg-studio-950/60 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/5">
          {/* Col 1: Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-cyber-cyan text-black flex items-center justify-center font-black">
                <Disc className="w-5 h-5" />
              </div>
              <span className="text-lg font-black tracking-wider text-white">PLUGGEDIN</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Professional digital signal processing and instrument engineering for hitmaking producers and sound designers worldwide.
            </p>
          </div>

          {/* Col 2: Supported DAWs */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-300 font-bold">
              Compatible DAWs
            </h4>
            <ul className="text-xs text-slate-400 space-y-2">
              <li>Image-Line FL Studio (20, 21, 24)</li>
              <li>Apple Logic Pro (10 & 11)</li>
              <li>Avid Pro Tools (StudioVerse / VST3)</li>
              <li>Ableton Live (11 & 12)</li>
              <li>PreSonus Studio One 6</li>
              <li>Cockos REAPER</li>
            </ul>
          </div>

          {/* Col 3: Plugin Formats */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-300 font-bold">
              Architecture
            </h4>
            <ul className="text-xs text-slate-400 space-y-2">
              <li>VST3 64-bit Native</li>
              <li>Audio Units (AU)</li>
              <li>macOS Universal (Apple Silicon & Intel)</li>
              <li>Windows 10 / 11 (64-bit)</li>
              <li>32-bit Floating Point DSP</li>
            </ul>
          </div>

          {/* Col 4: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-300 font-bold">
              Quick Links
            </h4>
            <ul className="text-xs text-slate-400 space-y-2">
              <li>
                <Link href="/#plugins" className="hover:text-cyber-cyan transition-colors">
                  Browse 15 Plugins
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-cyber-purple transition-colors">
                  All-Access Pass ($14.99/mo)
                </Link>
              </li>
              <li>
                <Link href="/download" className="hover:text-cyber-cyan transition-colors">
                  Download Central Hub
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-cyber-cyan transition-colors">
                  Producer Account &amp; Licenses
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} PluggedIN Audio Technologies. All rights reserved.</p>
          <div className="flex items-center space-x-1">
            <span>Engineered with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for producers worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
