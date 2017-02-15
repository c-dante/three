import { Mesh } from 'three';

import * as $ from '../util';
import * as G from '../geom';
import * as S from '../scene';

const defaultWiggleState = (state) => {
	const floor = new Mesh(G.newPlane(20000, 20000, 200, 200), G.Debug.normals);
	floor.rotation.x = Math.PI / 2;
	floor.position.y = -1000;

	S.addActors({ floor }, state.engine.scene);

	Object.assign(state.actors, { floor });

	return {
		floor,
	};
};

export const wiggleReducer = (state, action, global) => {
	if (!state) {
		return defaultWiggleState(global, action);
	}

	// @todo: move into example once I convert to naff
	const td = ($.tickSelector(global) / 100000000) * Math.PI;
	state.floor.geometry.vertices.forEach((vert, i) => {
		vert.z = Math.sin(i * td) * 100;
		// vert.x += i % 500;
	});
	state.floor.geometry.verticesNeedUpdate = true;

	return state;
};
