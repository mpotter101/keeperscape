// keeps track of input
export default class InputCapture {
	constructor () {
		this.raycaster = new THREE.Raycaster ();
		this.prevPointer = new THREE.Vector2();
		this.pointer = new THREE.Vector2();
		
		window.addEventListener( 'pointermove', (event) => { this.OnPointerMove (event); } );
		window.addEventListener( 'keydown', (event) => { this.OnKeyDown (event); } );
		window.addEventListener( 'keyup', (event) => { this.OnKeyUp (event); } );
		
		this.keys = {
			down: {},
			held: {},
			up: {}
		}
	}
	
	GetEventKey (event) {
		var key = event.key;
		
		if (event.code == 'Space') { key = 'Space'; }
		
		return key;
	}
	
	OnKeyDown (event) {
		var key = this.GetEventKey (event);
		
		this.keys.down [key] = true;
		this.keys.held [key] = true;
	}
	
	OnKeyUp (event) {
		var key = this.GetEventKey (event);
		
		delete this.keys.held [key];
		this.keys.up [key] = true;
	}
	
	OnPointerMove (event) {
		// Tracking an invisible pointer for the purpose of getting an accurate delta
		var pointer = new THREE.Vector2( event.movementX * 0.1, event.movementY * -0.1 );
		
		this.prevPointer = {...this.pointer};
		this.pointer.add (pointer);
	}
	
	GetDelta () {
		return new THREE.Vector2(
			this.pointer.x - this.prevPointer.x,
			this.pointer.y - this.prevPointer.y
		);
	}
	
	GetAnyKeysDown () { return Object.keys (this.keys.down).length > 0 }
	
	GetAnyKeysHeld () { return Object.keys (this.keys.held).length > 0 }
	
	GetAnyKeysUp () { return Object.keys (this.keys.up).length > 0 }
	
	Update () {
		// update delta to zero for when the mouse doesn't move
		this.prevPointer = {...this.pointer};
		
		// clear out the down and up inputs as they should only last 1 frame
		this.keys.down = {};
		this.keys.up = {};
	}
}