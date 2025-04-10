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
		
		if (window.characterJson) {
			this.LoadFromJson ({value: window.characterJson});
		}
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
		var dataToSave = {};
		var characterInfo = this.characterInfoForm.GetJson ();
		dataToSave [this.characterInfoForm.name] = characterInfo;
		
		// this is outdated support for when there was more than one sprite creator on the page.
		this.characterCreatorList.forEach (creator => {
			var s = creator.state.Get();
			dataToSave [s.name] = s;
		});
		
		this.Download (
			JSON.stringify (dataToSave, null, 4),
			characterInfo.characterName + '-' + 'data.json',
		)
	}
	
	LoadFromJson ({value}) {
		var json = value;
		if (typeof json == 'string') {
			json = JSON.parse (value);	
		}
		
		Object.keys (json).forEach (key => {
			// Find which character creator the data belongs to
			this.characterCreatorList.forEach (creator => {
				var s = creator.state.Get();
				if (s.name == key) {
					creator.ImportJson ({json: json [key]});
					creator.RedrawScene();
				}
			});

			// if we made it this far, we are probably loading in the character info
			if (key == this.characterInfoForm.name) {
				this.characterInfoForm.ImportJson ({json: json [key]});
			}
		});
	}
	
	async SaveToProfile () {
		var character = {}
		character [this.characterInfoForm.name] = this.characterInfoForm.GetJson ();
		
		this.characterCreatorList.forEach (creator => {
			var s = creator.state.Get();
			character [s.name] = s;
		});
		
		var response = await fetch('/api/v1/profile/' + window.username + '/sprite', {
			method: 'POST',
			body: JSON.stringify(character),
			headers: {'Content-type': 'application/json; charset=UTF-8'}
		});
		
		var result = await response.json ();
		console.log (result);
		if (result.success) {
			window.location.href = result.redirect;
		}
	}
}