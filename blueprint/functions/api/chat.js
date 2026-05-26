// Signal Dispatch v2 Blueprint — Pages Function: stakeholder chat endpoint
//
// Runs on the Cloudflare Pages Functions runtime. Proxies stakeholder
// questions through OpenRouter to a model with the v2 blueprint corpus
// loaded as system context.
//
// Required env var: OPENROUTER_API_KEY (set via `wrangler pages secret put`).
//   Stored in 1Password under "Cloudflare pages-deploy" / OpenRouter key
//   from astro-build/.env for this project.
//
// Why OpenRouter, not Anthropic direct: lets one key fan out to any model
// (Claude, GPT, etc.) without per-app key management.
//
// Docs are copied into _docs/ at deploy time (see scripts/prep-deploy.sh)
// so the function can fetch them via the ASSETS binding from /_docs/*.md.
// Subdirectory paths (e.g., research/competitive/synthesis.md) are
// preserved — the docs viewer fetches /_docs/<docId>.md where docId can
// contain slashes.

const DOCS = [
  // Stage artifacts (v2 greenfield — load-bearing for any v2 question)
  ['01-research',              '/_docs/01-research.md'],
  ['02-design-principles',     '/_docs/02-design-principles.md'],
  ['03-prototype-plan',        '/_docs/03-prototype-plan.md'],
  ['DECISIONS-NEEDED',         '/_docs/DECISIONS-NEEDED.md'],
  ['04-fact-check-log',        '/_docs/04-fact-check-log.md'],
  // Research inputs — personas + competitive synthesis (cross-industry-extended)
  ['personas-overview',        '/_docs/research/personas/README.md'],
  ['persona-peer-architect',   '/_docs/research/personas/peer-architect.md'],
  ['persona-hiring-evaluator', '/_docs/research/personas/hiring-evaluator.md'],
  ['persona-ai-curious-ic',    '/_docs/research/personas/ai-curious-ic.md'],
  ['competitive-synthesis',    '/_docs/research/competitive/synthesis.md'],
  // v1 baseline (so chat can answer questions about what changed v1→v2)
  ['v1-baseline-overview',     '/_docs/v1-baseline/README.md'],
  ['v1-diagnose',              '/_docs/v1-baseline/01-diagnose.md'],
  // Design alternates (parallel-track designs for v2)
  ['stitch-alternate-design',  '/_docs/research/design-alternates/stitch-DESIGN.md']
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

  SYSTEM_CONTEXT = `You are a research/design assistant grounded in the Signal Dispatch v2 Blueprint — a greenfield re-conception of the publication currently at ninochavez.co/blog (276 items across 8 collections in the v1 baseline). The author is Nino Chavez; the prototype lives at blueprint-blog.ninochavez.co.

The corpus below is the full Stage 1-3 artifact set plus salvaged v1 research (personas, competitive synthesis with cross-industry extension) and v1-baseline reference. Answer accurately from what's documented. When citing a decision, name it by ID (D1 through D9 from DECISIONS-NEEDED, or Rule 1-5 from 02-design-principles, or persona priority P1/P2/P3). When asked about v1 vs v2 differences, anchor in v1-baseline/01-diagnose findings (F1-F11) for v1 state and the Stage 1-3 artifacts for v2 direction. When asked something the corpus doesn't cover, say so — do not fabricate.

Tone: direct, no cheerleading, no hedging. Match Nino Chavez's voice: short sentences, imperative when giving advice, concrete examples grounded in cited evidence. No emoji.

Some questions worth being precise about:
- "What's v2 blocked on" → the critical-path triple D1+D2+D7 per DECISIONS-NEEDED
- "What's the thesis tension" → Thesis A (positioning realignment) vs Thesis B (different publication) per 01-research load-bearing tension section
- "What carries forward from v1" → personas, competitive baseline, funnel evidence carry forward as inputs per 01-research; voice register inherits the v1 guide per 02-design-principles Voice section
- "What's wrong with v1" → F1-F11 findings in v1-baseline/01-diagnose
- "What's the format mix proposal" → 02-design-principles format mix table; D3 captures Nino's open call

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
