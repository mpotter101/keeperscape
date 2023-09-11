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
            template: '<textarea></textarea>',
            class: 'ui textarea',
        })

        // Assign properties from config and render our dom
        this.assignConfig (config);
        this.renderToParent ();
    }
}
