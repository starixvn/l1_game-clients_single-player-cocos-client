import GameTicketDetailBase from "../../_base/view-models/GameTicketDetailBase";
import SicBoTicketDetailItem from "./SicBoTicketDetailItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SicBoTicketDetail extends GameTicketDetailBase {
    @property(cc.Label)
    roundLabel: cc.Label = null;

    @property(cc.Sprite)
    dices: cc.Sprite[] = [];

    @property(cc.Prefab)
    ticketDetailItemPrefab: cc.Prefab = null;

    @property(cc.Label)
    total: cc.Label = null;

    roundID: number;
    result: number;

    HEIGHT_BET_DETAIL_TABLE = 460;
    WIDTH_BET_DETAIL_TABLE = 620;

    public showbetLogs() {
        this.node.active = true;
        let index = 0;
        for (const betLogDetail of this.betLogDetails) {
            const ticketDetailItem = cc.instantiate(this.ticketDetailItemPrefab);
            const ticketDetailItemComponent = ticketDetailItem.getComponent(SicBoTicketDetailItem);
            ticketDetailItemComponent.updateContent(betLogDetail, this.settlementResult, index);
            this.content.addChild(ticketDetailItem);
            index++;
        }
    }

    setSicboDetailData(round: number, result: any, dicesSpriteFrames: cc.SpriteFrame[]) {
        this.roundLabel.string = round.toString();
        this.dices[0].spriteFrame = dicesSpriteFrames[result.dice1 - 1];
        this.dices[1].spriteFrame = dicesSpriteFrames[result.dice2 - 1];
        this.dices[2].spriteFrame = dicesSpriteFrames[result.dice3 - 1];
        this.total.string = result.dice1 + result.dice2 + result.dice3;
    }
}
