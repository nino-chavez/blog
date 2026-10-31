import type { APIRoute } from 'astro';
import { serveEssayAudio } from '../../../utils/serve-essay-audio.mjs';

export const prerender = false;

export const ALL: APIRoute = ({ request, locals }) =>
  serveEssayAudio(request, locals.runtime.env.ASSETS, caches.default);
