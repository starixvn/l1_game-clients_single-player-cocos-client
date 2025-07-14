import GameUtils from "../../../common/GameUtils";
import CascadeSlotReel from "./CascadeSlotReel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CascadingSlotTicketReel extends CascadeSlotReel {
    @property(cc.Prefab)
    mobileItemPrefab: cc.Prefab = null;

    createReelItem(): cc.Node {
        const node = GameUtils.isPhone() ? cc.instantiate(this.mobileItemPrefab) : cc.instantiate(this.itemPrefab);
        this.node.addChild(node);
        return node;
    }
}
