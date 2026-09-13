export interface PluginData {
  id: string;
  name: string;
  shortName: string;
  subtitle: string;
  category: 'Vocal Multi-FX' | 'Instruments & Synths' | 'Dynamics' | 'Equalizer' | 'Time-Based' | 'Reverb' | 'Mastering' | 'Sampler' | 'Utility' | 'Pitch / Time';
  latestVersion: string;
  devBuild: string;
  description: string;
  features: string[];
  retailPrice: number;
  salePrice: number;
  featured?: boolean;
  accentColor: 'cyan' | 'purple' | 'rose' | 'amber' | 'emerald' | 'blue';
  formats: string[];
  imageUrl?: string;
  downloadWinUrl?: string;
  downloadMacUrl?: string;
}

export interface DemoTrack {
  id: string;
  title: string;
  genre: string;
  pluginUsed: string;
  description: string;
  dryLabel: string;
  wetLabel: string;
}

export interface UserAccount {
  uid: string;
  email: string;
  displayName: string;
  tier: 'All Access Studio Pass' | 'Standard' | 'Pioneer Beta Tester (Lifetime)';
  isLifetimeVIP: boolean;
  subscriptionStatus: 'active' | 'inactive' | 'none';
  ownedPlugins: string[];
  authorizedMachines: string[];
}
