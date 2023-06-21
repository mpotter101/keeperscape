import * as THREE from 'three';
import ThreeHelper from '/ThreeHelper.js'

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
		this.parts.forEach ((p) => {
			p.material.color = p.originalColor;
			p.material.emissive = p.originalEmissive;
		});	
	}
	
	HighlightedPartUnderMouse (part) {
		// Highlight part
		try {
			var color = part.material.color;
			var emissive = 0x999999;
			var material = new THREE.MeshPhongMaterial ({ color, emissive });
			part.material = material;

			this.highlightedPart = part;
		}
		catch (err) {
			console.log (closest);	
		}
	}
	
	HandleClick (eventData) {
		if (this.highlightedPart) {
			this.SelectPart (this.highlightedPart);
		}
	}
	
	SelectPart (part) {
		part.material.wireframe = true;
		this.UnselectPart ();
		this.selectedPart = part;
	}
	
	UnselectPart () {
		if (this.selectedPart) {
			this.selectedPart.material.wireframe = false;
		}
		
		this.selectedPart = null;
	}
	
	// Temporary code for testing other things
	CreateBox () {
		var width = 1;
		var height = 1;
		var depth = 1;
		var color = 0xffffff;
		var emissive = 0x555555;
		var mesh = new THREE.Mesh(
			new THREE.BoxGeometry (width, height, depth),
			new THREE.MeshPhongMaterial ({ color, emissive })
		);
		mesh.isToxicBarrelPart = true;
		mesh.originalColor = mesh.material.color;
		mesh.originalEmissive = mesh.material.emissive;
		
		mesh.position.x = (Math.random() * 2) - 1;
		mesh.position.y = (Math.random() * 2);
		mesh.position.z = (Math.random() * 2) - 1;
		
		this.parts.push (mesh);
		this.scene.add (mesh);
	}
}