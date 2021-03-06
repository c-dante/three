import { Quaternion } from 'three';
import * as V from '../vector';

const cacheQuat = new Quaternion();

/**
 * Applies movement logic.
 *
 * @param {THREE.Object3D} target
 * @param {KeyState} KeyState
 * @void
 */
export const fly = (target, speed, activeCommands = {}) => {
	const multiplier = activeCommands.Sprint ? 2 : 1;
	const run = speed.run * multiplier;
	const turn = speed.turn * multiplier;

	// Move
	if (activeCommands.MoveUp) {
		target.translateOnAxis(V.unit.up, run);
	}

	if (activeCommands.MoveDown) {
		target.translateOnAxis(V.unit.down, run);
	}

	if (activeCommands.MoveForward) {
		target.translateOnAxis(V.unit.forward, run);
	}

	if (activeCommands.MoveBack) {
		target.translateOnAxis(V.unit.back, run);
	}

	if (activeCommands.MoveLeft) {
		target.translateOnAxis(V.unit.left, run);
	}

	if (activeCommands.MoveRight) {
		target.translateOnAxis(V.unit.right, run);
	}


	// Turn
	if (activeCommands.TurnLeft) {
		target.quaternion.multiply(
			cacheQuat.setFromAxisAngle(V.unit.up, turn)
		);
	}

	if (activeCommands.TurnRight) {
		target.quaternion.multiply(
			cacheQuat.setFromAxisAngle(V.unit.down, turn)
		);
	}

	if (activeCommands.TurnUp) {
		target.quaternion.multiply(
			cacheQuat.setFromAxisAngle(V.unit.right, turn)
		);
	}

	if (activeCommands.TurnDown) {
		target.quaternion.multiply(
			cacheQuat.setFromAxisAngle(V.unit.left, turn)
		);
	}

	// Roll
	if (activeCommands.RollCW) {
		target.quaternion.multiply(
			cacheQuat.setFromAxisAngle(V.unit.forward, turn)
		);
	}
	if (activeCommands.RollCCW) {
		target.quaternion.multiply(
			cacheQuat.setFromAxisAngle(V.unit.back, turn)
		);
	}

};
