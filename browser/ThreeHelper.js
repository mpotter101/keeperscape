import * as THREE from 'three';

export default class ThreeHelper {
	static GetClosestObjectToObject ({mainObject, otherObjects}) {
		if (!objects || !objects.length) { return false; }
		
		var mainPos = mainObject.position;
		var goal = 0;
		return otherObjects.reduce((prev, curr) => {
			var prevPos = prev.position.distanceTo (mainPos);
			var curPos = curr.position.distanceTo (mainPos);
			
			return (Math.abs(curPos - goal) < Math.abs(prevPos - goal) ? curr : prev);
		});	
	}
	
	static OnWindowResize ({renderer, camera}) {
		var node = $(renderer.domElement).parent ();
		var innerWidth = node.innerWidth ();
		var innerHeight = node.innerHeight ();
		
		camera.aspect = innerWidth / innerHeight;
		camera.updateProjectionMatrix ();

		renderer.setSize( node.innerWidth (), node.innerHeight () );
	}
	
	static MakeId() {
		let result = '';
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		const charactersLength = characters.length;
		let counter = 0;
		while (counter < 10) {
		  result += characters.charAt(Math.floor(Math.random() * charactersLength));
		  counter += 1;
		}
		return result + Date.now ();
	}
}