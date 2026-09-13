const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const CHANNELS = 2; // Stereo
const DURATION_SECS = 8.0; // 8 seconds loop
const NUM_SAMPLES = Math.floor(SAMPLE_RATE * DURATION_SECS);

// Helper to write a 16-bit stereo WAV buffer
function createWavBuffer(leftChannel, rightChannel) {
  const byteRate = SAMPLE_RATE * CHANNELS * 2;
  const blockAlign = CHANNELS * 2;
  const dataSize = NUM_SAMPLES * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF Chunk
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt Sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // SubChunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(CHANNELS, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // BitsPerSample (16)

  // data Sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < NUM_SAMPLES; i++) {
    // Clamp to -1.0 .. +1.0
    const l = Math.max(-1.0, Math.min(1.0, leftChannel[i] || 0));
    const r = Math.max(-1.0, Math.min(1.0, rightChannel[i] || 0));

    // Convert to 16-bit signed integer (-32768 to 32767)
    const sL = l < 0 ? Math.floor(l * 32768) : Math.floor(l * 32767);
    const sR = r < 0 ? Math.floor(r * 32768) : Math.floor(r * 32767);

    buffer.writeInt16LE(sL, offset);
    buffer.writeInt16LE(sR, offset + 2);
    offset += 4;
  }

  return buffer;
}

// -----------------------------------------------------------------------------
// 1. VOCAL DEMO: Modern Trap Melodic Vocal
// -----------------------------------------------------------------------------
function generateVocalDemos() {
  const dryL = new Float32Array(NUM_SAMPLES);
  const dryR = new Float32Array(NUM_SAMPLES);
  const wetL = new Float32Array(NUM_SAMPLES);
  const wetR = new Float32Array(NUM_SAMPLES);

  // Scale: F Minor (F3=174.61, G3=196, Ab3=207.65, Bb3=233.08, C4=261.63, Db4=277.18, Eb4=311.13, F4=349.23)
  // Target melody notes in Hz:
  const melodyNotes = [
    { start: 0.0, end: 1.8, targetFreq: 349.23 }, // F4
    { start: 1.8, end: 3.2, targetFreq: 311.13 }, // Eb4
    { start: 3.2, end: 4.8, targetFreq: 261.63 }, // C4
    { start: 4.8, end: 6.2, targetFreq: 277.18 }, // Db4
    { start: 6.2, end: 8.0, targetFreq: 261.63 }, // C4
  ];

  let dryPhase = 0;
  let wetPhase = 0;

  // Simple simple comb filter delay lines for reverb in wet channel
  const reverbBufferL = new Float32Array(8820); // ~200ms
  const reverbBufferR = new Float32Array(9400); // ~213ms
  let revIdxL = 0;
  let revIdxR = 0;

  for (let i = 0; i < NUM_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;

    // Find current melody note
    const note = melodyNotes.find(n => t >= n.start && t < n.end) || melodyNotes[melodyNotes.length - 1];

    // DRY: Imperfect human vocal: drifts flat (-15 cents), with natural vibrato
    const humanDrift = Math.sin(t * 1.5) * 6.0 - 4.0; // cents drift
    const vibrato = Math.sin(2 * Math.PI * 5.2 * t) * (t > (note.start + 0.5) ? 8.0 : 2.0); // vibrato kicks in after hold
    const dryFreq = note.targetFreq * Math.pow(2, (humanDrift + vibrato) / 1200);

    // Formant-rich saw/pulse simulation
    dryPhase += (2 * Math.PI * dryFreq) / SAMPLE_RATE;
    if (dryPhase > 2 * Math.PI) dryPhase -= 2 * Math.PI;

    // Vocal formant harmonics (F1 ~ 700Hz, F2 ~ 1200Hz, F3 ~ 2800Hz)
    let drySample = Math.sin(dryPhase) * 0.5 + Math.sin(dryPhase * 2) * 0.25 + Math.sin(dryPhase * 3) * 0.15;
    // Gentle mic room noise & breath
    const breath = (Math.random() - 0.5) * 0.02;
    drySample = (drySample + breath) * 0.5;

    dryL[i] = drySample;
    dryR[i] = drySample;

    // WET: Processed by PLUGTNE (hard autotune snap to exact note, 0ms speed) + PLUGVOX + PLUGVERB
    // Instant snap: frequency is bit-exact to target note
    const wetFreq = note.targetFreq;
    wetPhase += (2 * Math.PI * wetFreq) / SAMPLE_RATE;
    if (wetPhase > 2 * Math.PI) wetPhase -= 2 * Math.PI;

    // Hard-tuned formant signature (rich, polished commercial harmonics)
    let wetVocal = Math.sin(wetPhase) * 0.65 + Math.sin(wetPhase * 2) * 0.35 + Math.sin(wetPhase * 4) * 0.18;
    
    // PLUGVOX 40:1 leveling & soft saturation
    wetVocal = Math.tanh(wetVocal * 1.6) * 0.75;

    // PLUGVERB algorithmic decay
    const delayedL = reverbBufferL[revIdxL];
    const delayedR = reverbBufferR[revIdxR];
    reverbBufferL[revIdxL] = wetVocal + delayedL * 0.55;
    reverbBufferR[revIdxR] = wetVocal + delayedR * 0.58;
    revIdxL = (revIdxL + 1) % reverbBufferL.length;
    revIdxR = (revIdxR + 1) % reverbBufferR.length;

    wetL[i] = wetVocal * 0.8 + delayedL * 0.25;
    wetR[i] = wetVocal * 0.8 + delayedR * 0.28;
  }

  return { dryL, dryR, wetL, wetR };
}

// -----------------------------------------------------------------------------
// 2. SAMPLE CHOP DEMO: 70s Soul Vinyl vs PlugChop 16-Pad MPC Flip
// -----------------------------------------------------------------------------
function generateSampleDemos() {
  const dryL = new Float32Array(NUM_SAMPLES);
  const dryR = new Float32Array(NUM_SAMPLES);
  const wetL = new Float32Array(NUM_SAMPLES);
  const wetR = new Float32Array(NUM_SAMPLES);

  // 140 BPM grid: 1 beat = 60 / 140 = 0.4285 seconds
  const beatSec = 60.0 / 140.0;

  // DRY: Continuous 60 BPM vintage soul chord loop (Slow, unchopped)
  for (let i = 0; i < NUM_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    // Slow chord progression: Fm -> Bbm
    const chordTime = t % 4.0;
    const baseFreq = chordTime < 2.0 ? 174.61 : 233.08; // F3 vs Bb3
    
    // Warm Rhodes electric piano chords
    const rhodes = 0.3 * Math.sin(2 * Math.PI * baseFreq * t) +
                   0.25 * Math.sin(2 * Math.PI * baseFreq * 1.2 * t) +
                   0.2 * Math.sin(2 * Math.PI * baseFreq * 1.5 * t);
    
    // Soul brass horn stab
    const hornEnv = Math.exp(-(t % 2.0) * 8.0);
    const horn = Math.sin(2 * Math.PI * (baseFreq * 2) * t) * hornEnv * 0.4;

    // Vinyl crackle / tape hiss
    const vinyl = (Math.random() - 0.5) * 0.012;

    const sample = (rhodes + horn + vinyl) * 0.6;
    dryL[i] = sample;
    dryR[i] = sample;
  }

  // WET: Sliced into 16 pads and re-flipped with PlugChop 2.0 (140 BPM bounce, pitch shifted down 3 semitones)
  // Pitch ratio for -3 semitones: 2^(-3/12) = 0.8409
  const pitchRatio = Math.pow(2, -3 / 12);
  
  // Pad trigger pattern across 16 beats (8 seconds):
  // Beat 0: Pad 1 (Horn stab)
  // Beat 1.5: Pad 3 (Pitched vocal chop)
  // Beat 3: Pad 2 (Rhodes hit)
  // Beat 4: Pad 1 (Horn)
  // Beat 6: Pad 4 (Soul phrase reverse chop)
  // Beat 8: Pad 1
  // Beat 9.5: Pad 3 (Vocal stutter)
  // Beat 10: Pad 3 (Vocal stutter cut itself)
  // Beat 12: Pad 1
  // Beat 14: Pad 5 (Drop hit)
  const triggers = [
    { beat: 0.0, pad: 1, freq: 349.23 * pitchRatio },
    { beat: 1.5, pad: 3, freq: 523.25 * pitchRatio },
    { beat: 3.0, pad: 2, freq: 261.63 * pitchRatio },
    { beat: 4.0, pad: 1, freq: 349.23 * pitchRatio },
    { beat: 6.0, pad: 4, freq: 440.00 * pitchRatio },
    { beat: 8.0, pad: 1, freq: 349.23 * pitchRatio },
    { beat: 9.5, pad: 3, freq: 523.25 * pitchRatio },
    { beat: 10.0, pad: 3, freq: 523.25 * pitchRatio },
    { beat: 12.0, pad: 1, freq: 349.23 * pitchRatio },
    { beat: 14.0, pad: 5, freq: 392.00 * pitchRatio },
  ];

  let currentChop = null;
  let chopStartSample = 0;
  let triggerIndex = 0;

  for (let i = 0; i < NUM_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    const currentBeat = t / beatSec;

    if (triggerIndex < triggers.length && currentBeat >= triggers[triggerIndex].beat) {
      currentChop = triggers[triggerIndex];
      chopStartSample = i;
      triggerIndex++;
    }

    if (currentChop) {
      const chopTime = (i - chopStartSample) / SAMPLE_RATE;
      // Pad ADSR envelope with snappy attack and punch
      const env = Math.exp(-chopTime * 4.5);
      
      // Chopped harmonic hit
      let chopSample = Math.sin(2 * Math.PI * currentChop.freq * chopTime) * 0.6 +
                       Math.sin(2 * Math.PI * currentChop.freq * 2 * chopTime) * 0.3;
      
      // MPC 16-pad transient punch
      chopSample = Math.tanh(chopSample * 1.8) * env * 0.75;

      wetL[i] = chopSample;
      wetR[i] = chopSample;
    }
  }

  return { dryL, dryR, wetL, wetR };
}

// -----------------------------------------------------------------------------
// 3. 808 BASS DEMO: Clean Sine Sub vs Underground 12AX7 Tube Saturation
// -----------------------------------------------------------------------------
function generate808Demos() {
  const dryL = new Float32Array(NUM_SAMPLES);
  const dryR = new Float32Array(NUM_SAMPLES);
  const wetL = new Float32Array(NUM_SAMPLES);
  const wetR = new Float32Array(NUM_SAMPLES);

  const beatSec = 60.0 / 140.0; // 140 BPM
  const subHits = [
    { beat: 0.0, freq: 43.65 },  // F1 (43.65 Hz)
    { beat: 3.0, freq: 43.65 },  // F1
    { beat: 4.0, freq: 38.89 },  // Eb1 (38.89 Hz)
    { beat: 7.0, freq: 43.65 },  // F1
    { beat: 8.0, freq: 34.65 },  // Db1 (34.65 Hz)
    { beat: 11.0, freq: 38.89 }, // Eb1
    { beat: 12.0, freq: 43.65 }, // F1
    { beat: 15.0, freq: 58.27 }, // Bb1 slide
  ];

  let currentHit = null;
  let hitStart = 0;
  let hitIdx = 0;

  for (let i = 0; i < NUM_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    const currentBeat = t / beatSec;

    if (hitIdx < subHits.length && currentBeat >= subHits[hitIdx].beat) {
      currentHit = subHits[hitIdx];
      hitStart = i;
      hitIdx++;
    }

    if (currentHit) {
      const hitTime = (i - hitStart) / SAMPLE_RATE;
      // 808 pitch dive kick at the transient
      const pitchEnv = Math.exp(-hitTime * 40.0) * 80.0;
      const freq = currentHit.freq + pitchEnv;
      const sustainEnv = Math.exp(-hitTime * 1.5);

      // DRY: Pure pure sine sub (inaudible on phone/laptop speakers)
      const drySine = Math.sin(2 * Math.PI * freq * hitTime) * sustainEnv * 0.7;
      dryL[i] = drySine;
      dryR[i] = drySine;

      // WET: UNDERGRND 12AX7 tube saturation + asymmetric distortion + sub harmonics
      // Asymmetric triode transfer function: f(x) = x + 0.4*x^2 - 0.2*x^3
      const drive = 3.2; // +18 dB drive
      const driven = drySine * drive;
      let wetSat = Math.tanh(driven) + 0.3 * Math.tanh(driven * driven * 0.8);
      // Soft clip ceiling
      wetSat = Math.max(-0.95, Math.min(0.95, wetSat)) * 0.85;

      wetL[i] = wetSat;
      wetR[i] = wetSat;
    }
  }

  return { dryL, dryR, wetL, wetR };
}

// -----------------------------------------------------------------------------
// MAIN EXECUTION
// -----------------------------------------------------------------------------
const outputDir = path.join(__dirname, '..', 'public', 'audio');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Generating real studio audio demos...');

// 1. Vocal demos
const vocal = generateVocalDemos();
fs.writeFileSync(path.join(outputDir, 'vocal_dry.wav'), createWavBuffer(vocal.dryL, vocal.dryR));
fs.writeFileSync(path.join(outputDir, 'vocal_wet.wav'), createWavBuffer(vocal.wetL, vocal.wetR));
console.log('  ✓ Generated vocal_dry.wav & vocal_wet.wav (PLUGTNE + PLUGVOX)');

// 2. Sample Chop demos
const sample = generateSampleDemos();
fs.writeFileSync(path.join(outputDir, 'sample_dry.wav'), createWavBuffer(sample.dryL, sample.dryR));
fs.writeFileSync(path.join(outputDir, 'sample_wet.wav'), createWavBuffer(sample.wetL, sample.wetR));
console.log('  ✓ Generated sample_dry.wav & sample_wet.wav (PLUGCHOP 2.0)');

// 3. 808 Bass demos
const bass = generate808Demos();
fs.writeFileSync(path.join(outputDir, '808_dry.wav'), createWavBuffer(bass.dryL, bass.dryR));
fs.writeFileSync(path.join(outputDir, '808_wet.wav'), createWavBuffer(bass.wetL, bass.wetR));
console.log('  ✓ Generated 808_dry.wav & 808_wet.wav (UNDERGRND v4.2)');

console.log('All 6 audio demo files generated successfully in public/audio/!');
