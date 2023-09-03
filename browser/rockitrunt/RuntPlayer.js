import * as THREE from 'three';
import ThreeHelper from '/ThreeHelper.js';
import RockItRuntControls from '/rockitrunt/RockItRuntControls.js';

// Manages input between controls, state, and visuals
export default class RuntPlayer {
	constructor ({viewManager, collisionManager}) {
		this.viewManager = viewManager;
		
		this.name = 'Runt';
		this.hp = 100;
		
		
		// replacee this with player model eventually
		const geometry = new THREE.BoxGeometry ( 1, 1, 1 );
		const material = new THREE.MeshBasicMaterial ( {color: 0x777700} );
		this.mesh = new THREE.Mesh (geometry, material);
		
		this.controls = new RockItRuntControls ({viewManager});
		
		this.hashTableEntity = collisionManager.hashTable.RegisterNewHashTableEntity ({
			position: this.controls.mover.position,
			size: 1,
			object: this
		})
		
		// for tracking location
		var sphere = new THREE.Mesh( 
			new THREE.SphereGeometry( 0.5, 8, 8 ), 
			new THREE.MeshStandardMaterial( { color: 0xffff00, wireframe: true } ) 
		);
		this.locationMesh = sphere
		this.viewManager.scene.add (this.locationMesh);
	}
	
	Update (data) {
		// Need to check input before updating input capture as input capture update clears out keys held or released.
		var inputHeld = this.controls.inputCapture.GetAnyKeysDown ();
		
		// Controls also update our mover, so we need to update the controls before updating out hash table location.
		this.controls.Update (data);
		
		// Only update our hashTable if the player is moving
		if (inputHeld) {
			this.hashTableEntity.Update ({ position: this.controls.mover.position });	
		}
		
		this.locationMesh.position.copy (this.controls.mover.position);
		this.locationMesh.position.y = -1;
	}
}