import SocketIOGameHistoryBase from "../../_base/view-models/SocketIOGameHistoryBase";
import BitcoinMasterHistoryItem from "./BitcoinMasterHistoryItem";
import BitcoinMasterTicketDetail from "./BitcoinMasterTicketDetail";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BitcoinMasterHistory extends SocketIOGameHistoryBase {
    @property(cc.Prefab)
    ticketDetailPrefab: cc.Prefab = null;

    public handleBetHistory = (roundId, view) => {};

    bindItemRowData(betLog: any, index: any) {
        const itemNode = cc.instantiate(this.itemPrefab);
        const item = itemNode.getComponent(BitcoinMasterHistoryItem);
        item.setData(betLog, index);
        item.showTicketDetail = (log) => {
            this.showTicketDetail(log);
        };

        item.showBetHistory = (roundId, view) => {
            this.handleBetHistory(roundId, view);
        };
        this.content.addChild(itemNode);
    }

    showTicketDetail(data: any) {
        const node = cc.instantiate(this.ticketDetailPrefab);
        const detail = node.getComponent(BitcoinMasterTicketDetail);
        this.node.addChild(node);
        detail.setData(data);
    }

    onData(data) {
        super.onData(data);
        const { pageSize, total } = data;

        if (total <= pageSize) {
            this.pagination.node.active = false;
        }
    }
}
