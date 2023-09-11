/*

    Creates a canvas element

*/
import Html from './HTML.js'

export default class Canvas extends Html {
    constructor (config) {
        // Run HTML object setup
        super (config)

        // Make sure the config has certain properties
        config = this.setConfigDefaults ({
            template: '<canvas></canvas>',
            prop: {
                width: '800',
                height: '600'
            }
        })

        // Assign properties from config and render our dom
        this.assignConfig (config);
        this.renderToParent ();
    }

    GetContext () {
        return this.node [0].getContext ('2d');
    }

    ToDataURL (imageType) {
        return this.node [0].toDataURL (imageType);
    }
}
