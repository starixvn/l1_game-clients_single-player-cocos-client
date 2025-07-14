import GameUtils from "../../../common/GameUtils";
import BetHistory from "../../_new/common/BetHistory";
import { BetLog, TicketHistoryData } from "./HiLoBetData";
import HiLoTicketDetail from "./HiLoTicketDetail";
import HiLoTicketHistoryItem from "./HiLoTicketHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HiLoTicketHistory extends BetHistory {
    @property(cc.Prefab)
    ticketDetailPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    baseRoundItemPrefab: cc.Prefab = null;

    renderTicketHistory(data: TicketHistoryData) {
        data.betLogs.forEach((item, index) => {
            const itemNode = GameUtils.createNodeFromPrefab(this.prefabItem);
            const control = itemNode.getComponent(HiLoTicketHistoryItem);
            control.renderTicketItem(item, index);
            control.openTicketDetail = () => {
                this.initTicketDetail(item);
            };
            this.content.addChild(itemNode);
        });
    }

    initTicketDetail(data: BetLog) {
        const ticketDetailNode = GameUtils.createNodeFromPrefab(this.ticketDetailPrefab);
        this.node.addChild(ticketDetailNode);
        const detailControl = ticketDetailNode.getComponent(HiLoTicketDetail);
        detailControl.renderTicketDetail(data);
    }
}
