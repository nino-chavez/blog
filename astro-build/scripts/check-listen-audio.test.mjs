import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import matter from 'gray-matter';
import { checkAudio } from './check-listen-audio.mjs';
import { sourceHash, sha256, narrationScript, splitScript, localFile, assertSelectedVoice } from './listen-lib.mjs';
import { renderEssayAudio } from '../src/utils/essay-audio.mjs';

function fixture(t, { status = 'published', withAudio = true, withFile = true, audio = {}, body = 'A source paragraph.', recordedBody = body } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'signal-listen-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, 'src/content/blog'), { recursive: true });
  mkdirSync(join(root, 'public/blog/audio'), { recursive: true });
  const bytes = Buffer.from('test recording bytes');
  const data = { title: 'An essay', author: 'Nino Chavez', status };
  if (withAudio) data.audio = {
    status: 'approved', src: '/blog/audio/an-essay.mp3', durationSeconds: 120, narrator: 'Nino Chavez',
    sha256: sha256(bytes), sourceSha256: sourceHash({ data, content: recordedBody }), ...audio,
  };
  writeFileSync(join(root, 'src/content/blog/an-essay.mdx'), matter.stringify(body, data));
  if (withFile) writeFileSync(join(root, 'public/blog/audio/an-essay.mp3'), bytes);
  return root;
}

test('essays without audio still build', (t) => assert.equal(checkAudio(fixture(t, { withAudio: false, withFile: false })), 0));
test('accepts exact approved source and recording', (t) => assert.equal(checkAudio(fixture(t)), 1));
test('rejects an orphan recording', (t) => assert.throws(() => checkAudio(fixture(t, { withAudio: false })), /no approved/));
test('rejects a missing recording', (t) => assert.throws(() => checkAudio(fixture(t, { withFile: false })), /missing/));
test('rejects an unapproved recording', (t) => assert.throws(() => checkAudio(fixture(t, { audio: { status: 'ready-for-review' } })), /explicit recording approval/));
for (const status of ['draft', 'unlisted']) test(`rejects audio on ${status} essays`, (t) => assert.throws(() => checkAudio(fixture(t, { status })), /published essay/));
test('rejects replaced audio bytes', (t) => assert.throws(() => checkAudio(fixture(t, { audio: { sha256: '0'.repeat(64) } })), /bytes changed/));
test('rejects audio after the essay changes', (t) => assert.throws(() => checkAudio(fixture(t, { recordedBody: 'An earlier claim.' })), /Essay changed/));
test('rejects external and traversing audio paths', (t) => {
  for (const src of ['https://example.com/a.mp3', '/blog/audio/../a.mp3']) {
    assert.throws(() => checkAudio(fixture(t, { audio: { src } })), /must use/);
  }
});
test('local review cannot request arbitrary files', () => {
  for (const name of ['../secret', '/etc/passwd', '.env', 'cache/test.mp3']) assert.throws(() => localFile('/tmp', name));
});
test('spoken script preserves prose and normalizes links and 630', () => {
  const script = narrationScript({ data: { title: 'A title', author: 'Nino Chavez' }, content: 'At 630, [evidence](https://example.com/a_(b)) matters.\n\n## A heading\n\nStill true.' });
  assert.equal(script, 'A title.\n\nBy Nino Chavez.\n\nAt Six-three-oh, evidence matters.\n\nA heading.\n\nStill true.\n');
  assert.throws(() => narrationScript({ data: { title: 'Complex' }, content: '```js\ncode\n```' }), /complex MDX/);
});
test('narration headings retain existing punctuation', () => {
  const script = narrationScript({ data: { title: 'A title' }, content: '## What matters?\n\n## Next steps:\n\n## A statement.\n\n## *Already done.*\n\n## **Question?**\n\n##\n\nText after blank heading.' });
  assert.ok(script.endsWith('What matters?\n\nNext steps:\n\nA statement.\n\nAlready done.\n\nQuestion?\n\nText after blank heading.\n'));
});
test('invalid generation speed is rejected before reading review files or calling ElevenLabs', () => {
  for (const speed of ['0.69', '1.21', 'NaN', 'Infinity']) {
    assert.throws(() => execFileSync(process.execPath, [new URL('./generate-listen.mjs', import.meta.url).pathname,
      '--voice-id', 'test', '--speed', speed], { stdio: ['ignore', 'pipe', 'pipe'], timeout: 10000 }), /Speed must be between 0.7 and 1.2/);
  }
});
test('chunking preserves paragraph order and text', () => {
  const text = 'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.';
  const chunks = splitScript(text, 35);
  assert.ok(chunks.length > 1);
  assert.ok(chunks.every((chunk) => chunk.length <= 35));
  assert.equal(chunks.join('\n\n'), text);
});
test('generation accepts only the exact selected clone or designed voice', () => {
  for (const category of ['cloned', 'generated']) {
    const voice = { voice_id: 'SelectedVoice', name: 'Selected narrator', category };
    const selection = { voiceId: voice.voice_id, name: voice.name, category, narrator: 'Selected narrator', selectedBy: 'Nino' };
    assert.doesNotThrow(() => assertSelectedVoice(voice, selection));
    for (const other of [{ ...voice, voice_id: 'OtherVoice' }, { ...voice, name: 'Other narrator' }, { ...voice, category: 'premade' }]) {
      assert.throws(() => assertSelectedVoice(other, selection), /does not match/);
    }
    assert.throws(() => assertSelectedVoice(voice), /Record Nino/);
    assert.throws(() => assertSelectedVoice(voice, { ...selection, selectedBy: 'agent' }), /Record Nino/);
    assert.throws(() => assertSelectedVoice(voice, { ...selection, narrator: '' }), /narrator label/);
  }
});
test('designed narrator disclosure does not imply Nino recorded the voice', () => {
  const html = renderEssayAudio({ src: '/blog/audio/example.mp3', durationSeconds: 125, narrator: 'Original British narrator' }, { title: 'An essay' });
  assert.ok(html.includes('AI narration · Original British narrator.'));
  assert.ok(!html.includes('Nino') && !html.includes('’s voice'));
});
test('player escapes text, supplies a fallback, and never autoplays', () => {
  const html = renderEssayAudio({ src: '/blog/audio/example.mp3', durationSeconds: 125, narrator: '<Nino>' }, { title: '"Title" <script>' });
  assert.ok(html.includes('controls src="/blog/listen/example.mp3" preload="none"'));
  assert.ok(html.includes('href="/blog/audio/example.mp3" download'));
  assert.ok(html.includes('data-pagefind-ignore'));
  assert.ok(html.includes('2:05'));
  assert.ok(html.includes('Download audio'));
  assert.ok(html.includes('&lt;Nino&gt;'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!html.includes('autoplay'));
});
