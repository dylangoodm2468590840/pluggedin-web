import React from 'react';
import { PricingSection } from '../../components/PricingSection';

export default function PricingPage() {
  return (
    <div className="pt-8 pb-16">
      <PricingSection />

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <h3 className="text-2xl font-black text-white text-center mb-8">
          Frequently Asked Questions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-2">
            <h4 className="font-bold text-white">Can I buy individual plugins instead of subscribing?</h4>
            <p className="text-slate-400 leading-relaxed">
              Yes! Every single one of our 15 plugins can be purchased as a perpetual lifetime license ($19 - $49). You own it forever with free point updates and zero recurring fees.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-2">
            <h4 className="font-bold text-white">How many computers can I install on?</h4>
            <p className="text-slate-400 leading-relaxed">
              Each license or All-Access Pass allows you to activate up to 3 studio machines simultaneously (e.g. your studio desktop, live laptop, and home setup).
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-2">
            <h4 className="font-bold text-white">What happens if I cancel my All-Access Pass?</h4>
            <p className="text-slate-400 leading-relaxed">
              If you cancel, your subscription remains active until the end of your billing cycle. Any individual perpetual licenses you purchased separately remain unlocked forever.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-2">
            <h4 className="font-bold text-white">Do I need an internet connection to use plugins?</h4>
            <p className="text-slate-400 leading-relaxed">
              No! Once authorized through PluggedIN Central, all plugins run 100% offline in your DAW with zero internet connection or hardware dongles required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
