import { getStringDateByTime } from "../../../../common/helpers/DateTimeHelper";
import { numberWithCommas } from "../../../../common/helpers/NumberHelper";
import SocketIOHistoryItemBase from "../../../_base/view-models/SocketIOHistoryItemBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BauCuaHistoryItems extends SocketIOHistoryItemBase {
    @property({ type: cc.Sprite })
    dices: cc.Sprite[] = [];

    @property(cc.Label)
    stag: cc.Label = null;

    @property(cc.Label)
    gourd: cc.Label = null;

    @property(cc.Label)
    rooster: cc.Label = null;

    @property(cc.Label)
    fish: cc.Label = null;

    @property(cc.Label)
    crab: cc.Label = null;

    @property(cc.Label)
    prawn: cc.Label = null;

    @property(cc.SpriteFrame)
    animalSprites: cc.SpriteFrame[] = [];

    setData(betLog: any, index: number) {
        const { time, phien, result, betwin, settlementResult } = betLog;
        this.node.active = true;
        this.time.string = getStringDateByTime(time);
        this.round.string = phien;

        this.dices[0].spriteFrame = this.animalSprites[result.dice1];
        this.dices[1].spriteFrame = this.animalSprites[result.dice2];
        this.dices[2].spriteFrame = this.animalSprites[result.dice3];

        Object.keys(settlementResult).forEach((choice) => {
            this[choice].string = numberWithCommas(betLog[choice]);
            if (settlementResult[choice]) {
                this[choice].node.color = cc.Color.YELLOW;
            } else {
                this[choice].node.color = cc.Color.WHITE;
            }
        });

        this.win.string = numberWithCommas(betwin, 2);
        this.setBackground(index);
    }
}
