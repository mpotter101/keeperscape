import * as THREE from 'three';
import ThreeHelper from '/ThreeHelper.js'
import ToxicBarrelPart from '/toxicbarrel/ToxicBarrelPart.js'

export default class ToxicBarrelPartsManager {
	constructor ({scene, camera}) {
		this.scene = scene;
		this.camera = camera;
		this.parts = [];
		this.helper = new ThreeHelper ();
		
		this.highlightedPart = null;
		this.selectedPart = null;
		
		this.helper.SubscribeToEvent ('mouseMove', (eventData) => { this.HandleMouseMove(eventData); });
		$(window).on ('click', (eventData) => { this.HandleClick (eventData) });
	}
	
	HandleMouseMove (eventData) {
		var hits = this.helper.Raycast ({
				scene: this.scene,
				camera: this.camera
			}).filter (item => item.object.isToxicBarrelPart == true);
		
		var objects = [];
		hits.forEach (hit => {objects.push (hit.object)});
		
		var closest = this.helper.GetClosestObjectToCamera ({camera: this.camera, objects});
		
		this.highlightedPart = null;
		this.ResetEmissivesOnParts ();
		if (closest) { this.HighlightedPartUnderMouse (closest); }
	}
	
	ResetEmissivesOnParts () {
		// reset color and emissives of all parts
		this.parts.forEach ((p) => { p.ResetMaterial (); });
	}
	
	HighlightedPartUnderMouse (object3D) {
		var part;
		
		this.parts.forEach ((p) => { if (p.mesh == object3D) {part = p} });
		
		if (part) {
			part.Highlight ();
			this.highlightedPart = part;
		}
	}
	
	HandleClick (eventData) {
		if (this.highlightedPart) {
			this.UnselectPart ();
			this.SelectPart (this.highlightedPart);
		}
	}
	
	SelectPart (part) {
		this.selectedPart = part;
	}
	
	UnselectPart () {
		if (this.selectedPart) {
			this.selectedPart.mesh.material.wireframe = false;
		}
		
		this.selectedPart = null;
	}
	
	// Temporary code for testing other things
	CreateBox () {
		this.parts.push ( new ToxicBarrelPart ({scene: this.scene}) );
	}
}