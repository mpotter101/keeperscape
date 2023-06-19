// Because these scripts are made static by the app, 
// I can import them without needing the script to be loaded in the html
import * as THREE from 'three';
import { ViewHelper } from '/jsm/helpers/ViewHelper.js';
import { OrbitControls } from '/jsm/controls/OrbitControls.js';
import ThreeHelper from '/ThreeHelper.js';

$(window).on('load', () => { window.toxicBarrel = new ToxicBarrel () });
$(window).on('resize', () => { ThreeHelper.OnWindowResize({renderer: window.toxicBarrel.renderer.domElement}); })

function ToxicBarrel () {
	this._updateError = false;
	
	this.animate = () => {
		if (!this._updateError) {
			requestAnimationFrame (this.animate);
		
			try {
				this.orbitControls.update ();
				this.renderer.render (this.scene, this.camera);
			}
			catch (err) {
				this._updateError = true;
				console.error(err);
			}
		}
	}
	
	this.CreateScene = () => {
		this.objects = {};
		// using threejs documented setup to ensure threejs is working
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera( 
			75, 
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);

		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize (window.innerWidth, window.innerHeight);
		document.body.appendChild (this.renderer.domElement);

		this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
		this.orbitControls = this.orbitControls;
		
		var toxicOverflowRadius = 2;
		var toxicOverflowHeight = 1;
		var toxicOverflowSegments = 32;
		this.objects.toxicOverflow = new THREE.Mesh(
			new THREE.CylinderGeometry (toxicOverflowRadius, toxicOverflowRadius, toxicOverflowHeight, toxicOverflowSegments),
			new THREE.MeshPhongMaterial ({
				color: 0x26a269,
				emissive: 0x26a269,
				specular: 0xffffff,
				shininess: 100
			})
		);
		this.scene.add (this.objects.toxicOverflow);
		this.objects.toxicOverflow.position.y -= (toxicOverflowHeight / 2);
		
		var barrelRadius = 1.9;
		var barrelHeight = 5;
		var barrelSegments = 32;
		this.objects.barrel = new THREE.Mesh(
			new THREE.CylinderGeometry (barrelRadius, barrelRadius, barrelHeight, barrelSegments),
			new THREE.MeshPhongMaterial ({
				color: 0xf6d32d,
				emissive: 0xc64600,
				specular: 0xffffff,
				shininess: 100
			})
		);
		this.scene.add (this.objects.barrel);
		this.objects.barrel.position.y -= (barrelHeight / 2) + 0.1;
		
		this.camera.position.z = 2.5;
		this.camera.position.y = 2.5;
		this.camera.position.x = 2.5;

		this.objects.xArrowHelperMinHeight = new THREE.ArrowHelper(
			new THREE.Vector3( 1, 0, 0 ).normalize (), // Direction = positive X
			new THREE.Vector3( 0, 1, -toxicOverflowRadius ), // Origin 
			toxicOverflowRadius / 2, // Length 
			0xff0000 // Color
		);
		this.scene.add( this.objects.xArrowHelperMinHeight );
		
		this.objects.xArrowHelperMaxHeight = new THREE.ArrowHelper(
			new THREE.Vector3( 1, 0, 0 ).normalize (), // Direction = positive X
			new THREE.Vector3( 0, 2, -toxicOverflowRadius ), // Origin 
			toxicOverflowRadius / 2, // Length 
			0xff0000 // Color
		);
		this.scene.add( this.objects.xArrowHelperMaxHeight );
		
		this.objects.yArrowHelper = new THREE.ArrowHelper(
			new THREE.Vector3( 0, 1, 0 ).normalize (), // Direction = positive Y
			new THREE.Vector3( 0, 0, -toxicOverflowRadius ), // Origin 
			toxicOverflowRadius * 1.25, // Length 
			0x00ff00 // Color
		);
		this.scene.add( this.objects.yArrowHelper );
		
		this.objects.zArrowHelper = new THREE.ArrowHelper(
			new THREE.Vector3( 0, 0, 1 ).normalize (), // Direction = positive Z
			new THREE.Vector3( 0, 0.01, -toxicOverflowRadius ), // Origin 
			toxicOverflowRadius * 2.5, // Length 
			0x0000ff // Color
		);
		this.scene.add( this.objects.zArrowHelper );
		
		this.objects.centerArrowHelper = new THREE.ArrowHelper(
			new THREE.Vector3( 0, 1, 0 ).normalize (), // Direction = positive Z
			new THREE.Vector3( 0, 0, 0 ), // Origin 
			0.5, // Length 
			0x0000ff // Color
		);
		this.scene.add( this.objects.centerArrowHelper );
		
		const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
		directionalLight.position.x = 1.25;
		directionalLight.position.y = 2.25;
		directionalLight.position.z = 1.25;
		this.scene.add( directionalLight );
	}
	
	this.CreateScene ();
	this.animate ();
}