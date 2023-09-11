/*

    Manages an input and a slider
    Maintains their values to be the same

*/

import Html from './HTML.js'
import Input from './Input.js'
import  Slider from './Slider.js'
import Label from './Label.js'

export default class InputSlider extends Html {
    constructor (config) {
        // Run HTML object setup
        super (config);

        // Make sure the config has certain properties
        config = this.setConfigDefaults ({
            onInput: (data) => { console.log ('User typed in input: ', data) },
            onSlider: (data) => { console.log ('User moved slider: ', data) },
            onEnter: (data) => { console.log ('User pressed enter in input: ', data) },
            template: '<div><div class="ui header"></div><div class="ui input-slider"></div>',
            class: 'ui input-slider',
            label: {
                content: 'Hello World',
                class: 'ui label'
            },
            slider: {},
            input: {}
        })

        // Assign properties from config and render our dom
        this.assignConfig (config);
        this.renderToParent ();

        // Create child objects
        config.label.parent = this.node.find ('.ui.header');
        this.label = new Label (config.label)

        config.slider.parent = this.node.find ('.ui.input-slider'),
        config.slider.onInput = (data) => { this.sliderHandler (data); };
        this.slider = new Slider (config.slider)

        config.input.parent = this.node.find ('.ui.input-slider'),
        config.input.onInput = (data) => { this.inputHandler (data); };
        config.input.onEnter = (data) => { this.enterHandler (data); };
        this.input = new Input (config.input)
    }

    sliderHandler (event) {
        this._changed = 'slider';

        this.syncFields ();
        this.onSlider ({
            target: this,
            node: this.slider.node,
            value: this.slider.getValue (),
            event: event
        })
    }

    inputHandler (event) {
        this._changed = 'input';

        this.syncFields ();
        this.onInput ({
            target: this,
            node: this.input.node,
            value: this.input.getValue (),
            event: event
        })
    }

    enterHandler (event) {
        this._changed = 'input';

        this.syncFields ();
        this.onEnter ({
            target: this,
            node: this.input.node,
            value: this.input.getValue (),
            event: event
        })
    }

    syncFields () {
        if (this._changed == 'slider') {
            this.input.setValue ( this.slider.getValue () );
        }
        else { this.slider.setValue ( this.input.getValue () ); }

        this._changed = 'clean'
    }

    setValue (value) {
        this.input.setValue (value);
        this.slider.setValue (value)
    }

    getValue () { return this.input.getValue () }
}
