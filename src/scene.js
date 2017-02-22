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
		1, 20000
	);

	return {
		scene, renderer, camera,
	};
};


const apActors = fn => (actors, scene) => {
	fp.forEach((actor) => {
		if (fp.isArray(actor)) {
			actor.forEach(a => scene[fn](a), actor);
		} else {
			scene[fn](actor);
		}
		return actor;
	}, actors);
	return actors;
};

/**
 * Add a bunch of actors to a scene.
 * @param {Array<Actor>|Object.<Key, Actor|Array<Actor>>} actors
 * @param {THREE.Scene} scene
 * @returns actors
 */
export const addActors = apActors('add');
export const removeActors = apActors('remove');
