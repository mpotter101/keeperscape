import Button from '/incarnation/component/Button.js';
import Group from '/incarnation/component/Group.js';
import ImageInput from '/incarnation/component/ImageInput.js';
import InputSlider from '/incarnation/component/InputSlider.js';
import Label from '/incarnation/component/Label.js';
import LabeledInput from '/incarnation/component/LabeledInput.js';
import Canvas from '/incarnation/component/Canvas.js';

class Frame {
	constructor ({image, duration}) {
		this.image = image;
		this.duration = duration;
	}
}

class ExportableState {
	constructor (data) {
		this.state = {...data}
	}
	
	Assign (key, data) {
		this.state [key] = Object.assign (this.state [key], data);
	}
		
	Set (data) {
		this.state = Object.assign (this.state, data);
	}
	
	Get (key) {
		if (key) {
			return this.state [key];
		}
		
		return this.state
	}
	
	ExportData (filename) {
        var jsonFileContent = JSON.stringify (this.state, null, 4);
        this.Download (jsonFileContent, filename, "text/plain");
    }

    // Borrowd from here: http://www.4codev.com/javascript/download-save-json-content-to-local-file-in-javascript-idpx473668115863369846.html
    Download(content, fileName, contentType) {
        const a = document.createElement("a");
        const file = new Blob([content], { type: contentType });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    }
}

export default class CharacterCreator {
	constructor (config) {
		this.state = new ExportableState ({ 
				currentAnimation: '', 
				currentFacing: '',
				currentFrame: 1,
				currentDuration: 200,
				frames: {},
			},
		  	() => { this.Update(); }
		);
		
		// setup constant ui
		this.formNode = $('#form');
		this.canvasNode = $('#canvas');
		this.crudNode = $('#crud-operations');
		this.animationsNode = $('#animation-buttons');
		this.facingsNode = $('#facings-buttons');
		this.canvasContainerNode = $('#canvas-container');
		
		this.canvas = new Canvas ({
            parent: this.canvasContainerNode,
            prop: { width: 512, height: 512 }
        });
		this.ctx = this.canvas.node [0].getContext ('2d');

		// FORM UI
		this.imageLoader = new ImageInput ({
			parent: this.formNode,
			onImage: (data) => { data.value = [data.value]; this.HandleMultipleImages (data); },
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
				onSlider: (data) => { this.ChangeFrame (data) },
				onInput: (data) => { this.ChangeFrame (data) },
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

		// ANIMATION SELECTION UI 
		// create ui based on config
		this.animationButtons = [];
		var keys = Object.keys (config.animations);
		for (var key in keys)
		{
			var item = config.animations [keys [key]];
			this.animationButtons.push (new Button ({
				parent: this.animationsNode,
				label: keys [key],
				onClick: (e) => { this.ChangeAnimation (e); },
				notes: item.notes,
				name: keys [key]
			}))
		}

		this.facingButtons = [];
		for (var key in config.facings) {
			this.facingButtons.push (new Button ({
				parent: this.facingsNode,
				label: config.facings [key],
				onClick: (e) => { this.ChangeFacing (e); },
				name: config.facings [key]
			}))
		}
		// END OF ANIMATION SELECTION UI
		
		// Setting up Character Creator
		//Set default animation so we can see something if we are loading
		this.state.Set ({
			currentAnimation: this.animationButtons [0].name,
			currentFacing: this.facingButtons [0].name
		});
		
		// Prepare every possible animation
		this.animationButtons.forEach ((animationButton) => {
			this.facingButtons.forEach ((facingButton) => {
				var keyName = animationButton.name + '-' + facingButton.name;
				this.state.Assign ('frames', { [keyName]: [] });
			});
		});
	}
	
	RedrawScene() {
		this.ctx.clearRect(0, 0, 512, 512);
		
		var image = this.GetImageInCurrentFrame ();
		
		if (image) {
			this.ctx.drawImage (
				image,
				0,0,
				512, 512
			);	
		}
	}
	
	GetCurrentAnimationName () {
		var s = this.state.Get()
		return s.currentAnimation + '-' + s.currentFacing
	}
	
	GetImageInCurrentFrame () {
		return this.state.Get ().frames [this.GetCurrentAnimationName ()] [this.state.Get().currentFrame - 1].image
	}
	
	ChangeAnimation ({event, node, target}) {
		this.state.Set ({currentAnimation: target.name});
		this.RedrawScene();
	}
	
	ChangeFacing ({event, node, target}) {
		this.state.Set ({currentFacing: target.name});
		this.RedrawScene();
	}
	
	ChangeFrame ({event, node, target, value}) {
		this.state.Set ({currentFrame: value});
		this.RedrawScene();
	}
	
	HandleMultipleImages ({event, node, target, value}) {
		var state = this.state.Get();
		var newFrames = [];
		
		value.forEach ((img) => {
			newFrames.push ( new Frame ({image: img, duration: state.currentDuration}) )
		});
		
		state.frames [this.GetCurrentAnimationName ()] = newFrames
		this.state.Assign ('frames', state.frames);
		
		this.frameSelector.slider.setMaxValue (newFrames.length);
		this.frameSelector.setValue (1);
		this.state.Set ({currentFrame: 1});
		this.RedrawScene();
	}
	
}