import CharacterCreator from '/incarnation/CharacterCreator.js';
import CharacterDataManager from '/incarnation/CharacterDataManager.js';

$(window).on('load', () => {
	window.app = new Incarnation(defaultConfig);
});

function Incarnation (defaultConfig) {
	var spriteCreator = new CharacterCreator (defaultConfig);
	var spriteDataManager = new CharacterDataManager ({characterCreatorList: [spriteCreator]});
	return { spriteCreator, spriteDataManager}
}

const defaultConfig = {
	name: 'sprite',
    canvasHeight: 512,
    canvasWidth: 512,
    defaultFrameDuration: 200,
	formNode: $('#form'),
	canvasNode: $('#canvas'),
	groupsNode: $('#group-buttons'),
	animationsNode: $('#animation-buttons'),
	facingsNode: $('#facings-buttons'),
	canvasContainerNode: $('#canvas-container'),
	animationTitleNode: $('#current-animation-label'),
	animationNotesNode: $('#current-animation-notes'),
		
	groups: {
		World: {
			width: 512,
			height: 1024,
			notes: 'The sprites that other people see.',
			animations: {
				Idle: { notes: 'Plays when you are standing still and doing nothing. Loops.' },
				Movement: { notes: 'Plays when you are moving.' },
				Attack: { notes: 'Your bread and butter mouse 1 action. Generally means swinging your weapon. The frame before the last frame is used as the "Acitve" frame. Sprite timings impact gameplay. Generally an attack with a half-second wind-up will be appropriate.' },
				Ability: { notes: 'Your special mouse 2 action. Once you finish setting up your sprites, you will be able to pick an ability to assign in the second stage of character creation.' },
				Hurt: { notes: 'Plays when you receive damage. This is prioritized over idle and movement animations.' },
				KO: { notes: 'In-game this animation will not loop. When you are revived, this animation will play backwards.' },
				Emote1: { notes: 'Optional, plays when you select this character in a pre-game character selection lobby. Can also be performed in-game.' },
				Emote2: { notes: 'Optional, plays in post-game results screen. Can also be performed in-game.' }
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
		},
		FirstPerson: {
			width: 1024,
			height: 512,
			notes: 'Sprites for your first-person view such as bare hands or first-person emotes.',
			animations: {
				BareHandLeftIdle: { notes: 'For when your character has nothing in their left hand.' },
				BareHandRightIdle: { notes: 'For when your character has nothing in their right hand.' },
			},
			facings: [ 'first-person' ],
		},
		Ui: {
			width: 512,
			height: 512,
			notes: 'Sprites for UI elements such as a doom-like face cam.',
			animations: {
				faceIdle: { notes: 'Characters face when nothing is happening' },
				faceHurt: { notes: 'Characters face when taking damage' },
				faceLookLeft: { notes: 'Characters face when player is looking left' },
				faceLookRight: { notes: 'Characters face when player is looking right' },
			},
			facings: [ 'ui' ]
		}
	}
}