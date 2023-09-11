import Html from '/incarnation/component/HTML.js';
import Canvas from '/incarnation/component/Canvas.js';

export default class CanvasManager extends Html {
    constructor ({ parent, height, width, imgSize, background, scrollDir = '' }) {
        super ({parent});
        this.const = { HEIGHT: height, WIDTH: width };
        this.const.HALF_HEIGHT = height / 2;
        this.const.HALF_WIDTH = width / 2;
        this.const.IMG_SIZE = imgSize;
        this.const.HALF_IMG_SIZE = imgSize / 2;
        this.const.FRAME_RATE = 1000 / 60;
        this.const.SCROLL_SPEED = background.scrollSpeed;

        this.canvas = new Canvas ({
            parent: this.node,
            prop: { width, height }
        });

        this.ctx = this.canvas.GetContext();

        this.state = {};
        this.state.frames = [];
        this.state.currentFrame = 0;

        this.scrolling = true;
        this.scrollDir = scrollDir;
        this.bgImg = $('<img src="./assets/Tiling Grid.png" />');
        this.bgImg.on ('load', () => {
            this.GetBgImageDimensions();
        });
    }

    GetBgImageDimensions() {
        this.bgImgWidth = this.bgImg [0].naturalWidth;
        this.bgImgHeight = this.bgImg [0].naturalHeight;

        if (this.bgImgHeight == 0 && this.bgImgWidth == 0) {
            window.setTimeout(() => { this.GetBgImageDimensions(); }, 50)
        }
        else {
            this.bgAspect = this.bgImgHeight / this.bgImgWidth;
            this.bgImgPos = {
                x: this.bgImgWidth / 4 + 35,
                y: -this.bgImgHeight / 3 + this.const.HEIGHT
            };
            this.bgImgSpeed = {
                x: this.const.SCROLL_SPEED,
                y: this.const.SCROLL_SPEED * this.bgAspect
            };
            this.ready = true;
            this.RedrawLoop();
        }
    }

    SetImage ({ index, img, duration }) {
        this.state.currentFrame = index;
        this.state.frames [index] = {img, duration};
        this.RedrawScene ();
    }

    RedrawLoop () {
        if (this.scrolling) {
            this.ScrollBg ();
            this.RedrawScene ();

            window.setTimeout (() => { this.RedrawLoop () }, this.const.FRAME_RATE);
        }
    }

    ScrollBg () {
        if (this.scrollDir.indexOf ('right') != -1) {
            this.bgImgPos.x -= this.bgImgSpeed.x;
        }

        if (this.scrollDir.indexOf ('left') != -1) {
            this.bgImgPos.x += this.bgImgSpeed.x;
        }

        if (this.scrollDir.indexOf ('down') != -1) {
            this.bgImgPos.y += this.bgImgSpeed.y;
        }

        if (this.scrollDir.indexOf ('up') != -1) {
            this.bgImgPos.y -= this.bgImgSpeed.y;
        }

        if (this.bgImgPos.x <= -this.bgImgWidth || this.bgImgPos.x >= this.bgImgWidth) {
            this.bgImgPos.x = 0;
        }

        if (this.bgImgPos.y <= -this.bgImgHeight || this.bgImgPos.y >= this.bgImgHeight) {
            this.bgImgPos.y = 0;
        }
    }

    RedrawScene () {
        if (!this.ready) { return; }
        this.ctx.clearRect(0, 0, this.const.WIDTH, this.const.HEIGHT);

        this.DrawBgGrid ();

        if (this.state.frames [this.state.currentFrame]) {
            this.ctx.drawImage (
                this.state.frames [this.state.currentFrame].img,
                this.const.HALF_WIDTH - this.const.HALF_IMG_SIZE,
                this.const.HALF_HEIGHT - this.const.HALF_IMG_SIZE,
                this.const.IMG_SIZE, this.const.IMG_SIZE);
        }
    }

    DrawBgGrid () {
        // center img
        this.ctx.drawImage (
            this.bgImg [0],
            this.bgImgPos.x, this.bgImgPos.y
        )

        // Helds remove grid lines between images
        var alignmentBuffer = 1;

        // center right img
        this.ctx.drawImage (
            this.bgImg [0],
            this.bgImgPos.x + this.bgImgWidth - alignmentBuffer,
            this.bgImgPos.y
        )

        // center top img
        this.ctx.drawImage (
            this.bgImg [0],
            this.bgImgPos.x,
            this.bgImgPos.y - this.bgImgHeight + alignmentBuffer
        )

        // top right img
        this.ctx.drawImage (
            this.bgImg [0],
            this.bgImgPos.x + this.bgImgWidth - alignmentBuffer,
            this.bgImgPos.y - this.bgImgHeight + alignmentBuffer
        )

        // center left
        this.ctx.drawImage (
            this.bgImg [0],
            this.bgImgPos.x - this.bgImgWidth + alignmentBuffer,
            this.bgImgPos.y
        )

        // center bottom img
        this.ctx.drawImage (
            this.bgImg [0],
            this.bgImgPos.x,
            this.bgImgPos.y + this.bgImgHeight - alignmentBuffer
        )

        // bottom left img
        this.ctx.drawImage (
            this.bgImg [0],
            this.bgImgPos.x - this.bgImgWidth + alignmentBuffer,
            this.bgImgPos.y + this.bgImgHeight - alignmentBuffer
        )

        // top left img
        this.ctx.drawImage (
            this.bgImg [0],
            this.bgImgPos.x - this.bgImgWidth + alignmentBuffer,
            this.bgImgPos.y - this.bgImgHeight + alignmentBuffer
        )

        // bottom right img
        this.ctx.drawImage (
            this.bgImg [0],
            this.bgImgPos.x + this.bgImgWidth - alignmentBuffer,
            this.bgImgPos.y + this.bgImgHeight - alignmentBuffer
        )
    }

    GetFrameDuration (index) {
        var dur = 0;
        var frame = this.state.frames [index];

        if (frame) { dur = frame.duration; }

        return dur;
    }
}
