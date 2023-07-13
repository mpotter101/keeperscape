import * as THREE from 'three';
import ThreeHelper from '/ThreeHelper.js';

import { FirstPersonControls } from '/jsm/controls/FirstPersonControls.js';

export default class ViewManager {
	constructor (node) {
		this.updateList = [];
		
		this.node = node;
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera( 
			75, 
			node.innerWidth () / node.innerHeight (),
			0.1,
			1000
		);

		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize (node.innerWidth (), node.innerHeight ());
		node.append (this.renderer.domElement);
		
		this.clock = new THREE.Clock ();
		this.clock.start ();
		
		this.Update ();
	}
	
	Update () {
		requestAnimationFrame (() => {this.Update ()});
		var deltaTime = this.clock.getDelta ();
		this.updateList.forEach ((update) => { update.method ({deltaTime}); });
		
		this.renderer.render (this.scene, this.camera);
	}
	
	AddToUpdate (method) {
		var update = {id: ThreeHelper.MakeId (), method}
		this.updateList.push (update);
		
		return update.id;
	}
}