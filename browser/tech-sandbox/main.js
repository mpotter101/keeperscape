import * as THREE from 'three';
import ThreeHelper from '/core/ThreeHelper.js';

// Rock It Runt modules
import ViewManager from '/core/ViewManager.js';
import Player from '/tech-sandbox/Player.js';
import CollisionManager from '/core/CollisionManager.js';

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
			
			var hashTableEntity = this.collisionManager.hashTable.RegisterNewHashTableEntity ({
				object: floor,
				size: floorSize,
				position: floor.position
			});
			
			floors.push ({mesh: floor, hashTableEntity});
			
			colIndex++;
		}
		
		rowIndex++;
	}
	
	this.floors = floors;
	this.updates = {};
	this.updates.spinCubeUpdate = this.view.AddToUpdate(this.SpinCube);
	
	this.player = new Player ({viewManager: this.view, collisionManager: this.collisionManager});
	this.updates.playerUpdate = this.view.AddToUpdate((data) => { 
		this.player.Update (data) 
		
		// Maybe need an event/or check for frames when objects leave the relevant tiles...
		// Considering the normal use case is for only checking collisions for things nearby... maybe not
		this.floors.forEach (floor => { floor.mesh.material.color.setHex (this.floorColor); })
		
		// Demo for the hashtable collecting entities and setting nearby ones to a different color
		var nearbyEntities = this.player.hashTableEntity.GetEntitiesInRelevantCells();
		nearbyEntities.forEach (entity => {
			if (this.player.hashTableEntity.InSameCell (entity.centerCell)) {
				entity.object.material.color.setHex (this.runtFloorColor);
			}
			else {
				entity.object.material.color.setHex (this.nearbyFloorColor);
			}
		})
	});
}