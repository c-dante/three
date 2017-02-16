import { Mesh } from 'three';

import * as G from '../geom';
import * as S from '../scene';
import * as X from '../selectors';

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
	const td = (X.tickSelector(global) / 100000000) * Math.PI;
	state.floor.geometry.vertices.forEach((vert, i) => {
		const a = Math.cos(td / i + vert.x) * Math.sin(td * i) * 100;
		vert.z = a;
	});
	state.floor.geometry.verticesNeedUpdate = true;

	return state;
};
