import { Mesh } from 'three';
import fp from 'lodash/fp';

import * as G from '../geom';
import * as S from '../scene';

const defaultBoxesState = (state) => {
	const boxes = new Array(1000).fill(0).map(() => {
		const mesh = new Mesh(G.newBox(), G.Debug.normals);

		mesh.position.x = fp.random(-10000, 10000);
		mesh.position.y = fp.random(-10000, 10000);
		mesh.position.z = fp.random(-10000, 10000);

		return mesh;
	});

	S.addActors(boxes, state.engine.scene);

	Object.assign(state.actors, { boxes });

	return {
		boxes,
	};
};

export const boxesReducer = (state, action, global) => {
	if (!state) {
		return defaultBoxesState(global, action);
	}

	for (let i = 0; i < state.boxes.length; i++) {
		state.boxes[i].rotation.x += (i % 3) * 0.01;
		state.boxes[i].rotation.y += (i % 4) * 0.01;
	}

	return state;
};
