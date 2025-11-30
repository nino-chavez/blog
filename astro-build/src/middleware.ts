import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const host = context.request.headers.get('host') || '';

  // Only consider redirects for direct visits to blog.ninochavez.co
  if (host !== 'blog.ninochavez.co') {
    return next();
  }

  // Check if this is a proxied request from the main domain
  // Vercel rewrites set x-forwarded-host to the original requesting host
  const forwardedHost = context.request.headers.get('x-forwarded-host');

  // If x-forwarded-host is ninochavez.co, this is a proxied request - don't redirect
  if (forwardedHost === 'ninochavez.co') {
    return next();
  }

  // This is a direct visit to blog.ninochavez.co - redirect to main domain
  // Map the path correctly: /blog/* stays as /blog/*, root goes to /blog
  const path = url.pathname;
  const targetPath = path === '/' || path === '' ? '/blog' : path;

  return context.redirect(`https://ninochavez.co${targetPath}`, 308);
});
