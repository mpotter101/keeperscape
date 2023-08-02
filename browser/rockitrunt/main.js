import * as THREE from 'three';
import ThreeHelper from '/ThreeHelper.js';

// Rock It Runt modules
import ViewManager from '/ViewManager.js';
import RuntPlayer from '/rockitrunt/RuntPlayer.js';
import CollisionManager from '/CollisionManager.js';

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
	while (rowIndex < rowsAndColumns) {
		var colIndex = 0;
		while (colIndex < rowsAndColumns) {
			var floor = new THREE.Mesh (
				new THREE.PlaneGeometry (floorSize, floorSize),
				new THREE.MeshBasicMaterial ( {color: 0x77aa00} )
			)
			
			floor.position.x = startPoint.x + (rowIndex * floorSize);
			floor.position.z = startPoint.y + (colIndex * floorSize);
			floor.position.y = -1;
			floor.quaternion.setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), -Math.PI / 2 );
			
			this.view.scene.add (floor);
			
			var floorHashTableEntity = this.collisionManager.hashTable.RegisterNewHashTableEntity ({
				object: floor,
				size: floorSize,
				position: floor.position
			});
			
			floors.push ({mesh: floor, floorHashTableEntity});
			
			colIndex++;
		}
		
		rowIndex++;
	}
	
	this.floors = floors;
	this.updates = {};
	this.updates.spinCubeUpdate = this.view.AddToUpdate(this.SpinCube);
	
	this.runt = new RuntPlayer ({viewManager: this.view, collisionManager: this.collisionManager});
	this.updates.runtUpdate = this.view.AddToUpdate((data) => { this.runt.Update (data) });
	
	
}