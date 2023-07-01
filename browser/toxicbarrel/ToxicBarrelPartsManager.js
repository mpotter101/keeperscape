import * as THREE from 'three';
import ThreeHelper from '/ThreeHelper.js'
import ToxicBarrelPart from '/toxicbarrel/ToxicBarrelPart.js'

export default class ToxicBarrelPartsManager {
	constructor ({scene, camera, renderer}) {
		this.scene = scene;
		this.camera = camera;
		this.renderer = renderer;
		this.parts = [];
		this.helper = new ThreeHelper ();
		this.pointer = { x: 0, y: 0 };
		
		this.highlightedPart = null;
		this.selectedPart = null;
		
		$(window).on('mousemove', (event) => { 
			this.pointer.x = ( event.clientX / $(this.renderer.domElement).innerWidth () ) * 2 - 1;
			this.pointer.y = - ( event.clientY / $(this.renderer.domElement).innerHeight () ) * 2 + 1;
			this.HandleMouseMove (); 
		});
		
		$(window).on ('click', (event) => { this.HandleClick (event) });
	}
	
	HandleMouseMove () {
		var hits = this.helper.Raycast ({
				scene: this.scene,
				camera: this.camera,
				pointer: this.pointer
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