import fp from 'lodash/fp';
import flyd from 'flyd';
import immutable from 'object-path-immutable';
import ReduxThunk from 'redux-thunk';
import createLogger from 'redux-logger';
import { Quaternion } from 'three';
import * as $ from './util';
import { createStore, applyMiddleware } from './redux-mini';

/* A little splitting of my concerns */
import * as I from './input';
import * as S from './scene';
import * as X from './selectors';
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

	// Set up the blackboard
	const bb = {
		keyCtrlTarget: state.engine.camera,
	};

	// update the state
	return immutable(state)
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
const otherReducer = $.keyedReducer({
	examples: EX.reducer,
	delta: (n = 0, act, global) => (fp.isNumber(act) ? act - X.tickSelector(global) : n),
	tick: (n = 0, act) => (fp.isNumber(act) ? act : n),
});

// @todo: somehow remove this extra wrapper...?
const reducer = (state = defaultState, action) => {
	const app = otherReducer(state, action);
	return {
		...state,
		app,
	};
};

// @todo: redux or another state container
const store = createStore(
	reducer,
	defaultState,
	applyMiddleware(
		ReduxThunk,
		createLogger({
			collapsed: true,
			predicate: (getState, action) => !fp.isNumber(action),
		})
	)
);

// store.hook($.logHook());
store.subscribe(() => {
	const state = store.getState();

	// Fly
	fly(X.moveTarget(state), X.moveSettings(state), I.keys.activeCtrl());

	// Render the scene
	const rend = X.renderState(state);
	rend.renderer.render(rend.scene, rend.camera);

	// Render tpls
	state.tpl.debugTpl(state.dom.debug, X.debugStateSelector(state));

	state.tpl.examplesTpl(state.dom.examples, {
		selected: fp.get('example.selected', state),
		options: EX.registryKeys,
	});
});


// Hook into event delegation @todo: hmmmmm
dom.examples.addEventListener('input', (evt) => {
	store.dispatch(EX.actions.setExample(evt.target.value));
});
dom.debug.addEventListener('click', (evt) => {
	switch (evt.target.getAttribute('data-action')) {
		case 'print_state':
			console.debug(store.getState());
			break;

		default:
			break;
	}
});

// @todo: fire off default example
store.dispatch(EX.actions.setExample(EX.registryKeys[0]));

// Render/Update pipeline @todo: woof
flyd.on(time => store.dispatch(time), $.tick);

