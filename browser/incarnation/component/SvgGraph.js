/*

    Handles visualization of data

*/

import Svg from './SVG.js';

import SvgBox from './SvgBox.js';
import SvgLine from './SvgLine.js';
import SvgLabel from './SvgLabel.js';

import SvgAxis from './SvgAxis.js';
import SvgGrid from './SvgGrid.js';

export default class SvgGraph extends Svg {
    constructor (config) {
        // Run svg object constructor
        super (config);

        // Make sure the config has certain properties
        config = this.setConfigDefaults ({
            element: 'g',
            axisPadding: 13,
            xAxis: {
                bottom: {
                    titlePadding: 65,
                    title: {
                        innerHTML: 'Advanced D&D Classes',
                        svg: {}
                    },
                    type: 'x',
                    minValue: 1,
                    maxValue: 5,
                    labels: [
                        'Fighter',
                        'Wizard',
                        'Rogue',
                        'Dwarf',
                        'Elf'
                    ],
                    svg: {}
                }
            },
            yAxis: {
                left: {
                    titlePadding: 40,
                    title: {
                        innerHTML: 'Play Time (hrs)',
                        svg: {}
                    },
                    rotateLabels: false,
                    type: 'y',
                    minValue: 0,
                    maxValue: 100,
                    svg: {}
                },
                right: {
                    titlePadding: 90,
                    title: {
                        innerHTML: 'Monsters Defeated',
                        svg: {}
                    },
                    rotateLabels: false,
                    type: 'y',
                    minValue: 1,
                    maxValue: 9,
                    labels: [
                        'none', 'a few', 'several',
                        'plenty', 'bunches', 'hundreds',
                        'countless', 'literaly all',
                    ],
                    svg: {}
                },
            },
            svg: {
                width: 150,
                height: 150,
                x: 60, y: 50,
            },
            box: {
                svg: {
                    fill: 'black',
                    stroke: '#bebbc1',
                    'stroke-width': 2
                }
            },
            grid: {
                segments: 5,
                svg: {
                    fill: '#bebbc1',
                    stroke: '#bebbc1',
                    'stroke-width': 1,
                }
            }
        });

        // Assign config and render to parent
        this.assignConfig (config);
        this.renderToParent ();

        // Modify sub-component configs to work as proper configs

        // Create child objects

            // Create background
        this._box = this.box;
        this._box.parent = this.node;
        this._box.svg.x = this.svg.x;
        this._box.svg.y = this.svg.y;
        this._box.svg.width = this.svg.width;
        this._box.svg.height = this.svg.height;
        this.box = new SvgBox (this._box);

            // Create grid
        this._grid = this.grid;
        this._grid.parent = this.node
        this._grid.svg.width = this.svg.width;
        this._grid.svg.height = this.svg.height;
        this._grid.svg.x = this.svg.x;
        this._grid.svg.y = this.svg.y;
        this.grid = new SvgGrid (this._grid);

            // Create Axes
        this._yAxis = this.yAxis;
        this._xAxis = this.xAxis;

        if (this._yAxis) { this.createYAxes (); }
        if (this._xAxis) { this.createXAxes (); }
    }

    findXOfValue (value, axis) {
        if (!axis) { axis = 'bottom' }

        let ax = this._xAxis [axis];

        // Compare the value against the max possible value of this axis
        // to get a percentage
        let percent = (value - ax.minValue) / (ax.maxValue - ax.minValue);

        // Apply that percentage to the width of the graph and add the x offset
        // to get the final x coordinate
        let width =  Number (this.box.node.attr ('width'));
        let x = ( width * percent ) + Number (this.node.attr ('x'));

        if (isNaN (x)) { x = width + Number (this.node.attr ('x')); }

        return x;
    }
    findValueOfX (x, axis) {}

    findYOfValue (value, axis) {
        if (!axis) { axis = 'left' }

        let ax = this._yAxis [axis];

        // Compare the value against the max possible value of this axis
        // to get a percentage
        let percent = (value - ax.minValue) / (ax.maxValue - ax.minValue);

        // Apply that percentage to the width of the graph and add the x offset
        // to get the final x coordinate
        let height = Number (this.box.node.attr ('height'));
        let y = height - ( height * percent ) + Number (this.node.attr ('y'));

        if (isNaN (y)) { y = height + Number (this.node.attr ('y')); }

        return y;
    }
    findValueOfY (y, axis) {}

    createXAxes () {
        let titleX, titleY;

        if (this._xAxis.bottom) {
            // X Axis Bottom
            // Assign parent to the axis
            this._xAxis.bottom.parent = this.node;

            // Adjust for the size of a cell so labels are centered
            this._xAxis.bottom.svg.x = this.svg.x + ((this.svg.width / this._grid.segments) / 2 - 10);
            this._xAxis.bottom.svg.y = this.svg.y + this.svg.height + this.axisPadding;
            this._xAxis.bottom.svg.width = this.svg.width;
            this._xAxis.bottom.svg.height = this.svg.height;

            // Adjust the title of the axis to be in a sensible place
            this._xAxis.bottom.title.svg.x = 0;
            this._xAxis.bottom.title.svg.y = 0;
            titleX = this.svg.x + (this.svg.width / 2)
            titleY = this.svg.y + this.svg.height + this.axisPadding + this._xAxis.bottom.titlePadding;
            this._xAxis.bottom.title.svg ['transform'] = 'translate(' + titleX + ' ' + titleY + ')';
            this._xAxis.bottom.title.svg ['text-anchor'] = 'middle';

            // Create the actual axis object
            this.xAxis.bottom = new SvgAxis (this._xAxis.bottom);
        }
    }

    createYAxes () {
        let titleX, titleY;

        if (this._yAxis.left) {
            // Y Axis Left
            // Assign a parent to the axis
            this._yAxis.left.parent = this.node;

            this._yAxis.left.svg.y = this.svg.y - ((this.svg.height / this._grid.segments) / 2 - 10);
            this._yAxis.left.svg.x = this.svg.x - this.axisPadding;
            this._yAxis.left.svg.width = this.svg.width;
            this._yAxis.left.svg.height = this.svg.height;
            this._yAxis.left.svg ['text-anchor'] = 'end';

            // Adjust the title of the axis to be in a sensible place
            this._yAxis.left.title.svg.x = 0;
            this._yAxis.left.title.svg.y = 0;
            titleX = this.svg.x - this.axisPadding - this._yAxis.left.titlePadding;
            titleY = this.svg.y + (this.svg.height / 2);
            this._yAxis.left.title.svg ['transform'] = 'translate(' + titleX + ' ' + titleY + ') rotate(270)';
            this._yAxis.left.title.svg ['text-anchor'] = 'middle';

            // Create the actual axis object
            this.yAxis.left = new SvgAxis (this._yAxis.left);
        }

        if (this._yAxis.right) {
            // Y Axis Right
            // Assign parent to the axis
            this._yAxis.right.parent = this.node;

            // Make sure our labels are centered to each cell
            this._yAxis.right.svg.x = this.svg.x + this.svg.width + this.axisPadding;
            this._yAxis.right.svg.y = this.svg.y - ((this.svg.height / this._grid.segments) / 2 - 10);
            this._yAxis.right.svg.width = this.svg.width;
            this._yAxis.right.svg.height = this.svg.height;
            // Adjust the title of the axis to be in a sensible place
            this._yAxis.right.title.svg.x = 0;
            this._yAxis.right.title.svg.y = 0;
            titleX = this.svg.x + this.svg.width + this.axisPadding + this._yAxis.right.titlePadding;
            titleY = this.svg.y + (this.svg.height / 2);
            this._yAxis.right.title.svg ['transform'] = 'translate(' + titleX + ' ' + titleY + ') rotate(90)';
            this._yAxis.right.title.svg ['text-anchor'] = 'middle';

            // Create the actual axis object
            this.yAxis.right = new SvgAxis (this._yAxis.right);
        }
    }
}
