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
	constructor ({name, parent, app, group, animationsNode, facingsNode}) {
		this.active = false;
		this.app = app;
		this.name = name;
		this.parent = parent;
		this.group = group;
		this.animationsNode = animationsNode;
		this.facingsNode = facingsNode;
		this.width = group.width;
		this.height = group.height;
		
		this.button = new Button ({
			parent,
			label: this.name,
			onClick: (e) => { this.app.ChangeGroup (e, this); },
			notes: this.group.notes,
			name: this.name
		})
		
		// ANIMATION SELECTION UI 
		this.animationNotes = {};
		this.animationButtons = [];
		var keys = Object.keys (this.group.animations);
		for (var key in keys)
		{
			var item = this.group.animations [keys [key]];
			var animationButton = new Button ({
				parent: this.animationsNode,
				label: keys [key],
				onClick: (e) => { this.app.ChangeAnimation (e); },
				notes: item.notes,
				name: keys [key]
			})
			
			animationButton.node.addClass('hidden');
			
			this.animationButtons.push (animationButton);
			this.animationNotes [keys [key]] = item.notes
		}
		
		this.animationButtons [0].node.addClass ('active');


		this.facingButtons = [];
		for (var key in this.group.facings) {
			let facingButton = new Button ({
				parent: this.facingsNode,
				label: this.group.facings [key],
				onClick: (e) => { this.app.ChangeFacing (e); },
				name: this.group.facings [key]
			})
			
			facingButton.node.addClass ('hidden');
			this.facingButtons.push (facingButton)
			
		}
		
		this.facingButtons [0].node.addClass ('active');
		
		// Prepare every possible animation
		this.animationButtons.forEach ((animationButton) => {
			this.facingButtons.forEach ((facingButton) => {
				var keyName = this.name + '-' + animationButton.name + '-' + facingButton.name;
				this.app.state.Assign ('frames', { [keyName]: [] });
			});
		});
	}

	SetActive(isActive) {
		if (isActive) {
			this.button.node.addClass ('active');
			this.RemoveClassFromButtons (this.animationButtons, 'hidden');
			this.RemoveClassFromButtons (this.facingButtons, 'hidden');
		}
		else {
			this.button.node.removeClass ('active');
			this.AddClassToButtons (this.animationButtons, 'hidden');
			this.AddClassToButtons (this.facingButtons, 'hidden');
		}
	}
	
	AddClassToButtons (buttons, className) {
		buttons.forEach ((button) => {
			button.node.addClass(className);
		})
	}
	
	RemoveClassFromButtons(buttons, className) {
		buttons.forEach ((button) => {
			button.node.removeClass(className);
		})
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
		groupFieldsNode,
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
				currentGroup: '',
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
		this.groupFieldsNode = groupFieldsNode;
		this.animationsNode = animationsNode;
		this.facingsNode = facingsNode;
		this.canvasContainerNode = canvasContainerNode;
		this.animationTitleNode = animationTitleNode;
		this.animationNotesNode = animationNotesNode;
		this.currentGroup
		
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
		this.groupWidthField = new LabeledInput ({
			parent: this.groupFieldsNode,
			class: 'ui group field input',
			label: { content: 'Group Width', class: 'ui label' },
			onInput: (data) => { }
		})
		
		this.groupWidthField.setValue(this.width);
		
		this.groupHeightField = new LabeledInput ({
			parent: this.groupFieldsNode,
			class: 'ui group field input',
			label: { content: 'Group Height', class: 'ui label' },
			onInput: (data) => { }
		})
		
		this.groupHeightField.setValue(this.height);
		
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
		keys = Object.keys (groups);
		for (var key in keys)
		{
			var item = groups [keys [key]];
			var group = new AnimationGroup ({
				parent: this.groupsNode,
				name: keys [key],
				app: this,
				group: item,
				animationsNode: this.animationsNode,
				facingsNode: this.facingsNode
			});
			
			group.SetActive(false);
			
			this.groupButtons.push (group)
		}
		
		// END OF ANIMATION SELECTION UI
		
		// Setting up Character Creator
		//Set default animation so we can see something if we are loading
		this.state.Set ({
			currentGroup: this.groupButtons [0].name,
			currentAnimation: this.groupButtons [0].animationButtons [0].name,
			currentFacing: this.groupButtons [0].facingButtons [0].name
		});
		
		this.ChangeGroup({}, this.groupButtons[0]);
		this.UpdateTitleAndNotes();
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
		
		this.ChangeGroup({}, this.groupButtons[0]);
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
		this.animationNotesNode.html(this.currentGroup.animationNotes [animName]);
	}
	
	UpdateFrameSelector () {
		var s = this.state.Get();
		var animName = this.GetCurrentAnimationName ();
		this.frameSelector.slider.setMaxValue (Math.max (s.frames [animName].length, 1));
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
		return s.currentGroup + '-' + s.currentAnimation + '-' + s.currentFacing
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
	
	ChangeGroup ({event, node, target}, group) {
		this.state.Set ({currentGroup: group.name});
		this.currentGroup = group;
		
		this.groupButtons.forEach (group => {
			group.SetActive (false);
		})
		
		this.currentGroup.SetActive (true);
		
		this.state.Set ({
			currentAnimation: this.currentGroup.animationButtons [0].name,
			currentFacing: this.currentGroup.facingButtons [0].name,
			currentFrame: 1
		});
		
		this.width = this.currentGroup.width;
		this.height = this.currentGroup.height;
		this.canvas.node.prop ({ width: this.width, height: this.height })		
		this.OnStateChange();
	}
	
	ChangeAnimation ({event, node, target}) {
		this.state.Set ({currentAnimation: target.name});
		
		this.currentGroup.animationButtons.forEach (button => {
			button.node.removeClass ('active');
		});
		
		node.addClass ('active');
		this.state.Set ({currentFrame: 1});
		this.OnStateChange();
	}
	
	ChangeFacing ({event, node, target}) {
		this.state.Set ({currentFacing: target.name});
		
		this.currentGroup.facingButtons.forEach (button => {
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