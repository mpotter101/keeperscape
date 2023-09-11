/*

    Manages rendering of an svg box element

*/

import Svg from './SVG.js';

export default class SvgBox extends Svg {
    constructor (config) {
        super (config);

        config = this.setConfigDefaults ({
            element: 'rect',
            svg: {
                x: 10, y: 10,
                height: 25, width: 25,
                fill: 'white',
                stroke: 'red',
                'stroke-width': 2,
            }
        })

        this.assignConfig (config);
        this.renderToParent ();
    }
}
