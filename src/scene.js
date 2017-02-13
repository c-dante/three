import {
	Scene, PerspectiveCamera, WebGLRenderer,
} from 'three';
import fp from 'lodash/fp';

/**
 * @typedef {Object} SceneConfig
 * @property {THREE.Scene}
 * @property {THREE.WebGLRenderer}
 * @property {THREE.PerspectiveCamera}
*/

/**
 * Make a scene, renderer, and perspective camera.
 * @returns {SceneConfig}
 */
export const createBasicScene = () => {
	const scene = new Scene();
	const renderer = new WebGLRenderer();
	const camera = new PerspectiveCamera(
		27,
		1,
		1, 10000
	);

	return {
		scene, renderer, camera,
	};
};

/**
 * Add a bunch of actors to a scene.
 * @param {Array<Actor>|Object.<Key, Actor|Array<Actor>>} actors
 * @param {THREE.Scene} scene
 * @returns actors
 */
export const addActors = (actors, scene) => {
	fp.forEach((actor) => {
		if (fp.isArray(actor)) {
			actor.forEach(a => scene.add(a), actor);
		} else {
			scene.add(actor);
		}
		return actor;
	}, actors);
	return actors;
};
