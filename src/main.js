import fp from 'lodash/fp';
import flyd from 'flyd';
import immutable from 'object-path-immutable';
import { Mesh } from 'three';
import * as $ from './util';

// Display / DOM
import './main.scss';

/* A little splitting of my concerns */
import * as I from './input';
import * as G from './geom';
import * as S from './scene';
import * as V from './vector';


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

	if (controlActive(I.Controls.TurnLeft)) {
		target.rotation.y += state.TurnSpeed;
	}

	if (controlActive(I.Controls.TurnRight)) {
		target.rotation.y -= state.TurnSpeed;
	}
};


// const act = (type, payload) => ({ type, payload });
const newStore = (reducer, initialState) => {
	let state = initialState;
	
	const getState = () => state;
	const dispatch = (action) => {
		try {
			state = reducer(state, action);
		} catch (e) {
			console.error(e, action, state);
		}
		return action;
	}
	
	return {
		dispatch, getState
	};
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
	const boxes = new Array(10).fill(0).map(() => {
		const mesh = new Mesh(G.newBox(), G.Debug.normals);
	
		mesh.position.x = fp.random(-500, 500);
		mesh.position.y = fp.random(-500, 500);
		mesh.position.z = fp.random(-500, 500);
	
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
	//** @type {AppState} */
	// State tree
	engine: S.createBasicScene(),
	actors: {},
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
	
	applyMoveKeys(state.bb.keyCtrlTarget, state, I.keys.isDown());

	// Render
	state.engine.renderer.render(state.engine.scene, state.engine.camera);
	
	return state;
};

const store = newStore(reducer, undefined);


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
