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
	const remote = {
		pause: () => {
			s = false;
			return remote;
		},
		play: () => {
			s = true;
			setTimeout(go, 0);
			return remote;
		},
	};
	return remote.play();
};
