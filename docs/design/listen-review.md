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

Source audio, cleaned reference, exact settings, returned voice IDs, response receipts and comparison checks stay in `astro-build/.tmp/listen-preview/voice-cleanup/` in the locked worktree. The full essays have not been regenerated. Cleanup quality and warmth await Nino's hearing; the candidate is not approved. If cleanup does not resolve the sound, use a fresh recording at normal conversational volume in a furnished room with little echo, following [ElevenLabs' recording guidance](https://elevenlabs.io/docs/eleven-creative/voices/voice-cloning/instant-voice-cloning).
