import fp from 'lodash/fp';
import flyd from 'flyd';
import immutable from 'object-path-immutable';
import { Mesh, Quaternion } from 'three';
import * as $ from './util';

/* A little splitting of my concerns */
import * as I from './input';
import * as G from './geom';
import * as S from './scene';
import * as EX from './examples';
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


// @todo: home for this
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
	// Constants - @todo: move to settings
	RunSpeed: 25,
	TurnSpeed: Math.PI / 180,
});


// Let's re-make the above as a slice reducer...?
const tickSelector = fp.getOr(0, 'app.tick');
const otherReducer = $.keyedReducer({
	examples: EX.reducer,
	delta: (n = 0, act, global) => (fp.isNumber(act) ? act - tickSelector(global) : n),
	tick: (n = 0, act) => (fp.isNumber(act) ? act : n),
});

// @todo: somehow remove this extra wrapper...?
const reducer = (state = defaultState, action) => {
	const app = otherReducer(state, action);

	// @todo: move into example once I convert to naff
	const td = (tickSelector(state) / 100000000) * Math.PI;
	state.actors.floor.geometry.vertices.forEach((vert, i) => {
		vert.z = Math.sin(i*td) * 100;
		// vert.x += i % 500;
	});

	state.actors.floor.geometry.verticesNeedUpdate = true;

	return {
		...state,
		app,
	};
};

// @todo: redux or another state container
const store = $.newStore(reducer);

// Pure hooks?
store.hook($.logHook());
store.hook(s => () => {
	const state = s.getState();

	// Fly
	fly(state.bb.keyCtrlTarget, state, I.keys.activeCtrl());

	// Render engine
	state.engine.renderer.render(state.engine.scene, state.engine.camera);

	// Render tpls
	// Debug @todo: selectors
	// Example choice @todo: selectors
	state.tpl.debugTpl(state.dom.debug, {
		controls: I.Controls,
		activeMap: I.keys.activeCtrl(),
	});

	state.tpl.examplesTpl(state.dom.examples, {
		selected: fp.get('example.selected', state),
		options: EX.registryKeys,
	});
});


// Hook into event delegation @todo: hmmmmm
dom.examples.addEventListener('input', (evt) => {
	store.dispatch($.act('SET_EXAMPLE', evt.target.value));
});
dom.debug.addEventListener('click', evt => {
	switch (evt.target.getAttribute('data-action')) {
		case 'print_state':
			console.debug(store.getState());
			break;
		
		default:
			break;
	}
});

// Render/Update pipeline @todo: woof
flyd.on(time => store.dispatch(time), $.tick);
