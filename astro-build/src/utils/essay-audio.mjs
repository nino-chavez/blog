// Shared by the Astro article and the local-only listening room.
export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

export function renderEssayAudio({ src, durationSeconds, narrator }, { title, id = 'essay-audio' }) {
  const rounded = Math.round(durationSeconds);
  const minutes = Math.floor(rounded / 60);
  const seconds = String(rounded % 60).padStart(2, '0');
  const label = escapeHtml(id);
  return `<section class="essay-audio" aria-labelledby="${label}-heading" data-pagefind-ignore>
    <div class="essay-audio__heading">
      <h2 id="${label}-heading">Listen to this essay</h2>
      <span aria-label="${minutes} minutes ${Number(seconds)} seconds">${minutes}:${seconds}</span>
    </div>
    <p id="${label}-description">AI narration · ${escapeHtml(narrator)}.</p>
    <audio controls src="${escapeHtml(src)}" preload="none" tabindex="0" aria-label="Listen to ${escapeHtml(title)}" aria-describedby="${label}-description">
      Your browser does not support audio playback.
    </audio>
    <p class="essay-audio__error" data-audio-error role="status" hidden>Audio is unavailable. You can still read the essay below.</p>
    <div class="essay-audio__footer">
      <span>The essay below is the transcript.</span>
      <a href="${escapeHtml(src)}" download><span data-audio-download-label>Download audio</span><span class="sr-only"> for ${escapeHtml(title)}</span></a>
    </div>
  </section>`;
}
