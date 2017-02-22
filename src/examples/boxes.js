import { Mesh } from 'three';
import fp from 'lodash/fp';

import * as $ from '../util';
import * as G from '../geom';
import * as S from '../scene';
import * as X from '../selectors';

// SHIT IS BONKERS
export const {
	SHOW, HIDE, actions,
} = $.showHideExt('BoxesExample');

// init
const defaultBoxesState = (state) => {
	const boxes = new Array(1000).fill(0).map(() => {
		const mesh = new Mesh(G.newBox(), G.Debug.normals);

		mesh.position.x = fp.random(-10000, 10000);
		mesh.position.y = fp.random(-10000, 10000);
		mesh.position.z = fp.random(-10000, 10000);

		return mesh;
	});

	Object.assign(state.actors, { boxes });

	return {
		boxes,
		shown: false,
	};
};

export const reducer = (slice, action, global) => {
	const state = !slice ? defaultBoxesState(global, action) : slice;

	switch (action.type) {
		case SHOW: {
			if (!state.shown) {
				const scene = X.activeScene(global);
				S.addActors(state.boxes, scene);
			}
			return {
				...state,
				shown: true,
			};
		}

		case HIDE: {
			if (state.shown) {
				const scene = X.activeScene(global);
				S.removeActors(state.boxes, scene);
			}
			return {
				...state,
				shown: false,
			};
		}

		default:
			for (let i = 0; i < state.boxes.length; i++) {
				state.boxes[i].rotation.x += (i % 3) * 0.01;
				state.boxes[i].rotation.y += (i % 4) * 0.01;
			}
			return state;
	}

};
