import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies }) => {
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const { slug } = await request.json();

    // Validate token from cookie (set by drafts-auth)
    const expectedToken = import.meta.env.DRAFT_PREVIEW_TOKEN;
    const cookieToken = cookies.get('draft_token')?.value;
    if (!cookieToken || cookieToken !== expectedToken) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    if (!slug) {
      return new Response(JSON.stringify({ error: 'Missing slug' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Trigger GitHub Actions workflow via repository dispatch
    const ghToken = import.meta.env.GITHUB_PAT;
    const repo = import.meta.env.GITHUB_REPO || 'nino-chavez/signal-dispatch-blog';

    if (!ghToken) {
      return new Response(JSON.stringify({ error: 'GitHub PAT not configured' }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    const response = await fetch(
      `https://api.github.com/repos/${repo}/dispatches`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ghToken}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: 'publish-draft',
          client_payload: { slug },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ error: `GitHub API error: ${response.status}`, details: errorText }),
        { status: 502, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({
        message: `Publish workflow triggered for "${slug}". The post will be live in ~1-2 minutes after Vercel redeploys.`,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: message }),
      { status: 500, headers: corsHeaders }
    );
  }
};
