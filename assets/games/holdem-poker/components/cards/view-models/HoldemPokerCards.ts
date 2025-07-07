import * as i18n from "i18n/runtime-scripts/LanguageData";

import AudioManager from "../../../../../common/audio/AudioManager";
import { CardAnimation, CardModel } from "../../../../../common/new-card/view-models/NewCard";
import HoldemPokerArrows from "./HoldemPokerArrows";
import HoldemPokerCard from "./HoldemPokerCard";
import HandPlace from "./HoldemPokerHandPlace";

const { ccclass, property } = cc._decorator;
export const CombineCardResultLabel = [
    { key: 0, dataId: "doesNotQualify" },
    { key: 1, dataId: "highCards" },
    { key: 2, dataId: "onePair" },
    { key: 3, dataId: "twoPairs" },
    { key: 4, dataId: "threeKind" },
    { key: 5, dataId: "straight" },
    { key: 6, dataId: "flush" },
    { key: 7, dataId: "fullHouse" },
    { key: 8, dataId: "fourOfAKind" },
    { key: 9, dataId: "straightFlush" },
    { key: 10, dataId: "royalFlush" }
];

@ccclass
export default class HoldemPokerCards extends cc.Component {
    @property(cc.Prefab)
    cardPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    arrowPrefab: cc.Prefab = null;

    @property(cc.Node)
    cardBox: cc.Node = null;

    @property(HandPlace)
    dealerCards: HandPlace = null;

    @property(HandPlace)
    middleCards: HandPlace = null;

    @property(HandPlace)
    playerCards: HandPlace = null;

    @property(cc.Node)
    combineDealerCardResult: cc.Node = null;

    @property(cc.Node)
    combinePlayerCardResult: cc.Node = null;

    @property(cc.Node)
    cardDropPlace: cc.Node = null;

    @property(cc.AudioSource)
    cardSlideAudioSource: cc.AudioSource = null;

    get isCollectedCard() {
        return (
            this.middleCards.getCards().length === 0 && this.playerCards.getCards().length === 0 && this.dealerCards.getCards().length === 0
        );
    }

    protected playAudioCardSliding() {
        AudioManager.getInstance().playSFX(this.cardSlideAudioSource.clip);
    }

    protected createCard(card: CardModel, scaleX: number, scaleY: number): cc.Node {
        const node = cc.instantiate(this.cardPrefab);
        const cardComponent = node.getComponent(HoldemPokerCard);
        cardComponent.setCardOldStyle(card);
        node.scaleX = scaleX;
        node.scaleY = scaleY;
        return node;
    }

    public drawingRejoinDealerCards(cardData: CardModel, faceDown: boolean) {
        this.dealCardWithoutAnimation(cardData, this.dealerCards, faceDown);
    }

    public drawingRejoinPlayerCards(cardData: CardModel, faceDown: boolean) {
        this.dealCardWithoutAnimation(cardData, this.playerCards, faceDown);
    }

    public focusPlayerCard() {
        this.playerCards.SetSelected(true);
    }

    public unFocusPlayerCard() {
        this.playerCards.SetSelected(false);
    }

    public drawingRejoinMiddleCards(cardData: CardModel, faceDown: boolean, forcePositionIndex?: number) {
        this.dealCardWithoutAnimation(cardData, this.middleCards, faceDown, forcePositionIndex);
    }

    async drawingCardToDealer(cardData: CardModel, faceDown: boolean, forcePositionIndex?: number) {
        await this.dealCard(cardData, this.dealerCards, faceDown, forcePositionIndex);
    }
    async drawingCardToMiddle(cardData: CardModel, faceDown: boolean, forcePositionIndex?: number) {
        await this.dealCard(cardData, this.middleCards, faceDown, forcePositionIndex);
    }

    async drawingCardToPlayer(cardData: CardModel, faceDown: boolean, forcePositionIndex?: number) {
        await this.dealCard(cardData, this.playerCards, faceDown, forcePositionIndex);
    }

    async faceUpDealerCard(cardData: CardModel, indexCard: number) {
        await this.faceUpCard(cardData, this.dealerCards, indexCard);
    }

    async faceUpPlayerCard(cardData: CardModel, indexCard: number) {
        await this.faceUpCard(cardData, this.playerCards, indexCard);
    }

    showArrowIndicatorCards(combineCard: CardModel[], whose: string) {
        switch (whose) {
            case "community":
                this.showIndicatorCard(combineCard, [{ row: this.middleCards, position: "bot", whose: "player" }]);
                break;
            case "player":
                this.showIndicatorCard(combineCard, [
                    { row: this.playerCards, position: "top", whose: "player" },
                    { row: this.middleCards, position: "bot", whose: "player" }
                ]);
                break;
            case "dealer":
                this.showIndicatorCard(combineCard, [
                    { row: this.dealerCards, position: "top", whose: "dealer" },
                    { row: this.middleCards, position: "top", whose: "dealer" }
                ]);
                break;
            default:
                break;
        }
    }

    public showLabelIndicatorCards(labelId: number, whose: string) {
        switch (whose) {
            case "player":
                this.updateLabel(this.combinePlayerCardResult, labelId);
                break;
            case "dealer":
                this.updateLabel(this.combineDealerCardResult, labelId);
                break;
            default:
                break;
        }
    }

    protected updateLabel(combineCardResult: cc.Node, labelId: number) {
        const label = combineCardResult.getChildByName("text").getComponent(cc.Label);
        const result = `holdEmPoker.${CombineCardResultLabel[labelId].dataId}`;
        label.string = `${i18n.t(result)}`;
        combineCardResult.active = true;
    }

    public hideAllIndicator() {
        this.playerCards
            .getCards()
            .forEach((c) => c.getChildByName("card").getChildByName("Arrows").getComponent(HoldemPokerArrows).hideAllArrow());
        this.dealerCards
            .getCards()
            .forEach((c) => c.getChildByName("card").getChildByName("Arrows").getComponent(HoldemPokerArrows).hideAllArrow());
        this.middleCards
            .getCards()
            .forEach((c) => c.getChildByName("card").getChildByName("Arrows").getComponent(HoldemPokerArrows).hideAllArrow());
    }

    public hideAllLabelIndicatorCards() {
        this.combinePlayerCardResult.active = false;
        this.combineDealerCardResult.active = false;
    }

    protected randomRotation(): number {
        return Math.floor(Math.random() * 10); // NOSONAR
    }

    protected showIndicatorCard(
        combineCards: CardModel[],
        cardHands: { row: HandPlace; position: string; whose: string }[],
        waitingCardRender = 0.1
    ) {
        this.schedule(
            () => {
                cardHands.forEach((cardHand) => {
                    const cardsInRow = cardHand.row.getCards();
                    cardsInRow.forEach((cardInRow) => {
                        const card = cardInRow.getComponent(HoldemPokerCard).getCard();
                        const combineCard = combineCards.find((e) => {
                            return e.rank === card.rank && e.suit === card.suit;
                        });
                        if (combineCard) {
                            cardInRow
                                .getChildByName("card")
                                .getChildByName("Arrows")
                                .getComponent(HoldemPokerArrows)
                                .showArrow(cardHand.position, cardHand.whose);
                        }
                    });
                });
            },
            null,
            null,
            waitingCardRender
        );
    }

    protected faceUpCard(cardInfo: CardModel, cardHand: HandPlace, indexCard: number): Promise<void> {
        const selectedCard = cardHand.getCards()[indexCard];
        if (!selectedCard) {
            return null;
        }
        const duration = 1;
        const cardComponent = selectedCard.getComponent(HoldemPokerCard);

        return new Promise((resolve) => {
            cc.tween(selectedCard)
                .call(() => {
                    cardComponent.setCardOldStyle(cardInfo);
                    cardComponent.playAnimation(CardAnimation.DealerOpenCard, duration);
                })
                .delay(duration)
                .call(() => resolve())
                .start();
        });
    }

    protected dealCardWithoutAnimation(cardInfo: CardModel, cardHand: HandPlace, faceDown: boolean, forcePositionIndex?: number) {
        const cardNode = this.createCard(cardInfo, 1, 1);
        const cardComponent = cardNode.getComponent(HoldemPokerCard);
        cardComponent.setFaceUp(!faceDown);
        const startWorldPos = this.cardBox.convertToWorldSpaceAR(cc.v2(0, 0));
        const startLocalPos = cardHand.cardLayout.content.convertToNodeSpaceAR(startWorldPos);
        const finalPosition = cardHand.cardLayout.getFinalPosition();
        const rotationX = cc.v3(0);
        cardNode.position = cc.v3(startLocalPos.x, startLocalPos.y, 0);
        cardHand.addCard(cardNode);
        cardNode.position = finalPosition;
        cardNode.eulerAngles = rotationX;
        cardNode.active = true;
    }

    protected dealCard(cardInfo: CardModel, cardHand: HandPlace, faceDown: boolean, forcePositionIndex?: number): Promise<void> {
        const cardNode = this.createCard(cardInfo, 1, 1);
        const cardComponent = cardNode.getComponent(HoldemPokerCard);
        const startWorldPos = this.cardBox.convertToWorldSpaceAR(cc.v2(0, 0));
        const startLocalPos = cardHand.cardLayout.content.convertToNodeSpaceAR(startWorldPos);
        const nextPosition = cardHand.cardLayout.getNextPosition();
        const finalPosition = cardHand.cardLayout.getFinalPosition();
        const rotationX = cc.v3(0);
        cardNode.position = cc.v3(startLocalPos.x, startLocalPos.y, 0);
        cardHand.addCard(cardNode);

        const pullDuration = 0.2;
        const moveDuration = 0.4;
        const slideDuration = 0.1;
        return new Promise((resolve) => {
            cc.tween(cardNode)
                .call(() => {
                    this.playAudioCardSliding();
                    cardComponent.playAnimation(CardAnimation.PullCard, pullDuration);
                })
                .delay(pullDuration)
                .call(() => {
                    cardComponent.playAnimation(faceDown ? CardAnimation.DealerDrawingFaceDown : CardAnimation.DealerToHand, moveDuration);
                })
                .to(moveDuration, {
                    position: nextPosition,
                    eulerAngles: rotationX
                })
                .to(slideDuration, {
                    position: finalPosition,
                    eulerAngles: rotationX
                })
                .call(() => resolve())
                .start();
        });
    }

    protected collectCards(containerCards: HandPlace) {
        return new Promise<void>((resolve) => {
            const durationJumpToBoxCard = 0.7;

            const worldPosition = this.cardDropPlace.convertToWorldSpaceAR(cc.v2(0, 0));
            containerCards.cardLayout.shadow.active = false;
            const cardsNodes = containerCards.getCards();

            if (!cardsNodes.length) {
                resolve();
                return;
            }
            let count = 0;
            const destPosition = cardsNodes[0].parent.convertToNodeSpaceAR(worldPosition);
            cardsNodes.forEach((cardNode) => {
                cardNode.is3DNode = true;
                cc.tween(cardNode)
                    .to(0.3, { position: cc.v3(0, 0, 0), eulerAngles: cc.v3(0, 0, this.randomRotation()) })
                    .delay(count * 0.05)
                    .call(() => {
                        const cardComponent = cardNode.getComponent(HoldemPokerCard);
                        cardComponent.playAnimation(CardAnimation.DropCard, 0.7);
                    })
                    .then(cc.jumpTo(durationJumpToBoxCard, destPosition, 250, 1))
                    .delay(1)
                    .call(() => {
                        cardNode.destroy();
                        resolve();
                    })
                    .start();
            });
            count++;
        });
    }

    public async collectCardsOnTable() {
        if (this.playerCards.Selected) {
            await this.playerCards.SetSelected(false);
        }
        await Promise.all([this.collectCards(this.playerCards), this.collectCards(this.middleCards), this.collectCards(this.dealerCards)]);
    }
}
