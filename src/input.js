import flyd from 'flyd';
import ffilter from 'flyd/module/filter';
import fp from 'lodash/fp';
// import * as $ from './util';

/**
 * Anything related to inputs on the app that didn't
 * fall into util
 */

/**
 * Settings for keys that fire controls in the app.
 * Triggered action dispatches?
 */
export const Controls = {
	MoveForward: ['w'],
	MoveBack: ['s'],
	MoveLeft: ['a'],
	MoveRight: ['d'],
	MoveUp: [' '],
	MoveDown: ['c'],
	TurnLeft: ['arrowleft'],
	TurnRight: ['arrowright'],
	TurnUp: ['arrowup'],
	TurnDown: ['arrowdown'],
	RollCW: ['e'],
	RollCCW: ['q'],
	Sprint: ['shift'],
};

export const UsedKeysMap = fp.uniq(fp.flatten(fp.reduce(
	(acc, val) => acc.concat(val), [], Controls
))).reduce((acc, key) => {
	acc[key] = true;
	return acc;
}, {});

// Add some nifty things @selectors? actions? reducer? Why flyd here?
export const keys = {};
keys.events = flyd.stream();
keys.noRepeat = ffilter(x => !x.repeat, keys.events);
keys.isDown = flyd.combine((noRepeat, self) => {
	const evt = noRepeat();
	const map = self() || {};
	map[evt.key.toLowerCase()] = evt.type === 'keydown';
	return map;
}, [keys.noRepeat]);

keys.activeCtrl = flyd.combine((downMap) => {
	const map = downMap();
	return fp.mapValues(ctrls => fp.some(x => map[x], ctrls), Controls);
}, [keys.isDown])({});

// keys.isUsed = ffilter(x => UsedKeysMap[x.key], keys.events);
// $.log(keys.activeCtrl);


// Attach streams to window events
window.addEventListener('keydown', keys.events);
window.addEventListener('keyup', keys.events);

