import { BigRoadScoreboardPoint } from "sc-scoreboards";
import { BaccaratSettlementResult } from "../../baccarat/view-models/event-models/BaccaratSettlementResult";
import BigRoadItem from "./base/BigRoadItem";

const { ccclass } = cc._decorator;

@ccclass
export default class BaccaratBigRoadItem extends BigRoadItem {
    protected NodeItems = {
        BANKER: "banker",
        PLAYER: "player",
        NATURAL: "natural",
        BANKERPAIR: "bankerPair",
        PLAYERPAIR: "playerPair",
        TIE: "tie",
        COUNT: "count",
        NEXT: "next"
    };

    resetNode(bigRoadScoreboardPoint: BigRoadScoreboardPoint<BaccaratSettlementResult>) {
        const node = this.nodes[bigRoadScoreboardPoint.y];
        node.getChildByName(this.NodeItems.BANKER).active = false;
        node.getChildByName(this.NodeItems.PLAYER).active = false;
        node.getChildByName(this.NodeItems.BANKERPAIR).active = false;
        node.getChildByName(this.NodeItems.PLAYERPAIR).active = false;
        node.getChildByName(this.NodeItems.NATURAL).active = false;
        node.getChildByName(this.NodeItems.TIE).active = false;
        node.getChildByName(this.NodeItems.NEXT).active = false;
        node.getChildByName(this.NodeItems.COUNT).getComponent(cc.Label).string = "";
        this.hasValueArray[bigRoadScoreboardPoint.y] = false;
    }

    renderNode(bigRoadScoreboardPoint: BigRoadScoreboardPoint<BaccaratSettlementResult>, column?: number, row?: number) {
        const node = this.nodes[bigRoadScoreboardPoint.y];
        const baccaratSettleResult = bigRoadScoreboardPoint.data;

        node.getChildByName(this.NodeItems.BANKER).active = baccaratSettleResult[0].banker;
        node.getChildByName(this.NodeItems.PLAYER).active = baccaratSettleResult[0].player;
        node.getChildByName(this.NodeItems.NATURAL).active = baccaratSettleResult.some((settlementResult) => settlementResult.natural);
        node.getChildByName(this.NodeItems.BANKERPAIR).active = baccaratSettleResult.some(
            (settlementResult) => settlementResult.bankerPair
        );
        node.getChildByName(this.NodeItems.PLAYERPAIR).active = baccaratSettleResult.some(
            (settlementResult) => settlementResult.playerPair
        );

        const tieCount = baccaratSettleResult[0].tie ? baccaratSettleResult.length : baccaratSettleResult.length - 1;

        if (tieCount >= 1) {
            node.getChildByName(this.NodeItems.TIE).active = true;
        }

        if (tieCount > 1) {
            node.getChildByName(this.NodeItems.COUNT).active = true;
            node.getChildByName(this.NodeItems.COUNT).getComponent(cc.Label).string = tieCount.toString();
        }
        this.hasValueArray[bigRoadScoreboardPoint.y] = true;
    }
}
