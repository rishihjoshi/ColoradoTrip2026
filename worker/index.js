// Cloudflare Worker: secure proxy for the Ask tab's Anthropic API calls.
//
// Holds ANTHROPIC_API_KEY as a Worker secret (never exposed to the browser).
// Accepts a minimal chat request from the PWA, forwards it to
// api.anthropic.com with the key attached server-side, and streams the
// response straight back.

const ALLOWED_ORIGIN = 'https://rishihjoshi.github.io';
const ALLOWED_MODEL  = 'claude-sonnet-4-5';
const MAX_TOKENS_CAP = 1024;
const MAX_MESSAGES   = 16; // ASK_HISTORY_LIMIT * 2 + current turn, with headroom

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders() });
    }

    const origin = request.headers.get('Origin');
    if (origin !== ALLOWED_ORIGIN) {
      return new Response('Forbidden', { status: 403, headers: corsHeaders() });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response('Invalid JSON', { status: 400, headers: corsHeaders() });
    }

    if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > MAX_MESSAGES) {
      return new Response('Invalid messages', { status: 400, headers: corsHeaders() });
    }

    // Only forward the fields the app sends; model/key are pinned server-side.
    const payload = {
      model: ALLOWED_MODEL,
      max_tokens: Math.min(Number(body.max_tokens) || MAX_TOKENS_CAP, MAX_TOKENS_CAP),
      system: typeof body.system === 'string' ? body.system : undefined,
      messages: body.messages,
      stream: true,
    };

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(payload),
    });

    const headers = new Headers(upstream.headers);
    for (const [key, value] of Object.entries(corsHeaders())) {
      headers.set(key, value);
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers,
    });
  },
};
