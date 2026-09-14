import { NextRequest, NextResponse } from 'next/server';

const FOUNDER_PINS = ['8492', 'PluggedIn2026!', 'pluggedin_studio_secret_key_2026_launch'];

export async function GET(req: NextRequest) {
  const pin = req.headers.get('x-founder-pin') || req.nextUrl.searchParams.get('pin');
  if (!pin || !FOUNDER_PINS.includes(pin.trim())) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const rawText = req.nextUrl.searchParams.get('text') || '';
  const cleanText = rawText
    .replace(/[^a-zA-Z0-9\s.,!?'$-]/g, ' ')
    .slice(0, 300)
    .trim();

  if (!cleanText) {
    return new NextResponse('Text is required', { status: 400 });
  }

  try {
    const googleTtsUrl =
      'https://translate.google.com/translate_tts?ie=UTF-8&q=' +
      encodeURIComponent(cleanText) +
      '&tl=en-GB&client=tw-ob';

    const res = await fetch(googleTtsUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
      },
    });

    if (!res.ok) {
      return new NextResponse('TTS service temporarily unavailable', { status: 502 });
    }

    const audioBuffer = await res.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'Content-Disposition': 'inline; filename="jarvis_speech.mp3"',
      },
    });
  } catch (err: any) {
    return new NextResponse('Error generating audio: ' + err.message, { status: 500 });
  }
}
