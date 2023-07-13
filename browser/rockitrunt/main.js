import * as THREE from 'three';
import ThreeHelper from '/ThreeHelper.js';

// Threejs modules
import { FirstPersonControls } from '/jsm/controls/FirstPersonControls.js';

// Rock It Runt modules
import ViewManager from '/rockitrunt/ViewManager.js';
import RuntPlayer from '/rockitrunt/RuntPlayer.js';

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
	
	this.updates = {};
	this.updates.spinCubeUpdate = this.view.AddToUpdate(this.SpinCube);
	
	this.runt = new RuntPlayer ({viewManager: this.view});
	this.updates.runtUpdate = this.view.AddToUpdate((data) => { this.runt.Update (data) });
}