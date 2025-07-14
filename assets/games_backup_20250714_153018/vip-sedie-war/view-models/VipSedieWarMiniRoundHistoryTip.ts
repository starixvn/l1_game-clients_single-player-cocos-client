import GameUtils from "../../../common/GameUtils";

import MiniRoundHistoryTip from "../../../common/mini-round-history/MiniRoundHistoryTip";

const { ccclass, property } = cc._decorator;

@ccclass
export default class VipSedieWarMiniRoundHistoryTip extends MiniRoundHistoryTip {
    @property(cc.Node)
    dotNode: cc.Node = null;

    @property({ type: cc.SpriteFrame })
    dotsFrame: cc.SpriteFrame[] = [];

    public setData(data: any) {
        this.roundId.string = `#${data.roundId}`;
        const key = data.red % 2 === 0 ? "total_even" : "total_odd";
        const message = GameUtils.getText(`ui.${key}`);
        this.result.string = `${message} (${data.red})`;
        const list = ["red1", "red2", "red3", "red4"];
        let count = 0;
        this.dotNode.children.forEach((child) => {
            child.getComponent(cc.Sprite).spriteFrame = this.dotsFrame[1];
        });
        list.forEach((key) => {
            if (data.result.player[key]) {
                this.dotNode.children[count].getComponent(cc.Sprite).spriteFrame = this.dotsFrame[0];
                count++;
            }
        });

        count = 4;
        list.forEach((key) => {
            if (data.result.banker[key]) {
                this.dotNode.children[count].getComponent(cc.Sprite).spriteFrame = this.dotsFrame[0];
                count++;
            }
        });
    }
}
