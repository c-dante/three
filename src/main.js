import fp from 'lodash/fp';
import flyd from 'flyd';
import immutable from 'object-path-immutable';
import { Mesh, Quaternion } from 'three';
import * as $ from './util';

/* A little splitting of my concerns */
import * as I from './input';
import * as G from './geom';
import * as S from './scene';
import * as exampleScenes from './examples';
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

const registryOptions = Object.keys(exampleScenes.registry);

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
	const actors = {
		floor,
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
	engine: S.createBasicScene(),
	actors: {},
	cache: {
		quat: new Quaternion(),
	},
	// DOM rendering
	dom,
	tpl,
	// Examples state
	example: registryOptions[0],
	examples: {},
	// Constants - @todo: move to settings
	RunSpeed: 25,
	TurnSpeed: Math.PI / 180,
});

const reducer = (state = defaultState, action) => {
	// Specific example shnoz!
	if (action.type === 'SET_EXAMPLE') {
		return {
			...state,
			example: action.payload,
		};
	}

	// Fly camera, fly!
	fly(state.bb.keyCtrlTarget, state, I.keys.activeCtrl());

	// Run example reducer + update state
	state.examples[state.example] = exampleScenes.registry[state.example](
		state.examples[state.example],
		action,
		state
	);

	// Render
	state.engine.renderer.render(state.engine.scene, state.engine.camera);

	// Debug @todo: selectors
	state.tpl.debugTpl(state.dom.debug, {
		controls: I.Controls,
		activeMap: I.keys.activeCtrl(),
	});

	// Example choice
	state.tpl.examplesTpl(state.dom.examples, {
		selected: state.example,
		options: registryOptions,
	});

	return state;
};

const store = $.newStore(reducer, undefined);

// Hook into event delegation
dom.examples.addEventListener('input', (evt) => {
	store.dispatch($.act('SET_EXAMPLE', evt.target.value));
});

// Render/Update pipeline @todo: woof
flyd.on(time => store.dispatch(time), $.tick);
