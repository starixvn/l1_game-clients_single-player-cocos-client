import SocketIOGameHistoryBase from "../../_base/view-models/SocketIOGameHistoryBase";
import ThreeCardsHistoryItem from "./ThreeCardsHistoryItem";
import ThreeCardsTicketDetail from "./ThreeCardsTicketDetail";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ThreeCardsHistory extends SocketIOGameHistoryBase {
    @property(cc.Prefab)
    ticketDetailPrefab: cc.Prefab = null;

    bindItemRowData(betLog, index) {
        const itemNode = cc.instantiate(this.itemPrefab);
        const item = itemNode.getComponent(ThreeCardsHistoryItem);
        item.setData(betLog);
        item.showTicketDetail = (data) => this.showTicketDetail(data);
        item.setBackground(index);
        this.content.addChild(itemNode);
    }

    showTicketDetail(data: any) {
        const node = cc.instantiate(this.ticketDetailPrefab);
        this.node.addChild(node);

        const item = node.getComponent(ThreeCardsTicketDetail);
        item.setData(data);
    }
}
