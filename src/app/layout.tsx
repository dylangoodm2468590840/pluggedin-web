import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { TrafficTracker } from '../components/TrafficTracker';

export const viewport: Viewport = {
  themeColor: '#030712',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'PluggedIN Audio | Next-Gen VST3 & AU Studio Plugins',
  description: '15 flagship audio production plugins for FL Studio, Pro Tools, Logic Pro, and Ableton. Featuring PlugChop 16-Pad Sampler, PLUGTNE AutoTune, and Underground Analog Saturation.',
  keywords: ['audio plugins', 'vst3', 'au', 'autotune', 'sampler', 'mpc', 'fl studio', 'logic pro', 'pro tools', 'plugtune', 'plugchop', 'slate digital', 'waves'],
  manifest: '/manifest.json',
  icons: {
    icon: '/images/plugins/plugged1.png',
    apple: '/images/plugins/plugged1.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PluggedIN',
  },
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
      <head>
        <link rel="prefetch" href="/audio/vocal_dry.wav" as="audio" />
        <link rel="prefetch" href="/audio/vocal_tuned.wav" as="audio" />
        <link rel="prefetch" href="/audio/808_dry.wav" as="audio" />
        <link rel="prefetch" href="/audio/808_wet.wav" as="audio" />
        <link rel="prefetch" href="/audio/sample_dry.wav" as="audio" />
        <link rel="prefetch" href="/audio/sample_wet.wav" as="audio" />
      </head>
      <body className="min-h-screen flex flex-col bg-studio-950 text-slate-100 antialiased selection:bg-cyber-cyan selection:text-black">
        <TrafficTracker />
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
