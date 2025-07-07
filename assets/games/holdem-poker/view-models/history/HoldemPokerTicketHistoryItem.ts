import * as i18n from "i18n/runtime-scripts/LanguageData";

import { getStringDateByTime } from "../../../../common/helpers/DateTimeHelper";
import { numberWithCommas } from "../../../../common/helpers/NumberHelper";
import SocketIOHistoryItemBase from "../../../_base/view-models/SocketIOHistoryItemBase";
import { BetLog, HandResultConst } from "./HoldemPokerTicketHistory";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("Games/HolemPoker/HoldemPokerTicketHistoryItem")
export default class HoldemPokerTicketHistoryItem extends SocketIOHistoryItemBase {
    @property(cc.Label)
    player: cc.Label = null;

    @property(cc.Label)
    dealer: cc.Label = null;

    @property(cc.Label)
    stake: cc.Label = null;

    renderTicketHistoryItem(log: BetLog, index: number) {
        this.time.string = getStringDateByTime(log.time);
        this.round.string = log.roundId.toString();
        this.win.string = numberWithCommas(log.betWin);
        this.setBackground(index);
        if (!log.isFold) {
            const resultPlayer = `holdEmPoker.${HandResultConst[log.playerHandId]}`;
            this.player.string = `${i18n.t(resultPlayer)}`;
            this.dealer.string = `${i18n.t(this.getDealerResult(log))}`;
            this.handleNodeColorPlayerDealer(log);
        } else {
            const playerResult = `holdEmPoker.fold`;
            this.player.string = `${i18n.t(playerResult)}`;
            this.dealer.node.color = cc.Color.YELLOW;
            this.dealer.string = "-";
        }

        this.stake.string = numberWithCommas(log.stake);
    }

    getDealerResult(log: BetLog) {
        let dealerResult: string;
        if (log.isQualified) {
            dealerResult = `holdEmPoker.${HandResultConst[log.dealerHandId]}`;
        } else {
            dealerResult = `holdEmPoker.${HandResultConst[0]}`;
        }
        return dealerResult;
    }

    openTicketDetail() {}

    handleNodeColorPlayerDealer(log: BetLog) {
        if (log.isQualified) {
            if (log.isPlayerWin > 0) {
                this.player.node.color = cc.Color.YELLOW;
            } else if (log.isPlayerWin < 0) {
                this.dealer.node.color = cc.Color.YELLOW;
            }
        } else {
            this.player.node.color = cc.Color.YELLOW;
        }
    }
}
