/*

    A dropdown item

*/

import Html from './HTML.js'

export default class DropdownOption extends Html {
    constructor (config) {
        // Run HTML object setup
        super (config)

        // Make sure the config has certain properties
        config = this.setConfigDefaults ({
            label: { },
            class: 'ui segment group',
            template: '<option></option>',
            content: 'Option',
            value: 'Option Value'
        })

        // Assign properties from config and render our dom
        this.assignConfig (config);
        this.renderToParent ();

        // Apply content
        this.node [0].innerHTML = this.content
    }
}
