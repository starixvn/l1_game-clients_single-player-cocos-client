import { numberWithCommas } from "../../../../common/helpers/NumberHelper";
import GameTicketDetailBase from "../../../_base/view-models/GameTicketDetailBase";
import MiniRouletteTicketDetailItem from "./mini-roulette-ticket-detail-item";
import MiniRouletteTicketDetailTotalItem from "./mini-roulette-ticket-detailI-total-item";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MiniRouletteTicketDetail extends GameTicketDetailBase {
    @property(cc.Label)
    roundLabel: cc.Label = null;

    @property(cc.Label)
    resultLabel: cc.Label = null;

    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    totalItemPrefab: cc.Prefab = null;

    @property(cc.Label)
    profitLabel: cc.Label = null;

    roundID = 2000;
    result = 20;

    HEIGHT_BET_DETAIL_TABLE = 550;
    WIDTH_BET_DETAIL_TABLE = 930;

    odds: Record<string, number> = null;
    totalBet = 0;
    totalWin = 0;

    public showbetLogs() {
        this.node.active = true;
        this.betLogDetails.forEach((log) => {
            const item = cc.instantiate(this.itemPrefab);
            const itemComponent = item.getComponent(MiniRouletteTicketDetailItem);
            this.content.addChild(item);
            itemComponent.createBetLogItem(log, this.settlementResult, this.odds);
        });
        this.createTotalItem();
        this.createProfit();
    }

    createProfit() {
        if (!this.profitLabel) {
            return;
        }
        const profit = this.totalWin - this.totalBet;
        this.profitLabel.string = numberWithCommas(profit);
        this.profitLabel.node.color = profit > 0 ? cc.Color.YELLOW : cc.Color.WHITE;
    }

    createTotalItem() {
        const totalItem = cc.instantiate(this.totalItemPrefab);
        const totalItemComponent = totalItem.getComponent(MiniRouletteTicketDetailTotalItem);
        totalItemComponent.createTotalItem(this.totalBet, this.totalWin);
        this.content.addChild(totalItem);
    }

    setRouletteData(round: number, result: number) {
        this.roundLabel.string = round.toString();
        this.resultLabel.string = result.toString();
    }

    setDetailData(betLogDetails: any, settlementResult: any, data: { odds: Record<string, number>; totalBet: number; totalWin: number }) {
        super.setData(betLogDetails, settlementResult);
        this.odds = data.odds;
        this.totalBet = data.totalBet;
        this.totalWin = data.totalWin;
    }
}
