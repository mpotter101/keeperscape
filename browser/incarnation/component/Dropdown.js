/*

    Creates an input field
    Handles changes to input and enter key press

*/

import Html from './HTML.js';
import DropdownOption from './DropdownOption.js';

export default class Input extends Html {
    constructor (config) {
        // Run HTML object setup
        super (config);

        // Make sure the config has certain properties
        config = this.setConfigDefaults ({
            onChange: (val) => { console.log ('Dropdown was changed with a value of: ', val) },
            template: '<select></select>',
            class: 'ui select',
            options: ['one', 'two', 'three'],
        })

        // Assign properties from config and render our dom
        this.assignConfig (config);
        this.renderToParent ();

        this.setOptions (this.options);

        this.node.change ((e) => { this.OnChangeHandler (e); })
    }

    OnChangeHandler (e) {
        this.onChange (this.node.val ());
    }

    getValue () {
        return this.node.val ();
    }

    setOptions (options) {
        this.node [0].innerHTML = '';
        this._options = options;
        this.options = [];
        this._options.forEach ((item, index) => {
            this.options [index] = new DropdownOption ({
                parent: this.node,
                value: item,
                content: item
            })
        })
    }
}
