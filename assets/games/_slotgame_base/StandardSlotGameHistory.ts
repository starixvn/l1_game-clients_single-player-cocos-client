import SlotGameHistory from "./SlotGameHistory";
import StandardSlotGameTicketDetail from "./StandardSlotGameTicketDetail";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StandardSlotGameHistory extends SlotGameHistory {
    gameId: number;
    mainAtlas: cc.SpriteAtlas;

    initTicketDetail(): cc.Node {
        const node = super.initTicketDetail();
        const ticketDetail = node.getComponent(StandardSlotGameTicketDetail);
        ticketDetail.gameId = this.gameId;
        return node;
    }
}
