import SocketIOGameHistoryBase from "../../_base/view-models/SocketIOGameHistoryBase";
import RouletteHistoryItem from "./RouletteHistoryItem";
import RouletteTicketDetail from "./RouletteTicketDetail";

const { ccclass, property } = cc._decorator;
@ccclass
export default class RouletteHistory extends SocketIOGameHistoryBase {
    AUTO_SCALE_NODE_WIDTH = 930;
    HEIGHT_CONTENT = 700;

    @property(cc.Prefab)
    ticketDetailPrefab: cc.Prefab = null;

    bindItemRowData(log, index) {
        const historyItemPrefab = cc.instantiate(this.itemPrefab);
        const item = historyItemPrefab.getComponent(RouletteHistoryItem);
        this.content.addChild(historyItemPrefab);
        item.setData(log, index);
        this.handleSomeItemRowData(this, item, log);
    }

    showTicketDetail(round: number, time: string, result: number, betLogDetails: any, settlementResult: any) {
        const ticketDetailPrefab = cc.instantiate(this.ticketDetailPrefab);
        const ticketDetailComponent = ticketDetailPrefab.getComponent(RouletteTicketDetail);
        this.node.addChild(ticketDetailPrefab);
        ticketDetailComponent.setRouletteData(round, result);
        ticketDetailComponent.setData(betLogDetails, settlementResult);
        ticketDetailComponent.showbetLogs();
    }
}
