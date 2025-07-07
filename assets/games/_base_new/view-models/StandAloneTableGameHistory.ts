import SocketIOGameHistoryBase from "../../_base/view-models/SocketIOGameHistoryBase";
import StandAloneTableGameHistoryItem from "./StandAloneTableGameHistoryItem";
import StandAloneTableGameTicketDetail from "./StandAloneTableGameTicketDetail";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StandAloneTableGameHistory extends SocketIOGameHistoryBase {
    @property(cc.Prefab)
    ticketDetailPrefab: cc.Prefab = null;

    showTicketDetail(data: any) {
        const ticketDetailPrefab = cc.instantiate(this.ticketDetailPrefab);
        const ticketDetailComponent = ticketDetailPrefab.getComponent(StandAloneTableGameTicketDetail);

        this.node.addChild(ticketDetailPrefab);
        ticketDetailComponent.setData(data);
    }

    bindItemRowData(betLog, index) {
        const itemNode = cc.instantiate(this.itemPrefab);
        const item = itemNode.getComponent(StandAloneTableGameHistoryItem);
        item.setData(betLog, index);
        item.showTicketDetail = (log) => {
            this.showTicketDetail(log);
        };
        this.content.addChild(itemNode);
    }
}
