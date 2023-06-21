// Because these scripts are made static by the app, 
// I can import them without needing the script to be loaded in the html
import * as THREE from 'three';
import { OrbitControls } from '/jsm/controls/OrbitControls.js';
import ThreeHelper from '/ThreeHelper.js';
import ToxicBarrelSceneManager from '/toxicbarrel/ToxicBarrelSceneManager.js';
import ToxicBarrelPartsManager from '/toxicbarrel/ToxicBarrelPartsManager.js';

$(window).on('load', () => {
	window.THREE = THREE;
	window.toxicBarrel = new ToxicBarrel (); 

	$(window).on('resize', () => {
		ThreeHelper.OnWindowResize ({
			renderer: window.toxicBarrel.view.renderer,
			camera: window.toxicBarrel.view.camera
		});
	});
});

function ToxicBarrel () {
	this._updateError = false;
	
	this.animate = () => {
		if (!this._updateError) {
			requestAnimationFrame (this.animate);
		
			try {
				this.view.orbitControls.update ();
				this.view.renderer.render (this.view.scene, this.view.camera);
			}
			catch (err) {
				this._updateError = true;
				console.error(err);
			}
		}
	}
	
	this.CreatePart = () => {
		this.partsManager.CreateBox ();
	}
	
	this.view = ToxicBarrelSceneManager.CreateView ();
	this.partsManager = new ToxicBarrelPartsManager ({scene: this.view.scene, camera: this.view.camera});
	this.animate ();
}