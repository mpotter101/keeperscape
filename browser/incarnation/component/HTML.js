/*

    Stores basic information that all html components use

*/

export default class Html {
    constructor (config) {
        if (!config) { config = {} }
        this._config = config;

        config = this.setConfigDefaults ({
            parent: document.body,
        })

        this.template = '<div></div>';
        this.node = $ (this.template);
        this.parent = $ (config.parent);
        this.attr = {};
        this.prop = {};
        this.css = {};
        this.class = '';
    }

    assignConfig (config) { Object.assign (this, config) }

    _render (parent) {
        if (this._rendered) {
            console.warn ('Element tried to render more than once.'); console.trace ();
            return;
        }

        // convert template html into a node
        this.node = $ (this.template);


        // assign attributes
        // Attributes are assigned first since they must be strings
        this.node.attr (this.attr);

        // assign properties
        // prop and attr can assign the same things to an element,
        // but prop allows for non-string values.
        this.node.prop (this.prop);

        // Apply inline styling
        this.node.css (this.css);

        // add styling classes
        this.node.addClass (this.class);

        // Append object to parent
        this.parent.append (this.node [0]);

        this._rendered = true;
    }

    render (parent) { this._render (parent); }
    renderToParent () { this.render (this.parent) };

    setConfigDefaults (defaults, assign) {
        let config, item, key;

        config = this._config;

        if (!config) { config = {} }

        for (key in defaults) {
            item = defaults [key];

            if ( !(key in config) ) {
                config [key] = item;
            }
        }

        return config
    }
}
