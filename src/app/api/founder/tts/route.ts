import { NextRequest, NextResponse } from 'next/server';

const FOUNDER_PINS = ['8492', 'PluggedIn2026!', 'pluggedin_studio_secret_key_2026_launch'];

function splitTextIntoChunks(text: string, maxLen = 130): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
  const chunks: string[] = [];
  let current = '';

  for (const s of sentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;
    if ((current + ' ' + trimmed).trim().length <= maxLen) {
      current = (current + ' ' + trimmed).trim();
    } else {
      if (current) chunks.push(current);
      if (trimmed.length <= maxLen) {
        current = trimmed;
      } else {
        const words = trimmed.split(' ');
        current = '';
        for (const w of words) {
          if ((current + ' ' + w).trim().length <= maxLen) {
            current = (current + ' ' + w).trim();
          } else {
            if (current) chunks.push(current);
            current = w;
          }
        }
      }
    }
  }
  if (current) chunks.push(current);
  return chunks.filter((c) => c.trim().length > 0);
}

async function fetchAudioChunk(chunk: string): Promise<Buffer | null> {
  try {
    const googleTtsUrl =
      'https://translate.google.com/translate_tts?ie=UTF-8&q=' +
      encodeURIComponent(chunk) +
      '&tl=en-GB&client=tw-ob';

    const res = await fetch(googleTtsUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
      },
    });

    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (_) {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const pin = req.headers.get('x-founder-pin') || req.nextUrl.searchParams.get('pin');
  if (!pin || !FOUNDER_PINS.includes(pin.trim())) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const rawText = req.nextUrl.searchParams.get('text') || '';
  const cleanText = rawText
    .replace(/\[[A-Z_]+\]/g, '') // strip brackets like [VOICE_SPEECH]
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // strip markdown links
    .replace(/```[\s\S]*?```/g, '') // strip code blocks
    .replace(/`([^`]+)`/g, '$1') // strip inline code
    .replace(/[*#_~>]/g, ' ') // strip markdown formatting characters
    .replace(/[^a-zA-Z0-9\s.,!?'$%\/-]/g, ' ')
    .replace(/\s+/g, ' ')
    .slice(0, 600)
    .trim();

  if (!cleanText) {
    return new NextResponse('Text is required', { status: 400 });
  }

  try {
    const chunks = splitTextIntoChunks(cleanText, 130);
    if (chunks.length === 0) {
      return new NextResponse('Text is required', { status: 400 });
    }

    const buffers = await Promise.all(chunks.map(fetchAudioChunk));
    const validBuffers = buffers.filter((b): b is Buffer => b !== null);

    if (validBuffers.length === 0) {
      return new NextResponse('TTS service temporarily unavailable', { status: 502 });
    }

    const combinedBuffer = Buffer.concat(validBuffers);

    return new NextResponse(combinedBuffer, {
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
