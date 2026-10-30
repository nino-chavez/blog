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

Final selected captures and the test receipt belong in `docs/design/listen/`. The local review and its generated audio stay in the ignored `astro-build/.tmp/listen-preview/` directory. Actual ElevenLabs generation, voice fidelity, pronunciation, audio joins, physical-device behavior and Nino's listening approval remain unverified until his personal clone is saved and the real recordings are reviewed. No approval metadata or public MP3 has been added.
