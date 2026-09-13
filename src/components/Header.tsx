'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Download, User, Menu, X, Disc, ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-studio-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyber-cyan via-cyber-purple to-pink-500 p-[1.5px] shadow-glow-cyan transition-all group-hover:scale-105">
            <div className="w-full h-full bg-studio-950 rounded-[10px] flex items-center justify-center">
              <Disc className="w-5 h-5 text-cyber-cyan animate-spin-slow group-hover:text-white transition-colors" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="text-xl font-black tracking-wider text-white">PLUGGED</span>
              <span className="text-xl font-black tracking-wider text-cyber-cyan">IN</span>
            </div>
            <span className="text-[9px] font-mono tracking-widest uppercase text-slate-400">Audio Technologies</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
          <Link href="/#plugins" className="hover:text-cyber-cyan transition-colors">
            Plugins Catalog
          </Link>
          <Link href="/#sound-explorer" className="hover:text-cyber-cyan transition-colors flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyber-cyan" />
            <span>Sound Bank</span>
          </Link>
          <Link href="/pricing" className="hover:text-cyber-purple transition-colors flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-cyber-purple" />
            <span>All-Access Pass</span>
          </Link>
          <Link href="/download" className="hover:text-cyber-cyan transition-colors flex items-center space-x-1">
            <Download className="w-4 h-4 text-slate-400" />
            <span>Download Central</span>
          </Link>
        </nav>

        {/* Action CTAs */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            href="/account"
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 border border-white/5 transition-all"
          >
            <User className="w-4 h-4 text-slate-400" />
            <span>Account</span>
          </Link>

          <Link
            href="/pricing"
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-600 text-black text-xs font-black shadow-glow-cyan hover:brightness-110 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Get Pass • $14.99</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center space-x-3">
          <Link
            href="/download"
            className="p-2 rounded-xl bg-cyber-cyan text-black"
            title="Download Central"
          >
            <Download className="w-5 h-5" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-studio-900/95 backdrop-blur-2xl px-6 py-6 space-y-4">
          <Link
            href="/#plugins"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-slate-200 hover:text-cyber-cyan"
          >
            Plugins Catalog
          </Link>
          <Link
            href="/#sound-explorer"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-cyber-cyan"
          >
            PLUGGED 1 Sound Bank
          </Link>
          <Link
            href="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-cyber-purple"
          >
            All-Access Pass ($14.99/mo)
          </Link>
          <Link
            href="/download"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-slate-200"
          >
            Download PluggedIN Central
          </Link>
          <div className="pt-4 border-t border-white/5 flex flex-col space-y-3">
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-600 text-black text-sm font-black shadow-glow-cyan"
            >
              Get All-Access Pass
            </Link>
            <Link
              href="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-xl bg-white/5 text-slate-300 text-sm font-semibold border border-white/10"
            >
              Sign In to Account
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
