import CascadingSlotTumbleItem from "./CascadingSlotTumbleItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StandardCascadingSlotTumbleItem extends CascadingSlotTumbleItem {
    @property({ type: cc.SpriteAtlas, override: true, visible: false })
    mainAtlas: cc.SpriteAtlas = null;

    prefixSymbol = "symbol-";
    index = 0;
}
