import CharacterCreator from '/incarnation/CharacterCreator.js';

$(window).on('load', () => {
	window.app = new Incarnation(config);
});

function Incarnation (config) {
	return new CharacterCreator (config);
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
			notes: 'In-game this animation will not loop. When you are revived, this animation will play backwards.'
        },
        'Emote1': {
			notes: 'Optional, plays when you select this character in a pre-game character selection lobby. Can also be performed in-game.'
        },
        'Emote2': {
			notes: 'Optional, plays in post-game results screen. Can also be performed in-game.'
        }
    }
}