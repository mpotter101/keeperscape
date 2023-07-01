import * as THREE from 'three';
import { OrbitControls } from '/jsm/controls/OrbitControls.js';

export default class ToxicBarrelSceneManager {
	static CreateView () {
		var view = { objects: {} };
		
		// using threejs documented setup to ensure threejs is working
		view.scene = new THREE.Scene();
		view.camera = new THREE.PerspectiveCamera( 
			75, 
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);

		view.renderer = new THREE.WebGLRenderer();
		//let height = box.offsetHeight;
		var homeNode = $('.body-content');
		view.renderer.setSize (homeNode.innerWidth (), homeNode.innerHeight ());
		homeNode.append (view.renderer.domElement);

		view.orbitControls = new OrbitControls(view.camera, view.renderer.domElement);
		
		var toxicOverflowRadius = 2;
		var toxicOverflowHeight = 1;
		var toxicOverflowSegments = 32;
		view.objects.toxicOverflow = new THREE.Mesh(
			new THREE.CylinderGeometry (toxicOverflowRadius, toxicOverflowRadius, toxicOverflowHeight, toxicOverflowSegments),
			new THREE.MeshPhongMaterial ({
				color: 0x5CAB1F,
				emissive: 0x08640E,
				specular: 0xffffff,
				shininess: 100
			})
		);
		view.scene.add (view.objects.toxicOverflow);
		view.objects.toxicOverflow.position.y -= (toxicOverflowHeight / 2);
		
		var barrelRadius = 1.9;
		var barrelHeight = 5;
		var barrelSegments = 32;
		view.objects.barrel = new THREE.Mesh(
			new THREE.CylinderGeometry (barrelRadius, barrelRadius, barrelHeight, barrelSegments),
			new THREE.MeshPhongMaterial ({
				color: 0xDCCC3D,
				emissive: 0x624E03,
				specular: 0xffffff,
				shininess: 100
			})
		);
		view.scene.add (view.objects.barrel);
		view.objects.barrel.position.y -= (barrelHeight / 2) + 0.1;
		
		view.camera.position.z = 2.5;
		view.camera.position.y = 2.5;
		view.camera.position.x = 2.5;

		view.objects.xArrowHelperMinHeight = new THREE.ArrowHelper(
			new THREE.Vector3( 1, 0, 0 ).normalize (), // Direction = positive X
			new THREE.Vector3( 0, 1, -toxicOverflowRadius ), // Origin 
			toxicOverflowRadius / 2, // Length 
			0xff0000 // Color
		);
		view.scene.add( view.objects.xArrowHelperMinHeight );
		
		view.objects.xArrowHelperMaxHeight = new THREE.ArrowHelper(
			new THREE.Vector3( 1, 0, 0 ).normalize (), // Direction = positive X
			new THREE.Vector3( 0, 2, -toxicOverflowRadius ), // Origin 
			toxicOverflowRadius / 2, // Length 
			0xff0000 // Color
		);
		view.scene.add( view.objects.xArrowHelperMaxHeight );
		
		view.objects.yArrowHelper = new THREE.ArrowHelper(
			new THREE.Vector3( 0, 1, 0 ).normalize (), // Direction = positive Y
			new THREE.Vector3( 0, 0, -toxicOverflowRadius ), // Origin 
			toxicOverflowRadius * 1.25, // Length 
			0x00ff00 // Color
		);
		view.scene.add( view.objects.yArrowHelper );
		
		view.objects.zArrowHelper = new THREE.ArrowHelper(
			new THREE.Vector3( 0, 0, 1 ).normalize (), // Direction = positive Z
			new THREE.Vector3( 0, 0.01, -toxicOverflowRadius ), // Origin 
			toxicOverflowRadius * 2.5, // Length 
			0x0000ff // Color
		);
		view.scene.add( view.objects.zArrowHelper );
		
		view.objects.centerArrowHelper = new THREE.ArrowHelper(
			new THREE.Vector3( 0, 1, 0 ).normalize (), // Direction = positive Z
			new THREE.Vector3( 0, 0, 0 ), // Origin 
			0.5, // Length 
			0x0000ff // Color
		);
		view.scene.add( view.objects.centerArrowHelper );
		
		const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
		directionalLight.position.x = 1.25;
		directionalLight.position.y = 2.25;
		directionalLight.position.z = 1.25;
		view.scene.add( directionalLight );
		
		return view;
	}
}