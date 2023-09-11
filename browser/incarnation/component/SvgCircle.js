/*

    Manages drawing a cirlce in SVG

*/

import Svg from './SVG.js';

export default class SvgCircle extends Svg {
    constructor (config) {
        super (config);

        config = this.setConfigDefaults ({
            element: 'circle',
            svg: {
                cx: 55, cy: 55, r: 50,
                fill: '#7e3353',
                stroke: '#e7dab5',
                'stroke-width': 2
            }
        })

        this.assignConfig (config);
        this.renderToParent ();
    }
}
