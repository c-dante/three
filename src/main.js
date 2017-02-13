import fp from 'lodash/fp';
import flyd from 'flyd';
import immutable from 'object-path-immutable';
import { Mesh, Quaternion } from 'three';
import * as $ from './util';

/* A little splitting of my concerns */
import * as I from './input';
import * as G from './geom';
import * as S from './scene';
import * as V from './vector';

// Display / DOM
import './main.scss';
import debugTpl from './debug.tpl.pug';

const renderDebug = $.tplRenderer(debugTpl);

// @todo: find homes
/**
 * Updates render window + camera aspect to match.
 *
 * @param {DOMElement} elt
 * @param {THREE.Renderer} rend
 * @param {THREE.Camera} cam
 * @void
 */
const refreshCamRender = fp.curryN(3, (elt, rend, cam) => {
	rend.setSize(elt.clientWidth, elt.clientHeight);
	cam.aspect = elt.clientWidth / elt.clientHeight;
	cam.updateProjectionMatrix();
});

/**
 * Applies movement logic.
 *
 * @param {THREE.Object3D} target
 * @param {KeyState} KeyState
 * @void
 */
const applyMoveKeys = (target, state, keyIsDown = {}) => {
	const controlActive = fp.some(x => keyIsDown[x]);

	// Move
	if (controlActive(I.Controls.MoveUp)) {
		target.translateOnAxis(V.unit.up, state.RunSpeed);
	}

	if (controlActive(I.Controls.MoveDown)) {
		target.translateOnAxis(V.unit.down, state.RunSpeed);
	}

	if (controlActive(I.Controls.MoveForward)) {
		target.translateOnAxis(V.unit.forward, state.RunSpeed);
	}

	if (controlActive(I.Controls.MoveBack)) {
		target.translateOnAxis(V.unit.back, state.RunSpeed);
	}

	if (controlActive(I.Controls.MoveLeft)) {
		target.translateOnAxis(V.unit.left, state.RunSpeed);
	}

	if (controlActive(I.Controls.MoveRight)) {
		target.translateOnAxis(V.unit.right, state.RunSpeed);
	}


	// Turn
	if (controlActive(I.Controls.TurnLeft)) {
		target.quaternion.multiply(
			state.cache.quat.setFromAxisAngle(V.unit.up, state.TurnSpeed)
		);
	}

	if (controlActive(I.Controls.TurnRight)) {
		target.quaternion.multiply(
			state.cache.quat.setFromAxisAngle(V.unit.down, state.TurnSpeed)
		);
	}

	if (controlActive(I.Controls.TurnUp)) {
		target.quaternion.multiply(
			state.cache.quat.setFromAxisAngle(V.unit.right, state.TurnSpeed)
		);
	}

	if (controlActive(I.Controls.TurnDown)) {
		target.quaternion.multiply(
			state.cache.quat.setFromAxisAngle(V.unit.left, state.TurnSpeed)
		);
	}

	// Roll
	if (controlActive(I.Controls.RollCW)) {
		target.quaternion.multiply(
			state.cache.quat.setFromAxisAngle(V.unit.forward, state.TurnSpeed)
		);
	}
	if (controlActive(I.Controls.RollCCW)) {
		target.quaternion.multiply(
			state.cache.quat.setFromAxisAngle(V.unit.back, state.TurnSpeed)
		);
	}

};


const defaultState = ((state) => {
	// Add dom elts?
	state.dom.main.appendChild(
		state.engine.renderer.domElement
	);

	// Declare a render hook?
	const updateRender = () => refreshCamRender(
		state.dom.main, state.engine.renderer, state.engine.camera
	);
	window.addEventListener('resize', updateRender);
	updateRender();

	// Create some scene geometry, declare + add actors
	const floor = new Mesh(G.newPlane(), G.Debug.normals);
	const boxes = new Array(250).fill(0).map(() => {
		const mesh = new Mesh(G.newBox(), G.Debug.normals);

		mesh.position.x = fp.random(-1000, 1000);
		mesh.position.y = fp.random(-1000, 1000);
		mesh.position.z = fp.random(-1000, 1000);

		return mesh;
	});
	const actors = {
		floor,
		boxes,
	};
	S.addActors(actors, state.engine.scene);

	// Set up the blackboard
	const bb = {
		keyCtrlTarget: state.engine.camera,
	};

	// update the state
	return immutable(state)
		.assign('actors', actors)
		.assign('bb', bb)
		.value();
})({
	//* * @type {AppState} */
	// State tree
	engine: S.createBasicScene(),
	actors: {},
	cache: {
		quat: new Quaternion(),
	},
	dom: {
		main: document.querySelector('.main'),
		minimap: document.querySelector('.minimap'),
		debug: document.querySelector('.debug'),
	},
	// Constants
	RunSpeed: 10,
	TurnSpeed: Math.PI / 180,
});

const reducer = (state = defaultState) => {
	// Move target :/
	applyMoveKeys(state.bb.keyCtrlTarget, state, I.keys.isDown());

	// Render
	state.engine.renderer.render(state.engine.scene, state.engine.camera);

	// Debug
	renderDebug(state.dom.debug, {
		controls: I.Controls,
	});

	return state;
};

const store = $.newStore(reducer, undefined);

// Render/Update pipeline @todo: woof
flyd.on(time => store.dispatch(time), $.tick);


// updateMiniMap(State, State.camera),
// cameraHelper.update();
// State.miniMapRenderer.render(miniMapScene, State.miniMapCam);
// const cameraHelper = new CameraHelper(camera);
// const miniMapRenderer = new WebGLRenderer();
// const miniMapCam = new OrthographicCamera(
// 	-1000, 1000, -1000, 1000, 1, 1000
// );
// miniMapCam.position.y = 500;
// miniMapCam.rotation.x = Math.PI / 4;
// miniMapScene.add(cameraHelper);
// const minimap = document.querySelector('.minimap');
// minimap.appendChild(miniMapRenderer.domElement);
