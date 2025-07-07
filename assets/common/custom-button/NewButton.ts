import CustomButton from "./CustomButton";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewButton extends CustomButton {
    @property(cc.SpriteFrame)
    normalFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    highlightFrame: cc.SpriteFrame = null;

    @property
    highlightScale = 1.2;

    buttonSprite: cc.Sprite = null;
    originalScaleX = 1;
    originalScaleY = 1;

    onLoad() {
        super.onLoad();
        this.buttonSprite = this.getComponent(cc.Sprite);
        this.originalScaleX = this.node.scaleX;
        this.originalScaleY = this.node.scaleY;
    }

    setHighlight(highlight: boolean) {
        super.setHighlight(highlight);
        if (this.buttonSprite) {
            const ratio = highlight ? this.highlightScale : 1;

            this.buttonSprite.spriteFrame = highlight ? this.highlightFrame : this.normalFrame;
            cc.tween(this.node)
                .parallel(
                    cc.tween(this.node)
                        .to(0.1, { scaleX: this.originalScaleX * ratio }),
                    cc.tween(this.node)
                        .to(0.1, { scaleY: this.originalScaleY * ratio })
                )
                .start();
        }
    }
}
