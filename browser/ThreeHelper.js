import * as THREE from 'three';

export default class ThreeHelper {
	constructor() {
		this.raycaster = new THREE.Raycaster ();
		this.pointer = new THREE.Vector2 ();
		
		this.events = {
			mouseMove: []
		}
		
		this.eventData = {
			mouseMove: {}
		}
		
		window.addEventListener( 'pointermove', (event) => { this.OnPointerMove (event); } );
	}

	SubscribeToEvent (eventName, handler) {
		this.events [eventName].push (handler);
	}
	
	OnPointerMove (event) {
		// calculate pointer position in normalized device coordinates
		// (-1 to +1) for both components
		// This makes 0, 0 the center of the element
		this.pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		this.pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
		
		this.eventData.mouseMove = { pointer: this.pointer };
		
		this.EmitEvent ('mouseMove');
	}
	
	EmitEvent (eventName) {
		this.events [eventName].forEach ( handler => { handler(this.eventData [eventName]); } );
	}
	
	Raycast ({scene, camera, pointer}) {
		// update the picking ray with the camera and pointer position
		this.raycaster.setFromCamera( pointer, camera );

		// calculate objects intersecting the picking ray
		return this.raycaster.intersectObjects( scene.children );
	}
	
	// this was "borrowed" from github. Don't ask me how it works
	GetClosestObjectToCamera ({camera, objects}) {
		if (!objects || !objects.length) { return false; }
		
		var camPos = camera.position;
		var goal = 0;
		return objects.reduce((prev, curr) => {
			var prevPos = prev.position.distanceTo (camPos);
			var curPos = curr.position.distanceTo (camPos);
			
			return (Math.abs(curPos - goal) < Math.abs(prevPos - goal) ? curr : prev);
		});	
	}
	
	static OnWindowResize ({renderer, camera}) {
		//var parent = $(renderer.domElement).parent();
		// update this so it uses the height and width of its parent container
		// without stretching the parent container
		var node = $(renderer.domElement).parent ();
		var innerWidth = node.innerWidth ();
		var innerHeight = node.innerHeight ();
		
		camera.aspect = innerWidth / innerHeight;
		camera.updateProjectionMatrix ();

		renderer.setSize( node.innerWidth (), node.innerHeight () );
	}
	
	static MakeId() {
		let result = '';
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		const charactersLength = characters.length;
		let counter = 0;
		while (counter < 10) {
		  result += characters.charAt(Math.floor(Math.random() * charactersLength));
		  counter += 1;
		}
		return result + Date.now ();
	}
}