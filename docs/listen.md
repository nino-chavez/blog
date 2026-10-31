# Listen: hear the recording before publishing it

The first two recordings are **Because I Can Is Only Half the Answer** (**5:08**) and **The Rules of the Road Still Apply** (**10:20**). After reviewing his own clone and three original narrator auditions, Nino selected **candidate 1**, saved as **Signal Dispatch - British Narrator**. This is an original designed voice, disclosed as **Original British narrator**. Both recordings use Eleven v3, native speed 1, punctuated headings and **six-three-oh** as the pronunciation of `630`; only volume was adjusted locally. Nino heard both full recordings and explicitly approved publishing them on **October 30, 2026**. Their exact approved bytes are in `public/blog/audio/`, with matching audio metadata on both essays. Earlier voice references, auditions and takes remain private.

## Set up the voice once

Save the exact audition Nino selects, then read it back from ElevenLabs. Record its `voiceId`, `name`, `category` (`generated` or `cloned`), reader-facing `narrator` label and `selectedBy: Nino` in the private manifest's `voiceSelection`. The generator copies that narrator label to each completed essay; this is separate from its author. It rejects a different voice ID, name or category instead of silently changing narrators.

The selected candidate is saved from its original Voice Design preview, without cloning a performer. For a future personal clone, use one to two minutes of normal conversational speech in a quiet, furnished room, at a consistent microphone distance, and complete the voice-rights confirmation yourself. See the [official recording guidance](https://elevenlabs.io/docs/eleven-creative/voices/voice-cloning/instant-voice-cloning).

Voices stay in Nino's ElevenLabs account. Do not publish them to the voice library. The generation command accepts only the exact selected saved clone or designed voice; it never falls back to a stock narrator or another provider.

## Prepare and generate private recordings

Run commands from `astro-build`. `npm run listen:prepare` extracts the two published essays into `.tmp/listen-preview/`. It refuses to overwrite an existing review. Read both text files before generating: URLs are removed while link text remains, headings are spoken with ending punctuation, section dividers become pauses, and `630` becomes `Six-three-oh`, as Nino specified. The standalone “Read the letter” link is omitted. The title and author are spoken first. Complex MDX fails instead of silently losing code, images or tables.

`npm run listen:generate -- --voice-id SAVED_VOICE_ID --model-id eleven_v3` is the current offline dry run. It reports uncached characters and sends no requests. Add `--generate` to create the private recordings after the voice is saved, its selection recorded and the scripts read. The default allowance is 18,000 text characters per invocation. The first pair contains approximately 13,100 characters; the provider's actual credit charge remains authoritative.

The authoring command reads the existing ElevenLabs credential from 1Password in process memory, or accepts `ELEVENLABS_API_KEY` already supplied by a secret injector. It never writes credentials. `ffmpeg` and `ffprobe` are required locally. The voice is checked before generating. Output is 44.1 kHz / 128 kbps MP3, with no background music. Supported models are Eleven v3 and Multilingual v2; the latter remains the command's default for compatibility. The v3 setting uses stability 0.5 and omits similarity and speaker boost controls that v3 does not support.

Speed defaults to `1`, preserving the designed narrator's audition cadence; values outside ElevenLabs' supported `0.7`–`1.2` range are rejected before any request. Speed is part of the cache fingerprint. The earlier personal-clone review used `--speed 0.92` and sparse SSML pauses with Multilingual v2. Eleven v3 rejects those scripts because it does not support SSML breaks; its current scripts use natural punctuation and paragraph boundaries. See ElevenLabs' [pacing and pause guidance](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices).

Generation is split at paragraph boundaries. A chunk is reused only when its script, voice ID, model, voice settings, neighboring text and output format match and its saved bytes pass a checksum. There are no automatic paid retries. After an uncertain network failure, inspect ElevenLabs history before rerunning. If the clone's samples change under the same voice ID, preserve the old review and prepare a new review directory before generating again; cached takes are not evidence of the revised voice.

Local review state and audio stay under `.tmp`, outside Astro's source and public directories. The manifest records source/script hashes, settings, durations and audio hashes; chunk receipts record request IDs. Keep this review directory until the recording is approved and promoted; removing it loses the local recordings and cache.

Before removing a completed release worktree, retain its private review directory in the main repository's ignored `.artifacts/listen/<release-date>/` archive. The first release uses `.artifacts/listen/2026-10-30/`. Only the two approved finished MP3s belong in Git; source recordings, voice receipts, alternate takes and private transcripts stay in that local archive.

Keep previously shared MP3 paths unchanged when revising. Archive the prior manifest and assign new `audioFile` names before generation; the generator writes to those destinations. The British narrator files end in `-british-v1.mp3`, while their unprocessed takes end in `-british-v1-raw.mp3`. Earlier files remain unchanged. Do not rerun generation against the finished manifest without first assigning new raw-output names. Local finishing can reuse unprocessed recordings without another ElevenLabs generation. Each essay's `postProcessing` record and `.tmp/listen-preview/british-v1-review.json` retain source/final hashes, finishing settings and measured levels. Earlier review receipts remain alongside them.

## Listen locally

Run `npm run build`, then `npm run listen:preview`. Open `http://127.0.0.1:4328`. The listening room shows both recordings when available and links to each essay with the same player used by the public article. It binds only to loopback, sends no-store and noindex headers, and is not an Astro route. Public builds cannot include it.

The public player appears below the byline. Native controls support play, pause and seeking without JavaScript; the browser may also offer playback speed. A small enhancement makes Space work consistently when the player has focus and explains playback failures. Nothing autoplays or preloads before playback. A download link remains available as an explicitly fallible recovery action after an error, and the essay below supplies the transcript. The visible label identifies AI narration and the selected narrator, without implying that the author recorded a designed voice.

The listening room checks the current essay, built transcript and audio fingerprints. Changed text, an old build or replaced audio must be reconciled before listening. Check pronunciation, pace, paragraph joins and the ending of each actual recording. Pay particular attention to six-three-oh, LeagueApps, Hume Logan and the names cited in the second essay. Browser tests use an explicitly labelled test tone and do not establish voice quality. Nino must hear both real recordings before publication.

## Approval is a separate step

The first pair has Nino's listening and publication approval. For every future recording or revision, obtain approval of the actual audio before deployment. After approval, copy only the approved MP3s into `astro-build/public/blog/audio/`, using a filename that includes a short audio hash, and add each essay's `audio` frontmatter:

- `status: approved`
- `src: /blog/audio/<slug>-<short-hash>.mp3`
- `durationSeconds` and `narrator`
- `sha256` of the exact approved MP3
- `sourceSha256` from the reviewed manifest

`npm run build` rejects orphan files, unapproved/draft/unlisted owners, missing files, changed audio bytes and essays changed since recording. Approval cannot be inferred from generation success. The JSON indexes, feeds and search receive no draft recording metadata. Content and recording approval remain separate from LinkedIn distribution.

## Verification

`npm run test:listen` checks the approval boundary, stale recordings, paths, script preparation and player escaping. The build runs the public-audio check before Astro starts. `scripts/check-listen-player.mjs` accepts an installed Playwright package path, following the existing design runner's convention. It creates a quiet test tone in `.tmp`, then checks Chromium and WebKit at desktop, 390px and 320px widths, keyboard playback, seeking, missing-audio behavior, range requests and no-JavaScript markup. It never calls ElevenLabs.

Current evidence and any remaining review findings are recorded in `docs/design/listen-review.md`.
