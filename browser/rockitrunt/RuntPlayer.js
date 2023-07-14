import * as THREE from 'three';
import ThreeHelper from '/ThreeHelper.js';
import RockItRuntControls from '/rockitrunt/RockItRuntControls.js';

// Manages input between controls, state, and visuals
export default class RuntPlayer {
	constructor ({viewManager}) {
		this.viewManager = viewManager;
		
		this.name = 'Runt';
		this.hp = 100;
		
		
		// replacee this with player model eventually
		const geometry = new THREE.BoxGeometry ( 1, 1, 1 );
		const material = new THREE.MeshBasicMaterial ( {color: 0x777700} );
		this.mesh = new THREE.Mesh (geometry, material);
		
		this.controls = new RockItRuntControls ({viewManager})
	}
	
	Update (data) {
		this.controls.Update (data);
	}
}