import * as $ from '../util';
import { boxesReducer } from './boxes';

export const SET_EXAMPLE = 'Examples:SET_EXAMPLE';

export const registry = {
	boxes: boxesReducer,
	butts: boxesReducer,
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
