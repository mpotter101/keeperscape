import * as THREE from 'three';
import { Looker, Mover, InputCapture} from '/LookMoveCapture.js';

// listens for input and handles moving and looking a player
export default class RockItRuntControls {
	constructor ({camera, playerObj3d}) {
		this.camera = camera; // The thing to make look around
		this.playerObj3d = playerObj3d // the thing to move and keep the camera relative to
		
		this.inputCapture = new InputCapture();
		this.looker = new Looker({});
		this.mover = new Mover({});
	}
	
	Update ({deltaTime}) {
		this.looker.RotateByDelta ({deltaPointer: this.inputCapture.GetPointerDelta({}), deltaTime});
		this.camera.quaternion.copy (this.looker.rotation);
		this.inputCapture.Update ();
	}
}