# Listen: hear the recording before publishing it

The first trial uses **Because I Can Is Only Half the Answer** and **The Rules of the Road Still Apply**. Nino selected **Nino Casual - cleaned test** after hearing the short comparison and requested further refinement. Both essays now have private recordings using that voice, gentle EQ, compression and volume leveling: **3:46** and **7:52**, respectively. Pitch and timing are unchanged. The original clone, earlier recordings and unprocessed new takes are preserved. These final candidates still require Nino's listening approval. No essay has public audio metadata, and no MP3 has been added to the site.

## Set up the voice once

The trial uses **Nino Casual - cleaned test** and retains **Nino Casual** as the original. For a future replacement, record about two minutes alone in a quiet, furnished room with little echo, at a consistent microphone distance. Use normal conversational volume and the delivery you want the essays to use. Read the opening of an existing essay naturally. Use a name containing **Nino** and complete ElevenLabs' voice-rights confirmation yourself.

ElevenLabs recommends one to two minutes of clean, consistent speech; its current recording screen suggests three minutes. More than three minutes is not needed for this trial. See the [official recording guidance](https://elevenlabs.io/docs/eleven-creative/voices/voice-cloning/instant-voice-cloning).

The clone stays in Nino's ElevenLabs account. Do not publish it to the voice library. The generation command requires a saved Instant Voice Clone with Nino in its name; it never falls back to a stock narrator or another provider.

## Prepare and generate private recordings

Run commands from `astro-build`. `npm run listen:prepare` extracts the two published essays into `.tmp/listen-preview/`. It refuses to overwrite an existing review. Read both text files before generating: URLs are removed while link text remains, headings are spoken, section dividers become pauses, and `630` becomes `Six Thirty`. The standalone “Read the letter” link is omitted. The title and author are spoken first. Complex MDX fails instead of silently losing code, images or tables.

`npm run listen:generate -- --voice-id SAVED_VOICE_ID` is an offline dry run. It reports uncached characters and sends no requests. Add `--generate` to create the private recordings after the voice is saved and the scripts have been read. The default allowance is 18,000 text characters per invocation. The first pair contains approximately 13,100 characters; the provider's actual credit charge remains authoritative.

The authoring command reads the existing ElevenLabs credential from 1Password in process memory, or accepts `ELEVENLABS_API_KEY` already supplied by a secret injector. It never writes credentials. `ffmpeg` and `ffprobe` are required locally. The voice is checked before generating. Output uses Multilingual v2 at 44.1 kHz / 128 kbps MP3, with no background music.

Generation is split at paragraph boundaries. A chunk is reused only when its script, voice ID, model, voice settings, neighboring text and output format match and its saved bytes pass a checksum. There are no automatic paid retries. After an uncertain network failure, inspect ElevenLabs history before rerunning. If the clone's samples change under the same voice ID, preserve the old review and prepare a new review directory before generating again; cached takes are not evidence of the revised voice.

Local review state and audio stay under `.tmp`, outside Astro's source and public directories. The manifest records source/script hashes, settings, durations and audio hashes; chunk receipts record request IDs. Keep this review directory until the recording is approved and promoted; removing it loses the local recordings and cache.

Keep previously shared MP3 paths unchanged when revising. Archive the prior manifest and assign new `audioFile` names before generation; the generator writes to those destinations. The current refined files end in `-cleaned-refined-v2.mp3`, while their unprocessed takes end in `-cleaned-raw-v2.mp3`. Do not rerun generation against the finished manifest without first assigning new raw-output names. Local EQ revisions can reuse the unprocessed recordings without another ElevenLabs generation. Each essay's `postProcessing` record and `.tmp/listen-preview/refinement-review.json` retain the exact source hash, filters, finishing gain, final hash and measured levels.

## Listen locally

Run `npm run build`, then `npm run listen:preview`. Open `http://127.0.0.1:4328`. The listening room shows both recordings when available and links to each essay with the same player used by the public article. It binds only to loopback, sends no-store and noindex headers, and is not an Astro route. Public builds cannot include it.

The public player appears below the byline. Native controls support play, pause and seeking without JavaScript; the browser may also offer playback speed. A small enhancement makes Space work consistently when the player has focus and explains playback failures. Nothing autoplays or preloads before playback. A download link remains available as an explicitly fallible recovery action after an error, and the essay below supplies the transcript. The visible label says the narration uses an AI version of Nino's voice.

The listening room checks the current essay, built transcript and audio fingerprints. Changed text, an old build or replaced audio must be reconciled before listening. Check pronunciation, pace, paragraph joins and the ending of each actual recording. Pay particular attention to Six Thirty, LeagueApps, Hume Logan and the names cited in the second essay. Browser tests use an explicitly labelled test tone and do not establish voice quality. Nino must hear both real recordings before publication.

## Approval is a separate step

Do not merge this trial or deploy recordings until Nino has heard and approved them. After approval, copy only the approved MP3s into `astro-build/public/blog/audio/`, using a filename that includes a short audio hash, and add each essay's `audio` frontmatter:

- `status: approved`
- `src: /blog/audio/<slug>-<short-hash>.mp3`
- `durationSeconds` and `narrator`
- `sha256` of the exact approved MP3
- `sourceSha256` from the reviewed manifest

`npm run build` rejects orphan files, unapproved/draft/unlisted owners, missing files, changed audio bytes and essays changed since recording. Approval cannot be inferred from generation success. The JSON indexes, feeds and search receive no draft recording metadata. Content and recording approval remain separate from LinkedIn distribution.

## Verification

`npm run test:listen` checks the approval boundary, stale recordings, paths, script preparation and player escaping. The build runs the public-audio check before Astro starts. `scripts/check-listen-player.mjs` accepts an installed Playwright package path, following the existing design runner's convention. It creates a quiet test tone in `.tmp`, then checks Chromium and WebKit at desktop, 390px and 320px widths, keyboard playback, seeking, missing-audio behavior, range requests and no-JavaScript markup. It never calls ElevenLabs.

Current evidence and any remaining review findings are recorded in `docs/design/listen-review.md`.
