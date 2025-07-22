// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = "hello";

    private sprite: cc.Sprite = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        // Get the Sprite component from this node
        this.sprite = this.getComponent(cc.Sprite);
        if (this.sprite) {
            this.loadImageFromURL();
        } else {
            console.error("No Sprite component found on this node");
        }
    }

    private loadImageFromURL() {
        // const imageUrl = "https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_1.png";
        const imageUrl = "https://assets.lang.live/gift/fedffb919a921cfab98660bb2400cb07";

        // Create an image element
        const img = new Image();
        img.crossOrigin = "anonymous"; // Handle CORS

        img.onload = () => {
            // Create a canvas to convert the image
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            canvas.width = img.width;
            canvas.height = img.height;

            // Draw the image to canvas
            ctx.drawImage(img, 0, 0);

            // Get image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // Create a new texture
            const texture = new cc.Texture2D();
            texture.initWithData(imageData.data, cc.Texture2D.PixelFormat.RGBA8888, imageData.width, imageData.height);

            // Create a new SpriteFrame
            const newSpriteFrame = new cc.SpriteFrame();
            newSpriteFrame.setTexture(texture);

            // Set the spriteFrame directly to the Sprite component
            this.sprite.spriteFrame = newSpriteFrame;

            console.log("Image loaded successfully from URL");
        };

        img.onerror = (error) => {
            console.error("Failed to load image from URL:", error);
        };

        // Start loading the image
        img.src = imageUrl;
    }

    // update (dt) {}
}
