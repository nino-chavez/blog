# Listen review — October 30, 2026

The Listen feature preserves the current article direction in `DIRECTION.md`. The parent opened the desktop and phone captures before requesting an independent review. All captured audio is an eight-second quiet test tone, explicitly labelled in the review UI. These captures do not represent Nino's voice or acceptance of a real recording.

## Independent findings and source checks

Read-only dispatch `6e22304d-299e-45e3-8643-514263cfc727` completed with matching requested and reported runtime evidence. The reviewer opened the four frames before inspecting implementation. It passed the desktop essay, mobile essay and private review composition, and identified an error-state issue. The parent checked each retained finding against the actual source:

| Finding | Disposition |
|---|---|
| A private recording could be paired with changed essay text. | Confirmed. The listening server now compares the current essay hash, the built transcript hash and the saved audio hash before serving a review. Stale source, an old build or changed audio is rejected. |
| The error screen retained a definite “Download audio” action to a possibly missing file. | Confirmed. After a playback failure, the link becomes “Try downloading the MP3.” This preserves a fallback for browser codec failures while making recovery uncertain. The essay remains readable. |
| The documentation linked to a missing review record. | Confirmed; this record is now the owner. |
| Native controls initially show zero duration while the separate duration label is populated. | Optional; retained `preload="none"` to avoid fetching recordings before the reader chooses playback. The visible duration remains accurate. |

## Verification and limits

All 14 approval tests pass, exercising accepted and rejected ownership, changed bytes, changed essay text, paths, script conversion and escaping. The site build includes the public-audio guard. Production output was inspected for private review markers and audio assets; neither is present. All 12 rendered checks pass in Chromium and WebKit at 1440, 390 and 320px, plus no-JavaScript player markup. They exercise keyboard play/pause, seeking, byte ranges, failure recovery and layout. The server also rejects deliberately stale source and replaced audio fingerprints. A build-in-progress produced one unstyled capture; it was rejected and the runner now checks the actual font and background before capturing.

The keyboard test exposed a difference between native browser controls. The player now handles Space at capture phase, prevents a second native toggle and initializes only once. Error checks use a real missing file and a user playback action. The WebKit test did not receive a reliable failure event from a nested `source` element; assigning the single MP3 directly to the audio element fixed the failure and simplified the markup.

Final selected captures and the test receipt belong in `docs/design/listen/`. The local review and its generated audio stay in the ignored `astro-build/.tmp/listen-preview/` directory. No approval metadata or public MP3 has been added.

## First personal-voice recordings

On October 30, 2026 (Chicago time), the ElevenLabs personal-voice API confirmed Nino's saved **Nino Casual** clone. Multilingual v2 generated the two private recordings from 13,117 text characters, without retries. The manifest records the exact source, script and MP3 hashes and generation settings. The provider's billed credit count has not been independently checked.

| Essay | Duration | File checks |
|---|---|---|
| Because I Can Is Only Half the Answer | 3:36 | MP3 checksum matches; full decode succeeds; 44.1 kHz, mono, 128 kbps. |
| The Rules of the Road Still Apply | 7:25 | MP3 checksum matches; full decode succeeds; 44.1 kHz, mono, 128 kbps. |

A local Whisper small.en transcription was compared against each prepared script. It found no missing passages, including across the longer essay's paragraph-boundary join. Remaining transcript differences were number/name formatting and four single-word substitutions; these may be recognition errors and are not proof of exact pronunciation. The transcript comparisons and logs stay with the private recordings. Both real MP3s started playback in the in-app browser and were left paused. This establishes file integrity, broad completeness and basic playback, not human listening quality. Voice fidelity, pacing, pronunciation, the audible join, physical-device behavior and Nino's listening approval remain open.

## Source-cleanup comparison

Nino rejected the initial voice as muffled, hollow and lacking warmth, and reported recording quietly in an empty room. The API returned the clone's 67.72-second reference sample. Its measured mean level was -27.5 dBFS, with a -5.5 dBFS peak; those measurements establish level, not perceived warmth or room acoustics.

The reference was processed once with ElevenLabs Voice Isolator, then raised 2.5 dB without EQ, compression, pitch or rate changes. A separate private clone, **Nino Casual - cleaned test**, preserves the original clone. Both voices generated the same 357-character essay opening with identical Multilingual v2 settings. The 18-second original and 20-second cleanup comparisons use linear gain to match their listening levels within 0.2 LU. Full decoding succeeded; local transcription retained all passages, with only number formatting and “want to”/“wanna” differences. The API reported character-cost values of 677 for isolation and 143 for each short generation; these are response receipts, not a billing-statement reconciliation.

Source audio, cleaned reference, exact settings, returned voice IDs, response receipts and comparison checks stay in `astro-build/.tmp/listen-preview/voice-cleanup/` in the locked worktree. Nino subsequently selected the cleaned voice and requested further refinement for both full essays. If processing still does not resolve the sound, use a fresh recording at normal conversational volume in a furnished room with little echo, following [ElevenLabs' recording guidance](https://elevenlabs.io/docs/eleven-creative/voices/voice-cloning/instant-voice-cloning).

## Refined full-essay candidates

Both essays were regenerated with the selected cleaned clone and the existing Multilingual v2 settings. The original MP3 paths and earlier manifest remain preserved; new raw and refined versions have distinct filenames. Local processing applies a 50 Hz high-pass filter, small EQ moves at 160 Hz (+1.2 dB), 450 Hz (-1.3 dB) and 2.6 kHz (+1 dB), 1.6:1 compression, loudness normalization and a final gain adjustment. No pitch correction or time stretching was applied. Unprocessed takes remain available for further EQ changes without new paid generation.

| Essay | Duration | Final loudness | True peak |
|---|---|---|---|
| Because I Can Is Only Half the Answer | 3:46 | -19.26 LUFS | -2.76 dBTP |
| The Rules of the Road Still Apply | 7:52 | -19.26 LUFS | -2.67 dBTP |

Both MP3s decode fully, preserve their generated duration and match the hashes recorded in the manifest. Local transcription comparisons found no missing passages. Remaining differences were number/name formatting, “want to”/“wanna,” and one “improved”/“improve” discrepancy. These may be transcription errors; final subjective sound quality and pronunciation still require Nino's listening review. Nothing is approved for publication.

A local acoustic assessment of the reference was also requested. Its measurements, method and dependency verification remain private in `voice-cleanup/voice-assessment.json`; the reference transcript is not committed. This assessment describes the available recording rather than a clinical or singing-voice classification. The complete finishing settings, raw/final hashes, level checks and transcript comparisons are recorded in `.tmp/listen-preview/refinement-review.json`.

## Slower cadence and corrected club pronunciation

Nino found the refined voice better but its cadence rushed and unnatural. He specified that `630` is pronounced **six-three-oh**. The reusable script preparation now spells it that way and adds terminal punctuation to spoken headings. Generation accepts a validated `--speed` option; this review uses **0.92** with the other voice settings unchanged. Four sparse pauses in the first script and three in the second mark selected thought transitions, including a pause after each byline. Public essay prose is unchanged.

A 381-character pilot decoded fully and retained the opening in local transcription, which rendered the club name as `6-3-0`. Both full essays then generated from 13,282 text characters without retries. The v2 manifest and delivered MP3s are preserved unchanged. New scripts, raw takes and finished recordings use distinct `-cadence-v3` filenames. The same local EQ, compression and loudness treatment was applied; no local pitch correction or time stretching was used.

| Essay | Duration | Change from v2 | Final loudness | True peak |
|---|---|---|---|---|
| Because I Can Is Only Half the Answer | 4:04 | 8.1% longer | -19.27 LUFS | -2.98 dBTP |
| The Rules of the Road Still Apply | 8:26 | 7.3% longer | -19.26 LUFS | -2.58 dBTP |

Both final MP3s decode fully, retain their generated durations and match their saved hashes. Local Whisper small.en comparisons found no missing passages after normalizing number/name formatting and contractions. Two differences remain: `30`/`30th` and `conflict`/`conflicts`; these may be recognition errors. Transcription and timing checks do not establish natural cadence or exact pronunciation. Nino's listening approval remains required.

All 16 approval/script/player tests pass, including the pronunciation correction, heading punctuation and rejection of invalid speed values before any provider request. The full site build passes. Production output contains no MP3s or private-review markers. Earlier rendered player checks remain applicable because player code did not change. Exact audio checks and processing settings are in `.tmp/listen-preview/cadence-v3-review.json`. The draft stays unmerged and the recordings unpublished.

## Selected original British narrator

Nino requested an original theatrical British narrator audition and chose **candidate 1** from three readings of the same 359-character opening. The selected Voice Design preview was saved as **Signal Dispatch - British Narrator** and verified by an API readback. The three auditions and the selection receipt stay private under `british-narrator-audition/`. No performer recording was used to design this voice.

The generator now checks the exact selected voice ID, name and category against the private manifest, and copies the selected narrator label to each completed essay. It accepts selected personal clones and designed voices without a fallback. The shared player says **AI narration · Original British narrator.** The private review introduction no longer claims this is the author's voice. The author byline and public metadata schema are unchanged.

Both essays were generated with Eleven v3 at speed 1 and stability 0.5, matching the audition's model family and retaining the designed voice's native pacing. The scripts use punctuated headings, paragraph breaks and **six-three-oh**; they contain no SSML breaks or acting tags. Three requests used 13,128 text characters without retries. Local finishing applied only linear volume reductions, without EQ, compression, pitch correction or time stretching. Earlier delivered MP3s remain unchanged.

| Essay | Duration | Final loudness | True peak |
|---|---|---|---|
| Because I Can Is Only Half the Answer | 5:08 | -22.19 LUFS | -5.18 dBTP |
| The Rules of the Road Still Apply | 10:20 | -22.19 LUFS | -5.07 dBTP |

Both finished files decode fully, preserve generated duration and match their manifest hashes. Local Whisper small.en comparisons against the raw takes found no missing passages. Differences were British/American spelling, `30`/`30th`, `the`/`a` and `reward`/`rewards`; recognition is not proof of exact pronunciation. The complete settings, raw/final hashes and transcript comparisons are in `.tmp/listen-preview/british-v1-review.json`.

Read-only dispatch `81b57882-e411-4305-8a3d-b3f3540354fa` identified downstream author-voice assumptions; its requested and reported runtime matched. The parent checked the affected sources and updated the generation guard, shared disclosure, review copy, direction and operating guide without adding unnecessary public metadata fields. All 18 focused tests and all 12 rendered checks pass. The parent opened the updated desktop and phone captures directly. The browser checks use a labelled synthetic tone and establish controls, labels and layout, not acceptance of the new narration. The full site build passes, and production output contains no audio or private-review markers. Human approval of both actual full recordings remains open; the draft stays unmerged.
