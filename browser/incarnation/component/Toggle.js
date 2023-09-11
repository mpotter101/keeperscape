/*

    Create and manage the rendering of a toggle switch

*/

import Html from './HTML.js'

export default class Toggle extends Html {
    constructor (config) {
        super (config);

        config = this.setConfigDefaults ({
            onClick: (data) => { console.log ('Toggle clicked', data) },
            on: false,
        });

        this.assignConfig (config);
        this.renderToParent ();
    }

    render (parent) {
        this.template = `
        <label class="switch">
            <input type="checkbox">
            <span class="slider round"></span>
        </label>
        `

        this._render (parent);

        this.inputNode = (this.node.find ('input'));
        this.inputNode.click ((event) => { this.clickHandler (event); })
    }

    clickHandler (event) {
        this.on = !this.on;

        this.onClick ({
            target: this,
            node: this.node,
            event: event
        })
    }
}
