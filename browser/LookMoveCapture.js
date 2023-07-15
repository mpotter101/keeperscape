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
		horizontalLookSpeed = 2,
		verticalLookSpeed = 1.1
	}) {
		super ({horizontalLookSpeed, verticalLookSpeed});
		
		this.prevPosition = new THREE.Vector3 (); // used for undoing collisions
		this.position = new THREE.Vector3 ();
		this.velocity = new THREE.Vector3 ();
		this.moveSpeed = moveSpeed;
		
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
			var brakePower = completeStop ? 0 : deltaTime;
			this.velocity.multiplyScalar (brakePower);
		}
	}
	
	GetMovementDelta () {
		return new THREE.Vector3 (
			this.position.x - this.prevPosition.x,
			this.position.y - this.prevPosition.y,
			this.position.z - this.prevPosition.z,
		)
	}
	
	Update ({deltaTime}) {
		this.prevPosition.copy (this.position);
		this.MoveWithLocalVelocity ({deltaTime});
		this.ReduceVelocity ({deltaTime});
	}
}

export class Collider {
	
}

// Only manipulates Y value
export class Jumper {
	constructor (
		{
			jumpPower = 5,
			maxFallSpeed = 0.25, 
			fallAcceleration = 0.01,
			jumpDurationMs = 300, 
			numberOfJumps = 2
		}
	 ) {
		// Using a vector3 so we can easily apply Y value to other vector3s
		this.position = new THREE.Vector3();
		this.velocity = new THREE.Vector3();
		
		this.jumpPower = jumpPower;
		this.jumpDurationMs = jumpDurationMs;
		this.currentJumpTimeMs = 0;
		this.fallAcceleration = fallAcceleration;
		this.maxFallSpeed = maxFallSpeed;
		this.numberOfJumps = numberOfJumps;
		this.currentJump = 0;
		this.jumpHeld = false;
		this.fallSpeed = 0;
	}
	
	CanBeJumping () {
		return (
			this.currentJumpTimeMs <= this.jumpDurationMs &&
			this.jumpHeld
		)
	}
	
	Jump () {
		if (!this.jumpHeld && this.currentJump < this.numberOfJumps) {
			this.currentJump++;
			this.currentJumpTimeMs = 0;
			this.fallSpeed = 0;
		}
		
		this.jumpHeld = true;
	}
	
	StopJump () {
		this.jumpHeld = false;
		this.currentJumpTimeMs = 0;
	}
	
	Landed () {
		this.currentJump = 0;
		this.currentJumpTimeMs = 0;
		this.fallSpeed = 0;
	}
	
	ApplyJumpVelocity ({deltaTime}) {
		if (!this.CanBeJumping ()) {
			this.fallSpeed += deltaTime * this.fallAcceleration;

			if (this.fallSpeed > this.maxFallSpeed) {this.fallSpeed = this.maxFallSpeed}
			this.velocity.y -= this.fallSpeed;
			console.log ('falling');
		}
		else {
			console.log ('jumping');
			this.velocity.y = this.jumpPower * deltaTime
		}
		
		// TEMP CODE //
		if (this.position.y <= 0 && this.velocity.y < 0) { this.velocity.y = 0; this.Landed (); this.position.y = 0; }
		
		this.position.add (this.velocity);
	}
	
	Update ({deltaTime}) {
		if (this.jumpHeld) { this.currentJumpTimeMs += deltaTime * 1000; }
		this.ApplyJumpVelocity ({deltaTime});
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
	
	Update () {
		// update delta to zero for when the mouse doesn't move
		this.prevPointer = {...this.pointer};
		
		// clear out the down and up inputs as they should only last 1 frame
		this.keys.down = {};
		this.keys.up = {};
	}
}