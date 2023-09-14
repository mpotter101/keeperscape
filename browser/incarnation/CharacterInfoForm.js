import LabeledInput from '/incarnation/component/LabeledInput.js';
import Label from '/incarnation/component/Label.js';
import Dropdown from '/incarnation/component/Dropdown.js';
import InputSlider from '/incarnation/component/InputSlider.js';

export default class CharacterInfoForm {
	constructor ({name}) {
		this.crudFormNode = $('#crud-form');
		this.name = name;
		
		this.characterNameInput = new LabeledInput ({
			parent: this.crudFormNode,
			class: 'ui character-name',
			onInput: (e) => {  },
			label: { content: 'Character Name' }
		})
		
		this.characterNameInput.setValue ('Vagrant');
		
		this.characterDescriptionInput = new LabeledInput ({
			parent: this.crudFormNode,
			class: 'ui character-description',
			onInput: (e) => {  },
			label: { content: 'Character Description - This is just for fun. Other people will be able to see this.' }
		})
		
		this.characterSize = new InputSlider ({
				parent: this.crudFormNode,
				class: 'ui character-height-selector',
				onSlider: (data) => {  },
				onInput: (data) => {  },
				label: {
					class: 'ui label',
					content: 'Character Height - Adjusts your world sprite size and first person camera height'
				},
				slider: {
					prop: {
						min: 0.6,
						max: 1.6,
						value: 1,
						step: 0.1
					}
				}
			});
		
		this.characterSize.setValue (1);
		
		this.attackStyleDropdown = new Dropdown ({
			class: 'ui attack-dropdown',
			parent: this.crudFormNode,
			options: ['Unarmed', 'Melee', 'Ranged'],
		})
		
		this.attackDamageTypeDropdown = new Dropdown ({
			class: 'ui damage-dropdown',
			parent: this.crudFormNode,
			options: ['Mundane', 'Energy', 'Divine'],
		})
		
		this.abilityDropdown = new Dropdown ({
			class: 'ui ability-dropdown',
			parent: this.crudFormNode,
			options: ['Block', 'Charge', 'Heavy Ranged Attack', 'Hide In Shadows', 'Sprint', 'Charm'],
		})
	}
	
	GetJson() {
		return {
			name: this.name,
			characterName: this.characterNameInput.getValue()
		}
	}
	
	ImportJson ({json}) {
		
	}
}