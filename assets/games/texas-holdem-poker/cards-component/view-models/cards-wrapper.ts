import { convertCard } from "../../../holdem-poker/components/cards/view-models/CardWrapper";
import { dealerFakeData } from "../../texas-constants";
import PokerCards from "./texas-cards";
import SwapCards from "../../../_casino/SwapCards";

const handleCommunityCards = async (pokerCardsNote, communityCards) => {
    for (const element of communityCards) {
        await pokerCardsNote.drawingCardToMiddle(element, false);
    }

    return pokerCardsNote;
};
export const dealPlayerAndDealerCards = async (pokerCardsNote: PokerCards, callBack?: () => void) => {
    const playerFakeData = [
        { rank: "1", suit: 1 },
        { rank: "1", suit: 1 }
    ];

    await handleDealingCards(pokerCardsNote, playerFakeData, true);

    callBack && callBack();
};

export const dealPlayerAndDealerCardsWithoutSwap = async (pokerCardsNote: PokerCards, cardsData: any, callBack?: () => void) => {
    const { playerCards } = cardsData;
    await handleDealingCards(pokerCardsNote, playerCards, false);

    pokerCardsNote.focusPlayerCard();
    showIndicatorSymbols(pokerCardsNote, cardsData, callBack, 0);
};

const handleDealingCards = async (pokerCardsNote: PokerCards, playerCards: any, isFaceDown: boolean) => {
    pokerCardsNote.hideAllLabelIndicatorCards();
    pokerCardsNote.hideAllIndicator();

    await pokerCardsNote.drawingCardToPlayer(playerCards[0], isFaceDown, 0);

    await pokerCardsNote.drawingCardToDealer(dealerFakeData[0], true, 0);

    await pokerCardsNote.drawingCardToPlayer(playerCards[1], isFaceDown, 1);

    await pokerCardsNote.drawingCardToDealer(dealerFakeData[1], true, 1);
};
export const handleFaceUpPlayerCard = async (pokerCardsNote: PokerCards, cardsData: any, callBack?: () => void) => {
    const { playerCards } = cardsData;
    for (let index = 0; index < playerCards.length; index++) {
        const element = playerCards[index];
        await pokerCardsNote.faceUpPlayerCard(element, index);
    }

    pokerCardsNote.focusPlayerCard();
    showIndicatorSymbols(pokerCardsNote, cardsData, callBack, 0);
};

export const swapPlayerAndDealerCards = async (
    pokerCardsNote: PokerCards,
    cardsData: any,
    texasSwapCards: cc.Node,
    callBack?: () => void
) => {
    const componentSwap = texasSwapCards.getComponent(SwapCards);
    await componentSwap.swapCards();

    await handleFaceUpPlayerCard(pokerCardsNote, cardsData, callBack);
};

export const holdPlayerAndDealerCards = async (pokerCardsNote: PokerCards, cardsData: any, callBack?: () => void) => {
    await handleFaceUpPlayerCard(pokerCardsNote, cardsData, callBack);
};

export const dealFirstThreeCommunityCards = async (pokerCardsNote: PokerCards, cardsData: any, callBack?: () => void) => {
    pokerCardsNote.hideAllLabelIndicatorCards();
    pokerCardsNote.hideAllIndicator();
    const { communityCards } = cardsData;
    pokerCardsNote = await handleCommunityCards(pokerCardsNote, communityCards);

    showIndicatorSymbols(pokerCardsNote, cardsData, callBack, 0);
};

export const dealSecondCard = async (pokerCardsNote: PokerCards, cardsData: any, callBack?: () => void) => {
    pokerCardsNote.hideAllLabelIndicatorCards();
    pokerCardsNote.hideAllIndicator();
    const { communityCards } = cardsData;
    const communityCardsNew = communityCards.slice(-1);
    pokerCardsNote = await handleCommunityCards(pokerCardsNote, communityCardsNew);

    showIndicatorSymbols(pokerCardsNote, cardsData, callBack, 0);
};

export const dealThirdCardAndFaceUpDealerCards = async (
    pokerCardsNote: PokerCards,
    cardsData: any,
    callBack?: () => void,
    showResultMD5?: () => void
) => {
    pokerCardsNote.hideAllLabelIndicatorCards();
    pokerCardsNote.hideAllIndicator();
    const { communityCards, dealerCards } = cardsData;

    const communityCardsNew = communityCards.slice(-1);
    pokerCardsNote = await handleCommunityCards(pokerCardsNote, communityCardsNew);

    for (let index = 0; index < dealerCards.length; index++) {
        const element = dealerCards[index];
        await pokerCardsNote.faceUpDealerCard(element, index);
    }

    showResultMD5 && showResultMD5();
    showIndicatorSymbols(pokerCardsNote, cardsData, callBack, 2000);
};

export const dealFourAndFireCardAndFaceUpDealerCards = async (pokerCardsNote: PokerCards, cardsData: any, callBack?: () => void) => {
    pokerCardsNote.hideAllLabelIndicatorCards();
    pokerCardsNote.hideAllIndicator();
    const { communityCards, dealerCards, step } = cardsData;

    const communityCardsNew = communityCards.slice(step === "call" ? -2 : -1);

    pokerCardsNote = await handleCommunityCards(pokerCardsNote, communityCardsNew);

    for (let index = 0; index < dealerCards.length; index++) {
        const element = dealerCards[index];
        await pokerCardsNote.faceUpDealerCard(element, index);
    }

    showIndicatorSymbols(pokerCardsNote, cardsData, callBack, 1700);
};

const showIndicatorSymbols = (pokerCardsNote: PokerCards, cardsData: any, callBack?: () => void, delayCallBack = 2000) => {
    const { combinationResult } = cardsData;
    const { player, dealer } = combinationResult;

    pokerCardsNote.showArrowIndicatorCards(convertCard(player.combinationCards), "player");
    dealer && pokerCardsNote.showArrowIndicatorCards(convertCard(dealer.combinationCards), "dealer");

    dealer && pokerCardsNote.showLabelIndicatorCards(dealer.id, "dealer");
    pokerCardsNote.showLabelIndicatorCards(player.id, "player");

    setTimeout(() => {
        callBack && callBack();
    }, delayCallBack);
};

export const rawCardWhenRejoin = (pokerCardsNote: PokerCards, cardsData: any) => {
    const { combinationResult, communityCards, hasSwappedOrHold } = cardsData;
    let player = {
        id: 0,
        combinationCards: [],
        cards: []
    };
    let playerCards = [];
    if (hasSwappedOrHold) {
        playerCards = cardsData.playerCards;
        player = combinationResult.player;
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

    for (const card of playerCards) {
        pokerCardsNote.drawingRejoinPlayerCards(card, !hasSwappedOrHold);
    }

    for (const card of communityCards) {
        pokerCardsNote.drawingRejoinMiddleCards(card, false);
    }

    for (const card of dealerDataFake) {
        pokerCardsNote.drawingRejoinDealerCards(card, true);
    }

    if (hasSwappedOrHold) {
        pokerCardsNote.showArrowIndicatorCards(convertCard(player.combinationCards), "player");
        pokerCardsNote.showLabelIndicatorCards(player.id, "player");
        pokerCardsNote.focusPlayerCard();
    }
};
