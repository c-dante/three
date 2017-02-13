import { Vector3 } from 'three';

/**
 * Constants for the basis unit vectors of 3 space, named
 * @type {Object.<String, Vector3>}
 */
export const unit = {
	up: new Vector3(0, 1, 0),
	down: new Vector3(0, -1, 0),
	left: new Vector3(-1, 0, 0),
	right: new Vector3(1, 0, 0),
	forward: new Vector3(0, 0, -1),
	back: new Vector3(0, 0, 1),
};
