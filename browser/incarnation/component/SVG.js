/*

    Serves as the base component for SVG elements

*/

import Html from './HTML.js';

export default class Svg extends Html {
    constructor (config) {
        // Run HTML Object Setup
        super (config);


        // Modify properties to better suit use in SVG
        this.element = 'g';
        this.innerHTML = ''
        this.svg = {
            height: '100px',
            width: '100px',
            x: 10,
            y: 10,
        };
    }

    _render (parent) {
        if (this._rendered) {
            console.warn ('Element tried to render more than once.'); console.trace ();
            return;
        }

        // convert template html into a node
        this.node = $ (
            document.createElementNS (
                'http://www.w3.org/2000/svg',
                this.element
            )
        );

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

        this.updateNode ();

        this.node.html (this.innerHTML)

        this._rendered = true;
    }

    _getNamespaceForAttribute (attr) {
        switch (attr) {
            case 'some-property':
                return 'http://www.w3.org/1999/xlink'
            default:
                return null;
        }
    }

    updateNode () {
        let item, key, list, ns;
        list = this.svg;
        for (key in list) {
            item = list [key];

            ns = this._getNamespaceForAttribute (key);
            this.node [0].setAttributeNS (ns, key, item)
        }
    }
}
