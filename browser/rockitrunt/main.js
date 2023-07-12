import * as THREE from 'three';
import ThreeHelper from '/ThreeHelper.js';

import ViewManager from '/rockitrunt/ViewManager.js';

$(window).on('load', () => {
	window.THREE = THREE;
	window.app = new RockItRunt (); 
	
	console.log (window.app);
	console.log ('setting up resize listener');
	
	$(window).on('resize', () => {
		ThreeHelper.OnWindowResize ({
			renderer: window.app.view.renderer,
			camera: window.app.view.camera
		});
	});
});

function RockItRunt () {
	this.node = $('.body-content');
	
	this.view = new ViewManager (this.node);

	const geometry = new THREE.BoxGeometry ( 1, 1, 1 );
	const material = new THREE.MeshBasicMaterial ( {color: 0x777700} );
	this.cube = new THREE.Mesh (geometry, material);
	
	this.view.scene.add (this.cube);
	this.view.camera.position.z = 5;
	
	this.SpinCube = () => {
		this.cube.rotation.x += 0.01;
		this.cube.rotation.y += 0.01;
	}
	
	this.spinCubeUpdateId = this.view.AddToUpdate(this.SpinCube);
}