import MiniRoundHistoryItem from "../../../common/mini-round-history/MiniRoundHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class VipSedieWarMiniRoundHistoryItem extends MiniRoundHistoryItem {
    @property(cc.Sprite)
    icon: cc.Sprite = null;

    @property(cc.Label)
    red: cc.Label = null;

    public setData(data: any) {
        this.data = data;
        const colors = [cc.color(37, 128, 241), cc.color(253, 101, 0), cc.color(19, 180, 50)];
        this.icon.node.color = colors[data.type];
        this.red.string = data.red;
    }
}
