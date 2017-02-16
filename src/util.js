import flyd from 'flyd';
import fp from 'lodash/fp';
// Ugh, seriously though :/
export const mapValues = fp.mapValues.convert({ cap: false });

// @todo: actually think about this path crawler code.
// export const newCrawler = (fn, settings) => {
// 	const traverser = {
// 		canVisit: (val, path) => true,
// 		visit: (val, key) => true,
// 		start: fp.noop,
// 		...settings,
// 	};

// 	traverser.start =

// 	traverser.crawl = (obj, path = '') => {
// 		const val = fp.get(path, obj);
// 		if (traverser.canVisit(val, path)) {
// 			const ret = traverser.visit(val, path);
// 			if (!ret || ret.type)
// 		}
// 		return traverser;
// 	}

// 	return traverser;
// }

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

export const log = (stream, label = '') =>
	flyd.on(v => console.log(label, v), stream);  // eslint-disable-line no-console

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

const boot = Date.now();
export const remote = runWithRaf(() => tick(Date.now() - boot)).play();

export const act = (type, payload) => ({ type, payload });

// Helper to run templates smarter I guess maybe?
export const tplRenderer = (tpl) => {
	let last = {};
	let lastElt;
	return (elt, state) => {
		if (
			lastElt !== elt ||
			Object.keys(state).some(key => state[key] !== last[key])
		) {
			last = state;
			lastElt = elt;
			elt.innerHTML = tpl(state);
		}
	};
};

/**
 * AKA slice reducer
 * Takes an object of reducers,
 * gives each one a mini-state, and access to the outer.
 * @param {Object<String, function(state: T, action: G): T>} obj
 * @returns {function(state: A, action: B): A}
 */
export const keyedReducer = (obj) => {
	let state = fp.fromPairs(Object.keys(obj).map(
		key => [key, undefined]
	));

	return (globalState, action, ...rest) => {
		state = mapValues((slice, key) =>
			obj[key].apply(undefined, [slice, action, globalState].concat(rest)),
			state
		);
		return state;
	};
};

/**
 * Switch reducer to a slice. Passthrough.
 */
// export const passReducer = (obj, path) => {
// 	const state = fp.fromPairs(Object.keys(obj).map(
// 		key => [key, undefined]
// 	));

// 	return (global, action, ...rest) => mapValues(
// 	);
// };
