import { createSelector } from 'reselect';
import fp from 'lodash/fp';
import * as I from './input';

export const tickSelector = fp.getOr(0, 'app.tick');

export const activeCamera = fp.get('engine.camera');
export const activeScene = fp.get('engine.scene');
export const activeRenderer = fp.get('engine.renderer');
export const renderState = createSelector(
	[activeCamera, activeScene, activeRenderer],
	(camera, scene, renderer) => ({ camera, scene, renderer })
);

export const moveTarget = fp.get('bb.keyCtrlTarget');
export const runSpeed = fp.get('RunSpeed');
export const turnSpeed = fp.get('TurnSpeed');
export const moveSettings = createSelector(
	[runSpeed, turnSpeed],
	(run, turn) => ({ run, turn })
);

export const debugStateSelector = createSelector(
	[() => I.keys.activeCtrl(), () => I.Controls],
	(activeMap, controls) => ({ activeMap, controls })
);
