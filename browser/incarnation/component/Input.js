/*

    Creates an input field
    Handles changes to input and enter key press

*/

import Html from './HTML.js';

export default class Input extends Html {
    constructor (config) {
        // Run HTML object setup
        super (config);

        // Make sure the config has certain properties
        config = this.setConfigDefaults ({
            onInput: (data) => { console.log ('User typed in input: ', data) },
            onEnter: (data) => { console.log ('User pressed enter in input: ', data) },
            template: '<input>',
            class: 'ui input',
        })

        // Assign properties from config and render our dom
        this.assignConfig (config);
        this.renderToParent ();

        // Create event handlers
        this.node.on ('input', (event) => { this.inputHandler (event) })
        this.node.on ('keypress', (event) => { if (event.which != 13) { return; } this.enterHandler (event) })
    }

    inputHandler (event) {
        this.onInput ({
            target: this,
            event: event,
            node: this.node,
            value: this.node [0].value
        })
    }

    enterHandler (event) {
        this.onEnter ({
            target: this,
            event: event,
            node: this.node,
            value: this.node [0].value
        })
    }

    getValue () {
        let val = this.node.prop ('value');

        if ( !isNaN (Number (val)) ) { val = Number (val) }

        return val;
    }

    setValue (value) {
        this.node.prop ( { value } )
    }

    getIsCheckedAsBoolean () {
        if (this.node [0].type == "checkbox") {
            return this.node [0].checked
        }
    }
}
