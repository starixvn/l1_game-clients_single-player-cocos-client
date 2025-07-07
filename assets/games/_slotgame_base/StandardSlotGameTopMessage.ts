import SlotGameTopMessage from "./SlotGameTopMessage";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StandardSlotGameTopMessage extends SlotGameTopMessage {
    mainAtlas: cc.SpriteAtlas;

    @property(cc.Sprite)
    iconMultiplier: cc.Sprite = null;

    updateTopMessage() {
        this.iconMultiplier.spriteFrame = this.mainAtlas.getSpriteFrame("symbol-13");
        super.updateTopMessage();
    }
}
