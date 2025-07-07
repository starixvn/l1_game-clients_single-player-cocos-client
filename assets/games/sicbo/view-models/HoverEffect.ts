import HoverItemBase from "../../../common/HoverItemBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HoverEffect extends HoverItemBase {
    @property(cc.Sprite)
    background: cc.Sprite = null;

    @property(cc.SpriteFrame)
    normalSprite: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    highlightSprite: cc.SpriteFrame = null;

    onTouchMove(e) {
        super.onTouchMove(e);
        this.background.spriteFrame = this.highlightSprite;
    }

    onTouchEnd(e) {
        super.onTouchEnd(e);
        this.background.spriteFrame = this.normalSprite;
    }

    onTouchCancel(e) {
        super.onTouchCancel(e);
        this.background.spriteFrame = this.normalSprite;
    }
}
