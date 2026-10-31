import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { readFileSync } from 'node:fs';
import { Miniflare } from 'miniflare';

// Exercise real workerd Cache API semantics, including its range handling.
const source = readFileSync(new URL('../src/utils/serve-essay-audio.mjs', import.meta.url), 'utf8');
const bytes = Uint8Array.from({ length: 1024 }, (_, index) => index % 256);
let runtime;
before(() => {
  runtime = new Miniflare({
    modules: true,
    compatibilityDate: '2024-05-01',
    script: `${source}\nexport default { async fetch(request) {
      const assets = { async fetch(input) {
        if (!new URL(input.url).pathname.startsWith('/blog/audio/')) throw new Error('Asset URL would recurse through runtime');
        if (input.headers.has('Range') || input.headers.has('If-None-Match')) throw new Error('Incomplete asset request');
        if (input.url.includes('/missing-')) return new Response('Not found', {status:404});
        const body = new ReadableStream({ start(controller) {
          controller.enqueue(Uint8Array.from({length:1024},(_,i)=>i%256)); controller.close();
        }});
        return new Response(body, {headers:{'Content-Type':'audio/mpeg',ETag:'"fixture"'}});
      }};
      const cache = request.url.includes('/no-cache-') ? {match:async()=>undefined,put:async()=>{}}
        : request.url.includes('/put-error-') ? {match:async()=>undefined,put:async()=>{throw new Error('Cache write unavailable')}}
        : request.url.includes('/cache-error-') ? {match:async()=>{throw new Error('Cache unavailable')}} : caches.default;
      return serveEssayAudio(request, assets, cache, request.url.includes('/unapproved-') ? undefined : 1024);
    }};`,
  });
});
after(async () => { await runtime?.dispose(); });
const fetchAudio = (options, name = 'essay') => runtime.dispatchFetch(`https://listen.test/blog/listen/${name}-123456abcdef.mp3`, options);

test('full GET preserves exact bytes and advertises seeking', async () => {
  const response = await fetchAudio();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('accept-ranges'), 'bytes');
  assert.equal(response.headers.get('content-length'), '1024');
  assert.deepEqual(new Uint8Array(await response.arrayBuffer()), bytes);
});

test('HEAD works with a cold cache and ignores Range', async () => {
  const response = await fetchAudio({ method: 'HEAD', headers: { Range: 'bytes=0-1' } }, 'head');
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-length'), '1024');
  assert.equal((await response.arrayBuffer()).byteLength, 0);
});

for (const [label, range, start, end] of [
  ['cold', 'bytes=0-1', 0, 1],
  ['middle', 'bytes=400-499', 400, 499],
  ['open', 'bytes=1000-', 1000, 1023],
  ['suffix', 'bytes=-24', 1000, 1023],
]) {
  test(`${label} range returns only requested bytes on cold and warm cache`, async () => {
    for (let attempt = 0; attempt < 2; attempt++) {
      const response = await fetchAudio({ headers: { Range: range } }, label);
      assert.equal(response.status, 206);
      assert.equal(response.headers.get('content-range'), `bytes ${start}-${end}/1024`);
      assert.deepEqual(new Uint8Array(await response.arrayBuffer()), bytes.slice(start, end + 1));
    }
  });
}

test('unsatisfiable range returns 416 with total length', async () => {
  const response = await fetchAudio({ headers: { Range: 'bytes=1024-' } });
  assert.equal(response.status, 416);
  assert.equal(response.headers.get('content-range'), 'bytes */1024');
});

test('If-Range requires an exact strong validator', async () => {
  for (const validator of ['"changed"', 'W/"fixture"', 'Wed, 21 Oct 2015 07:28:00 GMT']) {
    const response = await fetchAudio({ headers: { Range: 'bytes=0-1', 'If-Range': validator } });
    assert.equal(response.status, 200);
    assert.equal((await response.arrayBuffer()).byteLength, 1024);
  }
  const response = await fetchAudio({ headers: { Range: 'bytes=0-1', 'If-Range': '"fixture"' } });
  assert.equal(response.status, 206);
  assert.equal((await response.arrayBuffer()).byteLength, 2);
});

test('conditional request returns 304 without a body', async () => {
  const response = await fetchAudio({ headers: { 'If-None-Match': 'W/"fixture"' } });
  assert.equal(response.status, 304);
  assert.equal((await response.arrayBuffer()).byteLength, 0);
});

test('missing files and unsupported methods remain explicit', async () => {
  assert.equal((await fetchAudio({}, 'missing')).status, 404);
  assert.equal((await fetchAudio({}, 'unapproved')).status, 404);
  assert.equal((await fetchAudio({ method: 'POST' })).status, 405);
  assert.equal((await runtime.dispatchFetch('https://listen.test/blog/listen/private.wav')).status, 404);
});

test('unavailable cache preserves full playback without advertising seeking', async () => {
  for (const name of ['no-cache', 'cache-error', 'put-error']) {
    for (const headers of [{}, { Range: 'bytes=0-1' }]) {
      const response = await fetchAudio({ headers }, name);
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('accept-ranges'), 'none');
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.deepEqual(new Uint8Array(await response.arrayBuffer()), bytes);
    }
    const head = await fetchAudio({ method: 'HEAD' }, name);
    assert.equal(head.status, 200);
    assert.equal((await head.arrayBuffer()).byteLength, 0);
  }
});
