'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Check, ArrowUpRight, Zap, Layers } from 'lucide-react';
import { PluginData } from '../types';
import { getPluginImageUrl } from '../data/plugins';

interface PluginCardProps {
  plugin: PluginData;
}

export const PluginCard: React.FC<PluginCardProps> = ({ plugin }) => {
  const getAccentBorder = () => {
    switch (plugin.accentColor) {
      case 'cyan':
        return 'border-cyber-cyan/30 hover:border-cyber-cyan/60 hover:shadow-glow-cyan';
      case 'purple':
        return 'border-cyber-purple/30 hover:border-cyber-purple/60 hover:shadow-glow-purple';
      case 'rose':
        return 'border-cyber-rose/30 hover:border-cyber-rose/60 hover:shadow-glow-rose';
      case 'amber':
        return 'border-cyber-amber/30 hover:border-cyber-amber/60 hover:shadow-glow-amber';
      case 'emerald':
        return 'border-emerald-500/30 hover:border-emerald-500/60';
      default:
        return 'border-white/10 hover:border-white/20';
    }
  };

  const getBadgeClass = () => {
    switch (plugin.accentColor) {
      case 'cyan':
        return 'bg-cyber-cyan/10 text-cyber-cyan border-cyber-cyan/20';
      case 'purple':
        return 'bg-cyber-purple/10 text-cyber-purple border-cyber-purple/20';
      case 'rose':
        return 'bg-cyber-rose/10 text-cyber-rose border-cyber-rose/20';
      case 'amber':
        return 'bg-cyber-amber/10 text-cyber-amber border-cyber-amber/20';
      case 'emerald':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-white/5 text-slate-300 border-white/10';
    }
  };

  return (
    <div className={`glass-panel rounded-3xl p-6 sm:p-7 flex flex-col justify-between glass-card-hover border ${getAccentBorder()} transition-all duration-300`}>
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getBadgeClass()}`}>
            {plugin.category}
          </span>
          <div className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-400">
            <span>VST3</span>
            <span>•</span>
            <span>AU</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 text-[9px] uppercase tracking-wider">
              RELEASED
            </span>
          </div>
        </div>

        {/* Real Plugin Hardware GUI Screenshot */}
        <Link 
          href={`/plugins/${plugin.id}`} 
          className="mt-4 block relative rounded-2xl overflow-hidden bg-black/60 border border-white/10 group/img aspect-[16/10] shadow-inner flex items-center justify-center p-2"
        >
          <img
            src={getPluginImageUrl(plugin.id)}
            alt={`${plugin.name} Real Interface`}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              const fallback = `/images/plugins/${plugin.shortName.toLowerCase().replace(/\s+/g, '')}.png`;
              if (e.currentTarget.src !== fallback) {
                e.currentTarget.src = fallback;
              }
            }}
          />
          <div className="absolute top-2.5 right-2.5 z-20">
            <span className="text-[9px] font-mono font-bold bg-black/80 backdrop-blur-sm text-cyber-cyan border border-cyber-cyan/30 px-2 py-0.5 rounded-full shadow">
              REAL VST3
            </span>
          </div>
        </Link>

        {/* Name & Subtitle */}
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white tracking-wide">
              {plugin.name}
            </h3>
            {plugin.featured && (
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/30">
                Flagship
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            {plugin.subtitle}
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="mt-5 space-y-2">
          {plugin.features.slice(0, 3).map((feat, i) => (
            <div key={i} className="flex items-start space-x-2 text-xs text-slate-300">
              <Check className="w-3.5 h-3.5 text-cyber-cyan shrink-0 mt-0.5" />
              <span className="line-clamp-1">{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing & Actions */}
      <div className="mt-6 pt-5 border-t border-white/5 space-y-3">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white font-mono">
              ${plugin.salePrice}
            </span>
            <span className="text-xs text-slate-500 line-through font-mono">
              ${plugin.retailPrice}
            </span>
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Launch -{Math.round(((plugin.retailPrice - plugin.salePrice) / plugin.retailPrice) * 100)}%
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Perpetual Lifetime</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Link
            href={`/plugins/${plugin.id}`}
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 transition-all flex items-center justify-center space-x-1"
          >
            <span>Specs</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            href="/pricing"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-600 text-black text-xs font-black shadow-glow-cyan hover:brightness-110 active:scale-95 transition-all flex items-center justify-center space-x-1"
          >
            <span>Get Pass</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
