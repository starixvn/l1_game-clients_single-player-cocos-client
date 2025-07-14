import { HoldemPokerCardModel } from "../event-models/HoldemPokerCardModel";
import { HandTicketDetail } from "../event-models/HoldemPokerCombinationResult";
import HoldemPokerEventHandler from "./HoldemPokerEventHandler";

export type HoldemPokerTicketDetail = {
    ticketDetail: {
        bets: any;
        dealer: {
            handId: number;
            combination: Array<Record<string, number>>;
            cards: Array<Record<string, number>>;
            isQualified: boolean;
        };
        player: {
            handId: number;
            combination: Array<Record<string, number>>;
            cards: Array<Record<string, number>>;
        };
        communityCards: Array<Record<string, number>>;
        isFold: boolean;
        isPlayerWin: number;
        isSwappedOrHold?: boolean;
    };
};

export default class HoldemPokerTicketDetailEventHandler extends HoldemPokerEventHandler<HoldemPokerTicketDetail> {
    protected verifyEvent(event: HoldemPokerTicketDetail) {
        return !!event.ticketDetail;
    }

    protected handle(event: HoldemPokerTicketDetail) {
        const { player, isFold, bets, dealer, isPlayerWin, isSwappedOrHold } = event.ticketDetail;
        const playerCards = new HandTicketDetail();
        playerCards.handResultId = player.handId;
        playerCards.cards = player.cards.map((c) => new HoldemPokerCardModel(c.rank, c.suit));
        playerCards.combinationCards = player?.combination?.map((c) => new HoldemPokerCardModel(c.rank, c.suit)) ?? [];

        const dealerCards = new HandTicketDetail();
        if (!isFold) {
            dealerCards.cards = dealer.cards.map((c) => new HoldemPokerCardModel(c.rank, c.suit));
            dealerCards.combinationCards = dealer?.combination?.map((c) => new HoldemPokerCardModel(c.rank, c.suit)) ?? [];
            dealerCards.handResultId = dealer.handId;
            dealerCards.isQualified = dealer.isQualified;
        }

        const communityCards = event.ticketDetail.communityCards.map((c) => new HoldemPokerCardModel(c.rank, c.suit));

        this.gameData.ticketDetailModel.changeTicketDetail({
            dealerCards,
            communityCards,
            playerCards,
            bets,
            isFold,
            isPlayerWin,
            isSwappedOrHold
        });
    }
}
