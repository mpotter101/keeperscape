import * as THREE from 'three';
import ThreeHelper from '/ThreeHelper.js';
import RockItRuntControls from '/rockitrunt/RockItRuntControls.js';

export default class RuntPlayer {
	constructor ({viewManager}) {
		this.name = 'Runt';
		this.viewManager = viewManager;
		
		// replacee this with player model eventually
		const geometry = new THREE.BoxGeometry ( 1, 1, 1 );
		const material = new THREE.MeshBasicMaterial ( {color: 0x777700} );
		this.mesh = new THREE.Mesh (geometry, material);
		
		this.controls = new RockItRuntControls ({
			camera: this.viewManager.camera,
			playerObj3d: this.mesh
		})
		
		//$(viewManager.renderer.domElement).on ('click', () => { this.HandleMouseLock (); });
		
		//$(window).on('resize', () => { this.controls.handleResize (); });
	
		//this.controls.lookSpeed = 0.5;
	}
	
	Update (data) {
		this.controls.Update (data);
	}
	
	HandleMouseLock() {
		this.viewManager.renderer.domElement.requestPointerLock ();
	}
}