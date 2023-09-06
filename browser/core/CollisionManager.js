import * as THREE from 'three';
import ThreeHelper from '/core/ThreeHelper.js';
import HashTable from '/core/HashTable.js';

export class Collider {
	constructor ({hashTableEntity, collisionManager}) {
		this.hashTableEntity = hashTableEntity;
		this.collisionManager = collisionManager;
	}
	
	GetCollisions () {
		var collisions = [];
		var entities = this.hashTableEntity.GetEntitiesInRelevantCells ();
		
		entities.forEach (hashTableEntity => {
			var collisionInfo = this.CheckForCollision (hashTableEntity) 
			if (collisionInfo.collided) {
				collisions.push ({entity: hashTableEntity.parent, hashTableEntity:hashTableEntity, collisionInfo});
			}
		});
		
		return collisions;
	}
	
	CheckForCollision (otherhashEntity) {
		var distance = this.hashTableEntity.position.distanceTo(otherhashEntity.position);
		return { 
			collided: distance < (this.hashTableEntity.radius + otherhashEntity.radius),
			overlap: Math.abs (distance - ( this.hashTableEntity.radius + otherhashEntity.radius )),
			distance,
		}
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