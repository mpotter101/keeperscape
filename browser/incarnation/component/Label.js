/*

    Creates a label comprised of three parts: prefix, content, and suffix
    Holds helper functions for making modifications easy

*/

import Html from './HTML.js'

export default class Label extends Html {
    constructor (config) {
        // Run HTML object setup
        super (config);

        // Make sure the config has certain properties
        config = this.setConfigDefaults ({
            onClick: (data) => { console.log ('clicked', data) },
            class: 'ui label',
            prefix: '',
            content: 'Hello world!',
            suffix: ''
        });

        // Assign properties from config and render our dom
        this.assignConfig (config);
        this.renderToParent ();
    }

    render (parent) {
        this.template = `
            <div>
                <div class="prefix">${this.prefix}</div>
                <div class="content">${this.content}</div>
                <div class="suffix">${this.suffix}</div>
            </div>
        `

        this._render (parent);

        this.prefixNode = this.node.find ('.prefix');
        this.contentNode = this.node.find ('.content');
        this.suffixNode = this.node.find ('.suffix');
    }

    setPrefix (prefix) { this.prefixNode.html (prefix); }
    setContent (content) { this.contentNode.html (content); }
    setSuffix (suffix) { this.suffixNode.html (suffix); }

    getPrefix () { return this.prefixNode.html () }
    getContent () { return this.contentNode.html () }
    getSuffix () { return this.suffixNode.html () }
}
