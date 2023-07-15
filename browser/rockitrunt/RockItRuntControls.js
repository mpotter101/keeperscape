import * as THREE from 'three';
import { Looker, Mover, Jumper, InputCapture} from '/LookMoveCapture.js';

// listens for input and handles moving and looking a player
export default class RockItRuntControls {
	constructor ({viewManager}) {
		this.viewManager = viewManager;
		this.camera = viewManager.camera; // The thing to make look around
		
		this.inputCapture = new InputCapture({viewManager});
		this.mover = new Mover({moveSpeed: 10});
		this.mover.position.z = 5;
		this.mover.position.y = 0.5;
		
		this.jumper = new Jumper ({});
		
		var canvas = this.viewManager.renderer.domElement;
		canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
		$(canvas).on ('click', () => {this.viewManager.renderer.domElement.requestPointerLock()});
	}
	
	HandleControls () {
		if (this.inputCapture.keys.held.w) {
			this.mover.MoveForward ();
		}
		
		if (this.inputCapture.keys.held.s) {
			this.mover.MoveBackward ();
		}
		
		if (this.inputCapture.keys.held.a) {
			this.mover.MoveLeft ();
		}
		
		if (this.inputCapture.keys.held.d) {
			this.mover.MoveRight ();
		}
		
		if (this.inputCapture.keys.held.Space) {
			this.jumper.Jump ();
		}
		if (this.inputCapture.keys.up.Space) {
			console.log ('stopping jump');
			this.jumper.StopJump ();
		}
	}
	
	Update ({deltaTime}) {
		if (document.pointerLockElement === this.viewManager.renderer.domElement) {
			this.mover.RotateByDelta ({deltaPointer: this.inputCapture.GetDelta (), deltaTime});
			this.HandleControls ();
		}
		
		// Always update the mover so it can actually move us
		this.mover.Update ({deltaTime});
		this.jumper.Update ({deltaTime});
		
		// Update the input capture last we can actually capture input from events
		this.inputCapture.Update ({deltaTime});
		
		// Copy over state of our mover so it updates the view
		this.camera.quaternion.copy (this.mover.rotation);
		this.camera.position.copy (this.mover.position);
		this.camera.position.y = this.jumper.position.y + 0.5;
	}
}