import * as i18n from "i18n/runtime-scripts/LanguageData";

import { getStringDateByTime } from "../../../../common/helpers/DateTimeHelper";
import { CardModel } from "../../../../common/new-card/view-models/NewCard";
import GameTicketDetailBase from "../../../_base/view-models/GameTicketDetailBase";
import { convertCard } from "../../components/cards/view-models/CardWrapper";
import HoldemPokerCard from "../../components/cards/view-models/HoldemPokerCard";
import { CombineCardResultLabel } from "../../components/cards/view-models/HoldemPokerCards";
import { HoldemPokerTicketDetailModel } from "../../event-models/HoldemPokerTicketDetailModel";
import HoldemPokerTicketDetailItem from "./HoldemPokerTicketDetailItem";
import { HandResultConst } from "./HoldemPokerTicketHistory";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("Games/HolemPoker/HoldemPokerTicketHistory")
export default class HoldemPokerTicketDetail extends GameTicketDetailBase {
    @property(cc.Prefab)
    prefabItem: cc.Prefab = null;

    @property(cc.Label)
    roundId: cc.Label = null;

    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Prefab)
    pokerCardPrefab: cc.Prefab = null;

    @property(cc.Layout)
    playerCardsContainer: cc.Layout = null;

    @property(cc.Layout)
    dealerCardsContainer: cc.Layout = null;

    @property(cc.Layout)
    communityCardsContainer: cc.Layout = null;

    @property(cc.Layout)
    playerCombinationContainer: cc.Layout = null;

    @property(cc.Layout)
    dealerCombinationContainer: cc.Layout = null;

    @property(cc.Label)
    playerRank: cc.Label = null;

    @property(cc.Label)
    dealerRank: cc.Label = null;

    @property(cc.Node)
    betTable: cc.Node = null;

    protected heightBetTable = 64;

    HEIGHT_BET_DETAIL_TABLE = 270;
    WIDTH_BET_DETAIL_TABLE = 850;

    renderTitle(roundId: number, time: Date) {
        this.roundId.string = roundId.toString();
        this.time.string = getStringDateByTime(time);
        this.roundId.node.color = cc.Color.YELLOW;
    }

    renderBets(data: HoldemPokerTicketDetailModel) {
        const { bets, isFold } = data.ticketDetail;
        const totalRow = bets.length;
        this.heightBetTable = isFold ? 76 : 64;
        bets.forEach((bet, index) => {
            this.heightBetTable += 50;
            this.handleTicketDetailItem(bet, index, totalRow);
        });
        this.betTable.height = this.heightBetTable;
        this.betDetailTable?.updateSize(this.WIDTH_BET_DETAIL_TABLE, this.heightBetTable);
        this.mainFrame.height = 420 + this.heightBetTable;
        this.betDetailFrame.updateSizeFrame(this.mainFrame.width, this.mainFrame.height);
    }

    protected getComponentDetailItem(node: cc.Node): HoldemPokerTicketDetailItem {
        return node.getComponent(HoldemPokerTicketDetailItem);
    }

    handleTicketDetailItem(bet: any, index: number, totalRow: number) {
        const detailItemPrefab = cc.instantiate(this.prefabItem);
        const detailItemControl = this.getComponentDetailItem(detailItemPrefab);
        detailItemControl.renderTicketDetailItem(bet, index, totalRow);
        this.content.addChild(detailItemPrefab);
    }

    renderCards(data: HoldemPokerTicketDetailModel) {
        const { playerCards, dealerCards, isFold, communityCards, isPlayerWin, isSwappedOrHold } = data.ticketDetail;

        const communityCardsConverted = convertCard(communityCards);
        this.renderCardPlayer(playerCards, isSwappedOrHold);
        communityCardsConverted.forEach((element) => {
            this.communityCardsContainer.node.addChild(this.createCard(element, 0.75, 0.75));
            this.communityCardsContainer.updateLayout();
        });

        if (!isFold) {
            const playerCombinationConverted = convertCard(playerCards.combinationCards);
            const dealerCombinationConverted = convertCard(dealerCards.combinationCards);
            const dealerCardsConverted = convertCard(dealerCards.cards);

            this.renderCardsUIEqualCall(playerCombinationConverted, dealerCombinationConverted, dealerCardsConverted);

            const playerResult = `holdEmPoker.${CombineCardResultLabel[playerCards.handResultId].dataId}`;
            this.playerRank.string = `${i18n.t(playerResult)}`;

            this.dealerRank.string = `${i18n.t(this.getDealerResult(dealerCards))}`;
            this.handleColorNodePlayerDealer({ dealerCards, isPlayerWin });
        } else {
            this.renderCardsUIEqualFold();
        }
    }

    protected checkFaceDownPlayerCard(isSwappedOrHold: boolean) {
        return isSwappedOrHold;
    }

    protected renderCardPlayer(playerCards, isSwappedOrHold) {
        let cards = [];
        if (playerCards.cards.length > 0) {
            cards = playerCards.cards;
        } else {
            cards = [
                { rank: "1", suit: 1 },
                { rank: "1", suit: 1 }
            ];
        }
        const playerCardsConverted = convertCard(cards);
        playerCardsConverted.forEach((element) => {
            this.playerCardsContainer.node.addChild(this.createCard(element, 0.75, 0.75, this.checkFaceDownPlayerCard(isSwappedOrHold)));
            this.playerCardsContainer.updateLayout();
        });
    }

    getDealerResult(dealerCards) {
        let dealerResult: string;
        if (dealerCards.isQualified) {
            dealerResult = `holdEmPoker.${CombineCardResultLabel[dealerCards.handResultId].dataId}`;
        } else {
            dealerResult = `holdEmPoker.${HandResultConst[0]}`;
        }
        return dealerResult;
    }

    handleColorNodePlayerDealer({ dealerCards, isPlayerWin }) {
        if (dealerCards.isQualified) {
            if (isPlayerWin > 0) {
                this.playerRank.node.color = cc.Color.YELLOW;
            } else if (isPlayerWin < 0) {
                this.dealerRank.node.color = cc.Color.YELLOW;
            }
        } else {
            this.playerRank.node.color = cc.Color.YELLOW;
        }
    }

    protected renderCardsUIEqualCall(playerCombination: any, dealerCombination: any, dealerCards: any) {
        playerCombination.forEach((element) => {
            this.playerCombinationContainer.node.addChild(this.createCard(element, 0.75, 0.75));
            this.playerCombinationContainer.updateLayout();
        });

        dealerCombination.forEach((element) => {
            this.dealerCombinationContainer.node.addChild(this.createCard(element, 0.75, 0.75));
            this.dealerCombinationContainer.updateLayout();
        });

        dealerCards.forEach((element) => {
            this.dealerCardsContainer.node.addChild(this.createCard(element, 0.75, 0.75));
            this.dealerCardsContainer.updateLayout();
        });
    }

    protected renderCardsUIEqualFold() {
        const dealerFakeData = [
            { rank: "1", suit: 1 },
            { rank: "1", suit: 1 }
        ];
        dealerFakeData.forEach((element) => {
            this.dealerCardsContainer.node.addChild(this.createCard(element, 0.75, 0.75, false));
            this.dealerCardsContainer.updateLayout();
        });
        this.dealerCombinationContainer.getComponent(cc.Label).string = "-";
        this.playerCombinationContainer.getComponent(cc.Label).string = "-";
        const playerResult = "holdEmPoker.fold";
        this.playerRank.string = `${i18n.t(playerResult)}`;
        this.dealerRank.string = "-";
    }

    protected createCard(card: CardModel, scaleX: number, scaleY: number, isFaceUp = true): cc.Node {
        const node = cc.instantiate(this.pokerCardPrefab);
        const cardComponent = node.getComponent(HoldemPokerCard);
        cardComponent.setCard(card);
        cardComponent.setFaceUp(isFaceUp);
        node.scaleX = scaleX;
        node.scaleY = scaleY;
        return node;
    }

    onDisable() {
        this.content.destroyAllChildren();
        this.node.destroy();
    }
}
