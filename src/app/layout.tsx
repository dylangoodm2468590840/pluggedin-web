import type { Metadata } from 'next';
import './globals.css';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export const metadata: Metadata = {
  title: 'PluggedIN Audio | Next-Gen VST3 & AU Studio Plugins',
  description: '15 flagship audio production plugins for FL Studio, Pro Tools, Logic Pro, and Ableton. Featuring PlugChop 16-Pad Sampler, PLUGTNE AutoTune, and Underground Analog Saturation.',
  keywords: ['audio plugins', 'vst3', 'au', 'autotune', 'sampler', 'mpc', 'fl studio', 'logic pro', 'pro tools', 'plugtune', 'plugchop', 'slate digital', 'waves'],
  openGraph: {
    title: 'PluggedIN Audio | Studio-Grade Audio Plugins',
    description: 'Zero-latency autotune, 16-pad sampling, and analog heat. Download PluggedIN Central today.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-studio-950 text-slate-100 antialiased selection:bg-cyber-cyan selection:text-black">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
