import * as THREE from 'three';
import ThreeHelper from '/ThreeHelper.js';
import RockItRuntControls from '/rockitrunt/RockItRuntControls.js';

// Manages input between controls, state, and visuals
export default class RuntPlayer {
	constructor ({viewManager, collisionManager}) {
		this.viewManager = viewManager;
		
		this.name = 'Runt';
		this.hp = 100;
		
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
		var debugLocation = new THREE.LineSegments ( new THREE.WireframeGeometry (new THREE.SphereGeometry( 0.5, 8, 8 )) );
		debugLocation.material.color.setHex (0x5555FF);
		this.locationMesh = debugLocation
		this.viewManager.scene.add (this.locationMesh);
	}
	
	Update (data) {
		// Controls also update our mover, so we need to update the controls before updating out hash table location.
		this.controls.Update (data);
		
		// Only update our hashTable if the player is moving
		if (this.controls.inputCapture.GetAnyKeysHeld ()) {
			this.hashTableEntity.Update ({ position: this.controls.mover.position });	
		}
		
		this.locationMesh.position.copy (this.controls.mover.position);
		this.locationMesh.position.y = -1;
	}
}