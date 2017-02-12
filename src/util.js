import flyd from 'flyd';

/**
 * A remote control. Can pause and play.
 *
 * @typedef {Object} Remote
 * @property {Function} pause
 * @property {Function} play
 */

/**
 * Helper to create a remote that's backed by
 * requestAnimationFrame.
 *
 * @param {Function} fn
 * @returns {Remote}
 */
export const runWithRaf = (fn) => {
	let s = true;
	const go = () => {
		if (s) {
			fn();
			requestAnimationFrame(go);
		}
	};

	const r = {
		pause: () => {
			s = false;
			return r;
		},
		play: () => {
			s = true;
			setTimeout(go, 0);
			return r;
		},
	};

	return r;
};


export const log = flyd.on(v => console.log(v)); // eslint-disable-line no-console

export const keys = flyd.stream({});
window.addEventListener('keydown', (evt) => {
	if (!evt.repeat) {
		const map = keys();
		map[evt.key] = true;
		keys(map);
	}
	evt.preventDefault();
});
window.addEventListener('keyup', (evt) => {
	if (!evt.repeat) {
		const map = keys();
		map[evt.key] = false;
		keys(map);
	}
	evt.preventDefault();
});

export const tick = flyd.stream();

export const interval = (fn, ms) => {
	let last = Date.now();
	return flyd.on((now) => {
		if (now - last >= ms) {
			fn();
			last = now;
		}
	}, tick);
};

export const remote = runWithRaf(() => tick(Date.now())).play();

