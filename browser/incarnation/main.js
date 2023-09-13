import Button from '/incarnation/component/Button.js';
import Group from '/incarnation/component/Group.js';
import ImageInput from '/incarnation/component/ImageInput.js';
import InputSlider from '/incarnation/component/InputSlider.js';
import Label from '/incarnation/component/Label.js';
import LabeledInput from '/incarnation/component/LabeledInput.js';

$(window).on('load', () => {
	window.app = new Incarnation(config);
});

function Incarnation (config) {
	// setup constant ui
	this.formNode = $('#form');
	this.canvasNode = $('#canvas');
	this.crudNode = $('#crud-operations');
	this.animationsNode = $('#animation-buttons');
	this.facingsNode = $('#facings-buttons');
	
	// FORM UI
	this.imageLoader = new ImageInput ({
		parent: this.formNode,
		onImage: (data) => { this.HandleImage (data); },
		onMultiImageUpload: (data) => { this.HandleMultipleImages (data); }
	});

	this.imageLoader.node.prop ('multiple', 'multiple');
	
	this.uploadFrameButton = new Button ({
		parent: this.formNode,
		label: 'Upload Frames',
		onClick: (e) => { this.imageLoader.node.click (); }
	})
	
	this.maxFrameCountInput = new LabeledInput ({
		parent: this.formNode,
		class: 'ui max-frame-count',
		onInput: (data) => { this.HandleMaxFrameCountChange (data); },
		label: { content: 'Frame Count' }
	})
	
	this.frameSelector = new InputSlider ({
            parent: this.formNode,
            class: 'ui frame-selector',
            onSlider: (data) => { this.HandleCurrentFrameChange (data) },
            onInput: (data) => { this.HandleCurrentFrameChange (data) },
            label: {
                class: 'ui label',
                content: 'Frame Selection'
            },
            slider: {
                prop: {
                    min: 1,
                    max: 3,
                    value: 1
                }
            }
        });

        this.frameSelector.input.setValue (1);

	this.frameDurationInput = new LabeledInput ({
		parent: this.formNode,
		class: 'ui frame-duration',
		label: { content: 'Frame 1 Duration(ms)', class: 'ui label' },
		onInput: (data) => { this.HandleMatchFrameDurations (data); }
	})

	this.frameDurationInput.setValue (200); //ms
	
	this.setAllFrameDurationsButton = new Button ({
		parent: this.formNode,
		label: 'Set All Frame Durations To Match This Frame',
		onClick: (e) => { 
			this.HandleMatchFrameDurations();
		}
	});

	this.playPauseButton = new Button ({
		parent: this.formNode,
		label: 'Play',
		onClick: (e) => { this.HandlePlayPause (e); }
	})
	// END OF FORM UI
	
	// CRUD OPERATION UI
	this.characterNameInput = new LabeledInput ({
		parent: this.crudNode,
		class: 'ui character-name',
		onInput: (data) => {  },
		label: { content: 'Character Name' }
	})
	
	this.exportFileButton = new Button ({
		parent: this.crudNode,
		label: 'Export JSON File',
		onClick: (e) => {  }
	})
	
	this.importFileButton = new Button ({
		parent: this.crudNode,
		label: 'Import JSON File',
		onClick: (e) => {  }
	})
	
	this.saveToProfileButton = new Button ({
		parent: this.crudNode,
		label: 'Save to Profile',
		onClick: (e) => {  }
	})
	// END OF CRUD OPERATION UI 
	
	// create ui based on config
	this.animationButtons = [];
	var keys = Object.keys (config.animations);
	console.log (keys);
	for (var key in keys)
	{
		var item = config.animations [keys [key]];
		this.animationButtons.push  (new Button ({
			parent: this.animationsNode,
			label: keys [key],
			onClick: (e) => {  },
			notes: item.notes,
			name: keys [key]
		}))
	}
	
	this.facingButtons = [];
	for (var key in config.facings) {
		this.facingButtons.push (new Button ({
			parent: this.facingsNode,
			label: config.facings [key],
			onClick: (e) => {  },
			name: config.facings [key]
		}))
	}
	
}
	

const config = {
    exportFileExtension: "json",
    canvasHeight: 512,
    canvasWidth: 512,
    defaultFrameDuration: 200,
    background: {
        scrollSpeed: 3.3
    },
	facings: [
		'towards',
		'towards-left',
		'left',
		'away-left',
		'away',
		'away-right',
		'right',
		'towards-right'
	],
    animations: {
        Idle: {
			notes: 'Plays when you are standing still and doing nothing. Loops.'
		},
        Movement: {
			notes: 'Plays when you are moving.'
		},
        Attack: {
			notes: 'Your bread and butter mouse 1 action. Generally means swinging your weapon. The frame before the last frame is used as the "Acitve" frame. Sprite timings impact gameplay. Generally an attack with a half-second wind-up will be appropriate.'
		},
		'Ability': {
			notes: 'Your special mouse 2 action. Once you finish setting up your sprites, you will be able to pick an ability to assign in the second stage of character creation.'
		},
		'Hurt': {
			notes: 'Plays when you receive damage. This is prioritized over idle and movement animations.'
		},
        'KO': {
			notes: 'In-game, this animation will not loop. When you are revived, this animation will play backwards.'
        },
        'Emote1': {
			notes: 'Optional, plays when you select this character in a pre-game character selection lobby. Can also be performed in-game.'
        },
        'Emote2': {
			notes: 'Optional, plays in post-game results screen. Can also be performed in-game.'
        }
    }
}