import { NextRequest, NextResponse } from 'next/server';
import {
  verifySessionToken,
  fetchJarvisStagedVideos,
  recordJarvisStagedVideo,
  updateJarvisStagedVideoStatus,
  recordJarvisDispatch,
  JarvisStagedVideo,
} from '@/lib/auth';

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

const DEFAULT_STAGED_VIDEOS: JarvisStagedVideo[] = [
  {
    id: 'vid_808_disappears',
    template: 'ab_dry_wet',
    title: 'Why Your 808 Disappears on iPhone Speakers',
    subtitle: 'A/B Dry vs Wet Harmonics Split-Screen',
    pluginId: 'UNDERGRND',
    pluginName: 'UNDERGRND Sub-Saturator',
    durationSec: 22,
    hookHeadline: 'STOP CLIPPING YOUR MASTER BUS',
    aspectRatio: '9:16',
    audioPair: '808',
    audioDryUrl: '/audio/808_dry.wav',
    audioWetUrl: '/audio/808_wet.wav',
    estimatedHookRetentionPct: 48,
    status: 'staged',
    createdAt: new Date().toISOString(),
    scenes: [
      {
        sceneNumber: 1,
        durationSec: 4,
        headline: 'Why your 808 disappears on phone speakers...',
        audioMode: 'dry',
        badgeText: '📱 Phone Speaker (Dry)',
        subtitles: ['Stop cranking the volume on your 808', 'You are just clipping the master bus'],
      },
      {
        sceneNumber: 2,
        durationSec: 5,
        headline: 'Phone speakers cut all frequencies under 60Hz.',
        audioMode: 'dry',
        badgeText: '⚠️ Low-End Lost',
        subtitles: ['Standard sub-bass is physically inaudible on mobile', 'You need upper 2nd & 3rd harmonics'],
      },
      {
        sceneNumber: 3,
        durationSec: 9,
        headline: 'Engaging UNDERGRND Sub-Saturator (Dialing Harmonics)',
        audioMode: 'wet',
        badgeText: '🔥 WET: Harmonics Active',
        subtitles: ['Watch what happens when I dial the Drive knob', 'Now it cuts straight through any smartphone'],
        knobLabel: 'DRIVE',
        knobTarget: 68,
      },
      {
        sceneNumber: 4,
        durationSec: 4,
        headline: 'Instant Low-End Polish • Link in Bio',
        audioMode: 'beat',
        badgeText: '⚡ PLUGGEDIN.STUDIO',
        subtitles: ['Download free trial at pluggedin.studio', 'Zero subscriptions forever'],
      },
    ],
  },
  {
    id: 'vid_vocal_chain_fl',
    template: 'workflow_hack',
    title: 'Secret 2-Step Vocal Polish Chain',
    subtitle: 'FL Studio $50 Mic vs $3,000 U87 Transformation',
    pluginId: 'PLUGTNE',
    pluginName: 'PLUGTNE Real-Time AutoTune Suite',
    durationSec: 26,
    hookHeadline: 'TURN A $50 USB MIC INTO A $3,000 U87',
    aspectRatio: '9:16',
    audioPair: 'vocal',
    audioDryUrl: '/audio/vocal_dry.wav',
    audioWetUrl: '/audio/vocal_wet.wav',
    estimatedHookRetentionPct: 52,
    status: 'staged',
    createdAt: new Date().toISOString(),
    scenes: [
      {
        sceneNumber: 1,
        durationSec: 4,
        headline: 'Stop stacking 10 different stock vocal plugins...',
        audioMode: 'dry',
        badgeText: '🎤 Raw Bedroom Mic',
        subtitles: ['If your vocals sound boxy and harsh', 'Stop overcomplicating your mixer chain'],
      },
      {
        sceneNumber: 2,
        durationSec: 7,
        headline: 'Step 1: 0ms Retune Speed on PLUGTNE',
        audioMode: 'tuned',
        badgeText: '⚡ 0ms Pitch Correction',
        subtitles: ['Lock to key C Minor with 0ms snap', 'Instant hard-tune pitch perfection'],
        knobLabel: 'SPEED',
        knobTarget: 0,
      },
      {
        sceneNumber: 3,
        durationSec: 10,
        headline: 'Step 2: 12kHz Air Boost & Vocal Leveling',
        audioMode: 'wet',
        badgeText: '💎 12kHz Crystalline Air',
        subtitles: ['Push the top air band and level the dynamics', 'Instant radio polish from your bedroom'],
        knobLabel: 'AIR BAND',
        knobTarget: 4.5,
      },
      {
        sceneNumber: 4,
        durationSec: 5,
        headline: 'Download Free FL Studio Preset in Bio',
        audioMode: 'beat',
        badgeText: '🎁 Free Preset Included',
        subtitles: ['Get PLUGTNE today at pluggedin.studio', 'Available for Windows & Mac VST3'],
      },
    ],
  },
  {
    id: 'vid_sidechain_myth',
    template: 'producer_mythbusters',
    title: 'STOP Sidechaining Kick & 808 Like This',
    subtitle: 'Dynamic Frequency Notch vs Hollow Pumping',
    pluginId: 'pluggedin_plugglue',
    pluginName: 'PLUGGLUE SSL 4000 G-Master Compressor',
    durationSec: 24,
    hookHeadline: 'YOU HAVE BEEN TAUGHT WRONG',
    aspectRatio: '9:16',
    audioPair: 'sample',
    audioDryUrl: '/audio/sample_dry.wav',
    audioWetUrl: '/audio/sample_wet.wav',
    estimatedHookRetentionPct: 44,
    status: 'staged',
    createdAt: new Date().toISOString(),
    scenes: [
      {
        sceneNumber: 1,
        durationSec: 4,
        headline: 'Stop ducking your entire bassline to your kick...',
        audioMode: 'dry',
        badgeText: '❌ Hollow Sidechain Pumping',
        subtitles: ['Sidechaining your entire 808 kills your low-end bounce', 'You lose 6dB of punch every kick strike'],
      },
      {
        sceneNumber: 2,
        durationSec: 6,
        headline: 'Standard compression clamps the whole spectrum.',
        audioMode: 'dry',
        badgeText: '⚠️ -6dB Energy Drop',
        subtitles: ['Your track feels thin and disconnected', 'Instead of clamping everything, use surgical bus glue'],
      },
      {
        sceneNumber: 3,
        durationSec: 9,
        headline: 'PLUGGLUE: Solid State Logic 4000 Bus Glue',
        audioMode: 'wet',
        badgeText: '✨ Solid State Logic Glue',
        subtitles: ['Needle pins to -4dB with parallel mix at 60%', 'The kick punches while the 808 sustains full weight'],
        knobLabel: 'MIX',
        knobTarget: 60,
      },
      {
        sceneNumber: 4,
        durationSec: 5,
        headline: 'Try it free on your current project',
        audioMode: 'beat',
        badgeText: '⚡ PLUGGEDIN.STUDIO',
        subtitles: ['Download the bus compressor at pluggedin.studio', 'Built for modern hip-hop & EDM'],
      },
    ],
  },
];

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  let stagedVideos = await fetchJarvisStagedVideos();
  if (stagedVideos.length === 0) {
    for (const v of DEFAULT_STAGED_VIDEOS) {
      await recordJarvisStagedVideo(v);
    }
    stagedVideos = await fetchJarvisStagedVideos();
  }

  return NextResponse.json({
    success: true,
    videos: stagedVideos,
  });
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'approve_video') {
      const { videoId } = body;
      await updateJarvisStagedVideoStatus(videoId, 'approved');

      const videos = await fetchJarvisStagedVideos();
      const target = videos.find((v) => v.id === videoId);

      if (target) {
        // Log dispatch ticket into pluggedin_jarvis_dispatches
        await recordJarvisDispatch({
          id: `dsp_vid_${Date.now()}`,
          type: 'marketing_dispatch',
          priority: 'high',
          title: `[Video Approved]: ${target.title}`,
          details: `Dylan approved video ad: "${target.title}" (${target.template}). Hook: "${target.hookHeadline}". Ready for Remotion local MP4 render and TikTok / Reels dispatch.`,
          suggestedAction: 'Execute local Remotion render and dispatch to social APIs.',
          status: 'open',
          createdAt: new Date().toISOString(),
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Video approved and dispatched to marketing queue!',
      });
    }

    if (action === 'generate_video') {
      const { pluginId, templateType } = body;
      const targetId = pluginId || 'UNDERGRND';
      const newVideo: JarvisStagedVideo = {
        id: `vid_custom_${Date.now()}`,
        template: templateType || 'ab_dry_wet',
        title: `${targetId} Fast Pitch & Harmonics Test`,
        subtitle: 'Dynamic A/B Vocal & Bass Transformation',
        pluginId: targetId,
        pluginName: targetId === 'PLUGTNE' ? 'PLUGTNE AutoTune' : 'UNDERGRND Demon Suite',
        durationSec: 20,
        hookHeadline: 'HOW METRO BOOMIN PROCESSES LOW-END IN 2026',
        aspectRatio: '9:16',
        audioPair: targetId === 'PLUGTNE' ? 'vocal' : '808',
        audioDryUrl: targetId === 'PLUGTNE' ? '/audio/vocal_dry.wav' : '/audio/808_dry.wav',
        audioWetUrl: targetId === 'PLUGTNE' ? '/audio/vocal_wet.wav' : '/audio/808_wet.wav',
        estimatedHookRetentionPct: 47,
        status: 'staged',
        createdAt: new Date().toISOString(),
        scenes: [
          {
            sceneNumber: 1,
            durationSec: 4,
            headline: 'Stop relying on generic EQ curves...',
            audioMode: 'dry',
            badgeText: '⚠️ Common Trap',
            subtitles: ['Most producers waste 30 minutes EQing low-end', 'When all you need is harmonic saturation'],
          },
          {
            sceneNumber: 2,
            durationSec: 10,
            headline: `Engaging ${targetId} with 0ms Latency`,
            audioMode: 'wet',
            badgeText: '🔥 Wet Transformation',
            subtitles: ['Watch how fast the harmonics lock into the mix', 'Instant commercial energy'],
            knobLabel: 'DRIVE',
            knobTarget: 75,
          },
          {
            sceneNumber: 3,
            durationSec: 6,
            headline: 'Download at pluggedin.studio',
            audioMode: 'beat',
            badgeText: '⚡ PLUGGEDIN.STUDIO',
            subtitles: ['Zero subscriptions • Lifetime license', 'Download free presets with your pass'],
          },
        ],
      };

      await recordJarvisStagedVideo(newVideo);
      return NextResponse.json({
        success: true,
        video: newVideo,
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
