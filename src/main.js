import {
	Scene, PerspectiveCamera, WebGLRenderer,
	Mesh, BoxGeometry, MeshBasicMaterial,
} from 'three';
import './main.scss';
import * as $ from './util';

// Scene + render details
const scene = new Scene();
const renderer = new WebGLRenderer();
const camera = new PerspectiveCamera(
	27,
	1,
	1, 10000
);

// Helpers for scene geometry
const makeBox = (l, w = l, h = l) => new BoxGeometry(l, w, h);
const box = makeBox(200);
const redWireMat = new MeshBasicMaterial({ color: 0xff0000, wireframe: true });


// Set up the scene
const boxMesh = new Mesh(box, redWireMat);
scene.add(boxMesh);
camera.position.z = 1000;

const updateScreen = (elt, rend, cam) => {
	rend.setSize(elt.clientWidth, elt.clientHeight);
	cam.aspect = elt.clientWidth / elt.clientHeight;
	cam.updateProjectionMatrix();
};

const main = document.querySelector('.main');

window.addEventListener('resize', () => {
	updateScreen(main, renderer, camera);
});
updateScreen(main, renderer, camera);


main.appendChild(renderer.domElement);

$.runWithRaf(() => {
	boxMesh.rotation.x += 0.01;
	boxMesh.rotation.z += 0.01;
	renderer.render(scene, camera);
});
