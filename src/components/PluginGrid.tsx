'use client';

import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { PLUGINS_DATA } from '../data/plugins';
import { PluginCard } from './PluginCard';

export const PluginGrid: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'All',
    'Vocal Multi-FX',
    'Sampler',
    'Instruments & Synths',
    'Dynamics',
    'Equalizer',
    'Time-Based',
    'Reverb',
    'Mastering',
  ];

  const filteredPlugins = useMemo(() => {
    return PLUGINS_DATA.filter((plugin) => {
      const matchesCategory = selectedCategory === 'All' || plugin.category === selectedCategory;
      const matchesSearch =
        plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plugin.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plugin.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <section id="plugins" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/20 text-xs font-bold text-cyber-cyan mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>15 FLAGSHIP PROCESSORS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            The Complete Suite
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-xl">
            Each instrument and effect is custom-engineered in C++ for maximum CPU efficiency, zero host latency, and pristine analog harmonics.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plugins, 808s, autotune..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-studio-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan/50 transition-all"
          />
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-cyber-cyan to-blue-600 text-black shadow-glow-cyan'
                : 'bg-studio-900/80 text-slate-400 hover:text-slate-200 hover:bg-studio-850 border border-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Plugins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlugins.map((plugin) => (
          <PluginCard key={plugin.id} plugin={plugin} />
        ))}
      </div>

      {filteredPlugins.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <p className="text-sm">No plugins found matching &quot;{searchQuery}&quot;.</p>
        </div>
      )}
    </section>
  );
};
