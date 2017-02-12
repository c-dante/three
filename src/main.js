import {
	Scene, PerspectiveCamera, WebGLRenderer,
	Mesh, BoxGeometry, MeshBasicMaterial,
	Vector3, OrthographicCamera,
	ArrowHelper,
} from 'three';
import flyd from 'flyd';
import fp from 'lodash/fp';
import './main.scss';
import * as $ from './util';
import debugTpl from './debug.tpl.pug';


// Constants
const FORWARD_VECT = new Vector3(0, 0, -1);
const BACK_VECT = new Vector3(0, 0, 1);
const LEFT_VECT = new Vector3(-1, 0, 0);
const RIGHT_VECT = new Vector3(1, 0, 0);

// Scene + render details
const scene = new Scene();
const renderer = new WebGLRenderer();
const camera = new PerspectiveCamera(
	27,
	1,
	1, 10000
);
camera.position.z = 1000;
const orthoCam = new OrthographicCamera(
	-1000, 1000, -1000, 1000, 1, 1000
);
orthoCam.rotation.x = Math.PI / 8;
scene.add(camera);
scene.add(orthoCam);

// Helpers for scene geometry
const makeBox = (l, w = l, h = l) => new BoxGeometry(l, w, h);
const box = makeBox(200);
const redWireMat = new MeshBasicMaterial({ color: 0xff0000 });

const updateScreen = (elt, rend, cam) => {
	rend.setSize(elt.clientWidth, elt.clientHeight);
	cam.aspect = elt.clientWidth / elt.clientHeight;
	cam.updateProjectionMatrix();
};

// Set up rendering and sizing
const main = document.querySelector('.main');
main.appendChild(renderer.domElement);
window.addEventListener('resize', () => {
	updateScreen(main, renderer, camera);
});


// Add a box to the scene
new Array(10).fill(0).map(() => {
	const mesh = new Mesh(box, redWireMat);

	mesh.position.x = fp.random(-500, 500);
	mesh.position.y = fp.random(-500, 500);
	mesh.position.z = fp.random(-500, 500);

	scene.add(mesh);
	return mesh;
});


const Controls = {
	MoveForward: ['w'],
	MoveBack: ['s'],
	MoveLeft: ['a'],
	MoveRight: ['d'],
	TurnLeft: ['ArrowLeft'],
	TurnRight: ['ArrowRight'],
	TurnUp: ['ArrowUp'],
	TurnDown: ['ArrowDown'],
};
const Settings = {
	RunSpeed: 5,
	TurnSpeed: Math.PI / 180,
};
const State = {
	camera,
	scene,
	renderer,
	move: {
		forward: new Vector3(),
		back: new Vector3(),
		left: new Vector3(),
		right: new Vector3(),
	},
};

const moveTarget = (target, keyState) => {
	const controlActive = fp.some(x => keyState[x]);

	if (controlActive(Controls.MoveForward)) {
		target.translateOnAxis(FORWARD_VECT, Settings.RunSpeed);
	}

	if (controlActive(Controls.MoveBack)) {
		target.translateOnAxis(BACK_VECT, Settings.RunSpeed);
	}

	if (controlActive(Controls.MoveLeft)) {
		target.translateOnAxis(LEFT_VECT, Settings.RunSpeed);
	}

	if (controlActive(Controls.MoveRight)) {
		target.translateOnAxis(RIGHT_VECT, Settings.RunSpeed);
	}

	if (controlActive(Controls.TurnLeft)) {
		target.rotation.y += Settings.TurnSpeed;
	}

	if (controlActive(Controls.TurnRight)) {
		target.rotation.y -= Settings.TurnSpeed;
	}
};

State.moveHelpers = fp.mapValues((x) => {
	const h = new ArrowHelper(x, 50, 0xffffff);
	// h.position.x = boxMesh.position.x;
	// h.position.y = boxMesh.position.y;
	// h.position.z = boxMesh.position.z;
	scene.add(h);
	return h;
}, State.move);

// Build render pipeline
const pipeline = fp.flow(
	() => moveTarget(State.camera, $.keys()),
	() => fp.keys(State.move).forEach((key) => {
		State.moveHelpers[key].setDirection(State.move[key]);
	}),
	() => State.renderer.render(State.scene, State.camera)
);

// Hook debug @todo: better debugging
const debug = document.querySelector('.debug');
$.interval(() => (debug.innerHTML = debugTpl({
	obj: {
		...fp.mapValues(
			v => v.toArray().map(x => x.toFixed(3)),
			State.move
		),
	},
})), 250);

// Init
setTimeout(() => updateScreen(main, renderer, camera), 25);

// Apply pipeline
flyd.on(pipeline, $.tick);
