// makes something look around
export class Looker {
	constructor ({horizontalLookSpeed = 0.5, verticalLookSpeed = 0.5}) {
		// use a camera for the player, or an object 3D for other entities
		this.rotation = new THREE.Quaternion();
		this.phi = 0;
		this.theta = 0;
		this.phiSpeed = 0.1;
		this.thetaSpeed = 0.1;
	}
	
	RotateByDelta ({deltaPointer, deltaTime}) {
		// Stolen and modified code from SimonDev
		this.phi += -deltaPointer.x * this.phiSpeed;
		this.theta = THREE.MathUtils.clamp(this.theta + deltaPointer.y * this.thetaSpeed, -Math.PI / 3, Math.PI / 3);

		const qx = new THREE.Quaternion();
		qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi);
		const qz = new THREE.Quaternion();
		qz.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.theta);

		const q = new THREE.Quaternion();
		q.multiply(qx);
		q.multiply(qz);

		const t = 1.0 - Math.pow(0.01, 5 * deltaTime);
		this.rotation.slerp(q, t);
	}
}

// makes something move and jump
export class Mover extends Looker {
	constructor ({
		moveSpeed = 1,
		brakeSpeed = 1,
		horizontalLookSpeed = 2,
		verticalLookSpeed = 1.1
	}) {
		super ({horizontalLookSpeed, verticalLookSpeed});
		
		this.position = new THREE.Vector3 ();
		this.velocity = new THREE.Vector3 ();
		this.moveSpeed = moveSpeed;
		this.brakeSpeed = brakeSpeed;
		
		this.inAir = false;
	}
	
	// These will move relative to Y rotation
	MoveForward () { this.velocity.z = 1; }
	MoveBackward () { this.velocity.z = -1; }
	MoveRight () { this.velocity.x = -1; }
	MoveLeft () { this.velocity.x = 1; }
	
	// Not meant to be called directly, but you can
	MoveWithLocalVelocity ({deltaTime}) {
		var qx = new THREE.Quaternion ();
		qx.setFromAxisAngle (new THREE.Vector3(0, 1, 0), this.phi);
		var forward = new THREE.Vector3(0, 0, -1); 
		forward.applyQuaternion(qx);
		forward.multiplyScalar(this.velocity.z * deltaTime * this.moveSpeed);
		var left = new THREE.Vector3(-1, 0, 0); 
		left.applyQuaternion(qx);
		left.multiplyScalar(this.velocity.x * deltaTime * this.moveSpeed);
		
		this.position.add(forward);
		this.position.add(left);
	}
	
	ReduceVelocity ({deltaTime, completeStop}) {
		// if we are not in the air, gradually reduce velocity to 0
		if (!this.inAir) {
			var brakePower = completeStop ? 0 : deltaTime * this.brakeSpeed;
			this.velocity.multiplyScalar (brakePower);
		}
	}
	
	Update ({deltaTime}) {
		this.MoveWithLocalVelocity ({deltaTime});
		this.ReduceVelocity ({deltaTime});
	}
}

// keeps track of input
export class InputCapture {
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
	
	OnKeyDown (event) {
		this.keys.down [event.key] = true;
		this.keys.held [event.key] = true;
	}
	
	OnKeyUp (event) {
		delete this.keys.held [event.key];
		this.keys.up [event.key] = true;
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
	
	Update () {
		// update delta to zero for when the mouse doesn't move
		this.prevPointer = {...this.pointer};
		
		// clear out the down and up inputs as they should only last 1 frame
		this.keys.down = {};
		this.keys.up = {};
	}
}