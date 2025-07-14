import SocketIOGameHistoryBase from "../../_base/view-models/SocketIOGameHistoryBase";
import VipFishPrawnCrabHistoryItem from "./VipFishPrawnCrabHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class VipFishPrawnCrabHistory extends SocketIOGameHistoryBase {
    @property(cc.SpriteFrame)
    animalSprites: cc.SpriteFrame[] = [];

    bindItemRowData(betLog, index) {
        const itemNode = cc.instantiate(this.itemPrefab);
        const item = itemNode.getComponent(VipFishPrawnCrabHistoryItem);
        item.setData(betLog, index);
        item.setAnimalSprites(betLog.result, this.animalSprites);
        this.content.addChild(itemNode);
    }
}
