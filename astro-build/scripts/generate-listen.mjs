#!/usr/bin/env node
// One-time authoring tool. Never runs during a site build or from a reader request.
import { mkdirSync, readFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { REVIEW_DIR, readManifest, readEssay, sourceHash, sha256, splitScript, localFile, assertSelectedVoice } from './listen-lib.mjs';

const { values } = parseArgs({ options: {
  'voice-id': { type: 'string' }, generate: { type: 'boolean', default: false },
  'max-characters': { type: 'string', default: '18000' },
  speed: { type: 'string', default: '1' },
  'model-id': { type: 'string', default: 'eleven_multilingual_v2' },
} });
if (!values['voice-id'] || !/^[a-zA-Z0-9]+$/.test(values['voice-id'])) throw new Error('Provide the selected saved narrator with --voice-id.');
const budget = Number(values['max-characters']);
if (!Number.isSafeInteger(budget) || budget < 1) throw new Error('Invalid character limit.');
const speed = Number(values.speed);
if (!Number.isFinite(speed) || speed < 0.7 || speed > 1.2) throw new Error('Speed must be between 0.7 and 1.2.');
const modelId = values['model-id'];
if (!['eleven_multilingual_v2', 'eleven_v3'].includes(modelId)) throw new Error('Unsupported narration model.');
const manifest = readManifest();
if (manifest.voiceSelection?.voiceId !== values['voice-id']) throw new Error('Voice ID must match the reviewed narrator selection.');
const settings = {
  voiceId: values['voice-id'], modelId, outputFormat: 'mp3_44100_128',
  voiceSettings: modelId === 'eleven_v3' ? { stability: 0.5, speed } :
    { stability: 0.6, similarity_boost: 0.75, style: 0, use_speaker_boost: true, speed },
};
const cacheDir = join(REVIEW_DIR, 'cache');
mkdirSync(cacheDir, { recursive: true });
const jobs = manifest.essays.map((essay) => {
  if (sourceHash(readEssay(essay.slug)) !== essay.sourceSha256) throw new Error('Essay changed; review the narration script again.');
  const text = readFileSync(localFile(REVIEW_DIR, essay.scriptFile), 'utf8');
  if (sha256(text) !== essay.scriptSha256) throw new Error('Script changed; review and update its fingerprint before generation.');
  if (modelId === 'eleven_v3' && /<break\b/i.test(text)) throw new Error('Eleven v3 does not support SSML breaks. Review a v3 narration script first.');
  const parts = splitScript(text);
  const chunks = parts.map((text, index) => {
    const input = { ...settings, text,
      previousText: modelId === 'eleven_multilingual_v2' ? parts[index - 1] || '' : '',
      nextText: modelId === 'eleven_multilingual_v2' ? parts[index + 1] || '' : '' };
    const fingerprint = sha256(JSON.stringify(input));
    const path = join(cacheDir, `${fingerprint}.mp3`);
    const receiptPath = join(cacheDir, `${fingerprint}.json`);
    let cached = false;
    if (existsSync(path) && existsSync(receiptPath)) {
      const receipt = JSON.parse(readFileSync(receiptPath, 'utf8'));
      cached = receipt.fingerprint === fingerprint && receipt.sha256 === sha256(readFileSync(path));
    }
    return { input, fingerprint, path, receiptPath, cached };
  });
  return { essay, chunks };
});
const characters = jobs.flatMap((job) => job.chunks).filter((chunk) => !chunk.cached).reduce((sum, chunk) => sum + chunk.input.text.length, 0);
console.log(`${manifest.essays.length} essays; ${characters} uncached text characters; maximum ${budget}.`);
if (characters > budget) throw new Error('Character allowance exceeded. No requests sent.');
if (!values.generate) {
  console.log('Dry run only. Add --generate after the selected voice is saved and scripts are reviewed.');
  process.exit(0);
}
// Check local prerequisites before spending credits. 1Password output stays in memory.
for (const command of ['ffmpeg', 'ffprobe']) execFileSync(command, ['-version'], { stdio: ['ignore', 'ignore', 'pipe'], timeout: 10000 });
const key = process.env.ELEVENLABS_API_KEY || execFileSync('op', [
  'read', 'op://Developer Secrets/ElevenLabs bc-subscriptions/credential',
], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 30000 }).trim();
const voiceResponse = await fetch(`https://api.elevenlabs.io/v1/voices/${settings.voiceId}`, {
  headers: { 'xi-api-key': key }, signal: AbortSignal.timeout(30000),
});
if (!voiceResponse.ok) throw new Error(`Cannot verify the selected voice (HTTP ${voiceResponse.status}).`);
const voice = await voiceResponse.json();
assertSelectedVoice(voice, manifest.voiceSelection);

for (const { essay, chunks } of jobs) {
  for (const chunk of chunks) {
    if (chunk.cached) continue;
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${settings.voiceId}?output_format=${settings.outputFormat}`, {
      method: 'POST', headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: chunk.input.text, model_id: settings.modelId,
        voice_settings: settings.voiceSettings,
        previous_text: chunk.input.previousText || undefined, next_text: chunk.input.nextText || undefined }),
      signal: AbortSignal.timeout(180000),
    });
    // Never automatically retry a generation whose billing outcome is uncertain.
    if (!response.ok) throw new Error(`ElevenLabs generation failed (HTTP ${response.status}). Inspect history before retrying.`);
    if (!response.headers.get('content-type')?.includes('audio/')) throw new Error('Unexpected generation response; inspect history before retrying.');
    const audio = Buffer.from(await response.arrayBuffer());
    if (audio.length < 1000) throw new Error('Generation returned an empty or incomplete audio file.');
    writeFileSync(chunk.path, audio);
    writeFileSync(chunk.receiptPath, JSON.stringify({
      fingerprint: chunk.fingerprint, sha256: sha256(audio), requestId: response.headers.get('request-id'),
      generatedAt: new Date().toISOString(), characters: chunk.input.text.length,
    }, null, 2) + '\n');
    console.log(`Saved ${essay.slug}: ${chunk.input.text.length} characters.`);
  }
  const destination = localFile(REVIEW_DIR, essay.audioFile);
  if (chunks.length === 1) copyFileSync(chunks[0].path, destination);
  else {
    const concat = join(cacheDir, `${essay.slug}.concat.txt`);
    // Only generated hex cache filenames enter the concat list.
    writeFileSync(concat, chunks.map((chunk) => `file '${chunk.fingerprint}.mp3'`).join('\n') + '\n');
    execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '1', '-i', concat,
      '-c:a', 'libmp3lame', '-b:a', '128k', '-ar', '44100', destination], { stdio: ['ignore', 'ignore', 'pipe'], timeout: 120000 });
  }
  const duration = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1', destination], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 10000 }).trim());
  if (!Number.isFinite(duration) || duration <= 0) throw new Error('Generated recording has no valid duration.');
  Object.assign(essay, { narrator: manifest.voiceSelection.narrator, status: 'ready-for-review', durationSeconds: duration, sha256: sha256(readFileSync(destination)),
    generation: settings, generatedAt: new Date().toISOString() });
  writeFileSync(join(REVIEW_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
}
console.log('Private recordings are ready for listening. Nothing has been approved or published.');
