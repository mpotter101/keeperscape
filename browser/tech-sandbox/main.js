// This project is to act as a "Kitchen Sink" demo.
// It should do a little bit of everything to demonstrate how these objects are used.

import * as THREE from 'three';
import ThreeHelper from '/core/ThreeHelper.js';

// Game modules
import ViewManager from '/core/ViewManager.js';
import Player from '/tech-sandbox/Player.js';
import CollisionManager from '/core/CollisionManager.js';

$(window).on('load', () => {
	window.THREE = THREE;
	window.app = new KitchenSink (); 
	
	console.log (window.app);
	console.log ('setting up resize listener');
	
	$(window).on('resize', () => {
		ThreeHelper.OnWindowResize ({
			renderer: window.app.view.renderer,
			camera: window.app.view.camera
		});
	});
});

function KitchenSink () {
	this.node = $('.body-content');
	
	this.view = new ViewManager (this.node);

	const geometry = new THREE.BoxGeometry ( 1, 1, 1 );
	const material = new THREE.MeshBasicMaterial ( {color: 0x777700} );
	this.cube = new THREE.Mesh (geometry, material);
	this.cube.name = "wall";
	
	this.view.scene.add (this.cube);
	this.view.camera.position.z = 5;
	
	this.SpinCube = () => {
		this.cube.rotation.x += 0.01;
		this.cube.rotation.y += 0.01;
	}
	
	this.collisionManager = new CollisionManager({});
	
	// create a grid of 100 x 100 planes from -50,-50 to 50,50
	// and assign register to the collision manager's hashtable
	var startPoint = new THREE.Vector2 (-5, -5);
	var rowsAndColumns = 10;
	var floorSize = 1;
	var rowIndex = 0;
	var floors = [];
	this.floorColor = 0x77aa00;
	this.nearbyFloorColor = 0x88bb11;
	this.runtFloorColor = 0x88CC99;
	while (rowIndex < rowsAndColumns) {
		var colIndex = 0;
		while (colIndex < rowsAndColumns) {
			var floor = new THREE.Mesh (
				new THREE.PlaneGeometry (floorSize, floorSize),
				new THREE.MeshBasicMaterial ( {color: this.floorColor} )
			)
			
			floor.position.x = startPoint.x + (rowIndex * floorSize);
			floor.position.z = startPoint.y + (colIndex * floorSize);
			floor.position.y = -1;
			floor.quaternion.setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), -Math.PI / 2 );
			
			this.view.scene.add (floor);
			
			var collider = this.collisionManager.CreateSphereCollider ({
				parent: floor,
				radius: floorSize,
				position: floor.position
			});
			floor.name = 'floor' + ((colIndex + 1) * rowIndex)
			floors.push ({mesh: floor, collider});
			
			colIndex++;
		}
		
		rowIndex++;
	}
	
	this.floors = floors;
	this.player = new Player ({viewManager: this.view, collisionManager: this.collisionManager});
	this.wallCollider = this.collisionManager.CreateSphereCollider({
		position: this.cube.position,
		radius: 1,
		parent: this.cube
	});
	
	this.updates = {};
	
	this.updates.spinCubeUpdate = this.view.AddToUpdate(this.SpinCube);
	this.updates.playerUpdate = this.view.AddToUpdate((data) => { 
		this.player.Update (data) 
		
		// A lot of this could be moved to the player since the hash table manager grants access to all other objects
		
		// Maybe need an event/or check for frames when objects leave the relevant tiles...
		// Considering the normal use case is for only checking collisions for things nearby... maybe not
		this.cube.material.color.setHex (0x777700);
		this.floors.forEach (floor => { floor.mesh.material.color.setHex (this.floorColor); })
		
		// Demo for the hashtable collecting entities and setting nearby ones to a different color
		// You shouldn't need to reach into the hashTableEntity directly for collision detecting, but showing off you can
		var nearbyEntities = this.player.collider.hashTableEntity.GetEntitiesInRelevantCells();
		nearbyEntities.forEach (entity => {
			if (this.player.collider.hashTableEntity.InSameCell (entity.centerCell)) {
				entity.parent.material.color.setHex (this.runtFloorColor);
			}
			else {
				entity.parent.material.color.setHex (this.nearbyFloorColor);
			}
		})
	});
}