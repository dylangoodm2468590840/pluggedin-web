import React from 'react';
import { DownloadHub } from '../../components/DownloadHub';

export default function DownloadPage() {
  return (
    <div className="pt-8 pb-16">
      <DownloadHub />

      {/* System Requirements Breakdown */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <h3 className="text-2xl font-black text-white text-center mb-8">
          System Requirements & DAW Compatibility
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
            <h4 className="font-bold text-white text-base">macOS Requirements</h4>
            <ul className="text-xs text-slate-400 space-y-2">
              <li>• macOS 11.0 (Big Sur) through macOS 15+ (Sequoia)</li>
              <li>• Native Apple Silicon support: M1, M2, M3, M4 Pro/Max</li>
              <li>• Intel Core i5 / i7 / i9 (64-bit)</li>
              <li>• Formats: VST3 & Audio Units (AU)</li>
              <li>• 4 GB RAM minimum (8 GB recommended)</li>
            </ul>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
            <h4 className="font-bold text-white text-base">Windows Requirements</h4>
            <ul className="text-xs text-slate-400 space-y-2">
              <li>• Windows 10 & Windows 11 (64-bit only)</li>
              <li>• Intel Core or AMD Ryzen processor (AVX support)</li>
              <li>• Formats: VST3 (64-bit)</li>
              <li>• 4 GB RAM minimum (8 GB recommended)</li>
              <li>• Standard VST3 scan path: <code className="text-cyber-cyan font-mono">C:\Program Files\Common Files\VST3</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
