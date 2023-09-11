/*

    Allows labels to be created inside of an svg element

*/

import Svg from './SVG.js'

export default class SvgLabel extends Svg {
    constructor (config) {
        super (config);

        config = this.setConfigDefaults ({
            element: 'text',
            innerHTML: 'Hello World!',
            svg: {
                x: 0,
                y: 20,
            },
        })

        this.assignConfig (config);
        this.renderToParent ();
    }    
}
