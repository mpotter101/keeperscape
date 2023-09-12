import Html from '/incarnation/component/HTML.js';

import Button from '/incarnation/component/Button.js';
import CanvasManager from '/incarnation/CanvasManager.js';
import Group from '/incarnation/component/Group.js';
import ImageInput from '/incarnation/component/ImageInput.js';
import InputSlider from '/incarnation/component/InputSlider.js';
import Label from '/incarnation/component/Label.js';
import LabeledInput from '/incarnation/component/LabeledInput.js';

export default class AnimationForm extends Html {
    constructor ({
        parent,
        frameCount,
        frameDuration,
        canvasHeight,
        canvasWidth,
        scrollDir,
        optional,
        name,
        categoryName,
        background,
    }) {
        super ({ parent });

        this.state = {};
        this.state.images = [];
        this.state.playing = false;
        this.state.optional = optional;
        this.state.scrollDir = scrollDir
        this.state.name = name;
        this.state.categoryName = categoryName;

        this.const = {};
        this.const.FRAME_DURATION_LABEL = 'Duration(ms)';
        this.const.IMG_SIZE = 256;
        this.const.TIP_MULTIPLE_FRAME_UPLOAD = "You can upload multiple frames by shift clicking images. Frame count will be adjusted automatically."

        this.canvasAndFormParent = new Group ({
            class: 'ui segment group canvas-form container',
            parent: this.node,
            label: { content: ' ' }
        })
        
        this.groups = {
            canvas: new Group ({
                class: 'ui segment group canvas preview',
                parent: this.canvasAndFormParent.node,
                label: {
                    content: 'Preview'
                }
            }),
            form: new Group ({
                parent: this.canvasAndFormParent.node,
                class: 'ui segment group frame-form',
                label: {
                    content: 'Frames Upload'
                }
            }),
            frames: new Group ({
                parent: this.node,
                class: 'ui segment group frames',
                label: {
                    content: 'Frames'
                }
            }),
        }

        this.canvasManager = new CanvasManager ({
            parent: this.node,
            height: canvasHeight, width: canvasWidth,
            imgSize: this.const.IMG_SIZE,
            scrollDir: scrollDir,
            background
        })

        this.groups.canvas.addContent (this.canvasManager.node);

        this.maxFrameCountInput = new LabeledInput ({
            parent: this.node,
            onInput: (data) => { this.HandleMaxFrameCountChange (data); },
            label: { content: 'Frame Count' }
        })

        this.maxFrameCountInput.setValue (frameCount);

        this.frameSelector = new InputSlider ({
            parent: this.node,
            onSlider: (data) => { this.HandleCurrentFrameChange (data) },
            onInput: (data) => { this.HandleCurrentFrameChange (data) },
            label: {
                class: 'ui label',
                content: 'Frame Selection'
            },
            slider: {
                prop: {
                    min: 1,
                    max: frameCount,
                    value: 1
                }
            }
        });

        this.frameSelector.input.setValue (1);

        this.imageLoader = new ImageInput ({
            parent: this.node,
            onImage: (data) => { this.HandleImage (data); },
            onMultiImageUpload: (data) => { this.HandleMultipleImages (data); }
        });

        this.imageLoader.node.prop ('multiple', 'multiple');

        this.tipMultiUploadLabel = new Label({
            parent: this.node,
            class: "ui tip label",
            content: this.const.TIP_MULTIPLE_FRAME_UPLOAD
        })

        this.uploadFrameButton = new Button ({
            parent: this.node,
            label: 'Upload Frames',
            onClick: (e) => { this.imageLoader.node.click (); }
        })

        this.playPauseButton = new Button ({
            parent: this.node,
            label: 'Play',
            onClick: (e) => { this.HandlePlayPause (e); }
        })

        this.frameDurationInput = new LabeledInput ({
            parent: this.node,
            label: { content: 'Frame 1 Duration(ms)', class: 'ui label' },
            onInput: (data) => { this.HandleFrameDurationChange (data); }
        })

        this.frameDurationInput.setValue (frameDuration);

        this.groups.form.addContent (this.maxFrameCountInput.node);
        this.groups.form.addContent (this.frameSelector.node);
        this.groups.form.addContent (this.frameDurationInput.node);
        this.groups.form.addContent (this.tipMultiUploadLabel.node);
        this.groups.form.addContent (this.uploadFrameButton.node);
        this.groups.form.addContent (this.playPauseButton.node);
    }

    HandleImage (data) {
        var frameIndex = this.GetCurrentFrame ();
        this.SetImageInFramesGroup ({index: frameIndex,  src: data.value.src});
        this.canvasManager.SetImage ({
            index: frameIndex,
            img: data.value,
            duration: this.frameDurationInput.getValue ()
        });
    }

    HandleMaxFrameCountChange (data) {
        var val = data.value;
        var oldVal = this.frameSelector.slider.getMaxValue ();

        if (val < oldVal) {
            var length = this.state.images.length - val;
            this.ClearFrames ({startIndex: val, endIndex: length});
        }

        this.frameSelector.slider.setMaxValue (val);
        this.HandleCurrentFrameChange ({ value: val });

        if (this.frameSelector.getValue () > val) {
            this.frameSelector.setValue (val);
        }
    }

    ClearFrames ({ startIndex, endIndex })
    {
        this.state.images.splice (startIndex, endIndex);
        this.canvasManager.state.frames.splice (startIndex, endIndex);
    }

    HandleFrameDurationChange (data) {
        if (this.CurrentFrameExists ()) {
            var curFrame = this.GetCurrentFrame ();
            this.canvasManager.state.frames [curFrame].duration = data.value;
            this.state.images [this.GetCurrentFrame ()].duration = data.value;
        }
    }

    HandleCurrentFrameChange (data) {
        this.canvasManager.state.currentFrame = data.value;

        if (this.CurrentFrameExists ()) {
            var frameData = this.canvasManager.state.frames [data.value];

            if (frameData) {
                this.frameDurationInput.setValue ( frameData.duration );
            }
        }

        this.frameDurationInput.label.setContent ('Frame ' + data.value + ' ' + this.const.FRAME_DURATION_LABEL);

        this.canvasManager.RedrawScene ();
    }

    HandlePlayPause() {
        this.state.playing = !this.state.playing;

        if (this.state.playing) {
            this.playPauseButton.node.html ('Pause');
            this.PlayFrame (this.canvasManager.GetFrameDuration (this.frameSelector.getValue ()))
        }
        else {
            this.playPauseButton.node.html ('Play');
        }
    }

    HandleMultipleImages ({target, event, node, value}) {
        // if we are on frame 1, adjust the max number of frames to the number of images
        var curFrame = this.GetCurrentFrame ();
        var maxFrames = curFrame + value.length - 1;
        this.maxFrameCountInput.setValue (maxFrames);
        this.HandleMaxFrameCountChange ({ value: maxFrames })

        value.forEach ((img) => {
            this.HandleImage ({ value: img });

            if (curFrame <= maxFrames) {
                curFrame++;
                this.frameSelector.setValue (curFrame);
            }
        })

        this.frameSelector.setValue (curFrame - 1);
        this.HandleCurrentFrameChange ({ value: curFrame - 1 });
    }

    SetImageInFramesGroup ({index, src}) {
        var curFrame = this.GetCurrentFrame ();

        var frameExists = this.CurrentFrameExists();
        if (!frameExists) {
            var newImg = $('<img />');
            newImg.height (this.const.IMG_SIZE);
            newImg.width (this.const.IMG_SIZE);
            this.state.images [index] = {
                node: newImg,
                src,
                duration: this.frameDurationInput.getValue ()
            }
            this.groups.frames.addContent (newImg)
        }

        this.state.images [index].src = src;
        this.state.images [index].node [0].src = src;

        // Re-add img elements so they appear in order
        this.state.images.forEach ((img) => {
            this.groups.frames.addContent (img.node);
        })
    }

    GetCurrentFrame () {
        return this.frameSelector.getValue ();
    }

    GetMaxFrameCount () {
        return this.maxFrameCountInput.getValue ();
    }

    CurrentFrameExists () {
        var curFrame = this.GetCurrentFrame ();
        var curFrameData = this.canvasManager.state.frames [curFrame];

        if (!curFrameData) { return false; }

        return true;
    }

    PlayFrame (duration) {
        if (this.state.playing) {
            var nextFrame = this.GetCurrentFrame () + 1;
            if (nextFrame > this.GetMaxFrameCount ()) {
                nextFrame = 1;
            }

            this.frameSelector.setValue (nextFrame);
            this.HandleCurrentFrameChange ({ value: nextFrame });

            window.setTimeout (() => {
                this.PlayFrame (this.canvasManager.GetFrameDuration (nextFrame));
            }, duration)
        }
    }

    GetState () {
        return {
                images: this.state.images,
            }
    }

    ClearData () {
        this.ClearFrames ({ startIndex: 0, endIndex: this.state.images.length});
    }

    ImportData (data) {
        this.frameSelector.setValue (0);
        this.HandleCurrentFrameChange ({value: 0});
        this.HandleMaxFrameCountChange ({value: 0});
        this.maxFrameCountInput.setValue (data.images.length - 1);
        this.HandleMaxFrameCountChange ({value: data.images.length - 1});

        var index = 0;
        data.images.forEach ((image) => {

            if (image) {
                this.frameSelector.setValue (index);
                this.HandleCurrentFrameChange ({value: index});

                this.frameDurationInput.setValue (image.duration);
                this.HandleFrameDurationChange ({value: image.duration});

                var img = $('<img />');
                img [0].src = image.src;

                this.HandleImage ({ value: img[0] });

                this.state.images [index].duration = image.duration;
                console.log (image.duration)
            }

            index++;
        })

        this.frameSelector.setValue (1);
        this.HandleCurrentFrameChange ({value: 1});

        console.log ('Uploaded images');
        console.log (this.state.images)
    }
}
