/*

    Creates a button object and its own html
    Takes a callback for when it is clicked

*/

import Html from './HTML.js'

export default class Button extends Html {
    constructor (config) {
        // Run HTML object setup
        super (config);

        // Make sure the config has certain properties
        config = this.setConfigDefaults ({
            onClick: (data) => { console.log ('clicked', data) },
            class: 'ui button',
            label: 'Click Me!'
        });

        // Assign properties from config and render our dom
        this.assignConfig (config);
        this.renderToParent ();

        // Assign event handlers
        this.node.click ((event) => { this.clickHandler (event); })
    }

    // default click hanlder if nothing is given
    clickHandler (event) {
        this.onClick ({
            node: this.node,
            target: this,
            event: event
        })
    }

    // Overriding render function to update template as well
    render (parent) {
        // Update template
        this.template = '<div>' + this.label + '</div>';

        // Call original render function
        this._render (parent);
    }
}
