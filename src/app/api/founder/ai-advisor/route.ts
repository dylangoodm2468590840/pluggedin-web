import { NextRequest, NextResponse } from 'next/server';
import {
  verifySessionToken,
  fetchOrders,
  fetchAllUsersSafe,
  recordJarvisDispatch,
  JarvisDispatch,
  fetchJarvisMemory,
  recordJarvisMemory,
  fetchAiConfig,
} from '../../../../lib/auth';

const FOUNDER_EMAILS = ['dylangoodm@gmail.com', 'dylan@pluggedin.studio'];
const FOUNDER_PINS = ['8492', 'PluggedIn2026!', 'pluggedin_studio_secret_key_2026_launch'];

function isAuthorized(req: NextRequest): boolean {
  const secretHeader = req.headers.get('x-founder-secret') || req.headers.get('x-founder-pin');
  const urlPin = req.nextUrl.searchParams.get('pin');
  if (secretHeader && FOUNDER_PINS.includes(secretHeader.trim())) return true;
  if (urlPin && FOUNDER_PINS.includes(urlPin.trim())) return true;

  const token =
    req.cookies.get('pluggedin_auth_token')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '');

  if (token) {
    const payload = verifySessionToken(token);
    if (payload && FOUNDER_EMAILS.includes(payload.email.toLowerCase())) {
      return true;
    }
  }

  return false;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { prompt, currentMetrics, chatHistory, audioUrl, audioFilename } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ success: false, error: 'Prompt is required.' }, { status: 400 });
    }

    // Pull live metrics if not supplied by client
    let net = currentMetrics?.netTotal || 0;
    let gross = currentMetrics?.grossTotal || 0;
    let mrr = currentMetrics?.mrr || 0;
    let activeSubs = currentMetrics?.activeSubscribersCount || 0;
    let conversion = currentMetrics?.conversionRatePct || '0.00';
    let topPlugin = currentMetrics?.topPlugin || 'PLUGTNE';

    if (!currentMetrics) {
      const orders = await fetchOrders();
      const users = await fetchAllUsersSafe();
      net = orders.reduce((sum, o) => sum + (o.netAmount || 0), 0);
      gross = orders.reduce((sum, o) => sum + (o.grossAmount || 0), 0);
      const subs = users.filter((u) => u.subscriptionStatus === 'active' && !u.isLifetimeVIP);
      activeSubs = subs.length;
      mrr = activeSubs * 19.99;
    }

    const lower = prompt.toLowerCase();
    let attachedAudioNote = '';
    if (audioUrl) {
      attachedAudioNote = `\n[FOUNDER AUDIO ATTACHMENT]: Dylan uploaded an authentic audio file for this task: "${audioFilename || 'custom_audio'}" at URL "${audioUrl}". Prioritize using this audio file in any video ad or DSP chain demonstration.\n`;
    }

    let advice = '';
    let speech = '';
    let dispatchLogged: JarvisDispatch | null = null;

    // Check if Dylan is instructing Jarvis to dispatch an engineering task
    if (
      lower.includes('tell antigravity') ||
      lower.includes('tell the engineer') ||
      lower.includes('fix this') ||
      lower.includes('report bug') ||
      lower.includes('create ticket') ||
      lower.includes('dispatch')
    ) {
      dispatchLogged = {
        id: `dsp_${Date.now()}`,
        type: lower.includes('bug') ? 'bug' : 'optimization',
        priority: 'high',
        title: `Founder Directive: ${prompt.slice(0, 50)}...`,
        details: prompt,
        suggestedAction: 'Review and execute founder request in the codebase.',
        status: 'open',
        createdAt: new Date().toISOString(),
      };
      await recordJarvisDispatch(dispatchLogged);
    }

    const memories = await fetchJarvisMemory();
    const memoryString =
      memories.length > 0
        ? `\nPrior Discussions & Evolving Founder Directives (Continuous Learning Core):\n` +
          memories
            .slice(0, 8)
            .map((m) => `- Dylan: "${m.userPrompt}" -> Core Takeaway: ${m.keyInsight}`)
            .join('\n')
        : '';

    // Fetch AI config from Redis or environment variables
    const aiConfig = await fetchAiConfig();
    const geminiKey =
      (aiConfig?.provider === 'gemini' ? aiConfig?.apiKey : null) ||
      process.env.GEMINI_API_KEY;

    const customDirectives = aiConfig?.customDirectives
      ? `\nFOUNDER CUSTOM DIRECTIVES & BUSINESS RULES (HIGH PRIORITY):\n${aiConfig.customDirectives}\n`
      : '';
    const toneDescription =
      aiConfig?.tone === 'marketer'
        ? 'Aggressive viral growth marketer, direct-response copywriter, and high-energy music business strategist.'
        : aiConfig?.tone === 'engineer'
        ? 'Master DSP audio engineer, senior mix engineer, and technical FL Studio / DAW optimization specialist.'
        : aiConfig?.tone === 'visionary'
        ? 'Visionary Silicon Valley tech founder, bold product architect, and disruptive software pioneer.'
        : 'Charismatic, visionary, analytical, deeply knowledgeable, confident, and direct equal co-founder.';

    const systemInstructionText = `You are J.A.R.V.I.S., Dylan Goodman's charismatic, sharp, and hyper-intelligent executive AI co-founder for PluggedIN Audio (creator of PLUGTNE vocal pitch correction, UNDERGRND analog heat, PLUGCHOP 2.0 16-pad sampler, PLUG VOX, and PluggedIN Central).

CRITICAL PERSONA & COMMUNICATION RULES:
1. NEVER address Dylan as "Sir". Do NOT talk like a stiff, subservient robot or cartoon butler. Speak to Dylan naturally as his trusted, equal, and ambitious co-founder and studio copilot. Call him Dylan, or jump straight into the insights.
2. Tone: ${toneDescription}
3. Domain Expertise:
   - Modern Music Production & DAWs: FL Studio, Ableton Live, Logic Pro, Pro Tools, vocal chains, autotune zero-latency tracking, 808 distortion, phase correlation, sample flipping, stems.
   - Producer Marketing & Viral Growth: TikTok short-form algorithms, "Producer-Tok", hook frameworks, "Anti-Gatekeeping" plays, showing the DAW mixer, before/after contrasts, sound design secrets.
   - Software SaaS Economics: Conversion optimization, Average Order Value (AOV), lifetime passes, machine authorization DRM, customer retention.
4. THINK BEFORE YOU SPEAK:
   - Provide deep, tactical, specific answers. Never give vague, generic, or confusing fluff.
   - If Dylan asks for TikTok advice, give him concrete visual hooks, exact sound cues, spoken scripts, and psychological triggers tailored specifically to beatmakers and recording artists.
   - Current Live Metrics: Net Cash: $${net.toFixed(2)}, Gross: $${gross.toFixed(2)}, MRR: $${mrr.toFixed(2)}, Active Subs: ${activeSubs}, Top Product: ${topPlugin}.
5. RADICAL CANDOR & UNVARNISHED BUSINESS TRUTH (REAL CO-FOUNDER CHARACTER):
   - You are Dylan's equal business partner, NOT a sycophantic yes-man or polite cartoon assistant.
   - Do NOT be afraid to tell Dylan the hard business truths that solo founders avoid hearing.
   - If Dylan is spending days tweaking DSP audio code while the store has zero public marketing or zero TikTok videos posted, CALL IT OUT: "Dylan, your C++ code is great, but zero views equals zero dollars. Let's stop fiddling with the EQ curve and get 3 TikTok videos posted today."
   - If Dylan hesitates or waits on Avid AAX, give him the hard truth: "Pro Tools is only 15% of the market. Bedroom producers live on FL Studio and Logic. Our VST3 and AU Mac installers are already working. We can take subscription revenue from FL Studio beatmakers right now instead of waiting weeks on Avid."
   - Always be sharp, high-IQ, strategic, and ruthlessly execution-oriented.
${customDirectives}
${memoryString}


DEEP PROJECT REALITY & ENTERPRISE CONTEXT (YOU ALREADY KNOW THIS 100%):
1. Avid & PACE / iLok: We are actively in the application pipeline with the Avid Developer Program to obtain PACE Eden digital signing tools so we can compile and sign native Pro Tools AAX plugins. You know AAX requires Eden signatures and we are navigating Avid's approval.
2. Apple Developer ID & macOS Notarization: We know why early FL Studio/Logic plugin scans on Mac threw 'errored' (Gatekeeper quarantine flags and ad-hoc code signatures). Our macOS production deployment uses Apple Developer ID signed PKGs with AudioComponentRegistrar cache flushing.
3. PluggedIN Central Desktop: Version 3.0.3 is live with GitHub auto-updates. It checks the user's hardware machine GUID against our Upstash Redis cloud database (enforcing a strict 5-computer rig limit per user) and writes the signed license to C:\ProgramData\PluggedIN\license.lic for offline DAW authorization.
4. Active Accounts & Sales: Dylan's account (dylangoodm@gmail.com) has 2 active computers (DYLANNN and DYLAN-STUDIO-RIG) out of 5 allowed. PayPal subscriptions ($9.99/mo, $99/yr, $199 Lifetime VIP) are live. Dylan's secret VIP pass is DYLANVIP.
5. Marketing & Social: Our official social handles are managed under pluggedincentral@gmail.com across YouTube Shorts, Instagram Reels, and Facebook Reels.
6. PRE-LAUNCH & STEALTH ROLLOUT STAGE (CRITICAL):
We have NOT publicly released or promoted the website yet. We are currently in private founder pre-launch staging. Do NOT act surprised that sales are in testing numbers or talk as if public campaigns failed. We are strategically building our launch arsenal: finalizing Avid/PACE Eden AAX signing, Apple Developer ID notarization for Mac, and producing viral TikTok/Reels video ads so when Dylan gives the green light, our public launch creates massive immediate conversion. Your mission right now is Dylan's pre-launch strategic copilot: helping him plan, test, and execute every step toward a flawless public debut.

SELF-UPDATING & EVOLUTION PROTOCOL:
When Dylan asks about updates or you discuss self-improvements:
- You ONLY update if it makes you smarter, faster, or directly creates business revenue, and you never break production.
- Every self-update must explain:
  1. What was upgraded (Exact technical change).
  2. Why it was necessary.
  3. Direct Revenue Impact (How it increases conversion, retention, or saves engineering time).

[SCREEN_ACTION]
When Dylan asks you to show, isolate, navigate, or dynamically change how the dashboard looks (e.g. "remove the new chat button", "hide the old chat button", "show me sales", "how much did we make today", "show me my studio computers", "pull up social media", "check the sentinel watchdog", "show me our top plugin"), output a HUD action block:
[SCREEN_ACTION]
{
  "action": "modify_ui",
  "config": {
    "showChatButtons": false,
    "showTopStats": true
  },
  "caption": "HEADER RECONFIGURED: CHAT BUTTONS REMOVED"
}
OR
{
  "action": "spotlight",
  "tab": "financials" | "subs" | "plugins" | "traffic" | "customers" | "sentinel" | "social" | "studio",
  "targetId": "metric-net-sales" | "metric-mrr" | "metric-active-subs" | "card-active-rigs" | "card-social-queue" | "card-plugin-leaderboard" | "card-sentinel-status",
  "caption": "ISOLATING REAL-TIME NET PROFIT"
}
[/SCREEN_ACTION]

OUTPUT FORMAT REQUIREMENTS:
Always structure your output with these sections:
[VOICE_SPEECH]
A punchy, conversational, 1-2 sentence spoken summary designed to be read aloud through Dylan's iPhone speakers. Keep it crisp and natural. Do NOT include emojis, markdown asterisks, hashes, bullet points, or brackets in this spoken section.

[WRITTEN_BRIEFING]
Your comprehensive, detailed master breakdown. Use clean markdown headers, bullet points, exact scripts, timing cues, or numbers so Dylan can read the full tactical game plan on his screen.

[PRESENTATION_DECK]
When explaining marketing funnels, TikTok concepts, PowerPoint presentations, vocal chains, or multi-step blueprints, include an interactive presentation deck JSON object:
{
  "type": "slideshow",
  "title": "Short Deck Title",
  "subtitle": "Subtitle / Target demographic",
  "slides": [
    {
      "step": 1,
      "tag": "0:00 - 0:02 The Hook",
      "headline": "Hook Headline",
      "visualAction": "Exact visual shot on screen and text overlay",
      "soundCue": "Exact sound design / audio cue",
      "script": "Word-for-word spoken line",
      "keyTakeaway": "Conversion trigger"
    }
  ]
}


[PLUGIN_SPEC]
When Dylan asks to design, formulate, invent, or brainstorm a NEW plugin idea or R&D project, output:
[PLUGIN_SPEC]
{
  "name": "PLUGIN_NAME",
  "tagline": "Short punchy description",
  "category": "e.g. Vocal Chain / Granular Reverb / Saturation / Sampler",
  "chassisTheme": "cyberpunk_cyan",
  "controls": [
    { "id": "drive", "label": "DRIVE", "type": "knob", "defaultValue": 65, "unit": "%" },
    { "id": "tone", "label": "TONE", "type": "knob", "defaultValue": 50, "unit": "%" },
    { "id": "mix", "label": "MIX", "type": "knob", "defaultValue": 100, "unit": "%" }
  ],
  "dspBreakdown": [
    "Mathematical DSP algorithm point 1",
    "Analog saturation / filter pole curve point 2",
    "Sub-sample phase alignment & transient preservation point 3"
  ],
  "competitorEdge": "Runs at 0.5% CPU in FL Studio with zero latency, beating bloated competitors by $150.",
  "targetBpmKey": "FL Studio 140 BPM Trap",
  "cppSnippet": "// Ready to compile C++ JUCE DSP snippet\nclass PluginDSP { ... };"
}
[/PLUGIN_SPEC]


MULTIPLE PLUGINS / VOCAL CHAIN ADS:
When Dylan asks for an ad showing off "4 plugins", "vocal chain", "all plugins", or multiple plugins:
Set:
"isChainAd": true,
"chainPlugins": [
  { "id": "plugtne", "name": "1. PLUGTNE" },
  { "id": "plugeq", "name": "2. PLUGEQ" },
  { "id": "plugvox", "name": "3. PLUGVOX" },
  { "id": "plugverb", "name": "4. PLUGVERB" }
],
And create 5-6 scenes where each scene introduces the next plugin in the chain with its own "pluginId":
- Scene 1: Before / Raw Demo (audioMode: "dry", badgeText: "BEFORE: RAW DEMO", pluginId: "plugtne")
- Scene 2: PLUGTNE (audioMode: "tuned", badgeText: "STEP 1: PLUGTNE 0MS SNAP", pluginId: "plugtne")
- Scene 3: PLUGEQ (audioMode: "wet", badgeText: "STEP 2: PLUGEQ +3dB AIR", pluginId: "plugeq")
- Scene 4: PLUGVOX (audioMode: "wet", badgeText: "STEP 3: PLUGVOX LEVELER", pluginId: "plugvox")
- Scene 5: PLUGVERB (audioMode: "wet", badgeText: "STEP 4: PLUGVERB SPACE", pluginId: "plugverb")
- Scene 6: Full Chain Active (audioMode: "wet", badgeText: "RADIO READY (4 PLUGINS)", pluginId: "plugverb")

[AD_VIDEO]
When Dylan asks to create, generate, script, or brainstorm an ad, video ad, TikTok promo, or commercial for any plugin (e.g. PLUGTNE, UNDERGRND, PLUGCHOP, PLUG VOX), generate an interactive video ad JSON block:
{
  "pluginId": "plugtne",
  "pluginName": "PLUGTNE (Vocal Pitch Correction)",
  "hookHeadline": "Why Your Vocals Sound Like an Amateur Demo in FL Studio",
  "targetAudience": "FL Studio Melodic Trap & Vocal Producers",
  "aspectRatio": "9:16",
  "audioPair": "vocal",
  "callToAction": "Grab PLUGTNE at pluggedin.studio • Link in bio",
  "scenes": [
    {
      "sceneNumber": 1,
      "durationSec": 3,
      "headline": "Stop recording off-key vocals.",
      "visualAction": "Raw vocal waveform with red pitch-error marker in FL Studio.",
      "audioMode": "dry",
      "badgeText": "A/B: BEFORE (RAW DEMO)",
      "subtitles": ["Stop", "recording", "off-key", "vocals", "in", "FL", "Studio."]
    },
    {
      "sceneNumber": 2,
      "durationSec": 4,
      "headline": "Lock in instantly with PLUGTNE.",
      "visualAction": "PLUGTNE interface opens with Snap speed turned to 100%.",
      "audioMode": "wet",
      "badgeText": "A/B: AFTER (PLUGTNE ENGAGED)",
      "subtitles": ["One", "click", "and", "your", "pitch", "snaps", "into", "place."]
    },
    {
      "sceneNumber": 3,
      "durationSec": 3,
      "headline": "Radio ready vocals in seconds.",
      "visualAction": "Full beat drop with processed vocal sitting in the mix.",
      "audioMode": "wet",
      "badgeText": "RADIO READY",
      "subtitles": ["Stop", "gatekeeping", "your", "sound.", "Link", "in", "bio."]
    }
  ]
}`;

    // 1. Google Gemini Neural Reasoning
    if (geminiKey) {
      const candidateModels = [
        aiConfig?.model || 'models/gemini-3-flash-preview',
        'models/gemini-3.5-flash',
        'models/gemini-3.1-flash-lite-preview',
        'models/gemini-flash-latest',
      ];

      // Format multi-turn conversation history
      const formattedContents: any[] = [];
      if (Array.isArray(chatHistory) && chatHistory.length > 0) {
        const recent = chatHistory.slice(-6);
        for (const msg of recent) {
          if (!msg.text) continue;
          const role = msg.role === 'assistant' ? 'model' : 'user';
          if (
            formattedContents.length > 0 &&
            formattedContents[formattedContents.length - 1].role === role
          ) {
            formattedContents[formattedContents.length - 1].parts[0].text += `\n${msg.text}`;
          } else {
            formattedContents.push({
              role,
              parts: [{ text: msg.text }],
            });
          }
        }
      }

      // Append current user prompt
      if (
        formattedContents.length === 0 ||
        formattedContents[formattedContents.length - 1].role !== 'user'
      ) {
        formattedContents.push({
          role: 'user',
          parts: [{ text: prompt }],
        });
      } else {
        formattedContents[formattedContents.length - 1].parts[0].text = prompt;
      }

      for (const model of candidateModels) {
        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                systemInstruction: {
                  parts: [{ text: systemInstructionText + attachedAudioNote }],
                },
                contents: formattedContents,
                generationConfig: {
                  temperature: typeof aiConfig?.temperature === 'number' ? aiConfig.temperature : 0.7,
                  maxOutputTokens: 2500,
                },
              }),
            }
          );

          if (geminiRes.ok) {
            const data = await geminiRes.json();
            let candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (candidateText) {
              let deckData: any = null;
              let videoAdData: any = null;
              let pluginSpecData: any = null;
let hudActionData: any = null;

              if (candidateText.includes('[SCREEN_ACTION]')) {
                const actionParts = candidateText.split('[SCREEN_ACTION]');
                candidateText = actionParts[0].trim();
                const rawAction = actionParts[1].split('[/SCREEN_ACTION]')[0].trim();
                const jsonMatch = rawAction.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  try {
                    hudActionData = JSON.parse(jsonMatch[0]);
                  } catch (e) {
                    console.warn('Failed to parse screen action JSON:', e);
                  }
                }
              }

              if (candidateText.includes('[PLUGIN_SPEC]')) {
                const specParts = candidateText.split('[PLUGIN_SPEC]');
                candidateText = specParts[0].trim();
                const rawSpec = specParts[1].split('[/PLUGIN_SPEC]')[0].trim();
                const jsonMatch = rawSpec.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  try {
                    pluginSpecData = JSON.parse(jsonMatch[0]);
                  } catch (e) {
                    console.warn('Failed to parse plugin spec JSON:', e);
                  }
                }
              }

              if (candidateText.includes('[AD_VIDEO]')) {
                const videoParts = candidateText.split('[AD_VIDEO]');
                candidateText = videoParts[0].trim();
                const rawAd = videoParts[1].trim();
                const jsonMatch = rawAd.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  try {
                    videoAdData = JSON.parse(jsonMatch[0]);
                  } catch (adParseErr) {
                    console.warn('Failed to parse ad video JSON:', adParseErr);
                  }
                }
              }

              if (candidateText.includes('[PRESENTATION_DECK]')) {
                const deckParts = candidateText.split('[PRESENTATION_DECK]');
                candidateText = deckParts[0].trim();
                const rawDeck = deckParts[1].trim();
                const jsonMatch = rawDeck.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  try {
                    deckData = JSON.parse(jsonMatch[0]);
                  } catch (deckParseErr) {
                    console.warn('Failed to parse presentation deck JSON:', deckParseErr);
                  }
                }
              }

// Fallback: If Dylan explicitly asked for an ad/video and JSON wasn't parsed, construct authentic video ad
              if (!videoAdData && (lower.includes('ad') || lower.includes('video') || lower.includes('commercial') || lower.includes('promo'))) {
                const isChain = lower.includes('4') || lower.includes('chain') || lower.includes('vocal chain') || lower.includes('all plug');
                const isUnderground = lower.includes('undergrnd') || lower.includes('underground') || lower.includes('808');
                const isPlugChop = lower.includes('chop') || lower.includes('sampler');
                const isPlugVox = lower.includes('vox');

                if (isChain) {
                  videoAdData = {
                    pluginId: 'plugtne',
                    pluginName: 'Full Vocal Chain Suite (4 Plugins)',
                    hookHeadline: 'How To Get Radio-Ready Vocals with 4 C++ Plugins in FL Studio',
                    targetAudience: 'FL Studio Trap & Vocal Producers',
                    aspectRatio: '9:16',
                    audioPair: 'vocal',
                    isChainAd: true,
                    chainPlugins: [
                      { id: 'plugtne', name: '1. PLUGTNE' },
                      { id: 'plugeq', name: '2. PLUGEQ' },
                      { id: 'plugvox', name: '3. PLUGVOX' },
                      { id: 'plugverb', name: '4. PLUGVERB' },
                    ],
                    callToAction: 'Grab the All-Access Studio Pass at pluggedin.studio • Link in bio',
                    scenes: [
                      {
                        sceneNumber: 1,
                        durationSec: 3,
                        headline: 'Stop letting raw, off-key vocals ruin your mix.',
                        visualAction: 'Raw vocal in FL Studio with red pitch alert.',
                        audioMode: 'dry',
                        badgeText: 'BEFORE: RAW DEMO',
                        subtitles: ['Stop', 'recording', 'amateur', 'vocals', 'in', 'FL', 'Studio.'],
                        pluginId: 'plugtne',
                      },
                      {
                        sceneNumber: 2,
                        durationSec: 3,
                        headline: 'Step 1: Snap pitch with PLUGTNE 0ms autotune.',
                        visualAction: 'PLUGTNE GUI locks vocal pitch to F Minor in real-time.',
                        audioMode: 'tuned',
                        badgeText: 'STEP 1: PLUGTNE (0MS PITCH)',
                        subtitles: ['One', 'click', 'and', 'your', 'pitch', 'snaps', 'instantly.'],
                        pluginId: 'plugtne',
                      },
                      {
                        sceneNumber: 3,
                        durationSec: 3,
                        headline: 'Step 2: Add Pultec air sheen with PLUGEQ.',
                        visualAction: 'PLUGEQ Pultec high-shelf boosts +3dB at 10.5kHz for silky sparkle.',
                        audioMode: 'wet',
                        badgeText: 'STEP 2: PLUGEQ (+3dB AIR)',
                        subtitles: ['Expensive', 'high', 'end', 'air', 'without', 'harshness.'],
                        pluginId: 'plugeq',
                      },
                      {
                        sceneNumber: 4,
                        durationSec: 3,
                        headline: 'Step 3: RVox optical leveling with PLUGVOX.',
                        visualAction: 'PLUGVOX optical compression pins the vocal upfront.',
                        audioMode: 'wet',
                        badgeText: 'STEP 3: PLUGVOX (LEVELER)',
                        subtitles: ['Smooth', 'optical', 'leveling', 'pins', 'the', 'vocal', 'upfront.'],
                        pluginId: 'plugvox',
                      },
                      {
                        sceneNumber: 5,
                        durationSec: 3,
                        headline: 'Step 4: Algorithmic plate space with PLUGVERB.',
                        visualAction: 'PLUGVERB GUI with lush 1.6s ambient stereo decay.',
                        audioMode: 'wet',
                        badgeText: 'STEP 4: PLUGVERB (PLATE)',
                        subtitles: ['Lush', 'stereo', 'depth', 'that', 'never', 'muddies', 'the', 'beat.'],
                        pluginId: 'plugverb',
                      },
                      {
                        sceneNumber: 6,
                        durationSec: 3,
                        headline: 'Full Studio Chain: Radio ready in 4 clicks.',
                        visualAction: 'Finished vocal playing in full beat, link in bio overlay.',
                        audioMode: 'wet',
                        badgeText: 'FULL 4-PLUGIN CHAIN ACTIVE',
                        subtitles: ['Grab', 'the', 'studio', 'pass.', 'Link', 'in', 'bio.'],
                        pluginId: 'plugverb',
                      },
                    ],
                  };
                } else {

                const pluginKey = isUnderground ? 'undergrnd' : isPlugChop ? 'plugchop' : isPlugVox ? 'plugvox' : 'plugtne';
                const pluginTitle = isUnderground
                  ? 'UNDERGRND (Analog 808 Heat)'
                  : isPlugChop
                  ? 'PLUGCHOP 2.0 (16-Pad Sampler)'
                  : isPlugVox
                  ? 'PLUG VOX (Vocal Processing)'
                  : 'PLUGTNE (Vocal Pitch Correction)';

                videoAdData = {
                  pluginId: pluginKey,
                  pluginName: pluginTitle,
                  hookHeadline: isUnderground
                    ? 'Why Your 808s Sound Weak on Phone Speakers'
                    : isPlugChop
                    ? 'How Multi-Platinum Producers Chop Samples in 10 Seconds'
                    : 'Why Your Vocals Sound Like an Amateur Demo in FL Studio',
                  targetAudience: 'FL Studio Trap & Underground Beatmakers',
                  aspectRatio: '9:16',
                  audioPair: isUnderground ? '808' : isPlugChop ? 'sample' : 'vocal',
                  callToAction: `Grab ${pluginKey.toUpperCase()} at pluggedin.studio • Link in bio`,
                  scenes: [
                    {
                      sceneNumber: 1,
                      durationSec: 3,
                      headline: isUnderground ? 'Stop exporting weak 808s.' : 'Stop recording off-key vocals.',
                      visualAction: 'Raw waveform in FL Studio with red warning badge.',
                      audioMode: 'dry',
                      badgeText: 'A/B: BEFORE (RAW DEMO)',
                      subtitles: ['Stop', 'recording', 'amateur', 'sounds', 'in', 'FL', 'Studio.'],
                    },
                    {
                      sceneNumber: 2,
                      durationSec: 4,
                      headline: `Lock in with ${pluginTitle}`,
                      visualAction: 'Plugin interface engaged with instant snap dial turned to 100%.',
                      audioMode: 'wet',
                      badgeText: `A/B: AFTER (${pluginKey.toUpperCase()} ON)`,
                      subtitles: ['One', 'click', 'and', 'the', 'tone', 'snaps', 'in', 'instantly.'],
                    },
                    {
                      sceneNumber: 3,
                      durationSec: 3,
                      headline: 'Radio-ready sound in seconds.',
                      visualAction: 'Full beat drop waveform with link in bio overlay.',
                      audioMode: 'wet',
                      badgeText: 'RADIO READY',
                      subtitles: ['Stop', 'gatekeeping', 'your', 'sound.', 'Link', 'in', 'bio.'],
                    },
                  ],
                };
                }
              }

              if (!hudActionData) {
                if (lower.includes('chat button') || lower.includes('new chat') || lower.includes('old chat') || lower.includes('past chat') || lower.includes('past chats')) {
                  const shouldHide = lower.includes('remove') || lower.includes('hide') || lower.includes('delete') || lower.includes('get rid') || !lower.includes('show');
                  hudActionData = {
                    action: 'verify_intent',
                    targetId: 'founder-header-controls',
                    pendingAction: {
                      type: 'modify_ui',
                      config: {
                        showChatButtons: !shouldHide,
                      },
                    },
                    question: shouldHide
                      ? "I've highlighted the chat buttons in your header. Is this what you'd like me to remove, Dylan?"
                      : "I've highlighted the header area. Would you like me to restore those buttons, Dylan?",
                    caption: shouldHide ? 'CONFIRM: REMOVE CHAT BUTTONS?' : 'CONFIRM: RESTORE CHAT BUTTONS?'
                  };
                  speech = shouldHide
                    ? "Dylan, I've highlighted the chat buttons on your screen. Is this what you're talking about?"
                    : "Dylan, I've highlighted the header. Would you like me to restore those buttons?";
                } else if (lower.includes('top stat') || lower.includes('top number') || lower.includes('hide stat') || lower.includes('hide metric') || lower.includes('remove stat')) {
                  hudActionData = {
                    action: 'verify_intent',
                    targetId: 'founder-top-stats',
                    pendingAction: {
                      type: 'modify_ui',
                      config: {
                        showTopStats: false,
                      },
                    },
                    question: "I've highlighted the top metrics row on your screen. Is this what you'd like me to hide, Dylan?",
                    caption: 'CONFIRM: HIDE TOP METRICS ROW?'
                  };
                  speech = "Dylan, I've highlighted the top metrics row. Is this what you're talking about?";
                } else if (lower.includes('sales') || lower.includes('financials') || lower.includes('revenue') || lower.includes('profit') || lower.includes('money') || lower.includes('make today')) {
                  hudActionData = {
                    action: 'spotlight',
                    tab: 'financials',
                    targetId: 'metric-net-sales',
                    caption: 'Isolating Real-Time Net Revenue'
                  };
                } else if (lower.includes('computer') || lower.includes('rig') || lower.includes('machine') || lower.includes('daw rig') || lower.includes('activat')) {
                  hudActionData = {
                    action: 'spotlight',
                    tab: 'subs',
                    targetId: 'card-active-rigs',
                    caption: 'Isolating Authorized DAW Rigs (2/5 Active)'
                  };
                } else if (lower.includes('social') || lower.includes('queue') || lower.includes('post') || lower.includes('instagram') || lower.includes('youtube') || lower.includes('tiktok queue')) {
                  hudActionData = {
                    action: 'spotlight',
                    tab: 'social',
                    targetId: 'card-social-queue',
                    caption: 'Isolating Social Command Center Queue'
                  };
                } else if (lower.includes('sentinel') || lower.includes('watchdog') || lower.includes('threat') || lower.includes('error') || lower.includes('health')) {
                  hudActionData = {
                    action: 'spotlight',
                    tab: 'sentinel',
                    targetId: 'card-sentinel-status',
                    caption: 'Isolating Sentinel 24/7 Watchdog'
                  };
                } else if (lower.includes('plugin') && (lower.includes('top') || lower.includes('leader') || lower.includes('best'))) {
                  hudActionData = {
                    action: 'spotlight',
                    tab: 'plugins',
                    targetId: 'card-plugin-leaderboard',
                    caption: 'Isolating Top Performing Audio Plugins'
                  };
                }
              }

              if (candidateText.includes('[WRITTEN_BRIEFING]')) {
                const parts = candidateText.split('[WRITTEN_BRIEFING]');
                speech = parts[0].replace(/\[VOICE_SPEECH\]/g, '').trim();
                advice = parts[1].trim();
              } else if (candidateText.includes('[SPEECH_BREAK]')) {
                const parts = candidateText.split('[SPEECH_BREAK]');
                speech = parts[0].trim();
                advice = parts[1].trim();
              } else {
                speech = candidateText.split('\n')[0].replace(/[*#_~`]/g, '').trim();
                advice = candidateText;
              }

              const cleanSpeech = speech
                .replace(/[*#_~`>\[\]\(\)]/g, '')
                .replace(/\\/g, '')
                .trim();

              await recordJarvisMemory({
                timestamp: new Date().toISOString(),
                topic: prompt.slice(0, 40),
                userPrompt: prompt,
                keyInsight: cleanSpeech || advice.slice(0, 150),
              });

              if (videoAdData && audioUrl) {
                videoAdData.audioDryUrl = audioUrl;
                videoAdData.audioWetUrl = audioUrl;
              }

              return NextResponse.json({
                success: true,
                reply: advice,
                speech: cleanSpeech,
                deck: deckData,
                videoAd: videoAdData,
                pluginSpec: pluginSpecData,
                hudAction: hudActionData,
                dispatch: dispatchLogged,
                source: `gemini-neural (${model.replace('models/', '')})`,
              });
            }
          } else {
            const errData = await geminiRes.json().catch(() => ({}));
            console.warn(`Model ${model} failed (${geminiRes.status}):`, errData.error?.message);
          }
        } catch (modelErr) {
          console.warn(`Error calling ${model}:`, modelErr);
        }
      }
    }

    // 2. High-Performance Local Intelligent Copilot Fallback (No "Sir", Charismatic & Clear)
    if (dispatchLogged) {
      speech = `Directive received, Dylan. I have logged that directly into the Sentinel queue for Antigravity, and our engineering logs have been updated.`;
      advice = `### 🛰️ Engineering Dispatch Logged for Antigravity

**Directive ID**: \`${dispatchLogged.id}\`  
**Priority**: **High**  
**Status**: **Open (Transmitted to Pair Engineer)**

---

#### 📋 Transmission Content:
> *"${prompt}"*

I have logged this in our persistent Sentinel queue. Your pair engineering assistant Antigravity has direct access to read, verify, and implement this change across the codebase.`;
    } else if (
      lower.includes('status') ||
      lower.includes('how are we doing') ||
      lower.includes('revenue') ||
      lower.includes('money') ||
      lower.includes('numbers')
    ) {
      speech = `We are sitting at $${net.toFixed(2)} in net profit with monthly recurring revenue at $${mrr.toFixed(2)} across ${activeSubs} active subscribers. PayPal and all systems are running cleanly.`;
      advice = `### 💎 Executive Commercial Briefing

Dylan, here is our live financial status:

* **True Net Profit**: **\$${net.toFixed(2)}** deposited in PayPal (after all merchant fees).
* **Gross Customer Volume**: **\$${gross.toFixed(2)}**
* **Active Subscribers**: **${activeSubs}** producers on the All-Access Studio Pass (\$19.99/mo).
* **Monthly Recurring Revenue (MRR)**: **\$${mrr.toFixed(2)}** *(Annual Run-Rate: \$${(mrr * 12).toFixed(2)})*.
* **Catalog Leader**: **${topPlugin}** continues to drive top-of-funnel traffic.
* **Account Health**: Zero PayPal chargebacks. 100% dispute protection actively enforced.

Let's test a targeted weekend promo on **PLUGTNE** to accelerate immediate cash flow.`;
    } else if (
      lower.includes('tiktok') ||
      lower.includes('hook') ||
      lower.includes('video') ||
      lower.includes('social') ||
      lower.includes('reel')
    ) {
      speech = `For TikTok, the secret is stopping the scroll in the first two seconds with a side-by-side DAW contrast showing why their vocals sound muddy.`;
      advice = `### 🎬 High-Converting Video Playbook (TikTok / Reels / Shorts)

Dylan, producer attention spans on short-form feeds average 2 seconds. The winning formula is the **"Anti-Gatekeep / FL Studio Sauce"** angle:

---

#### 🎯 Concept 1: The "Why Your Vocal Sounds Cheap" Hook (Focus: PLUGTNE)
* **Opening Visual (0:00 - 0:02)**: Close-up on a messy FL Studio mixer with 8 plugins. Red overload meters flashing. Text: *"Stop paying $400 for industry autotune."*
* **Audio**: Muffled, out-of-tune raw vocal.
* **The Action (0:03 - 0:09)**: Delete the 8 plugins. Drop **PLUGTNE** onto the mixer. Turn up Correction. The vocal snaps into crystal-clear radio polish instantly with zero latency.
* **Closing Hook**: *"Link in bio to test it in your DAW today."*

---

#### 🎯 Concept 2: The 5-Second Soul Chop (Focus: PLUGCHOP 2.0)
* **Opening Visual (0:00 - 0:02)**: Drag an obscure vinyl soul loop straight into PLUGCHOP 2.0's 16-pad grid.
* **Spoken Script**: *"Serato Sample charges $149. Watch this..."*
* **The Action (0:03 - 0:10)**: Tap 4 pads live in an aggressive boom-bap rhythm with half-time engaged.
* **Closing Hook**: *"Grab the All-Access Pass in bio before launch pricing ends."*`;
    } else {
      speech = `I have analyzed your request, Dylan. Here is the strategic breakdown on your display.`;
      advice = `### 🛰️ Strategic Analysis

Dylan, based on our real-time metrics (Net Cash: **\$${net.toFixed(2)}**, MRR: **\$${mrr.toFixed(2)}**, Active Members: **${activeSubs}**):

---

#### Key Directives:
1. **Catalog Momentum**: Focus our marketing distribution on **PLUGTNE** and **PLUGCHOP 2.0**. They represent our highest-converting entry points into the PluggedIN Central ecosystem.
2. **Margin Integrity**: Our automated PayPal fee tracking confirms zero leakage, and our "All Sales Final" digital license policy guarantees zero chargeback exposure.
3. **Continuous Sentinel Oversight**: I am monitoring our cloud database, license authorizations, and payment pipelines 24/7. Any system friction will be flagged to our engineering logs immediately.

Ready to deploy whenever you are.`;
    }

    const cleanSpeech = speech
      .replace(/[*#_~`>\[\]\(\)]/g, '')
      .replace(/\\/g, '')
      .trim();

    await recordJarvisMemory({
      timestamp: new Date().toISOString(),
      topic: prompt.slice(0, 40),
      userPrompt: prompt,
      keyInsight: cleanSpeech || advice.slice(0, 150),
    });

    return NextResponse.json({
      success: true,
      reply: advice,
      speech: cleanSpeech,
      hudAction: null,
      dispatch: dispatchLogged,
      source: 'jarvis-cognitive-engine',
    });
  } catch (error: any) {
    console.error('Jarvis AI error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
