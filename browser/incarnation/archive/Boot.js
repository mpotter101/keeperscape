// import files needed here
//import App from './Kitchen-Sink'
import App from '/incarnation/App.js'

// Create the App
// Pass in schema for app here
window.Incarnation = new App ({
    stageQuerySelector: "#stage",
    exportFileName: "entity-animation-data.json",
    canvasHeight: 512,
    canvasWidth: 512,
    defaultFrameDuration: 200,
    background: {
        scrollSpeed: 3.3
    },
    animationNotes: {
        'Idle': 'Plays when you are standing still and doing nothing. Loops.',
        'Movement': 'Plays when you are moving.',
        'Attack': 'Your bread and butter mouse 1 action. Generally means swinging your weapon. The frame before the last frame is used as the "Acitve" frame. Sprite timings impact gameplay. Generally an attack with a half-second wind-up will be appropriate.',
        'Ability': 'Your special mouse 2 action. Once you finish setting up your sprites, you will be able to pick an ability to assign in the second stage of character creation.',
        'Hurt': 'Plays when you receive damage. This is prioritized over idle and movement animations.',
        'KO': 'In-game, this animation will not loop. When you are revived, this animation will play backwards.',
        'Emote1': 'Optional, plays when you select this character in a pre-game character selection lobby. Can also be performed in-game.',
        'Emote2': 'Optional, plays in post-game results screen. Can also be performed in-game.',
    },
    animationCategories: {
        'Idle': {
            'face-towards': { },
            'face-towards-left': { },
            'face-left': { },
            'face-away-left': { },
            'face-away': { },
            'face-away-right': { },
            'face-right': { },
            'face-towards-right': { },
        },
        'Movement': {
            'face-towards': { },
            'face-towards-left': { },
            'face-left': { },
            'face-away-left': { },
            'face-away': { },
            'face-away-right': { },
            'face-right': { },
            'face-towards-right': { },
        },
        'Attack': {
            'face-towards': { },
            'face-towards-left': { },
            'face-left': { },
            'face-away-left': { },
            'face-away': { },
            'face-away-right': { },
            'face-right': { },
            'face-towards-right': { },
        },
		'Ability': {
			'face-towards': { },
            'face-towards-left': { },
            'face-left': { },
            'face-away-left': { },
            'face-away': { },
            'face-away-right': { },
            'face-right': { },
            'face-towards-right': { },
		},
		'Hurt': {
		    'face-towards': { },
            'face-towards-left': { },
            'face-left': { },
            'face-away-left': { },
            'face-away': { },
            'face-away-right': { },
            'face-right': { },
            'face-towards-right': { },
		},
        'KO': {
            'face-towards': { },
            'face-towards-left': { },
            'face-left': { },
            'face-away-left': { },
            'face-away': { },
            'face-away-right': { },
            'face-right': { },
            'face-towards-right': { },
        },
        'Emote1': {
            'face-towards': { },
            'face-towards-left': { },
            'face-left': { },
            'face-away-left': { },
            'face-away': { },
            'face-away-right': { },
            'face-right': { },
            'face-towards-right': { },
        },
        'Emote2': {
            'face-towards': { },
            'face-towards-left': { },
            'face-left': { },
            'face-away-left': { },
            'face-away': { },
            'face-away-right': { },
            'face-right': { },
            'face-towards-right': { },
        }
    }
});
