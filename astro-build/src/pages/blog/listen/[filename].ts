import type { APIRoute } from 'astro';
import { serveEssayAudio } from '../../../utils/serve-essay-audio.mjs';
import approvedAssets from '../../../../.tmp/listen-assets.json';

export const prerender = false;

export const ALL: APIRoute = ({ request, locals, params }) =>
  serveEssayAudio(request, locals.runtime.env.ASSETS, caches.default,
    approvedAssets[`/blog/audio/${params.filename}`]);
