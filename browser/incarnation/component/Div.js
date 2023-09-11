/*

    A simple div

*/
import Html from './HTML.js'

export default class Div extends Html {
    constructor (config) {
        // Run HTML object setup
        super (config)

        // Make sure the config has certain properties
        config = this.setConfigDefaults ({
            template: '<div></div>',
        })

        // Assign properties from config and render our dom
        this.assignConfig (config);
        this.renderToParent ();
    }
}
