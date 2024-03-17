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

class AnimationGroup {
	// Takes parent, notes, animations, and facings
	// handles hiding/showing its related buttons
	constructor () {}
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
}

export default class CharacterCreator {
	constructor ({
		name,
		canvasHeight,
		canvasWidth,
		defaultFrameDuration,
		formNode,
		canvasNode,
		groupsNode,
		animationsNode,
		facingsNode,
		canvasContainerNode,
		animationTitleNode,
		animationNotesNode,
		groups,
		facings,
		animations,
	}) {
		this.state = new ExportableState ({ 
				name,
				currentAnimation: '', 
				currentFacing: '',
				currentFrame: 1,
				currentDuration: defaultFrameDuration,
				frames: {},
			}
		);
		
		// setup constant ui
		this.formNode = formNode;
		this.canvasNode = canvasNode;
		this.groupsNode = groupsNode;
		this.animationsNode = animationsNode;
		this.facingsNode = facingsNode;
		this.canvasContainerNode = canvasContainerNode;
		this.animationTitleNode = animationTitleNode;
		this.animationNotesNode = animationNotesNode;
		
		this.canvas = new Canvas ({
            parent: this.canvasContainerNode,
            prop: { width: canvasWidth, height: canvasHeight }
        });
		this.ctx = this.canvas.node [0].getContext ('2d');
		this.clock = new THREE.Clock ();
		this.clock.start ();
		this.playing = false;
		this.frameTimer = 0;
		this.width = canvasWidth;
		this.height = canvasHeight;

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

		// create ui based on config
		var keys;
		
		// GROUP SELECTION UI
		this.groupButtons = [];
		this.groupNotes = {};
		keys = Object.keys (groups);
		for (var key in keys)
		{
			var item = groups [keys [key]];
			this.groupButtons.push (new Button ({
				parent: this.groupsNode,
				label: keys [key],
				onClick: (e) => { this. },
				notes: item.notes,
				name: keys [key]
			})
		}
		
		
		// ANIMATION SELECTION UI 
		this.animationNotes = {};
		this.animationButtons = [];
		keys = Object.keys (animations);
		for (var key in keys)
		{
			var item = animations [keys [key]];
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
		for (var key in facings) {
			this.facingButtons.push (new Button ({
				parent: this.facingsNode,
				label: facings [key],
				onClick: (e) => { this.ChangeFacing (e); },
				name: facings [key]
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
	
	ImportJson ({json}) {
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
		this.ctx.clearRect(0, 0, this.width, this.height);
		
		var image = this.GetImageInCurrentFrame ();
		
		if (image) {
			this.ctx.drawImage (
				image,
				0,0,
				this.width, this.height
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
	
	ChangeGroup ({event, node, target}) {
		sthis.state.Set ({currentGroup: target.name});
		
		this.groupButtons.forEach (button => {
			button.node.removeClass ('active');
		})
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