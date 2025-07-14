import { getStringDateByTime } from "../../../../common/helpers/DateTimeHelper";
import { numberWithCommas } from "../../../../common/helpers/NumberHelper";
import NewCard from "../../../../common/new-card/view-models/NewCard";
import SocketIOHistoryItemBase from "../../../_base/view-models/SocketIOHistoryItemBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RongHoHistoryItem extends SocketIOHistoryItemBase {
    @property({ type: NewCard })
    cards: NewCard[] = [];

    @property(cc.Label)
    betDragon: cc.Label = null;

    @property(cc.Label)
    betTiger: cc.Label = null;

    @property(cc.Label)
    betDraw: cc.Label = null;

    setData(betLog: any, index) {
        this.node.active = true;
        this.time.string = getStringDateByTime(betLog.time);
        this.round.string = betLog.phien;
        this.win.string = numberWithCommas(betLog.betwin, 2);

        this.setCards(betLog.result);

        this.betDragon.string = numberWithCommas(betLog.dragon);
        this.betTiger.string = numberWithCommas(betLog.tiger);
        this.betDraw.string = numberWithCommas(betLog.tie);

        const settlementResult = betLog.settlementResult;
        if (settlementResult.dragon) {
            this.betDragon.node.color = cc.Color.YELLOW;
        } else if (settlementResult.tiger) {
            this.betTiger.node.color = cc.Color.YELLOW;
        } else {
            this.betDraw.node.color = cc.Color.YELLOW;
        }
        this.setBackground(index);
    }

    setCards(results: any) {
        if (this.cards.length === 2) {
            Object.values(results).forEach((result: any, index) => {
                this.cards[index].setCardOldStyle({
                    rank: result.card,
                    suit: result.type
                });
                this.cards[index].faceUp();
            });
        }
    }
}
