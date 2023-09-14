import CharacterCreator from '/incarnation/CharacterCreator.js';
import CharacterDataManager from '/incarnation/CharacterDataManager.js';

$(window).on('load', () => {
	window.app = new Incarnation(worldCharacterConfig, firstPersonConfig);
});

function Incarnation (worldCharacterConfig, firstPersonConfig) {
	var worldCharacterCreator = new CharacterCreator (worldCharacterConfig);
	var firstPersonCharacterCreator = new CharacterCreator (firstPersonConfig);
	var characterDataManager = new CharacterDataManager ({characterCreatorList: [worldCharacterCreator, firstPersonCharacterCreator]});
	return { worldCharacterCreator, firstPersonCharacterCreator, characterDataManager}
}
	
const firstPersonConfig = {
	name: 'first-person-sprites',
	canvasHeight: 512,
	canvasWidth: 512,
	defaultFrameDuration: 200,
	formNode: $('#fps-form'),
	canvasNode: $('#fps-canvas'),
	animationsNode: $('#fps-animation-buttons'),
	facingsNode: $('#fps-facings-buttons'),
	canvasContainerNode: $('#fps-canvas-container'),
	animationTitleNode: $('#fps-current-animation-label'),
	animationNotesNode: $('#fps-current-animation-notes'),
	facings: [ 'first-person' ],
	animations: {
		Idle: { notes: 'Plays while standing still or moving. Being able to see what your character is holding is recommended.' },
		Attack: { notes: 'Your normal attack from the first-person perspective. The frame timings should align with the world sprite for the best effect.' },
		Ability: { notes: 'What using your ability looks like from first person. Frame timings should align with respective world sprite animation for best effect.' },
		Hurt: { notes: 'Plays when you get hurt while idle or moving.' },
		KO: { notes: 'Plays when you are KO\'d. Plays in reverse when you are revived.' },
		Emote1: { notes: 'Optional, Your emote1 from the first-person perspective. Only seen in game by you.' },
		Emote2: { notes: 'Optional, your emote2 from the first-person perspective. Only seen in game by you.' },
	}
}

const worldCharacterConfig = {
	name: 'world-sprites',
    canvasHeight: 512,
    canvasWidth: 512,
    defaultFrameDuration: 200,
	formNode: $('#form'),
	canvasNode: $('#canvas'),
	animationsNode: $('#animation-buttons'),
	facingsNode: $('#facings-buttons'),
	canvasContainerNode: $('#canvas-container'),
	animationTitleNode: $('#current-animation-label'),
	animationNotesNode: $('#current-animation-notes'),
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
        Idle: { notes: 'Plays when you are standing still and doing nothing. Loops.' },
        Movement: { notes: 'Plays when you are moving.' },
        Attack: { notes: 'Your bread and butter mouse 1 action. Generally means swinging your weapon. The frame before the last frame is used as the "Acitve" frame. Sprite timings impact gameplay. Generally an attack with a half-second wind-up will be appropriate.' },
		Ability: { notes: 'Your special mouse 2 action. Once you finish setting up your sprites, you will be able to pick an ability to assign in the second stage of character creation.' },
		Hurt: { notes: 'Plays when you receive damage. This is prioritized over idle and movement animations.' },
        KO: { notes: 'In-game this animation will not loop. When you are revived, this animation will play backwards.' },
        Emote1: { notes: 'Optional, plays when you select this character in a pre-game character selection lobby. Can also be performed in-game.' },
        Emote2: { notes: 'Optional, plays in post-game results screen. Can also be performed in-game.' }
    }
}