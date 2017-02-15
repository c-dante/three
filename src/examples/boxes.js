import { Mesh } from 'three';
import fp from 'lodash/fp';

import * as G from '../geom';
import * as S from '../scene';

const defaultBoxesState = (state) => {
	const boxes = new Array(250).fill(0).map(() => {
		const mesh = new Mesh(G.newBox(), G.Debug.normals);

		mesh.position.x = fp.random(-1000, 1000);
		mesh.position.y = fp.random(-1000, 1000);
		mesh.position.z = fp.random(-1000, 1000);

		return mesh;
	});

	S.addActors(boxes, state.engine.scene);

	Object.assign(state.actors, { boxes });

	return {
		boxes,
	};
};

export const boxesPause = () => {

};

export const boxesReducer = (state, action, global) => {
	if (!state) {
		return defaultBoxesState(global, action);
	}

	return state;
};
