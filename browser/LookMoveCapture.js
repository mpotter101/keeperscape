// makes something look around
export class Looker {
	constructor () {
		// use a camera for the player, or an object 3D for other entities
		this.rotation = new THREE.Quaternion();
		this.phi = 0;
		this.theta = 0;
		this.phiSpeed = 2;
		this.thetaSpeed = 1.1;
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

// makes something move
export class Mover {
	constructor (object3D) {
	
	}
}

// keeps track of input
export class InputCapture {
	constructor () {
		this.raycaster = new THREE.Raycaster ();
		this.prevPointer = new THREE.Vector2();
		this.pointer = new THREE.Vector2();
		
		this.delta = new THREE.Vector2();
		
		window.addEventListener( 'pointermove', (event) => { this.OnPointerMove (event); } );
	}
	
	OnPointerMove (event) {
		// calculate pointer position in normalized device coordinates
		// (-1 to +1) for both components
		// This makes 0, 0 the center of the element
		var pointer = { }
		pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
		
		this.UpdateCurrentPointer ({pointer});
		this.UpdateCurrentDelta ();
	}
	
	GetPointerDelta ({
		currentPointer = this.pointer, 
		prevPointer = this.prevPointer
	}) {
		return {
			x: currentPointer.x - prevPointer.x,
			y: currentPointer.y - prevPointer.y
		}
	}
	
	Raycast ({scene, camera, pointer = this.pointer}) {
		// update the picking ray with the camera and pointer position
		this.raycaster.setFromCamera( pointer, camera );

		// calculate objects intersecting the picking ray
		return this.raycaster.intersectObjects( scene.children );
	}
	
	UpdateCurrentPointer ({pointer}) {
		this.prevPointer = {...this.pointer};
		this.pointer = pointer
	}
	
	UpdateCurrentDelta () {
		this.delta = this.GetPointerDelta ({});;
	}
	
	Update () {
		this.UpdateCurrentPointer ({pointer: this.pointer});
		this.UpdateCurrentDelta ();
	}
}