import Button from '/incarnation/component/Button.js';
import TextFileInput from '/incarnation/component/TextFileInput.js';

export default class DataCrudOperations {
	constructor ({ onSaveToJson, onLoadFromJson, onSaveToProfile, onLoadFromProfile }) {
		this.crudButtonsNode = $('#crud-buttons');
		this.exportFileButton = new Button ({
			parent: this.crudButtonsNode,
			label: 'Save to JSON File',
			onClick: onSaveToJson
		})

		this.dataImporter = new TextFileInput ({
            parent: $(document.body),
            onFile: onLoadFromJson
        })
		
		this.importFileButton = new Button ({
			parent: this.crudButtonsNode,
			label: 'Load from JSON File',
			onClick: (e) => { this.dataImporter.node.click (); }
		})

		this.saveToProfileButton = new Button ({
			parent: this.crudButtonsNode,
			label: 'Save to Profile',
			onClick: onSaveToProfile
		})
		
		this.loadFromProfileButton = new Button ({
			parent: this.crudButtonsNode,
			label: 'Load from Profile',
			onClick: onLoadFromProfile
		})	
	}
}