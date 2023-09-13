// Import objects
import Button from './component/Button';
import Label from './component/Label';
import Slider from './component/Slider';
import Input from './component/Input';
import InputSlider from './component/InputSlider';
import Group from './component/Group';
import Tabber from './component/Tabber';

import SvgArea from './component/SvgArea';
import SvgLabel from './component/SvgLabel';
import SvgLine from './component/SvgLine';
import SvgBox from './component/SvgBox';
import SvgGraph from './component/SvgGraph';

// Variables shared across instances

// The starting point for the application
export default class App {
    constructor (config) {
        console.log ('App is starting! Config:', config)

        console.log ('-----------')
        console.log  ('HTML Elements')

        console.log ('Button')
        console.log ('\tCreating bare-minimum button')
        let button = new Button ({
            parent: $ ('#left-sidebar-body')
        })

        console.log ('\tCreating complex button')
        let complexButton = new Button ({
            label: 'Complex Button',
            class: 'ui button circular',
            parent: $ ('#left-sidebar-body'),
            prop: { dataValue: 43 },
            onClick: (data) => { this.onComplexButtonClick (data) }
        })

        // console.log ('Rendering a button twice?')
        // complexButton.render ()

        console.log ('Label')
        console.log ('\tCreating bare-minimum label')
        let label = new Label ({
            parent: $ ('#left-sidebar-body')
        })

        console.log ('\tCreating complex label')
        let complexLabel = new Label ({
            parent: $ ('#left-sidebar-body'),
            prefix: 'Distooonce:',
            content: 10000,
            suffix: '<sup>BU</sup>',
            class: 'ui label complex',
        })

        console.log ('\tTesting label to make sure it updates its dom')
        complexLabel.setPrefix ('Distance:');
        complexLabel.setContent (10);
        complexLabel.setSuffix ('<sub>AU</sub>');

        console.log ('Slider')
        console.log ('\tCreating bare-minimum slider')
        let slider = new Slider ({
            parent: $ ('#left-sidebar-body'),
        })

        console.log ('\tTesting setting slider value')
        slider.setValue (99);
        slider.setValue ('2');

        console.log ('\tTesting getting slider value')
        console.log ('\t', slider.getValue ())

        console.log ('\tCreating complex slider')
        let complexSlider = new Slider ({
            parent: $ ('#left-sidebar-body'),
            prop: {
                max: 1000,
                min: 0.001,
                step: 0.0001,
                value: 100,
                id: 'complex-slider'
            },
            class: 'ui slider complex',
            onInput: (data) => { this.onComplexSliderInput (data) }
        })

        console.log ('Input')
        console.log ('\tCreate bare-minimum input')
        let input = new Input ({
            parent: $ ('#left-sidebar-body'),
        })

        console.log ('\tCreating complex input')
        let complexInput = new Input ({
            parent: $ ('#left-sidebar-body'),
            prop: {
                type: 'number',
                value: 100,
                placeholder: 'Number Field'
            },
            class: 'ui input complex',
            onInput: (data) => { data.type = 'input'; this.onComplexInputInput (data); },
            onEnter: (data) => { data.type = 'enter'; this.onComplexInputInput (data); }
        })

        console.log ('\tTesting Input field getters and setters')
        complexInput.setValue (123);
        console.log ('\t', complexInput.getValue ())
        input.setValue ('Zero');
        console.log ('\t', input.getValue ())

        console.log ('Input Slider');
        console.log ('\tCreating bare-minimum input slider');
        let inputSlider = new InputSlider ({
            parent: $ ('#left-sidebar-body'),
        })

        let complexInputSlider = new InputSlider ({
            parent: $ ('#left-sidebar-body'),
            class: 'ui input-slider complex',
            label: {
                content: 'Rabbits',
                suffix: '<sub>(Ru)</sub>'
            },
            input: {
                prop: {
                    value: 25
                }
            },
            slider: {
                prop: {
                    min: 10,
                    max: 100000,
                    step: 0.001,
                    value: 50
                }
            },
            onInput: (data) => { this.onComplexInputSliderInput (data); },
            onEnter: (data) => { this.onComplexInputSliderInput (data); },
            onSlider: (data) => { this.onComplexInputSliderInput (data); },
        })

        console.log ('\t', 'Testing setting and getting input slider values')
        inputSlider.setValue (88);
        complexInputSlider.setValue (3404.867);
        console.log ('\t', inputSlider.getValue ());
        console.log ('\t', complexInputSlider.getValue ());

        console.log ('Group')
        console.log ('\t', 'Creating bare-minimum group')
        let group = new Group ({
            parent: $ ('#left-sidebar-body')
        })

        console.log ('\t', 'Create complex group')
        let complexGroup = new Group ({
            parent: $ ('#left-sidebar-body'),
            class: 'ui segment group complex',
            label: {
                class: 'ui complex label',
                prefix: 'Cool:',
                content: 'Group',
                suffix: '<sub>(YO)</sub>'
            }
        })

        console.log ('\t', 'Testing adding content to groups')
        let groupInputSlider = new InputSlider ()
        groupInputSlider.setValue (50);
        complexGroup.addContent (groupInputSlider.node);

        console.log ('Tabber')
        console.log ('\t', 'Creating a bare-minimum tabber')
        let tabber = new Tabber ({
            parent: $ ('#right-sidebar-body')
        });

        console.log ('\t', 'Creating a complex tabber')
        let complexTabber = new Tabber ({
            parent: $ ('#right-sidebar-body'),
            tabs: [
                'Graph',
                'SVG',
            ],
            class: 'ui complex tabber',
            activeTab: 1,
            onTabChange: (data) => { this.onComplexTabberChange (data); },
        });

        console.log ('Adding content to tabber');
        let tabbedInputSlider = new InputSlider ();
        complexTabber.addContent ('Graph', tabbedInputSlider.node);
        tabbedInputSlider.setValue (25);

        console.log ('End of HTML elements');
        console.log ('-----------');
        console.log ('SVG Elements');

        console.log ('Svg Area');
        console.log ('\t','Creating bare-minimum svg element')
        let svgArea = new SvgArea ();
        complexTabber.addContent ('SVG', svgArea.node);

        console.log ('\t','Creating a complex svg element')
        let complexSvgArea = new SvgArea ({
            class: 'ui complex svg',
            svg: {
                width: '100%',
                height: 250,
            },
        })
        complexTabber.addContent ('SVG', complexSvgArea.node);

        console.log ('Svg Label');
        console.log ('\t', 'Creating a bare-minimum Svg Label');
        let svgLabel = new SvgLabel ({
            parent: complexSvgArea.node
        });

        console.log ('\t', 'Creating a complex Svg Label');
        let complexSvgLabel = new SvgLabel ({
            parent: complexSvgArea.node,
            svg: {
                x: 50,
                y: 150
            },
            innerHTML: 'This is a custom svg label object',
            class: 'ui complex svg label'
        });

        console.log ('Svg Line');
        console.log ('\t', 'Creating bare-minimum Svg Line');
        let svgLine = new SvgLine ({
            parent: complexSvgArea.node,
        });

        console.log ('\t', 'Creating complex svg line');
        let complexSvgLine = new SvgLine ({
            parent: complexSvgArea.node,
            class: 'ui complex line',
            svg: {
                x1: 50, x2: 250,
                y1: 155, y2: 165,
                'stroke-width': 2,
                stroke: 'white',
            }
        });

        console.log ('\t', 'Setting position of line to above complex svg label');
                                //  x1   x2  y1   y2
        complexSvgLine.setPosition (50, 230, 125, 125);
        console.log ('\t', 'Moving complex line by 50 units');
        complexSvgLine.moveBy (50, 50);

        console.log ('Svg Box');
        console.log ('\t', 'Creating bare-minimum svg box');
        let svgBox = new SvgBox ({
            parent: complexSvgArea.node,
        });

        console.log ('\t', 'Creating complex svg box');
        let complexSvgBox = new SvgBox ({
            parent: complexSvgArea.node,
            svg: {
                x: 10, y: 220,
                width: 295, height: 10,
                fill: '#4b0a31',
                stroke: '#feddff',
                'stroke-width': 3
            }
        });

        console.log ('Svg Graph');
        console.log ('\t', 'Creating a bare-minimum svg graph');
        let graphSvgArea = new SvgArea ({
            svg: {
                width: '100%',
                height: 300
            }
        })

        complexTabber.addContent ('Graph', graphSvgArea.node);
        complexTabber.changeTab ('Graph')

        let graph = new SvgGraph ({
            parent: graphSvgArea.node
        });

        // Open the right sidebar
        $ ('#right-sidebar-button').click ();
    }

    onComplexButtonClick (data) {
        console.log ('App is handling complex button click.')
        console.log ('Data:', data)
        console.log (data.node.prop ('dataValue'))
    }

    onComplexSliderInput (data) {
        console.log ('App is handling complex slider input');
        console.log ('Data:', data);
        console.log (data.target.getValue ())
    }

    onComplexInputInput (data) {
        console.log ('App is handling complex input input');
        console.log ('Data:', data);
    }

    onComplexInputSliderInput (data) {
        console.log ('App is handling complex input-slider input')
        console.log ('Data:', data);
    }

    onComplexTabberChange (data) {
        console.log ('App is handling complex tabber change')
        console.log ('Data:', data);
    }
}
