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

// makes something move along the "ground"
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

// Handles complex Y value movements
export class Jumper {
	constructor ({
		jumpPower = 5,
		maxFallSpeed = 1.25, 
		fallAcceleration = 0.1,
		jumpDurationMs = 300, 
		numberOfJumps = 2,
		slowFallMod = 0.1 // set to 1 to disable slow falling
	}) {
		// Using a vector3 so we can easily apply Y value to other vector3s
		this.position = new THREE.Vector3();
		this.velocity = new THREE.Vector3();

		this.jumpPower = jumpPower;
		this.jumpDurationMs = jumpDurationMs;
		this.currentJumpTimeMs = 0;
		this.fallAcceleration = fallAcceleration;
		this.maxFallSpeed = maxFallSpeed;
		this.numberOfJumps = numberOfJumps;
		this.slowFallMod = slowFallMod;
		this.currentJump = 0;
		this.jumpHeld = false;
		this.fallSpeed = 0;
		this.landed = false;
	}
	
	CanBeJumping () {
		return (
			this.currentJumpTimeMs <= this.jumpDurationMs &&
			this.currentJump < this.numberOfJumps &&
			this.jumpHeld
		)
	}
	
	Jump () {
		if (!this.jumpHeld && this.currentJump < this.numberOfJumps) {
			this.currentJumpTimeMs = 0;
			this.fallSpeed = 0;
			this.landed = false;
		}
		
		this.jumpHeld = true;
	}
	
	StopJump () {
		this.jumpHeld = false;
		this.currentJumpTimeMs = 0;
		this.currentJump++;
	}
	
	Landed () {
		this.currentJump = 0;
		this.currentJumpTimeMs = 0;
		this.fallSpeed = 0;
		this.landed = true;
		this.velocity.y = 0;
	}
	
	Rise (deltaTime) {
		this.fallSpeed = 0;
		this.velocity.y = this.jumpPower * deltaTime
	}
	
	Fall (deltaTime) {
		var maxFallSpeed = this.maxFallSpeed;
		
		// slow fall if holding jump
		if (this.jumpHeld) {
			maxFallSpeed *= this.slowFallMod
		}
		
		this.fallSpeed = deltaTime * this.fallAcceleration;

		this.velocity.y -= this.fallSpeed;
		
		if (
			this.velocity.y < 0 &&
			Math.abs (this.velocity.y) > maxFallSpeed
		) { this.velocity.y = -Math.abs (maxFallSpeed) } 
	}
	
	ApplyJumpVelocity ({deltaTime}) {
		if (this.CanBeJumping ()) { this.Rise (deltaTime) }
		else if (!this.landed) { 
			this.Fall (deltaTime) 
			
			// TEMP CODE //
			if (this.position.y <= 0 && this.velocity.y < 0) {
				this.Landed (); 
				this.position.y = 0; 
			}
			// TEMP CODE //
		}
		
		this.position.add (this.velocity);
	}
	
	Update ({deltaTime}) {
		if (this.jumpHeld) { this.currentJumpTimeMs += deltaTime * 1000; }
		this.ApplyJumpVelocity ({deltaTime});
	}
}