/*

    Creates a slider.
    Runs a callback when the user changes something

*/

import Html from './HTML.js'

export default class Slider extends Html {
    constructor (config) {
        // Run HTML object setup
        super (config);

        // Make sure the config has certain properties
        config = this.setConfigDefaults ({
            onInput: (data) => { console.log ('Input', data) },
            prop: {
                min: 1,
                max: 100,
                value: 50
            },
            template: '<input type="range">'
        });

        // Assign properties from config and render our dom
        this.assignConfig (config);
        this.renderToParent ();

        this.node.on ('input', (event) => { this.inputHandler (event) })
    }

    inputHandler (event) {
        this.onInput ({
            target: this,
            node: this.node,
            event: event,
            value: Number (this.node [0].value)
        })
    }

    getValue () { return Number ( this.node.prop ('value') ) }

    setValue (value) {
        value = value.toString ()
        this.node.prop ( { value } )
    }

    setMaxValue (value) {
        value = value.toString ()
        this.node.prop ( { max: value } )
    }

    getMaxValue () {
        return Number(this.node.prop ('max'));
    }

    setMinValue (value) {
        value = value.toString ()
        this.node.prop ( { min: value } )
    }
}
