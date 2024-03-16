import { ProfileLibrary, CharacterCard } from '/profile/ProfileLibrary.js'

class DashboardCard extends CharacterCard {
	constructor ({character, node}) {
		super({character, node});
		
		this.loadInEditorButton = this.node.find ('.character.button.load-in-editor');
		this.loadInEditorButton.on ('click', () => { this.LoadCharacterInEditor (); });
	}
	
	LoadCharacterInEditor () {
		window.location.href = "/incarnation/sprite/" + this.character._key;
	}
	
	async GetPrivacy () {
		
	}
	
	async DeleteCharacter () {
		
	}
}

export class DashboardManager extends ProfileLibrary {
	constructor () {
		super({});
	}
	
	CreateCharacterCard (character) {
		var node = $('#character-card-template').clone();
		node.css('display', '');
		node.removeAttr('id');
		return new DashboardCard ({character, node});
	}
}