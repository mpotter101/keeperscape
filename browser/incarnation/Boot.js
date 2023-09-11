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
    animationCategories: {
        'Idle': {
            'face-right': { },
            'face-left': { },
            'face-right-away': { optional: true },
            'face-left-away': { optional: true },
        },
        'Movement': {
            'face-right': { scrollDir: 'right up' },
            'face-left': { scrollDir: 'left up' },
            'face-right-away': {scrollDir: 'down right', optional: true},
            'face-left-away': { scrollDir: 'down left', optional: true },
        },
        'Combat': {
            'basic-attack': {},
            'cast-ability': {},
            'hurt': {},
            '(knockedout-start)': { optional: true },
            'knockedout-loop': {},
        }
    }
});
