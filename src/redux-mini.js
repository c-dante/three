/* eslint-disable */
import flow from 'lodash/fp/flow';

/**
 * I didn't want the force it to be an object for redux
 * I like some of their tools
 * I want to interop with existing middleare
 *
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2015-present Dan Abramov

 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

export function applyMiddleware(...middlewares) {
	return createStore => (reducer, preloadedState, enhancer) => {
		const store = createStore(reducer, preloadedState, enhancer);
		let dispatch = store.dispatch;
		let chain = [];

		const middlewareAPI = {
			getState: store.getState,
			dispatch: action => dispatch(action),
		};
		chain = middlewares.map(middleware => middleware(middlewareAPI));
		dispatch = flow(...chain)(store.dispatch);

		return {
			...store,
			dispatch,
		};
	};
}

export function createStore(reducer, preloadedState, enhancer) {
	if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
		enhancer = preloadedState;
		preloadedState = undefined;
	}

	if (typeof enhancer !== 'undefined') {
		if (typeof enhancer !== 'function') {
			throw new Error('Expected the enhancer to be a function.');
		}

		return enhancer(createStore)(reducer, preloadedState);
	}

	if (typeof reducer !== 'function') {
		throw new Error('Expected the reducer to be a function.');
	}

	let currentState = preloadedState;
	let currentListeners = [];
	let nextListeners = currentListeners;
	let isDispatching = false;

	function ensureCanMutateNextListeners() {
		if (nextListeners === currentListeners) {
			nextListeners = currentListeners.slice();
		}
	}

	/**
	 * Reads the state tree managed by the store.
	 *
	 * @returns {any} The current state tree of your application.
	 */
	function getState() {
		return currentState;
	}

	function subscribe(listener) {
		if (typeof listener !== 'function') {
			throw new Error('Expected listener to be a function.');
		}

		let isSubscribed = true;

		ensureCanMutateNextListeners();
		nextListeners.push(listener);

		return function unsubscribe() {
			if (!isSubscribed) {
				return;
			}

			isSubscribed = false;

			ensureCanMutateNextListeners();
			const index = nextListeners.indexOf(listener);
			nextListeners.splice(index, 1);
		};
	}

	function dispatch(action) {
		if (isDispatching) {
			throw new Error('Reducers may not dispatch actions.');
		}

		try {
			isDispatching = true;
			currentState = reducer(currentState, action);
		} finally {
			isDispatching = false;
		}

		const listeners = currentListeners = nextListeners;
		for (let i = 0; i < listeners.length; i++) {
			const listener = listeners[i];
			listener();
		}

		return action;
	}

	return {
		dispatch,
		subscribe,
		getState,
	};
}
