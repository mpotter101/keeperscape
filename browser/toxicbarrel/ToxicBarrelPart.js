import * as THREE from 'three';

export default class ToxicBarrelPart {
	constructor ({scene}) {
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
		
		mesh.position.x = (Math.random() * 2) - 1;
		mesh.position.y = (Math.random() * 2);
		mesh.position.z = (Math.random() * 2) - 1;
		
		this.originalColor = mesh.material.color;
		this.originalEmissive = mesh.material.emissive;
		this.mesh = mesh;
		this.scene = scene;
		this.scene.add (this.mesh);
	}
	
	ResetMaterial () {
		this.mesh.material.color = this.originalColor;
		this.mesh.material.emissive = this.originalEmissive;
	}
	
	Highlight () {
		var color = this.mesh.material.color;
		var emissive = 0x999999;
		var material = new THREE.MeshPhongMaterial ({ color, emissive });
		this.mesh.material = material;	
	}
}