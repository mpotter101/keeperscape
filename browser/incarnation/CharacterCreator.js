import * as THREE from 'three';
import Button from '/incarnation/component/Button.js';
import Group from '/incarnation/component/Group.js';
import ImageInput from '/incarnation/component/ImageInput.js';
import InputSlider from '/incarnation/component/InputSlider.js';
import Label from '/incarnation/component/Label.js';
import LabeledInput from '/incarnation/component/LabeledInput.js';
import Canvas from '/incarnation/component/Canvas.js';
import TextFileInput from '/incarnation/component/TextFileInput.js';
import Dropdown from '/incarnation/component/Dropdown.js';

class Frame {
	constructor ({image, duration, src}) {
		this.image = image;
		this.duration = duration;
		this.src = src;
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
        this.Download (jsonFileContent, filename + '.json', "text/plain");
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
				characterName: '',
			},
		  	() => { this.Update(); }
		);
		
		// setup constant ui
		this.formNode = $('#form');
		this.canvasNode = $('#canvas');
		this.crudButtonsNode = $('#crud-buttons');
		this.crudFormNode = $('#crud-form');
		this.animationsNode = $('#animation-buttons');
		this.facingsNode = $('#facings-buttons');
		this.canvasContainerNode = $('#canvas-container');
		this.animationTitleNode = $('#current-animation-label');
		this.animationNotesNode = $('#current-animation-notes');
		
		this.canvas = new Canvas ({
            parent: this.canvasContainerNode,
            prop: { width: 512, height: 512 }
        });
		this.ctx = this.canvas.node [0].getContext ('2d');
		this.clock = new THREE.Clock ();
		this.clock.start ();
		this.playing = false;
		this.frameTimer = 0;

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
						max: 1,
						value: 1
					}
				}
			});

			this.frameSelector.input.setValue (1);

		this.frameDurationInput = new LabeledInput ({
			parent: this.formNode,
			class: 'ui frame-duration',
			label: { content: 'Frame 1 Duration(ms)', class: 'ui label' },
			onInput: (data) => { this.ChangeCurrentFrameDuration (data); }
		})

		this.frameDurationInput.setValue (200); //ms

		this.setAllFrameDurationsButton = new Button ({
			parent: this.formNode,
			label: 'Set All Frame Durations To Match This Frame',
			onClick: (e) => { this.HandleMatchFrameDurations(); }
		});

		this.playPauseButton = new Button ({
			parent: this.formNode,
			label: 'Play',
			onClick: (e) => { this.HandlePlayPause (e); }
		})
		// END OF FORM UI

		// CRUD OPERATION UI
		this.characterNameInput = new LabeledInput ({
			parent: this.crudFormNode,
			class: 'ui character-name',
			onInput: (e) => {  },
			label: { content: 'Character Name' }
		})
		
		this.characterSizeLabel = new Label ({
			parent: this.crudFormNode,
			content: 'Character Size'
		})
		
		this.characterSizeDropdown = new Dropdown ({
			parent: this.crudFormNode,
			onChange: (e) => { console.log ('don\'t forget to collect character info into exported state') },
			class: 'ui character-size',
			options: ['Medium - sprite will be same size in game', 'Large - sprite will be 1/3rd bigger game', 'small - sprite will be 1/3rd smaller in game']
		});
		
		this.characterNameInput.setValue ('Vagrant');
		this.state.Set ({characterName: 'Vagrant'});

		this.exportFileButton = new Button ({
			parent: this.crudButtonsNode,
			label: 'Export JSON File',
			onClick: (e) => { this.state.ExportData (this.state.Get().characterName) }
		})

		this.dataImporter = new TextFileInput ({
            parent: $(document.body),
            onFile: (data) => { this.ImportJson (data); }
        })
		
		this.importFileButton = new Button ({
			parent: this.crudButtonsNode,
			label: 'Import JSON File',
			onClick: (e) => { this.dataImporter.node.click (); }
		})

		this.saveToProfileButton = new Button ({
			parent: this.crudButtonsNode,
			label: 'Save to Profile',
			onClick: (e) => {  }
		})
		
		this.loadFromProfileButton = new Button ({
			parent: this.crudButtonsNode,
			label: 'Load from Profile',
			onClick: (e) => {  }
		})
		// END OF CRUD OPERATION UI 

		// create ui based on config
		// ANIMATION SELECTION UI 
		this.animationNotes = {};
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
			
			this.animationNotes [keys [key]] = item.notes
		}
		
		this.animationButtons [0].node.addClass ('active');

		this.facingButtons = [];
		for (var key in config.facings) {
			this.facingButtons.push (new Button ({
				parent: this.facingsNode,
				label: config.facings [key],
				onClick: (e) => { this.ChangeFacing (e); },
				name: config.facings [key]
			}))
		}
		
		this.facingButtons [0].node.addClass ('active');
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
		
		this.UpdateTitleAndNotes();
		this.OnStateChange();
		this.Update();
	}
	
	ImportJson ({value}) {
		var json = JSON.parse (value);
		
		this.state.Set (json);
		
		// setup frames
		var s = this.state.Get();
		var keys = Object.keys (s.frames);
		keys.forEach (key => {
			var frame = s.frames [key];
			frame.forEach (cell => {
				cell.image = $('<img />') [0]
				cell.image.src = cell.src;
			});
		});
		
		var animBtn = this.animationButtons [0];
		var faceBtn = this.facingButtons [0];
		this.ChangeAnimation ({node: animBtn.node, target: animBtn, value: animBtn.name});
		this.ChangeFacing ({node: faceBtn.node, target: faceBtn, value: faceBtn.name});
		this.UpdateFrameSelector();
		this.RedrawScene();
	}
	
	Update () {
		if (this.hasError) { return; }
		
		requestAnimationFrame (() => {this.Update ()});
		
		try {
			var deltaTime = this.clock.getDelta ();
			
			if (this.playing) {
				this.frameTimer += deltaTime * 1000; //convert to ms
				var frame = this.GetCurrentFrame ();
			
				if (frame && frame.duration <= this.frameTimer) {
					var s = this.state.Get();
					var nextFrame = s.currentFrame + 1 > this.GetFrameCountOfCurrentAnimation () ? 1 : s.currentFrame + 1;
					this.ChangeFrame ({value: nextFrame}); 
					this.frameTimer = 0;
				}
			}
		}
		catch (err) {
			this.hasError = err;	
		}	
	}
	
	OnStateChange () {
		this.UpdateTitleAndNotes();
		this.UpdateFrameSelector();
		this.RedrawScene();
	}
	
	UpdateTitleAndNotes () {
		var s = this.state.Get ();
		var animName = s.currentAnimation;
		var facingName = s.currentFacing;
		
		this.animationTitleNode.html(animName + ' ' + facingName);
		this.animationNotesNode.html(this.animationNotes [animName]);
	}
	
	UpdateFrameSelector () {
		var s = this.state.Get();
		var animName = this.GetCurrentAnimationName ();
		
		this.frameSelector.slider.setMaxValue (s.frames [animName].length);
		this.frameSelector.setValue (1);
		this.frameSelector.label.setContent ('Frame Selection : Frame Count (' + s.frames [animName].length + ')');
	}
	
	RedrawScene() {
		var s = this.state.Get();
		this.ctx.clearRect(0, 0, 512, 512);
		
		var image = this.GetImageInCurrentFrame ();
		
		if (image) {
			this.ctx.drawImage (
				image,
				0,0,
				512, 512
			);	
		}
		
		this.frameDurationInput.label.setContent ('Frame ' + s.currentFrame + ' Duration(ms)');
	}
	
	GetCurrentAnimationName () {
		var s = this.state.Get()
		return s.currentAnimation + '-' + s.currentFacing
	}
	
	GetFrameCountOfCurrentAnimation () {
		var s = this.state.Get();
		var animName = this.GetCurrentAnimationName ();
		return s.frames [animName].length
	}
	
	GetCurrentFrame () {
		var s = this.state.Get();
		var currentAnimation = this.GetCurrentAnimationName ();
		var frameIndex = s.currentFrame - 1;
		
		if (s.frames [currentAnimation] && s.frames [currentAnimation] [frameIndex]) {
			return s.frames [currentAnimation] [frameIndex]
		}
	}
	
	GetImageInCurrentFrame () {
		var frame = this.GetCurrentFrame ();
		
		if (frame && frame.image) { return frame.image }
	}
	
	ChangeAnimation ({event, node, target}) {
		this.state.Set ({currentAnimation: target.name});
		
		this.animationButtons.forEach (button => {
			button.node.removeClass ('active');
		});
		
		node.addClass ('active');
		this.state.Set ({currentFrame: 1});
		this.OnStateChange();
	}
	
	ChangeFacing ({event, node, target}) {
		this.state.Set ({currentFacing: target.name});
		
		this.facingButtons.forEach (button => {
			button.node.removeClass ('active');
		});
		
		node.addClass ('active');
		this.state.Set ({currentFrame: 1});
		this.OnStateChange();
	}
	
	ChangeFrame ({event, node, target, value}) {
		this.state.Set ({currentFrame: value});
		
		var frame = this.GetCurrentFrame ();
		
		if (frame.duration != undefined) {
			this.frameDurationInput.setValue (frame.duration);
			this.frameSelector.setValue (value);
		}
		
		this.RedrawScene();
	}
	
	ChangeCurrentFrameDuration ({event, node, target, value}) {
		var currentFrame = this.GetCurrentFrame ();
		
		// due to how javascript objects work, this should update the object in the original state
		if (currentFrame) {
			currentFrame.duration = value;
		}
	}
	
	HandleMultipleImages ({event, node, target, value}) {
		var state = this.state.Get();
		var newFrames = [];
		
		value.forEach ((img) => {
			newFrames.push ( new Frame ({
				image: img, 
				duration: state.currentDuration,
				src: img.src
			}) )
		});
		
		state.frames [this.GetCurrentAnimationName ()] = newFrames
		this.state.Assign ('frames', state.frames);
		this.state.Set ({currentFrame: 1});
		
		this.OnStateChange();
	}
	
	HandlePlayPause () {
		this.playing = !this.playing;
		
		var labelContent = this.playing ? 'Pause' : 'Play'
		this.playPauseButton.node.html (labelContent);
	}
	
	HandleMatchFrameDurations() {
		var s = this.state.Get();
		var animName = this.GetCurrentAnimationName();
		var currentFrames = s.frames [animName];
		var frameToMatch = this.GetCurrentFrame ();
		
		if (frameToMatch) {
			currentFrames.forEach (frame => {
				frame.duration = frameToMatch.duration;
			});
		}
		
		this.OnStateChange();
	}
	
}