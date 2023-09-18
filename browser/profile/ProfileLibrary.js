import * as THREE from 'three';

$(window).on ('load', () => {
	window.profileLibrary = new ProfileLibrary();
});

class CharacterCard {
	constructor ({character, node}) {
		this.character = character;
		this.node = node;
		this.imageNode = this.node.find ('img.character.image');
		this.nameNode = this.node.find ('div.character.name');
		this.viewInfoButtonNode = this.node.find ('div.character.button.view-details');
		this.libraryButtonNode = this.node.find ('div.character.button.add-to-library');
		this.facings = ['towards', 'towards-left', 'left', 'away-left', 'away', 'away-right', 'right', 'towards-right'];
		this.animationName = 'Idle';
		this.currentFacingIndex = -1;
		
		this.nameNode.html (this.character ['character-info'].characterName);
		
		this.viewInfoButtonNode.on ('click', () => { this.ViewCharacterModal (); });
		this.libraryButtonNode.on ('click', () => { this.AddToLibrary (); });
		
		this.ProgressAnimation ();
	}
	
	ViewCharacterModal () {
		console.log ('viewing character info')
	}
	
	AddToLibrary () {
		console.log ('adding character', this.character._id, 'to logged-in user')
	}
	
	ProgressAnimation () {
		this.currentFacingIndex++;
		
		if (this.currentFacingIndex >= this.facings.length) { this.currentFacingIndex = 0; }
		this.currentFacing = this.facings [this.currentFacingIndex];
		this.currentAnimation = this.animationName + '-' + this.currentFacing;
		this.imageNode [0].src = this.character ['world-sprites'].frames [this.currentAnimation] [0].src;
	}
}

class ProfileLibrary {
	constructor () {
		var characters = window.charactersJson ? window.charactersJson : [];
		this.containerNode = $('#character-card-library');
		this.timeToSpinMs = 750;
		this.currentTime = 0;
		
		// iterate over character data, create cards
		this.characterCards = [];
		characters.forEach (character => {
			var card = this.CreateCharacterCard (character);
			this.containerNode.append (card.node);
			this.characterCards.push (card);
		});
		
		this.clock = new THREE.Clock ();
		this.clock.start ();
		
		this.AnimateCards ();
	}
	
	CreateCharacterCard (character) {
		var node = $('#character-card-template').clone();
		node.css('display', '');
		node.removeAttr('id');
		return new CharacterCard ({character, node});
	}
	
	AnimateCards () {
		requestAnimationFrame (() => { if (!this.error) { this.AnimateCards (); } });
		
		try {
			var deltaTimeMs = this.clock.getDelta () * 1000;
			this.currentTime += deltaTimeMs;

			if (this.currentTime >= this.timeToSpinMs) {
				this.currentTime = 0;
				this.characterCards.forEach (card => card.ProgressAnimation ());
			}	
		}
		catch (err) {
			this.error = true;
			console.error (err);
		}
		
	}
}