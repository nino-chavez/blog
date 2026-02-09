import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies }) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  const expectedToken = import.meta.env.DRAFT_PREVIEW_TOKEN;

  if (!expectedToken) {
    return new Response(
      JSON.stringify({ error: 'DRAFT_PREVIEW_TOKEN not configured' }),
      { status: 500, headers }
    );
  }

  try {
    const body = await request.json();
    const submittedToken = body.token;

    if (submittedToken && submittedToken === expectedToken) {
      // Set cookie
      cookies.set('draft_token', submittedToken, {
        path: '/',
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid token' }),
      { status: 401, headers }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: 'Invalid request' }),
      { status: 400, headers }
    );
  }
};
