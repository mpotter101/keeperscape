
// makes something look around
export class Looker {
	constructor (object3D) {
		// use a camera for the player, or an object 3D for other entities
	}
}

// makes something move
export class Mover {
	constructor (object3D) {
	
	}
}

// keeps track of input
export class InputCapture {
	constructor () {
		this.events = {
			mouseMove: []
		}
		
		this.eventData = {
			mouseMove: {}
		}
		
		window.addEventListener( 'pointermove', (event) => { this.OnPointerMove (event); } );
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
	
	SubscribeToEvent (eventName, handler) {
		this.events [eventName].push (handler);
	}
}

// listens for input and handles moving and looking a player
export default class RockItRuntControls {
	constructor ({camera, playerObj3d}) {
		this.camera = camera; // The thing to make look around
		this.playerObj3d = playerObj3d // the thing to move and keep the camera relative to
	}
	
	Update ({deltaTime}) {
		
	}
}