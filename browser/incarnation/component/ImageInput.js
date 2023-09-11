import Html from './HTML.js';

export default class ImageInput extends Html {
    constructor(config) {
        // Run HTML object setup
        super (config);

        // Make sure the config has certain properties
        config = this.setConfigDefaults ({
            template: '<div></div>',
            onImage: (data) => { console.log ("Image detected!") },
            onMultiImageUpload: (data) => { console.log ("Multiple images detected for upload! " + data.value) }
        })

        // Assign properties from config and render our dom
        this.assignConfig (config);
        this.renderToParent ();

        var fileElement = document.createElement('input');
        fileElement.type = 'file';
        this.reader = new FileReader();
        this.reader.onload = (e) => { this.ImageHandler (e); };
        this.node = $(fileElement);
        this.fileOrder = [];
        this.uploadedFiles = [];
        this.node [0].addEventListener ('change', (e) => {
            if (this.reader.readyState != 0) { this.reader.abort(); }

            var files = event.target.files;
            if (files.length > 1) {
                this.fileOrder = [];
                this.uploadedFiles = [];

                for (var index = 0; index < files.length; index++) {
                    var file = files [index];

                    if(!file.type.match('image')) {
                        continue;
                    }

                    this.fileOrder.push (file.name);
                    this.LoadImageFromMultipleImageEvent (file, index);
                }

                console.log (this.fileOrder);
            }
            else {
                this.LoadImageFromEvent (e);
            }
        }, false);
    }

    ImageHandler (e) {
        var img = new Image();
        img.src = this.reader.result;
        img.onload = () => {
            this.onImage ({
                target: this,
                event: e,
                node: this.node,
                value: img
            });
            this.node [0].value = null;
        }
    }

    MultiImageHandler (e, reader, index) {
        var img = new Image();
        var i = index;

        img.src = reader.result;
        img.onload = () => {
            this.PlaceImageInMultiImageArray (img, i);
            this.node [0].value = null;
        }
    }

    PlaceImageInMultiImageArray (img, index) {
        this.uploadedFiles [index] = img;

        var loadedCount = 0;
        this.uploadedFiles.forEach ((img) => {
            if (img) { loadedCount++; }
        })

        console.log ('Images loaded: ' + loadedCount + ' Images to load: ' + this.fileOrder.length);

        if (loadedCount == this.fileOrder.length) {
            this.onMultiImageUpload({
                target: this,
                event: {},
                node: this.node,
                value: this.uploadedFiles
            })
        }
    }

    LoadImageFromEvent (e) {
        this.reader.readAsDataURL(e.target.files[0]);
    }

    LoadImageFromMultipleImageEvent (file, index) {
        var reader = new FileReader ();
        var i = index;
        reader.onload = (e) => { this.MultiImageHandler (e, reader, i); }

        reader.readAsDataURL (file);
    }
}
