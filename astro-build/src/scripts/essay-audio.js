// Native playback remains available without JS. This makes focus + Space work
// consistently in Safari as well as Chromium, and explains failed audio loads.
for (const audio of document.querySelectorAll('.essay-audio audio')) {
  if (audio.dataset.listenReady) continue;
  audio.dataset.listenReady = 'true';
  const message = audio.closest('.essay-audio').querySelector('[data-audio-error]');
  const downloadLabel = audio.closest('.essay-audio').querySelector('[data-audio-download-label]');
  const failed = () => { message.hidden = false; downloadLabel.textContent = 'Try downloading the MP3'; };
  audio.addEventListener('error', failed);
  audio.addEventListener('canplay', () => { message.hidden = true; downloadLabel.textContent = 'Download audio'; });
  audio.addEventListener('keydown', (event) => {
    if (event.target !== audio || event.code !== 'Space' || event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (audio.paused) audio.play().catch(failed);
    else audio.pause();
  }, true);
}
