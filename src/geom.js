import {
	BoxGeometry, PlaneGeometry,
	MeshBasicMaterial, MeshNormalMaterial, MeshLambertMaterial,
} from 'three';


export const newBox = (l = 100, w = l, h = l, ...rest) =>
	new BoxGeometry(l, w, h, ...rest);


export const newPlane = () => new PlaneGeometry();


/**
 * Some basic materials to reuse?
 * @type {Object.<String, THREE.Material>}
 */
export const Materials = {
	default: new MeshLambertMaterial({ color: 0x00ff00 }),
	redWireframe: new MeshBasicMaterial({ color: 0xff0000, wireframe: true }),
};


export const Debug = {
	normals: new MeshNormalMaterial({ wireframe: true }),
};

