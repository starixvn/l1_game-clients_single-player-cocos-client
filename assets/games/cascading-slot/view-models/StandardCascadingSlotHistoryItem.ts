import CascadingSlotHistoryItem from "./CascadingSlotHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StandardCascadingSlotHistoryItem extends CascadingSlotHistoryItem {
    @property
    textHighlightColor: cc.Color = cc.Color.YELLOW;

    @property
    textNormalColor: cc.Color = cc.Color.WHITE;

    setData(betLog, index) {
        super.setData(betLog, index);
        if (betLog.betwin > 0) {
            this.time.node.color = this.betLevel.node.color = this.coinValue.node.color = this.textHighlightColor;
        } else {
            this.time.node.color = this.betLevel.node.color = this.coinValue.node.color = this.textNormalColor;
        }
    }
}
