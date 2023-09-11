/*

    A single tab meant to hold content for a tabular menu

*/

import Html from './HTML.js'

export default class Tab extends Html {
    constructor (config) {
        super (config);

        config = this.setConfigDefaults ({
            class: 'ui tab',
            prop: {
                'data-tab': 'tab'
            },
            name: 'tab',
            contentParent: document.body,
            buttonParent: document.body
        })

        this.assignConfig (config);
    }

    getName () { return this.name; }
}
