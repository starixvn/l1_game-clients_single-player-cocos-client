import AudioManager from "../../../../common/audio/AudioManager";
import BetHistory from "../../../_new/common/BetHistory";
import { events } from "../../../_new/connection/SocketIOConnection";
import HoldemPoker from "../HoldemPoker";
import HoldemPokerTicketDetail from "./HoldemPokerTicketDetail";
import HoldemPokerTicketHistoryItem from "./HoldemPokerTicketHistoryItem";

const { ccclass, property, menu } = cc._decorator;

export interface BetLog {
    dealerHandId: number;
    playerHandId: number;
    isFold: boolean;
    roundId: number;
    stake: number;
    time: Date;
    betWin: number;
    isQualified: boolean;
    isPlayerWin: number;
}

type HistoryDataType = {
    history: {
        page: number;
        pageSize: number;
        total: number;
        betLogs: BetLog[];
    };
};

export const HandResultConst = {
    0: "doesNotQualify",
    1: "highCards",
    2: "onePair",
    3: "twoPairs",
    4: "threeKind",
    5: "straight",
    6: "flush",
    7: "fullHouse",
    8: "fourOfAKind",
    9: "straightFlush",
    10: "royalFlush"
};

@ccclass
@menu("Games/HolemPoker/HoldemPokerTicketHistory")
export default class HoldemPokerTicketHistory extends BetHistory {
    @property([cc.SpriteFrame])
    cardTypes: Array<cc.SpriteFrame> = [];

    @property(cc.Prefab)
    ticketDetailPrefab: cc.Prefab = null;

    protected root: HoldemPoker;
    protected ticketDetailComponent: HoldemPokerTicketDetail = null;

    getTicketDetail(roundId = 1) {
        this.connection.emit(events.getTicketDetail, { roundId });
    }

    renderTicketHistory(data: any) {
        const betLogs = data.betLogs;
        betLogs.forEach((log, index) => {
            const historyItemPrefab = cc.instantiate(this.prefabItem);
            const historyControl = historyItemPrefab.getComponent(HoldemPokerTicketHistoryItem);
            historyControl.renderTicketHistoryItem(log, index);
            historyControl.openTicketDetail = () => {
                AudioManager.getInstance().playClick();
                this.getTicketDetail(log.roundId);
                this.initTicketDetail(log.roundId, log.time);
            };
            this.content.addChild(historyItemPrefab);
        });
    }

    private initTicketDetail(roundId: number, time: Date) {
        const ticketDetail = this.node.getChildByName(this.ticketDetailPrefab.name);
        if (ticketDetail) {
            ticketDetail.removeFromParent(true);
            ticketDetail.destroy();
        }
        const ticketDetailPrefab = cc.instantiate(this.ticketDetailPrefab);
        this.ticketDetailComponent = ticketDetailPrefab.getComponent(HoldemPokerTicketDetail);
        this.ticketDetailComponent.renderTitle(roundId, time);
        this.node.addChild(ticketDetailPrefab);
    }

    public showTicketDetail(data) {
        this.ticketDetailComponent.renderBets(data);
        this.ticketDetailComponent.renderCards(data);
    }
}
