const audioPath = /^\/blog\/listen\/[a-z0-9-]+\.mp3$/;

// Pages assets ignore Range. The Workers Cache API implements byte ranges over
// a stored response with Content-Length, without buffering MP3s in JS memory.
// https://developers.cloudflare.com/workers/runtime-apis/cache/#match
export async function serveEssayAudio(request, assets, cache, byteLength) {
  const url = new URL(request.url);
  if (!audioPath.test(url.pathname)) return new Response('Not found', { status: 404 });
  if (!Number.isSafeInteger(byteLength) || byteLength <= 0 || byteLength > 25 * 1024 * 1024) {
    return new Response('Not found', { status: 404 });
  }
  if (!['GET', 'HEAD'].includes(request.method)) {
    return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
  }
  url.search = '';
  const key = new Request(url);
  const assetUrl = new URL(url);
  assetUrl.pathname = assetUrl.pathname.replace('/blog/listen/', '/blog/audio/');
  const assetRequest = () => new Request(assetUrl, { headers: { 'Accept-Encoding': 'identity' } });
  const withoutSeeking = async (response) => {
    const headers = new Headers(response.headers);
    headers.set('Accept-Ranges', 'none');
    headers.set('Cache-Control', 'no-store');
    if (request.method === 'HEAD') await response.body?.cancel();
    return new Response(request.method === 'HEAD' ? null : response.body, { status: response.status, headers });
  };
  const fallback = async () => {
    try { return await withoutSeeking(await assets.fetch(assetRequest())); }
    catch { return new Response('Audio temporarily unavailable', { status: 503, headers: { 'Cache-Control': 'no-store' } }); }
  };
  let full;
  try {
    full = await cache.match(key);
    if (!full) {
      // ASSETS bypasses this runtime route. Fetch the complete immutable file;
      // forwarding Range or conditional headers could cache an incomplete body.
      const asset = await assets.fetch(assetRequest());
      if (asset.status !== 200) {
        if (request.method === 'HEAD') {
          await asset.body?.cancel();
          return new Response(null, { status: asset.status, headers: asset.headers });
        }
        return asset;
      }
      if (!/^audio\/mpeg\b/.test(asset.headers.get('content-type') || '')) {
        await asset.body?.cancel();
        return new Response('Audio unavailable', { status: 502, headers: { 'Cache-Control': 'no-store' } });
      }
      const headers = new Headers(asset.headers);
      headers.set('Accept-Ranges', 'bytes');
      headers.set('Cache-Control', /-[a-f0-9]{12}\.mp3$/.test(url.pathname)
        ? 'public, max-age=31536000, immutable' : 'public, max-age=300');
      headers.delete('Set-Cookie');
      // ASSETS may use chunked encoding. The build records each approved file's
      // exact size; FixedLengthStream makes workerd retain Content-Length and
      // rejects truncated/oversized bodies without buffering them in memory.
      const { readable, writable } = new FixedLengthStream(byteLength);
      headers.set('Content-Length', String(byteLength));
      // Await the store: the first range request needs the cached body now.
      await Promise.all([
        cache.put(key, new Response(readable, { headers })).finally(async () => {
          // A disabled cache may not consume the stream. Release the writer
          // instead of leaving the request blocked by backpressure.
          try { await readable.cancel(); } catch { /* already consumed/locked */ }
        }),
        asset.body.pipeTo(writable),
      ]);
      full = await cache.match(key);
      if (!full) return fallback();
    }
  } catch { return fallback(); }

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
    let partial;
    try { partial = await cache.match(new Request(key, { headers: { Range: range } })); }
    catch { return withoutSeeking(full); }
    if (partial) {
      await full.body?.cancel();
      return partial;
    }
    return withoutSeeking(full);
  }
  return full;
}
