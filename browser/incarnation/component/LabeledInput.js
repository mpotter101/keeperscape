/*

    Creates an input with a label header

*/

import Html from './HTML.js'
import Input from './Input.js'
import Label from './Label.js'

export default class LabeledInput extends Html {
    constructor (config) {
        // Run HTML object setup
        super (config);

        // Make sure the config has certain properties
        config = this.setConfigDefaults ({
            onInput: (data) => { console.log ('User typed in input: ', data) },
            onEnter: (data) => { console.log ('User pressed enter in input: ', data) },
            template: '<div><div class="ui header"></div><div class="ui label-input"></div>',
            class: 'ui labeled-input',
            label: {
                content: 'Hello World',
                class: 'ui label'
            },
            input: {}
        })

        // Assign properties from config and render our dom
        this.assignConfig (config);
        this.renderToParent ();

        // Create child objects
        config.label.parent = this.node.find ('.ui.header');
        this.label = new Label (config.label)

        config.input.parent = this.node.find ('.ui.label-input'),
        config.input.onInput = (data) => { this.inputHandler (data); };
        config.input.onEnter = (data) => { this.enterHandler (data); };
        this.input = new Input (config.input)
    }

    inputHandler (event) {
        this.onInput ({
            target: this,
            node: this.input.node,
            value: this.input.getValue (),
            event: event
        })
    }

    enterHandler (event) {
        this.onEnter ({
            target: this,
            node: this.input.node,
            value: this.input.getValue (),
            event: event
        })
    }

    setValue (value) { this.input.setValue (value); }

    getValue () { return this.input.getValue () }

    setChecked (value) { this.input.node.prop ('checked', value) }

    getIsCheckedAsBoolean () {
        if (this.input.node [0].type == "checkbox") {
            return this.input.node [0].checked
        }
    }
}
