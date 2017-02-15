import fp from 'lodash/fp';
import flyd from 'flyd';
import immutable from 'object-path-immutable';
import { Mesh, Quaternion } from 'three';
import * as $ from './util';

/* A little splitting of my concerns */
import * as I from './input';
import * as G from './geom';
import * as S from './scene';
import { fly } from './examples/fly';

// Display / DOM
import './main.scss';
import debugTpl from './debug.tpl.pug';
import examplesTpl from './examples/examples.tpl.pug';

const tpl = fp.mapValues($.tplRenderer, {
	debugTpl,
	examplesTpl,
});

const body = document.querySelector('body');
const dom = fp.flow(
	fp.map((k) => {
		const elt = document.createElement('div');
		body.appendChild(elt);
		elt.classList.add(k);
		return [k, elt];
	}),
	fp.fromPairs
)(['main', 'examples', 'debug']);


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
	const floor = new Mesh(G.newPlane(20000, 20000, 200, 200), G.Debug.normals);
	floor.rotation.x = Math.PI / 2;
	floor.position.y = -1000;
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
	dom,
	tpl,
	// Constants
	RunSpeed: 25,
	TurnSpeed: Math.PI / 180,
});

const reducer = (state = defaultState) => {
	// Fly camera, fly!
	fly(state.bb.keyCtrlTarget, state, I.keys.activeCtrl());

	// Render
	state.engine.renderer.render(state.engine.scene, state.engine.camera);

	// Debug
	state.tpl.debugTpl(state.dom.debug, {
		controls: I.Controls,
		activeMap: I.keys.activeCtrl(),
	});

	return state;
};

const store = $.newStore(reducer, undefined);

// Render/Update pipeline @todo: woof
flyd.on(time => store.dispatch(time), $.tick);
