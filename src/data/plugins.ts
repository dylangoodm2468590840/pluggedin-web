import { PluginData, DemoTrack } from '../types';

export const getPluginImageUrl = (id: string): string => {
  const map: Record<string, string> = {
    PlugChop: '/images/plugins/plugchop.png',
    PLUGTNE: '/images/plugins/plugtne.png',
    UNDERGRND: '/images/plugins/undergrnd.png',
    pluggedin_plugged1: '/images/plugins/pluggedin_plugged1.png',
    pluggedin_plugvox: '/images/plugins/pluggedin_plugvox.png',
    pluggedin_plugopto: '/images/plugins/pluggedin_plugopto.png',
    pluggedin_plugglue: '/images/plugins/pluggedin_plugglue.png',
    pluggedin_plugeq: '/images/plugins/pluggedin_plugeq.png',
    PlugLimit: '/images/plugins/pluglimit.png',
    PlugDelay: '/images/plugins/plugdelay.png',
    PlugVerb: '/images/plugins/plugverb.png',
    PlugRack: '/images/plugins/plugrack.png',
    PlugSilky: '/images/plugins/plugsilky.png',
    PlugBlue: '/images/plugins/plugblue.png',
    PlugWarp: '/images/plugins/plugwarp.png',
  };
  return map[id] || `/images/plugins/${id.toLowerCase()}.png`;
};

export const PLUGINS_DATA: PluginData[] = [
  {
    id: 'PlugChop',
    name: 'PLUGCHOP 2.0',
    shortName: 'PlugChop',
    subtitle: '16-Pad MPC & Serato Slicing Sample Workstation',
    category: 'Sampler',
    latestVersion: '2.0.0',
    devBuild: 'DEV-1022',
    retailPrice: 79,
    salePrice: 39,
    featured: true,
    accentColor: 'amber',
    formats: ['VST3', 'AU', 'Universal M1/M2/M3', 'Windows x64'],
    description: '16-pad MPC/Serato style sample slicing workstation with dull/medium/sharp transient auto-slicing, 1-to-16 beat grid chopping, pitch shifting, and choke groups.',
    features: [
      '16 Dynamic Velocity MPC Performance Pads with real-time waveform display',
      'Intelligent Auto-Slice: Dull, Medium, and Sharp transient detection algorithms',
      'Musical Slicing Modes: 1, 2, 4, 8, 16 Beat Grid chops & manual cue point drag',
      'Dual Pad Trigger Modes: One-Shot trigger or Gate / Hold playback',
      'Exclusive Choke Groups & Mono Cut-itself architecture to prevent voice overlap',
      'Real-Time Pitch Shift (±24 Semitones) with pristine anti-aliased interpolation',
      'Reverse sample toggle, Pad ADSR volume envelope & filter cutoff per pad'
    ]
  },
  {
    id: 'PLUGTNE',
    name: 'PLUGTNE v1.0.3',
    shortName: 'PlugTune',
    subtitle: 'Real-Time Pitch Correction & AutoTune Suite',
    category: 'Vocal Multi-FX',
    latestVersion: '1.0.3',
    devBuild: 'DEV-1079',
    retailPrice: 89,
    salePrice: 49,
    featured: true,
    accentColor: 'cyan',
    formats: ['VST3', 'AU', 'Universal M1/M2/M3', 'Windows x64'],
    description: 'Ultra-low latency real-time vocal pitch correction, dual vector oscilloscope, scale detection, and de-popped transition curves for modern trap, pop, and electronic vocals.',
    features: [
      'Zero-Latency Real-Time Monitoring engine suited for live vocal tracking',
      'Retune Speed from robotic hard-tune (0ms) to transparent natural vocal drift',
      'Full Scale & Root Key selector with automatic chromatic detection',
      'Dual Vector Oscilloscope visualizing incoming pitch vs. target note in real time',
      'Signalsmith linear STFT architecture with Intel and Apple Silicon hardware acceleration',
      'Clean binary identity bypassing historical DAW scan errors'
    ]
  },
  {
    id: 'UNDERGRND',
    name: 'UNDERGRND v4.2.6',
    shortName: 'Underground',
    subtitle: 'Boutique Vocal Multi-FX & Analog Heat Demon Suite',
    category: 'Vocal Multi-FX',
    latestVersion: '4.2.6',
    devBuild: 'DEV-0110',
    retailPrice: 59,
    salePrice: 29,
    featured: true,
    accentColor: 'rose',
    formats: ['VST3', 'AU', 'Universal M1/M2/M3', 'Windows x64'],
    description: 'Decimated NSDF pitch tracking, 3-band parametric formant warping, 12AX7 tube drive, and analog saturation designed to destroy 808s and transform vocals into demonic textures.',
    features: [
      'Dual Octave Pitch Shifting (-12 to +12 Semitones) with formant lock',
      'Formant Shift parameter transforming male vocals to female or demonic undertones',
      '12AX7 Dual-Triode Tube Saturation with asymmetric clipping harmonics',
      'Sub-Bass Generator adding tuned low-end rumble to thin recordings',
      'High-pass / Low-pass pre-distortion tone sculpting filters',
      'Parallel Wet/Dry Blend control for aggressive NYC parallel processing'
    ]
  },
  {
    id: 'pluggedin_plugged1',
    name: 'PLUGGED 1',
    shortName: 'Plugged 1',
    subtitle: 'Flagship Hybrid Synthesizer & Sub-808 Engine',
    category: 'Instruments & Synths',
    latestVersion: '1.0.2',
    devBuild: 'DEV-1026',
    retailPrice: 79,
    salePrice: 39,
    featured: true,
    accentColor: 'purple',
    formats: ['VST3', 'AU', 'Universal M1/M2/M3', 'Windows x64'],
    description: 'Commercial hybrid synth with dedicated Voice Choke & Cut Hardware Bay ("Cut Itself"), 808 Anti-Squeak circuit, 3D knurled ADSR knobs with live LED arcs, and electro-mechanical tines.',
    features: [
      'Polyphonic and Monophonic modes with authentic Hardware "Cut Itself" voice choking',
      'Dedicated 808 Sub Engine with Anti-Squeak zero-crossing phase realignment',
      '3D Knurled ADSR controls with illuminated live LED energy rings',
      'Multi-engine wavetables spanning vintage analog Rhodes to futuristic neuro basses',
      'Stereo unison detune with up to 16 voices per note and wide spatial spread'
    ]
  },
  {
    id: 'pluggedin_plugvox',
    name: 'PLUGVOX',
    shortName: 'PlugVox',
    subtitle: 'Modern RVox-Style Vocal Leveler & Gate',
    category: 'Dynamics',
    latestVersion: '1.0.2',
    devBuild: 'DEV-1020',
    retailPrice: 49,
    salePrice: 29,
    featured: false,
    accentColor: 'rose',
    formats: ['VST3', 'AU', 'Universal M1/M2/M3', 'Windows x64'],
    description: 'Authentic Renaissance Vox workflow: -48 dB leveling depth, automatic 40:1 program-dependent leveling ratio, 0.1ms clamp / 65ms release, and illuminated LED ladder meters.',
    features: [
      'Intuitive 2-slider workflow: Compression Threshold and Expansion Gate',
      'Program-dependent 40:1 soft-knee auto-leveling that pins vocals to the front',
      'Fast 0.1ms optical attack preventing vocal clipping without transient dulling',
      'Illuminated LED ladder meters showing input, gain reduction, and output simultaneously'
    ]
  },
  {
    id: 'pluggedin_plugopto',
    name: 'PLUGOPTO',
    shortName: 'PlugOpto',
    subtitle: 'Vintage CLA-2A Optical Tube Leveler',
    category: 'Dynamics',
    latestVersion: '1.0.3',
    devBuild: 'DEV-1016',
    retailPrice: 49,
    salePrice: 29,
    featured: false,
    accentColor: 'cyan',
    formats: ['VST3', 'AU', 'Universal M1/M2/M3', 'Windows x64'],
    description: 'Authentic Teletronix T4B electro-luminescent optical cell modeling, dual-time-constant release memory lag, and photorealistic analog VU meter.',
    features: [
      'Non-linear T4B optical cell response with realistic multi-stage release memory',
      'Smooth, creamy vocal compression that never sounds pumping or aggressive',
      'Limit / Compress switch with authentic 3:1 to ∞:1 ratio response',
      'Photorealistic analog VU meter with +4, +10, and Gain Reduction calibration modes'
    ]
  },
  {
    id: 'pluggedin_plugglue',
    name: 'PLUGGLUE',
    shortName: 'PlugGlue',
    subtitle: 'SSL 4000 G-Master Stereo Bus Compressor',
    category: 'Dynamics',
    latestVersion: '1.0.3',
    devBuild: 'DEV-1011',
    retailPrice: 49,
    salePrice: 29,
    featured: false,
    accentColor: 'emerald',
    formats: ['VST3', 'AU', 'Universal M1/M2/M3', 'Windows x64'],
    description: 'Solid State Logic 4000 G-Master bus compression, parallel Mix knob (0–100%), photorealistic Sifam Meter with linear needle travel, and stepped chicken-head knobs.',
    features: [
      'The legendary British console mix bus "glue" that binds drum kits and final mixes',
      'Stepped ratio selector: 2:1, 4:1, and 10:1 for versatile mastering and punch',
      'High-Pass Sidechain filter preventing kick drums from falsely triggering compression',
      'Integrated parallel Mix control for fast New York style drum compression'
    ]
  },
  {
    id: 'pluggedin_plugeq',
    name: 'PLUG EQ',
    shortName: 'Plug EQ',
    subtitle: '24-Band Precision Dynamic Visual Equalizer',
    category: 'Equalizer',
    latestVersion: '1.0.2',
    devBuild: 'DEV-1016',
    retailPrice: 49,
    salePrice: 29,
    featured: false,
    accentColor: 'purple',
    formats: ['VST3', 'AU', 'Universal M1/M2/M3', 'Windows x64'],
    description: '4096-point FFT with continuous fractional Catmull-Rom cubic interpolation, 1/24th-octave Gaussian smoothing, and band-isolated dynamic EQ sidechains.',
    features: [
      'Up to 24 parametric bands with zero phase degradation and linear frequency response',
      'Dynamic EQ mode on every band with automatic threshold and ratio clamping',
      'High-resolution real-time spectrum analyzer with pre- and post-EQ curve overlays',
      'Precision Q bandwidth adjustment from broad mastering shelves to surgical notch cuts'
    ]
  },
  {
    id: 'PlugLimit',
    name: 'PLUGLIMIT',
    shortName: 'PlugLimit',
    subtitle: '1:1 Hardware L1 Ultramaximizer & Peak Limiter',
    category: 'Dynamics',
    latestVersion: '1.0.2',
    devBuild: 'DEV-1005',
    retailPrice: 39,
    salePrice: 19,
    featured: false,
    accentColor: 'amber',
    formats: ['VST3', 'AU', 'Universal M1/M2/M3', 'Windows x64'],
    description: '1:1 hardware console peak limiter with lookahead brickwall clamp, dual sculpted aluminum faders, knurled release knob, and CRT oscilloscope.',
    features: [
      'Lookahead true-peak brickwall limiting that eliminates inter-sample clipping',
      'Linked Threshold and Ceiling faders for instant, effortless volume maximization',
      'Knurled release dial with auto-release memory for punchy drum mastering',
      'Real-time CRT waveform oscilloscope visualizer showing clipped peaks'
    ]
  },
  {
    id: 'PlugDelay',
    name: 'PLUGDELAY',
    shortName: 'PlugDelay',
    subtitle: 'Flagship Vocal & Mix Studio Delay',
    category: 'Time-Based',
    latestVersion: '1.0.1',
    devBuild: 'DEV-1007',
    retailPrice: 39,
    salePrice: 19,
    featured: false,
    accentColor: 'cyan',
    formats: ['VST3', 'AU', 'Universal M1/M2/M3', 'Windows x64'],
    description: 'Stereo ping-pong delay with analog tape saturation, ducking sidechain, high-pass/low-pass filters, and millisecond/beat-sync tempos.',
    features: [
      'Independent Left/Right time controls with straight, dotted, and triplet sync',
      'Built-in Vocal Ducking circuit that clears space while the artist sings',
      'Analog Tape Flutter & Saturation engine adding vintage warmth to repeats',
      'Interactive ping-pong stereo spreader with high-damping tone filters'
    ]
  },
  {
    id: 'PlugVerb',
    name: 'PLUGVERB',
    shortName: 'PlugVerb',
    subtitle: 'Flagship Acoustic Space & Algorithmic Reverb',
    category: 'Reverb',
    latestVersion: '1.0.3',
    devBuild: 'DEV-1021',
    retailPrice: 49,
    salePrice: 24,
    featured: false,
    accentColor: 'purple',
    formats: ['VST3', 'AU', 'Universal M1/M2/M3', 'Windows x64'],
    description: 'Multi-band algorithmic space reverb with interactive decay visualizer, pre-delay, diffusion, and warmth coloring.',
    features: [
      'Smooth algorithmic reverb tail with zero metallic ringing or graininess',
      'Interactive frequency decay visualizer showing reverb falloff in real time',
      'Pre-delay syncable to project BPM for upfront lead vocals',
      'Modulation engine adding gentle pitch chorusing inside the reverb chamber'
    ]
  },
  {
    id: 'PlugRack',
    name: 'PLUGRACK',
    shortName: 'PlugRack',
    subtitle: 'Modular Multi-FX Hardware Host',
    category: 'Utility',
    latestVersion: '1.0.1',
    devBuild: 'DEV-1020',
    retailPrice: 39,
    salePrice: 19,
    featured: false,
    accentColor: 'blue',
    formats: ['VST3', 'AU', 'Universal M1/M2/M3', 'Windows x64'],
    description: 'Chained modular channel strip rack host housing any combination of PluggedIN compressors, EQs, limiters, and vocal suites.',
    features: [
      'Drag-and-drop signal flow ordering (Compressor -> EQ -> Delay -> Limiter)',
      'Global master input/output gain staging with mono compatibility checker',
      'One-click preset saving across your entire custom processing chain',
      'Ultra-efficient zero-latency internal routing'
    ]
  },
  {
    id: 'PlugSilky',
    name: 'PLUGSILKY',
    shortName: 'PlugSilky',
    subtitle: 'Dynamic Multi-Band Air & High-End Polisher',
    category: 'Mastering',
    latestVersion: '1.0.0',
    devBuild: 'DEV-1012',
    retailPrice: 49,
    salePrice: 29,
    featured: false,
    accentColor: 'cyan',
    formats: ['VST3', 'AU', 'Universal M1/M2/M3', 'Windows x64'],
    description: 'Ultra-clean dynamic multi-band spectral exciter and air polisher, +1.5 dBFS linear headroom, and Gaussian stereo expansion.',
    features: [
      'Adds expensive high-end "sheen" and acoustic air without harsh sibilance',
      'Gaussian stereo width enhancer that keeps bass frequencies 100% mono-safe',
      'Dynamic high-band expansion emphasizing vocal harmonics and drum cymbals',
      'Linear-phase crossover filters preserving mix clarity and transients'
    ]
  },
  {
    id: 'PlugBlue',
    name: 'PLUGBLUE',
    shortName: 'PlugBlue',
    subtitle: 'Vintage Blue-Stripe Optical & FET Leveler',
    category: 'Dynamics',
    latestVersion: '1.0.0',
    devBuild: 'DEV-1003',
    retailPrice: 49,
    salePrice: 29,
    featured: false,
    accentColor: 'blue',
    formats: ['VST3', 'AU', 'Universal M1/M2/M3', 'Windows x64'],
    description: 'Aggressive vintage 1176 Blue-Stripe discrete FET compressor recreation with ultra-fast attack times, harmonic drive, and all-buttons-in mode.',
    features: [
      'Lightning-fast 20-microsecond FET attack capturing sharp snare drum transients',
      'Authentic "All-Buttons-In" British slam mode for explosive drum room mics',
      'Harmonic saturation character adding grit to aggressive rap and rock vocals',
      'Analog-modeled transistor distortion stages'
    ]
  },
  {
    id: 'PlugWarp',
    name: 'PLUGWARP',
    shortName: 'PlugWarp',
    subtitle: 'Dual-Stage Pitch, Time & Spectral Warper',
    category: 'Pitch / Time',
    latestVersion: '1.0.0',
    devBuild: 'DEV-1004',
    retailPrice: 49,
    salePrice: 24,
    featured: false,
    accentColor: 'purple',
    formats: ['VST3', 'AU', 'Universal M1/M2/M3', 'Windows x64'],
    description: 'Dual-engine real-time granular time-stretching, formant-preserved pitch warping, and frequency spectrum tape morphing.',
    features: [
      'Real-time tape stop effect with customizable deceleration curve',
      'Granular formant pitch transposer with zero phase cancellation',
      'Spectral blur filter creating ambient ethereal synth pads out of raw audio',
      'BPM-synchronized time-stretching for instant half-time / double-time flips'
    ]
  }
];

export const DEMO_TRACKS: DemoTrack[] = [
  {
    id: 'trap_vocal',
    title: 'Lead Vocal Chain (Dylan Desktop Stem)',
    genre: 'Melodic Trap • F Minor',
    pluginUsed: 'PLUGTNE + PLUGVOX + PLUGEQ + PLUGVERB',
    description: 'Direct from Dylan\'s desktop microphone in F Minor. Toggle individual plugins (AutoTune, RVox Leveler, Air EQ, Reverb) on/off in real time to isolate what each plugin does.',
    dryLabel: 'Raw Desktop Mic (Bypass All)',
    wetLabel: 'Full Flagship Vocal Chain'
  },
  {
    id: 'hiphop_sample',
    title: 'Vintage Soul Sample Flip',
    genre: 'Hip Hop / Boom Bap',
    pluginUsed: 'PLUGCHOP 2.0 (16-Pad Sampler)',
    description: 'A 1970s vinyl soul record chopped, pitched down 3 semitones, and re-sequenced into a hard-hitting MPC trap loop.',
    dryLabel: 'Original Vinyl Loop',
    wetLabel: 'PlugChop 16-Pad Chop'
  },
  {
    id: 'distorted_808',
    title: 'Sub-Bass 808 & Dark Rap',
    genre: 'Dark Trap / Rage',
    pluginUsed: 'UNDERGRND v4.2 + PLUGGED 1',
    description: 'A clean sine sub-bass driven through UNDERGRND tube saturation and low-end harmonics that shake phone speakers.',
    dryLabel: 'Dry Sine 808',
    wetLabel: 'Underground Tube Heat'
  }
];

export const TOTAL_CATALOG_VALUE = 799;
export const ALL_ACCESS_MONTHLY = 14.99;
export const ALL_ACCESS_ANNUAL = 99;
export const FOUNDERS_PROMO_MONTHLY = 9.99;
export const FOUNDERS_SPOTS_TOTAL = 250;
export const FOUNDERS_SPOTS_REMAINING = 47;
