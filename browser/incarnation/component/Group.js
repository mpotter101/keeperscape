/*

    Groups elements together under a div
    Can easily add or remove elements

*/

import Html from './HTML.js'
import Label from './Label.js'

export default class Group extends Html {
    constructor (config) {
        // Run HTML object setup
        super (config)

        // Make sure the config has certain properties
        config = this.setConfigDefaults ({
            label: { },
            class: 'ui segment group'
        })

        // Assign properties from config and render our dom
        this.assignConfig (config);
        this.renderToParent ();

        // Collect needed information to work
        this.content = this.node.find ('div.content');

        // Create child objects
        config.label.parent = this.node.find ('div.label > div > label');
        this.label = new Label (config.label);

    }

    render (parent) {
        this.template = `
            <div>
                <div class="label">
                    <div>
                        <label></label>
                    </div>
                </div>
                <div class="content">
                </div>
            </div>
        `;

        this._render (parent);
    }

    addContent (node) {
        this.content.append (node);
    }

    removeContent (node) {
        this.content.remove (node);
    }
}
