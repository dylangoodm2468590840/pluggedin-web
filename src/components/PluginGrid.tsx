'use client';

import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Sparkles, Music, Mic, Radio, Waves, Cpu, Disc3 } from 'lucide-react';
import { PLUGINS_DATA } from '../data/plugins';
import { PluginCard } from './PluginCard';

interface CategoryFilter {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  matches: (category: string, id: string) => boolean;
}

const CATEGORY_FILTERS: CategoryFilter[] = [
  {
    id: 'all',
    label: 'All Processors',
    matches: () => true,
  },
  {
    id: 'vocals',
    label: 'Vocal FX & Tuning',
    matches: (cat, id) => cat === 'Vocal Multi-FX' || id === 'pluggedin_plugvox',
  },
  {
    id: 'synths_samplers',
    label: 'Synths & 808s',
    matches: (cat, id) => cat === 'Sampler' || cat === 'Instruments & Synths',
  },
  {
    id: 'dynamics',
    label: 'Dynamics & Compressors',
    matches: (cat) => cat === 'Dynamics',
  },
  {
    id: 'eq',
    label: 'EQ & Tone Shaping',
    matches: (cat) => cat === 'Equalizer',
  },
  {
    id: 'reverb_delay',
    label: 'Reverb & Delay',
    matches: (cat) => cat === 'Reverb' || cat === 'Time-Based',
  },
  {
    id: 'creative',
    label: 'Creative & Multi-FX',
    matches: (cat) => cat === 'Pitch / Time' || cat === 'Multi-FX',
  },
];

export const PluginGrid: React.FC = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const currentFilter = CATEGORY_FILTERS.find((f) => f.id === selectedCategoryId) || CATEGORY_FILTERS[0];

  const filteredPlugins = useMemo(() => {
    return PLUGINS_DATA.filter((plugin) => {
      const matchesCat = currentFilter.matches(plugin.category, plugin.id);
      const matchesSearch =
        plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plugin.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plugin.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [currentFilter, searchQuery]);

  // Compute counts for each category badge
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CATEGORY_FILTERS.forEach((filter) => {
      counts[filter.id] = PLUGINS_DATA.filter((p) => filter.matches(p.category, p.id)).length;
    });
    return counts;
  }, []);

  return (
    <section id="plugins" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-400 mb-3 shadow-glow-cyan">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ALL 15 PLUGINS RELEASED • LAUNCH SALE UP TO 50% OFF</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            The Complete PluggedIN Studio Suite
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-2xl">
            Every instrument and processor is officially released and ready for your DAW. Save up to 50% on lifetime perpetual licenses, or unlock every single plugin with the All-Access Pass.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 808s, autotune, sampler, opto..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-studio-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan/60 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Category Filter Tabs with Dynamic Count Badges */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-10 scrollbar-none">
        {CATEGORY_FILTERS.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          const count = categoryCounts[cat.id] || 0;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-2 border ${
                isSelected
                  ? 'bg-gradient-to-r from-cyber-cyan to-blue-600 text-black border-transparent shadow-glow-cyan'
                  : 'bg-studio-900/80 text-slate-400 hover:text-slate-200 hover:bg-studio-850 border-white/5'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded-md ${
                  isSelected ? 'bg-black/20 text-black' : 'bg-white/5 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Plugins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlugins.map((plugin) => (
          <PluginCard key={plugin.id} plugin={plugin} />
        ))}
      </div>

      {filteredPlugins.length === 0 && (
        <div className="text-center py-20 bg-studio-900/40 rounded-3xl border border-white/5">
          <p className="text-base text-slate-400 font-bold">No plugins found matching &quot;{searchQuery}&quot;</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategoryId('all');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </section>
  );
};
