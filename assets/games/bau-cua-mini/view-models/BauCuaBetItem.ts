import BetItem from "../../_base/view-models/BetItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BauCuaBetItem extends BetItem {
    @property(cc.Sprite)
    xSprite: cc.Sprite = null;

    @property(cc.SpriteFrame)
    x2Sprite: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    x3Sprite: cc.SpriteFrame = null;

    @property(cc.Sprite)
    hashNumber: cc.Sprite = null;

    public resetHighlight() {
        this.highlightBorder.active = false;
        this.highlight.active = true;
    }

    protected setHighlightItems(highlight: boolean, isAnimated = true) {
        this.updateHighlight(highlight);
    }

    setXSpriteFrame(spriteFrame: cc.SpriteFrame) {
        this.xSprite.node.active = true;
        this.xSprite.spriteFrame = spriteFrame;
    }

    updateHighlight(show: boolean) {
        this.highlightBorder.active = show;
        this.highlight.active = show;
    }

    hideXTimesResult() {
        this.xSprite.node.active = false;
    }

    showHashNumber(show: boolean) {
        this.hashNumber.node.active = show;
    }
}
