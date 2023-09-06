import * as THREE from 'three';
import ThreeHelper from '/core/ThreeHelper.js';
import PlayerControls from '/tech-sandbox/PlayerControls.js';

// Manages input between controls, state, and visuals
export default class Player {
	constructor ({viewManager, collisionManager}) {
		this.viewManager = viewManager;
		this.prevPosition = new THREE.Vector3();
		this.name = 'Player';
		this.hp = 100;
		this.controls = new PlayerControls ({viewManager, moveSpeed: 10});
		
		var playerRadius = 0.5;
		console.log ('Player collider:');
		this.collider = collisionManager.CreateSphereCollider ({
			position: this.controls.mover.position,
			radius: playerRadius,
			parent: this
		})
		
		// for tracking location
		var debugLocation = new THREE.LineSegments ( new THREE.WireframeGeometry (new THREE.SphereGeometry( playerRadius, 8, 8 )) );
		debugLocation.material.color.setHex (0x5555FF);
		this.locationMesh = debugLocation
		this.viewManager.scene.add (this.locationMesh);
	}
	
	HandleCollisions () {
		var collisions = this.collider.GetCollisions();
		collisions.forEach (({entity, hashTableEntity, collisionInfo}) => {
			// since we move our player for each collision, make sure we are still colliding with objects
			if (entity.name == 'wall' && this.collider.CheckForCollision(hashTableEntity).collided) {
				// taken from: 
				// https://stackoverflow.com/questions/18347287/how-would-i-move-an-object-directly-away-from-the-camera-in-the-camera-direction
				var direction = this.controls.mover.position.clone().sub( hashTableEntity.position ).normalize();
				this.controls.AddPosition(direction.clone().multiplyScalar(collisionInfo.overlap));
				
				// A little tedious, but we need to manually update our collider each time we move.
				this.collider.SetPosition (this.controls.GetPosition());
			}
		});
	}
	
	Update (data) {
		this.prevPosition.copy (this.controls.GetPosition());
		
		// Controls also update our mover, so we need to update the controls before updating out hash table location.
		this.controls.Update (data);
		
		this.collider.Update ({ position: this.controls.GetPosition() });	
		
		// After we've moved, check if we bumped into a wall and need to undo our movement
		this.HandleCollisions ();
		
		// debug location mesh
		this.locationMesh.position.copy (this.controls.GetPosition());
		this.locationMesh.position.y -= 1;
		this.controls.UpdateCameraPosition();
	}
}