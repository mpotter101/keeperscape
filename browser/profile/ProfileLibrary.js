import * as THREE from 'three';

export class CharacterCard {
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
		this.inLibrary = false;
		
		this.nameNode.html (this.character ['character-info'].characterName);
		
		this.viewInfoButtonNode.on ('click', () => { this.ViewCharacterModal (); });
		this.libraryButtonNode.on ('click', () => { this.HandleLibraryButton (); });
		
		this.UpdateLibraryButton();
		
		this.ProgressAnimation ();
	}
	
	ViewCharacterModal () {
		console.log ('viewing character info')
	}
	
	async HandleLibraryButton () {
		var response;
		
		if (this.inLibrary) {
			response = await fetch('/api/v1/sprite/' + this.character._key + '/library', {
				method: 'DELETE',
				headers: {'Content-type': 'application/json; charset=UTF-8'}
			});
		}
		else {
			response = await fetch('/api/v1/sprite/' + this.character._key + '/library', {
				method: 'PUT',
				headers: {'Content-type': 'application/json; charset=UTF-8'}
			});
		}
		
		var result = await response.json ();
		if (result.user) { window.user = result.user };
		this.UpdateLibraryButton();
	}
	
	UpdateLibraryButton () {
		var u = window.user
		this.inLibrary = false
		
		if (u && u.library.length) {
			if (u.library.includes (this.character._id)) { this.inLibrary = true; }
		}
		
		if (this.inLibrary) {
			this.libraryButtonNode.html ('Remove from Library');
			this.libraryButtonNode.addClass ('remove');
		}
		else {
			this.libraryButtonNode.html ('Add to Library');
			this.libraryButtonNode.removeClass ('remove');
		}
	}
	
	ProgressAnimation () {
		this.currentFacingIndex++;
		
		if (this.currentFacingIndex >= this.facings.length) { this.currentFacingIndex = 0; }
		this.currentFacing = this.facings [this.currentFacingIndex];
		this.currentAnimation = this.animationName + '-' + this.currentFacing;
		this.imageNode [0].src = this.character ['sprite'].frames [this.currentAnimation] [0].src;
	}
}

export class ProfileLibrary {
	constructor () {
		var characters = window.charactersJson ? window.charactersJson : [];
		this.containerNode = $('#character-card-library');
		this.timeToSpinMs = 750;
		this.currentTime = 0;
		
		// iterate over character data, create cards
		this.characterCards = [];
		this.characters = characters;
		this.clock = new THREE.Clock ();
		this.clock.start ();
	}
	
	CreateCards () {
		this.characters.forEach (character => {
			var card = this.CreateCharacterCard (character);
			this.containerNode.append (card.node);
			this.characterCards.push (card);
		});
	}
	
	CreateCharacterCard (character) {
		console.log ('creating character card');
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