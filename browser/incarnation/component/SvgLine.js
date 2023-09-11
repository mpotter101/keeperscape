/*

    Manages the rendering of a SVG line between two points

*/

import Svg from './SVG.js';

export default class SvgLine extends Svg {
    constructor (config) {
        super (config);

        config = this.setConfigDefaults ({
            element: 'line',
            svg: {
                x1: 5, x2: 50,
                y1: 50, y2: 10,
                stroke: 'white',
                'stroke-width': 2,
                width: 2
            }
        })

        this.assignConfig (config);
        this.renderToParent ();
    }

    // Move the whole line
    moveBy (x, y) {
        if (isNaN (x)) { x = 0 }
        if (isNaN (y)) { y = 0 }

        this.svg.x1 += x;
        this.svg.x2 += x;
        this.svg.y1 += y;
        this.svg.y2 += y;

        this.updateNode ();
    }

    // Set the draw coordinates of the line
    setPosition (x1, x2, y1, y2) {
        if (isNaN (x1)) { x1 = this.svg.x1; }
        if (isNaN (x2)) { x1 = this.svg.x2; }
        if (isNaN (y1)) { x1 = this.svg.y1; }
        if (isNaN (y2)) { x1 = this.svg.y2; }

        this.svg.x1 = x1;
        this.svg.x2 = x2;
        this.svg.y1 = y1;
        this.svg.y2 = y2;

        this.updateNode ();
    }
}
