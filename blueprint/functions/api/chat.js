// Rally HQ Blueprint — Pages Function: stakeholder chat endpoint
//
// Runs on the Cloudflare Pages Functions runtime. Proxies stakeholder
// questions through OpenRouter to Claude with the blueprint docs loaded
// as system context.
//
// Required env var: OPENROUTER_API_KEY (set via `wrangler pages secret put`).
//   Stored in 1Password as "blueprint-global" (Developer Secrets vault).
//
// Why OpenRouter, not Anthropic direct: lets the same "blueprint-global" key
// fan out to any model — Claude, GPT, etc. — without per-app key management.
//
// Docs are copied into prototype/_docs/ at deploy time (see
// scripts/prep-deploy.sh) so the function can fetch them via the ASSETS
// binding from /_docs/*.md.

const DOCS = [
  ['research-synthesis', '/_docs/research-synthesis.md'],
  ['design-principles',  '/_docs/design-principles.md'],
  ['cx-strategy',        '/_docs/cx-strategy.md'],
  ['roadmap',            '/_docs/roadmap.md'],
  ['gaps',               '/_docs/gaps.md'],
  ['feasibility',        '/_docs/feasibility.md']
];

let SYSTEM_CONTEXT = null;

async function loadContext(env, requestUrl) {
  if (SYSTEM_CONTEXT) return SYSTEM_CONTEXT;

  const origin = new URL(requestUrl).origin;
  const sections = [];

  for (const [name, path] of DOCS) {
    try {
      // Pages Functions get `env.ASSETS` — a fetcher that serves the
      // deploy's static assets. Falls back to a plain fetch against the
      // request origin if ASSETS isn't bound (older runtimes).
      const url = `${origin}${path}`;
      const res = env.ASSETS
        ? await env.ASSETS.fetch(new Request(url))
        : await fetch(url);
      if (res.ok) {
        const content = await res.text();
        sections.push(`=== ${name} (${path}) ===\n${content}`);
      }
    } catch {
      // Skip missing — partial context still useful
    }
  }

  SYSTEM_CONTEXT = `You are a research/design assistant grounded in the Rally HQ Blueprint — a synthetic design study for the Rally HQ tournament-management product.

You have access to the full blueprint corpus below. Answer questions accurately based on what's documented. When the user asks about a decision, cite the specific finding number (e.g., "Finding #3"), design principle (e.g., "R6"), or page that explains it. When the user asks for something not covered, say so honestly — do not fabricate.

Tone: direct, no cheerleading, no hedging. Match Nino Chavez's voice: short sentences, imperative when giving advice, concrete examples. No emoji.

If asked about implementation, reference docs/feasibility.md. If asked about ordering, reference docs/roadmap.md. If asked about specific UI decisions, reference the prototype page and its strategy panel content.

--- BLUEPRINT CORPUS ---

${sections.join('\n\n')}`;

  return SYSTEM_CONTEXT;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'OPENROUTER_API_KEY not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { messages = [], page, pageTitle } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'messages array required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const system = (await loadContext(env, request.url)) +
    (page ? `\n\nUser is currently viewing the "${pageTitle || page}" prototype page (id: ${page}).` : '');

  try {
    const openrouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://signal-dispatch-blueprint.pages.dev',
        'X-Title': 'Signal Dispatch Blueprint'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-haiku-4.5',
        max_tokens: 800,
        messages: [
          { role: 'system', content: system },
          ...messages.map(m => ({ role: m.role, content: m.content }))
        ]
      })
    });

    if (!openrouterRes.ok) {
      const text = await openrouterRes.text();
      return new Response(JSON.stringify({
        error: `OpenRouter API error: ${openrouterRes.status}`,
        detail: text.slice(0, 500)
      }), { status: 502, headers: { 'Content-Type': 'application/json' } });
    }

    const data = await openrouterRes.json();
    const reply = data.choices?.[0]?.message?.content || '(no response)';
    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({
      error: 'Chat request failed',
      message: err.message
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
