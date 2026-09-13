import { Hero } from '../components/Hero';
import { AudioDemoPlayer } from '../components/AudioDemoPlayer';
import { PluginGrid } from '../components/PluginGrid';
import { Plugged1SoundExplorer } from '../components/Plugged1SoundExplorer';
import { PricingSection } from '../components/PricingSection';
import { DownloadHub } from '../components/DownloadHub';

export default function HomePage() {
  return (
    <div className="space-y-12">
      <Hero />
      <AudioDemoPlayer />
      <PluginGrid />
      <Plugged1SoundExplorer />
      <PricingSection />
      <DownloadHub />
    </div>
  );
}
