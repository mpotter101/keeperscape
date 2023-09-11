import Html from './HTML.js';

export default class TextFileInput extends Html {
    constructor(config) {
        // Run HTML object setup
        super (config);

        // Make sure the config has certain properties
        config = this.setConfigDefaults ({
            template: '<div></div>',
            onFile: (data) => { console.log ("Text File detected!") },
        })

        // Assign properties from config and render our dom
        this.assignConfig (config);
        this.renderToParent ();

        var fileElement = document.createElement('input');
        fileElement.type = 'file';
        this.reader = new FileReader();
        this.reader.onload = (e) => { this.FileHandler (e); };
        this.node = $(fileElement);
        this.fileOrder = [];
        this.uploadedFiles = [];
        this.node [0].addEventListener ('change', (e) => {
            if (this.reader.readyState != 0) { this.reader.abort(); }

            if(e.target.files [0].type.match('image')) {
                console.log ("Attempted image upload with text file input.")
                return;
            }

            this.LoadFileFromEvent (e);
        }, false);
    }

    FileHandler (e) {
        this.onFile ({
            target: this,
            event: e,
            node: this.node,
            value: this.reader.result
        });
    }

    LoadFileFromEvent (e) {
        this.reader.readAsText(e.target.files[0]);
    }
}
