import immutable from 'object-path-immutable';
import * as $ from '../util';
import * as wiggle from './wiggle';
import * as boxes from './boxes';
import * as vox from './vox';
import * as X from '../selectors';

// @todo: clean up for full example stack
const children = { boxes, vox };

export const SET_EXAMPLE = 'Examples:SET_EXAMPLE';
export const actions = {
	setExample: d => (dispatch, getState) => {
		const local = X.example(getState()) || {};

		const old = children[local.selected];
		if (old && old.actions && old.actions.hide) {
			dispatch(old.actions.hide());
		}

		const res = dispatch($.act(SET_EXAMPLE, d));

		const updated = X.example(getState()) || {};
		const current = children[updated.selected];
		if (current && current.actions && current.actions.show) {
			return dispatch(current.actions.show());
		}

		return res;
	},
};


// @todo @todo -- classes of reducers.... hmmmmm....
const bluh = $.keyedReducer({
	a: wiggle.reducer,
	b: boxes.reducer,
});
// @todo: weird pattern: fucking poltergeist -- composition?! WHAT.


// @todo: this is a nice template reducer -- basics of "slice" reducer?
// examples as discrete slices
export const registry = {
	boxes: (slice, action, global) => bluh(global, action),
	vox: vox.reducer,
};
export const registryKeys = Object.keys(registry);

// Discrete examples
const defaultState = {
	selected: undefined,
	slice: {},
};

export const reducer = (state = defaultState, action, global) => {
	const sliceReducer = registry[state.selected];
	const sliceState = state.slice[state.selected];

	switch (action.type) {
		case SET_EXAMPLE: {
			if (!registry[action.payload]) {
				throw new Error('Unknown slice selected.');
			}

			return {
				...state,
				selected: action.payload,
			};
		}

		// Run the current slice
		default:
			if (!sliceReducer) {
				return state;
			}

			return {
				...state,
				slice: immutable.set(
					state.slice,
					state.selected,
					sliceReducer(sliceState, action, global)
				),
			};
	}
};
