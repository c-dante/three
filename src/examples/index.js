import * as $ from '../util';
import { wiggleReducer } from './wiggle';
import { boxesReducer } from './boxes';

export const SET_EXAMPLE = 'Examples:SET_EXAMPLE';


// @todo: weird pattern: fucking poltergeist
const bluh = $.keyedReducer({
	a: wiggleReducer,
	b: boxesReducer,
});
export const registry = {
	boxes: (slice, action, global) => bluh(global, action),
};

export const registryKeys = Object.keys(registry);

const defaultState = {
	selected: registryKeys[0],
	slice: {},
};

const sliceReducer = $.keyedReducer(registry);
export const reducer = (state = defaultState, action, global) => {
	switch (action.type) {
		case SET_EXAMPLE:
			return {
				...state,
				example: action.payload,
			};

		default:
			return {
				...state,
				slice: sliceReducer(global, action),
			};
	}
};
