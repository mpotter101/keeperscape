import DataCrudOperations from '/incarnation/DataCrudOperations.js';
import CharacterInfoForm from '/incarnation/CharacterInfoForm.js';

export default class CharacterDataManager {
	constructor ({characterCreatorList}) {
		this.characterCreatorList = characterCreatorList;
		this.characterInfoForm = new CharacterInfoForm({name: 'character-info'});
		this.dataCrudOperations = new DataCrudOperations({
			onSaveToJson: () => { this.SaveToJson (); },
			onLoadFromJson: (e) => { this.LoadFromJson (e); },
			onSaveToProfile: () => { this.SaveToProfile (); }
		});
	}
	
	// Borrowed from here: http://www.4codev.com/javascript/download-save-json-content-to-local-file-in-javascript-idpx473668115863369846.html
    Download(content, fileName) {
        const a = document.createElement("a");
        const file = new Blob([content], { type: 'text/plain' });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    }
	
	SaveToJson () {
		var filesToSave = [];
		var characterInfo = this.characterInfoForm.GetJson ();
		
		this.characterCreatorList.forEach (creator => {
			var s = creator.state.Get();
			this.Download (
				JSON.stringify (s, null, 4),
				characterInfo.characterName + '-' + s.name + '.json',
			)
		});
		
		this.Download (
			JSON.stringify (characterInfo, null, 4),
			characterInfo.characterName + '-' + 'character-info.json',
		)
	}
	
	LoadFromJson ({value}) {
		var json = JSON.parse (value);
		
		// Find which character creator the data belongs to
		this.characterCreatorList.forEach (creator => {
			var s = creator.state.Get();
			if (s.name == json.name) {
				creator.ImportJson ({json});
				return;
			}
		});
		
		// if we made it this far, we are probably loading in the character info
		if (json.name == this.characterInfoForm.name) {
			this.characterInfoForm.ImportJson ({json});
		}
	}
	
	SaveToProfile () {
		var character = {}
		character [this.characterInfoForm.name] = this.characterInfoForm.GetJson ();
		
		this.characterCreatorList.forEach (creator => {
			var s = creator.state.Get();
			character [s.name] = s;
		});
		
		fetch('/api/v1/profile/' + window.username + '/character', {
			method: 'POST',
			body: JSON.stringify(character),
			headers: {'Content-type': 'application/json; charset=UTF-8'}
		})
	}
}