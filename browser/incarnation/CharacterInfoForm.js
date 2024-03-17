import LabeledInput from '/incarnation/component/LabeledInput.js';
import Label from '/incarnation/component/Label.js';
import Dropdown from '/incarnation/component/Dropdown.js';
import InputSlider from '/incarnation/component/InputSlider.js';

export default class CharacterInfoForm {
	constructor ({name}) {
		this.crudFormNode = $('#crud-form');
		this.name = name;
		
		this.spriteNameInput = new LabeledInput ({
			parent: this.crudFormNode,
			class: 'ui sprite-name',
			onInput: (e) => {  },
			label: { content: 'Sprite Name' }
		})
		
		this.spriteTagsInput = new LabeledInput ({
			parent: this.crudFormNode,
			class: 'ui sprite-tags',
			onInput: (e) => {  },
			label: { content: 'Tags - Comma separated' }
		})
		
		this.spriteDescriptionInput = new LabeledInput ({
			parent: this.crudFormNode,
			class: 'ui sprite-description',
			onInput: (e) => {  },
			label: { content: 'Description' }
		})
	}
	
	GetJson() {
		return {
			name: this.name,
			spriteName: this.spriteNameInput.getValue (),
			description: this.spriteDescriptionInput.getValue (),
			tags: this.spriteTagsInput.getValue ()
		}
	}
	
	ImportJson ({json}) {
		console.log ('here?', json);
	}
}