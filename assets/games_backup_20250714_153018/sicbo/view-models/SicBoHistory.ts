import SocketIOGameHistoryBase from "../../_base/view-models/SocketIOGameHistoryBase";
import SicBoHistoryItem from "./SicBoHistoryItem";
import SicBoTicketDetail from "./SicBoTicketDetail";

const { ccclass, property } = cc._decorator;
@ccclass
export default class SicBoHistory extends SocketIOGameHistoryBase {
    @property(cc.Prefab)
    ticketDetailPrefab: cc.Prefab = null;

    @property(cc.SpriteFrame)
    dices: cc.SpriteFrame[] = [];

    bindItemRowData(log: any, index: number) {
        const historyItemPrefab = cc.instantiate(this.itemPrefab);
        const item = historyItemPrefab.getComponent(SicBoHistoryItem);
        this.content.addChild(historyItemPrefab);
        item.setData(log, this.dices, index);
        this.handleSomeItemRowData(this, item, log);
    }

    showTicketDetail(round: number, time: string, result: any, betLogDetails: any, settlementResult: any) {
        const ticketDetailPrefab = cc.instantiate(this.ticketDetailPrefab);
        const ticketDetailComponent = ticketDetailPrefab.getComponent(SicBoTicketDetail);
        this.node.addChild(ticketDetailPrefab);
        ticketDetailComponent.setSicboDetailData(round, result, this.dices);
        ticketDetailComponent.setData(betLogDetails, settlementResult);
        ticketDetailComponent.showbetLogs();
    }
}
