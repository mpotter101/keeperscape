import * as THREE from 'three';
import ThreeHelper from '/core/ThreeHelper.js';
import HashTable from '/core/HashTable.js';

export class Collider {
	constructor ({hashTableEntity, collisionManager}) {
		this.hashTableEntity = hashTableEntity;
		this.collisionManager = collisionManager;
		console.log (this);
	}
	
	GetCollisions () {
		var collisions = [];
		var entities = this.hashTableEntity.GetEntitiesInRelevantCells ();
		
		entities.forEach (hashTableEntity => {
			if (this.CheckForCollision (this.hashTableEntity, hashTableEntity)) {
				collisions.push (hashTableEntity);
			}
		});
		
		return collisions;
	}
	
	CheckForCollision (hashEntityA, hashEntityB) {
		return hashEntityA.position.distanceTo(hashEntityB) < hashEntityA.radius + hashEntityB.radius;
	}
	
	SetPosition (data) { this.hashTableEntity.SetPosition(data); }
	
	Update (data) {
		this.hashTableEntity.Update (data);
	}
}

export default class CollisionManager {
	constructor ({
		hashTable = new HashTable({})
	}) {
		this.hashTable = hashTable;
	}
	
	CreateSphereCollider ({radius = 0.5, position = new THREE.Vector3(), parent}) {
		// Possibly perform other kinds of setup here for collision management...
		var hashTableEntity = this.hashTable.RegisterNewHashTableEntity ({radius, position, parent});
		return new Collider ({hashTableEntity, collisionManager: this});
	}
	// CheckEntityForCollision
}