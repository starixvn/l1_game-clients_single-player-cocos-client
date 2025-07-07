import KenoNumber from "./KenoNumber";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SpriteKenoNumber extends KenoNumber {
    @property({ type: cc.Label, visible: false, override: true })
    numberLabel: cc.Label = null;

    @property(cc.Sprite)
    numberSprite: cc.Sprite = null;

    @property(cc.SpriteFrame)
    waitingSpriteFrame: cc.SpriteFrame = null;

    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    setNumber(value: number, animated: boolean) {
        this.node.stopAllActions();
        this.node.angle = 0;
        this.numberSprite.spriteFrame = this.atlas.getSpriteFrame(value.toString());
        this.show(animated);
    }

    showWaiting() {
        this.node.active = true;
        this.numberSprite.spriteFrame = this.waitingSpriteFrame;
        this.node.runAction(cc.repeatForever(cc.rotateBy(1, 360)));
    }

    runNumberAnimation() {
        this.node.scale = 0;
        this.node.runAction(cc.scaleTo(2, 1).easing(cc.easeBackOut()));
    }
}
