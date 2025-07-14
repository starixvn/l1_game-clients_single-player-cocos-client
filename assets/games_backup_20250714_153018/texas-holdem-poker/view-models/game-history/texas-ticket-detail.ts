import HoldemPokerTicketDetail from "../../../holdem-poker/view-models/history/HoldemPokerTicketDetail";
import { CombineCardResultLabel } from "./../../../holdem-poker/components/cards/view-models/HoldemPokerCards";
import TexasTicketDetailItem from "./texas-ticket-detail-item";

const { ccclass } = cc._decorator;

@ccclass
export default class TexasTicketDetail extends HoldemPokerTicketDetail {
    WIDTH_BET_DETAIL_TABLE = 850;

    protected getComponentDetailItem(node: cc.Node): TexasTicketDetailItem {
        return node.getComponent(TexasTicketDetailItem);
    }

    getDealerResult(dealerCards) {
        return `holdEmPoker.${CombineCardResultLabel[dealerCards.handResultId].dataId}`;
    }

    handleColorNodePlayerDealer({ isPlayerWin }) {
        if (isPlayerWin > 0) {
            this.playerRank.node.color = cc.Color.YELLOW;
        } else if (isPlayerWin < 0) {
            this.dealerRank.node.color = cc.Color.YELLOW;
        }
    }
}
