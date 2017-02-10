import './main.scss';
import {
	Scene, PerspectiveCamera, WebGLRenderer,
	Mesh, BoxGeometry, MeshBasicMaterial
}from 'three';

const runWithRaf = fn => {
	let s = true;
	const go = () => {
		if (s) {
			fn();
			requestAnimationFrame(go);
		}
	};
	const remote = {
		pause: () => (s = false, remote),
		play: () => (s = true, go(), remote),
	};
	return remote.play();
};

const init = (elt) => {
	const scene = new Scene();
	
	const cameraProps = [
		27,
		elt.clientWidth / elt.clientHeight,
		1, 10000
	];
	const camera = new PerspectiveCamera(...cameraProps);
	camera.position.z = 1000;
	
	const box = new Mesh(
		new BoxGeometry(200, 200, 200),
		new MeshBasicMaterial({ color: 0xff0000, wireframe: true })
	);
	scene.add(box);
	
	const renderer = new WebGLRenderer();
	renderer.setSize(elt.clientWidth, elt.clientHeight);

	return {
		camera, renderer, scene, box
	};
}

const main = document.querySelector('.main');

const {
	camera, renderer, scene, box
} = init(main);

main.appendChild(renderer.domElement);

const remote = runWithRaf(() => {
	box.rotation.x += 0.01;
	box.rotation.z += 0.01;
	renderer.render(scene, camera);
});

console.debug(remote);
