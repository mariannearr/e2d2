window.HELP_IMPROVE_VIDEOJS = false;


$(document).ready(function() {
    // Check for click events on the navbar burger icon
	document.addEventListener('DOMContentLoaded', () => {
		const v1 = document.getElementById('vid1');
		const v2 = document.getElementById('vid2');
		const vids = [v1, v2];

		// Small helper to await one event once
		function once(target, event) {
			return new Promise(resolve => target.addEventListener(event, resolve, { once: true }));
		}

		// Loaded enough to know duration & seek
		const ready = v => new Promise(res => {
			if (v.readyState >= 1) res(); // HAVE_METADATA
			else v.addEventListener('loadedmetadata', res, { once: true });
		});

		// Safari sometimes ignores currentTime=0 immediately after ended.
		// Seek to a tiny epsilon and wait for 'seeked' before play()ing.
		async function seekAndPlayTogether(videos, t = 0.00001) {
			videos.forEach(v => v.pause());
			videos.forEach(v => { try { v.currentTime = t; } catch (_) {} });
			await Promise.all(videos.map(v => once(v, 'seeked')));  // <- critical for Safari
			await Promise.allSettled(videos.map(v => v.play()));
		}

		// Some iOS builds don’t dispatch 'ended' reliably; we add a timeupdate guard.
		function addEndGuards(v, onEnded) {
			v.addEventListener('ended', onEnded);
			v.addEventListener('timeupdate', () => {
			// Treat as ended if we’re within 50ms of duration and not moving forward
			const dur = v.duration || 0;
			if (dur && v.currentTime >= dur - 0.05) onEnded();
			});
		}

		// Start aligned once both have metadata
		async function startTogether() {
			await Promise.all(vids.map(ready));
			await seekAndPlayTogether(vids, 0.00001);
		}

		const endedSet = new Set();
		function handleEndedFactory(v) {
			let handled = false;
			return () => {
			if (handled) return; handled = true;
			endedSet.add(v);
			v.pause();
			if (endedSet.size === vids.length) {
				endedSet.clear();
				// Restart both in lockstep; use Safari-safe seek
				seekAndPlayTogether(vids, 0.00001);
			} else {
				// Reset handled state if the other ends later and we restart
				setTimeout(() => { handled = false; }, 0);
			}
			};
		}

		vids.forEach(v => {
			v.removeAttribute('loop'); // we loop manually
			addEndGuards(v, handleEndedFactory(v));
			v.addEventListener('error', e => console.error('[video error]', v.id, v.error || e));
		});

		// If tab backgrounding caused drift, resync on return
		document.addEventListener('visibilitychange', async () => {
			if (document.visibilityState === 'visible')) {
			const d = Math.abs((v1.currentTime || 0) - (v2.currentTime || 0));
			if (d > 0.25) await seekAndPlayTogether(vids, 0.00001);
			}
		});

		startTogether();
		});

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
