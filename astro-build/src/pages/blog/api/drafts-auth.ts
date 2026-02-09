import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const expectedToken = import.meta.env.DRAFT_PREVIEW_TOKEN;

  if (!expectedToken) {
    return new Response('DRAFT_PREVIEW_TOKEN not configured', { status: 500 });
  }

  const formData = await request.formData();
  const submittedToken = formData.get('token')?.toString();

  if (submittedToken && submittedToken === expectedToken) {
    // Set cookie
    cookies.set('draft_token', submittedToken, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return redirect('/blog/drafts', 302);
  }

  // Invalid token - redirect back with error
  return redirect('/blog/drafts?error=invalid', 302);
};
