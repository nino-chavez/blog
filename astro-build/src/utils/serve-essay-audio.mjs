const audioPath = /^\/blog\/audio\/[a-z0-9-]+\.mp3$/;

// Pages assets ignore Range. The Workers Cache API implements byte ranges over
// a stored response with Content-Length, without buffering MP3s in JS memory.
// https://developers.cloudflare.com/workers/runtime-apis/cache/#match
export async function serveEssayAudio(request, assets, cache) {
  const url = new URL(request.url);
  if (!audioPath.test(url.pathname)) return new Response('Not found', { status: 404 });
  if (!['GET', 'HEAD'].includes(request.method)) {
    return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
  }
  url.search = '';
  const key = new Request(url);
  let full = await cache.match(key);
  if (!full) {
    // ASSETS bypasses this runtime route. Fetch the complete immutable file;
    // forwarding Range or conditional headers could cache an incomplete body.
    const asset = await assets.fetch(new Request(key, { headers: { 'Accept-Encoding': 'identity' } }));
    if (asset.status !== 200) {
      if (request.method === 'HEAD') {
        await asset.body?.cancel();
        return new Response(null, { status: asset.status, headers: asset.headers });
      }
      return asset;
    }
    const length = Number(asset.headers.get('content-length'));
    if (!Number.isSafeInteger(length) || length <= 0 || length > 25 * 1024 * 1024 ||
        !/^audio\/mpeg\b/.test(asset.headers.get('content-type') || '')) {
      await asset.body?.cancel();
      return new Response('Audio unavailable', { status: 502, headers: { 'Cache-Control': 'no-store' } });
    }
    const headers = new Headers(asset.headers);
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', /-[a-f0-9]{12}\.mp3$/.test(url.pathname)
      ? 'public, max-age=31536000, immutable' : 'public, max-age=300');
    headers.delete('Set-Cookie');
    // Await the store: the first range request needs the cached body now.
    await cache.put(key, new Response(asset.body, { headers }));
    full = await cache.match(key);
    if (!full) return new Response('Audio temporarily unavailable', {
      status: 503, headers: { 'Cache-Control': 'no-store', 'Retry-After': '3' },
    });
  }

  const etag = full.headers.get('etag');
  const ifNoneMatch = request.headers.get('if-none-match');
  if (ifNoneMatch && (ifNoneMatch === '*' || ifNoneMatch.split(',').some((value) =>
    value.trim().replace(/^W\//, '') === etag?.replace(/^W\//, '')))) {
    await full.body?.cancel();
    return new Response(null, { status: 304, headers: { ETag: etag || '', 'Cache-Control': full.headers.get('cache-control') } });
  }
  if (request.method === 'HEAD') {
    await full.body?.cancel();
    return new Response(null, { headers: full.headers });
  }

  const range = request.headers.get('range');
  const ifRange = request.headers.get('if-range');
  // Cache.match does not implement If-Range; a changed/weak/date validator must
  // receive the whole file unless it exactly matches the asset's strong ETag.
  if (range && (!ifRange || (etag && !etag.startsWith('W/') && ifRange === etag))) {
    const partial = await cache.match(new Request(key, { headers: { Range: range } }));
    if (partial) {
      await full.body?.cancel();
      return partial;
    }
  }
  return full;
}
