import { ProfileLibrary, CharacterCard } from '/profile/ProfileLibrary.js'

class DashboardCard extends CharacterCard {
	constructor ({character, node}) {
		super({character, node});
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