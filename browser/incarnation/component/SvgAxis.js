/*

    Draws a line between two coordinates
    Renders labels and can plot items
    based on given values instead of
    coordinates

*/

import Svg from './SVG.js';

import SvgLabel from './SvgLabel.js';

export default class SvgAxis extends Svg {
    constructor (config) {
        super (config);

        // Make sure the config has certain properties
        config = this.setConfigDefaults ({
            element: 'g',
            minValue: 0,
            maxValue: 100,
            labels: [],
            labelCount: 5,
            labelPadding: 5,
            labelOffset: 5,
            type: 'x',
            rotateLabels: true,
            scientificNotation: true,
            notationDecimals: 1,
            title: {
                innerHTML: 'Axis',
                svg: {
                    x: 10, y: 25
                }
            },
            svg: {
                x: 10, y: 10,
                height: 100,
                width: 100,
                fill: '#bebbc1',
                stroke: '#bebbc1',
                'stroke-width': 1,
            }
        });

        // Assign config and render to parent
        this.assignConfig (config);
        this.renderToParent ();

        // If no labels are given, use label count to auto generate
        // labels between  the min and max values
        if (!this.labels.length) { this.generateLabels (); }

        // Create a series of labels across either the width or height
        // Based on which type of axis we are making

        switch (this.type) {
            case 'x': this.createXAxis (); break;
            case 'y': this.createYAxis (); break;
            default: console.warn ('Invalid axis type given. Accepted values: x, y');
        }

        // Create title of axis
        this.title.parent = this.node;
        this.title = new SvgLabel (this.title)
    }

    createXAxis () {
        let increment = this.svg.width / this.labels.length;
        let x, y;
        let transform
        let offset = this.labelOffset

        // Create value labels
        this.labels.forEach ((item, index) => {
            transform = null;
            x = (increment * index) + this.svg.x + offset
            y = this.svg.y + this.labelPadding;

            if (this.rotateLabels) {
                transform = 'translate(' + x + ' ' + y + ') rotate(45)'
            }
            else { transform = 'translate(' + x + ' ' + y + ')' }

            this.labels [index] = new SvgLabel ({
               innerHTML: item,
               parent: this.node,
               svg: {
                   x: 0, y: 0,
                   transform
               }
            })
        });

        console.log (this.labels)
    }

    createYAxis () {
        let increment = this.svg.height / this.labels.length;
        let x, y;
        let transform
        let offset = this.labelOffset

        // Create value labels
        this.labels.forEach ((item, index) => {
            transform = null;
            x = this.svg.x + this.labelPadding;
            y = (increment * (this.labels.length - index)) + this.svg.y - this.labelOffset

            if (this.rotateLabels) {
                transform = 'translate(' + x + ' ' + y + ') rotate(45)'
            }
            else { transform = 'translate(' + x + ' ' + y + ')' }

            this.labels [index] = new SvgLabel ({
               innerHTML: item,
               parent: this.node,
               svg: {
                   x: 0, y: 0,
                   transform
               }
            })
        });
    }

    generateLabels () {
        let endLabel = this.maxValue;

        let end, exponent, increment, index, value;

        increment = (this.maxValue - this.minValue) / this.labelCount;
        index = 0;
        end = this.labelCount - 1;

        while (index < end) {
            value = (increment * index) + this.minValue;

            if (this.scientificNotation) { value = value.toExponential (this.notationDecimals); }

            this.labels.push ( value );

            index++
        }

        if (this.scientificNotation) { endLabel = endLabel.toExponential (this.notationDecimals); }
        this.labels.push (endLabel);
    }
}
