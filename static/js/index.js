window.HELP_IMPROVE_VIDEOJS = false;

// static/js/index.js
document.addEventListener('DOMContentLoaded', () => {
  const v1 = document.getElementById('vid1');
  const v2 = document.getElementById('vid2');
  const vids = [v1, v2];

  // Safety: ensure not looping (we control the loop manually)
  vids.forEach(v => v.removeAttribute('loop'));

  // Helper: wait for metadata so duration/currentTime are valid
  const ready = v => new Promise(res => {
    if (v.readyState >= 1) res();
    else v.addEventListener('loadedmetadata', res, { once: true });
  });

  // Start both from 0 in sync once they're ready
  async function startTogether() {
    await Promise.all(vids.map(ready));
    vids.forEach(v => { v.pause(); v.currentTime = 0; });
    // Kick off together; ignore autoplay promise rejections
    await Promise.allSettled(vids.map(v => v.play()));
  }

  // Sync-restart logic: when one ends, wait for the other; then restart both
  const endedSet = new Set();
  vids.forEach(v => {
    v.addEventListener('ended', async () => {
      endedSet.add(v);
      v.pause(); // early finisher waits at end

      if (endedSet.size === vids.length) {
        // Both finished — restart together
        endedSet.clear();
        vids.forEach(x => { x.currentTime = 0; });
        await Promise.allSettled(vids.map(x => x.play()));
      }
    });
  });

  // Optional: if the tab was hidden and timings drift, resync on return
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible') {
      // Small heuristic: if their times drift by >0.25s, hard-resync at next cycle
      const delta = Math.abs((v1.currentTime || 0) - (v2.currentTime || 0));
      if (delta > 0.25) {
        vids.forEach(v => v.pause());
        await startTogether();
      }
    }
  });

  // Go!
  startTogether();
});

$(document).ready(function() {
    // Check for click events on the navbar burger icon

    var options = {
			slidesToScroll: 1,
			slidesToShow: 1,
			loop: true,
			infinite: true,
			autoplay: true,
			autoplaySpeed: 5000,
    }

		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);
	
    bulmaSlider.attach();

})
