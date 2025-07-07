import { convertOldRank } from "../../../../../common/new-card/view-models/NewCard";
import SwapCards from "../../../../_casino/SwapCards";
import { HoldemPokerAfterDealModel } from "../../../event-models/HoldemPokerAfterDealModel";
import HoldemPokerHoldModel from "../../../event-models/HoldemPokerHoldModel";
import HoldemPokerCards from "./HoldemPokerCards";

export const convertCard = (cards) => {
    return cards.map((e) => {
        return {
            rank: convertOldRank(e.rank),
            suit: e.suit
        };
    });
};

export const dealPlayerAndDealerCards = async (
    pokerCardsNote: HoldemPokerCards,
    dealModel: HoldemPokerAfterDealModel,
    callBack?: () => void
) => {
    const { communityCards } = dealModel;
    const playerFakeData = [
        { rank: "1", suit: 1 },
        { rank: "1", suit: 1 }
    ];
    await handleDealingCards(pokerCardsNote, playerFakeData, communityCards, true);
    showPlayerIndicator(pokerCardsNote, dealModel);
    callBack && callBack();
};

export const dealPlayerAndDealerCardsWithoutSwap = async (
    pokerCardsNote: HoldemPokerCards,
    holdModel: HoldemPokerHoldModel,
    callBack?: () => void
) => {
    await handleDealingCards(pokerCardsNote, holdModel.playerCards, holdModel.communityCards, false);
    pokerCardsNote.focusPlayerCard();
    showIndicator(pokerCardsNote, holdModel, callBack, 0);
};

const handleDealingCards = async (pokerCards: HoldemPokerCards, playerCards: any, communityCards: any, isFaceDown: boolean) => {
    pokerCards.hideAllLabelIndicatorCards();
    pokerCards.hideAllIndicator();

    const dealerFakeData = [
        { rank: "1", suit: 1 },
        { rank: "1", suit: 1 }
    ];

    // =>player
    await pokerCards.drawingCardToPlayer(playerCards[0], isFaceDown, 0);
    //=> dealer
    await pokerCards.drawingCardToDealer(dealerFakeData[0], true, 0);
    // => player
    await pokerCards.drawingCardToPlayer(playerCards[1], isFaceDown, 1);
    //=> dealer;
    await pokerCards.drawingCardToDealer(dealerFakeData[1], true, 1);

    for (const element of communityCards) {
        await pokerCards.drawingCardToMiddle(element, false);
    }
};

export const handleFaceUpPlayerCard = async (pokerCardsNote: HoldemPokerCards, cardsData: any, callBack?: () => void) => {
    pokerCardsNote.hideAllLabelIndicatorCards();
    pokerCardsNote.hideAllIndicator();

    const { playerCards } = cardsData;
    for (let index = 0; index < playerCards.length; index++) {
        const element = playerCards[index];
        await pokerCardsNote.faceUpPlayerCard(element, index);
    }

    pokerCardsNote.focusPlayerCard();
    showIndicator(pokerCardsNote, cardsData, callBack, 0);
};

export const swapPlayerAndDealerCards = async (
    pokerCardsNote: HoldemPokerCards,
    cardsData: any,
    texasSwapCards: cc.Node,
    callBack?: () => void
) => {
    const componentSwap = texasSwapCards.getComponent(SwapCards);
    await componentSwap.swapCards();

    await handleFaceUpPlayerCard(pokerCardsNote, cardsData, callBack);
};

export const holdPlayerAndDealerCards = async (pokerCardsNote: HoldemPokerCards, cardsData: any, callBack?: () => void) => {
    await handleFaceUpPlayerCard(pokerCardsNote, cardsData, callBack);
};

export const rawCardAfterClickCall = async (
    pokerCardsNote: HoldemPokerCards,
    cardsData: any,
    showResultMD5?: () => void,
    callBack?: () => void
) => {
    const { communityCards, dealerCards } = cardsData;
    const communityCardsNew = communityCards.slice(-2);

    pokerCardsNote.hideAllLabelIndicatorCards();
    pokerCardsNote.hideAllIndicator();

    for (const element of communityCardsNew) {
        await pokerCardsNote.drawingCardToMiddle(element, false);
    }

    let index = 0;
    for (const element of dealerCards) {
        await pokerCardsNote.faceUpDealerCard(element, index);
        index++;
    }

    showResultMD5 && showResultMD5();
    showIndicator(pokerCardsNote, cardsData, callBack, 1000);
};

const showIndicator = (pokerCardsNote: HoldemPokerCards, cardsData: any, callBack?: () => void, delayCallBack = 2000) => {
    showPlayerIndicator(pokerCardsNote, cardsData);
    showDealerIndicator(pokerCardsNote, cardsData.combinationResult);

    setTimeout(() => {
        callBack && callBack();
    }, delayCallBack);
};

export const collectCards = async (pokerCardsNote: HoldemPokerCards, callBack?: () => void, delayCallBack = 0) => {
    pokerCardsNote.hideAllLabelIndicatorCards();
    pokerCardsNote.hideAllIndicator();
    await pokerCardsNote.collectCardsOnTable();
    callBack && callBack();
};

export const rawCardWhenRejoin = (pokerCardsNote: HoldemPokerCards, cardsData: any, callBack?: () => void) => {
    const { communityCards, hasSwappedOrHold } = cardsData;
    let playerCards = [];
    if (hasSwappedOrHold) {
        playerCards = cardsData.playerCards;
    } else {
        playerCards = [
            { rank: "6", suit: 3 },
            { rank: "6", suit: 3 }
        ];
    }

    const dealerDataFake = [
        { rank: "6", suit: 3 },
        { rank: "6", suit: 3 }
    ];

    pokerCardsNote.hideAllLabelIndicatorCards();
    pokerCardsNote.hideAllIndicator();

    for (const card of playerCards) {
        pokerCardsNote.drawingRejoinPlayerCards(card, !hasSwappedOrHold);
    }

    for (const card of communityCards) {
        pokerCardsNote.drawingRejoinMiddleCards(card, false);
    }

    for (const card of dealerDataFake) {
        pokerCardsNote.drawingRejoinDealerCards(card, true);
    }

    showPlayerIndicator(pokerCardsNote, cardsData);

    if (hasSwappedOrHold) {
        pokerCardsNote.focusPlayerCard();
    }
};

export const showPlayerIndicator = async (pokerCardsNote: HoldemPokerCards, cardsData: any) => {
    const { combinationResult } = cardsData;
    const { player } = combinationResult;
    const playerCombinationCardsConverted: [
        {
            rank: string;
            suit: number;
        }
    ] = convertCard(player.combinationCards);

    if (cardsData.playerCards || cardsData.communityCards.length > 3) {
        pokerCardsNote.showArrowIndicatorCards(playerCombinationCardsConverted, "player");
    } else {
        pokerCardsNote.showArrowIndicatorCards(playerCombinationCardsConverted, "community");
    }

    pokerCardsNote.showLabelIndicatorCards(player.id, "player");
};

export const showDealerIndicator = async (pokerCardsNote: HoldemPokerCards, combinationResult: any) => {
    const { dealer, isQualified } = combinationResult;
    const dealerCombinationCardsConverted: [
        {
            rank: string;
            suit: number;
        }
    ] = dealer ? convertCard(dealer.combinationCards) : [];

    pokerCardsNote.showArrowIndicatorCards(dealerCombinationCardsConverted, "dealer");
    dealer && pokerCardsNote.showLabelIndicatorCards(isQualified ? dealer.id : 0, "dealer");
};
