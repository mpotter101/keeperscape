/*

    Draws a grid of lines over an area
    Manages updating the look of that grid

*/

import Svg from './SVG.js';

import SvgLine from './SvgLine.js';

export default class SvgGrid extends Svg {
    constructor (config) {
        super (config);

        config = this.setConfigDefaults ({
            element: 'g',
            segments: 3,
            svg: {
                width: 100,
                height: 100,
                x: 10, y: 10
            }
        })

        this.assignConfig (config);
        this.renderToParent ();

        // Figure out some coordinates to make child creation easier
        this.top = this.svg.y;
        this.bottom = this.svg.y + this.svg.height;
        this.left = this.svg.x;
        this.right = this.svg.x + this.svg.width;

        // Create child objects
        this.createRows ();
        this.createColumns ();
    }

    createRows () {
        // Rows only need to space out their Y coordinates
        this.rows = [];

        let end, height, increment, index, line, width, x1, x2, y1, y2;
        x1 = this.left;
        x2 = this.right;

        increment = this.svg.height / this.segments;

        index = 1;
        end = this.segments + 1;
        while (index < end) {
            y1 = index * increment + this.top;
            y2 = y1;

            line = new SvgLine ({
                parent: this.node,
                svg: {
                    fill: this.svg.fill,
                    stroke: this.svg.stroke,
                    'stroke-width': this.svg ['stroke-width'],
                    x1, x2, y1, y2
                }
            })

            this.rows.push (line);

            index++;
        }
    }

    createColumns () {
        // Columns only need their x coordinate moved
        this.columns = [];

        let end, height, increment, index, line, width, x1, x2, y1, y2;
        y1 = this.top;
        y2 = this.bottom;

        increment = this.svg.width / this.segments;

        index = 1;
        end = this.segments + 1;
        while (index < end) {
            x1 = index * increment + this.left;
            x2 = x1;

            line = new SvgLine ({
                parent: this.node,
                svg: {
                    fill: this.svg.fill,
                    stroke: this.svg.stroke,
                    'stroke-width': this.svg ['stroke-width'],
                    x1, x2, y1, y2
                }
            });

            this.columns.push (line);

            index++;
        }
    }
}
