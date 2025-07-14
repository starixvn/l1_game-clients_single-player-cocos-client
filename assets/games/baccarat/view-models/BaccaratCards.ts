import AudioManager from "../../../common/audio/AudioManager";
import NewCard from "../../../common/new-card/view-models/NewCard";
import BaccaratCard from "./BaccaratCard";

const { ccclass, property } = cc._decorator;
@ccclass
export default class BaccaratCards extends cc.Component {
    @property(cc.Node)
    card1: cc.Node = null;

    @property(cc.Node)
    card2: cc.Node = null;

    @property(cc.Node)
    card3: cc.Node = null;

    @property(cc.Sprite)
    cardBack: cc.Sprite = null;

    @property(cc.Node)
    otherCard: cc.Node = null;

    @property()
    flyX = 0;

    @property
    isBanker = false;

    @property(cc.Node)
    cardsBox: cc.Node = null;

    @property(cc.Label)
    point: cc.Label = null;

    @property(cc.Node)
    cardsTmp: cc.Node[] = [null, null];

    @property(cc.Node)
    positionCardTmp1: cc.Node = null;

    @property(cc.Label)
    numberTagCardBack: cc.Label = null;

    protected playGetCardAudio = () => {
        // handle
    };
    protected readonly flyCardSecond = 0.8;
    protected readonly openCardSecond = 0.3;
    protected readonly openSecondCardSecond = 1.6;
    protected readonly setPointSecond = 0.2;
    protected isMainPage = false;

    private readonly SHOW_CARD = 1;
    private readonly SHOW_FINISH_CARD = 2;
    protected SET_POINT = 3;

    onLoad() {
        this.card1.children[0].getComponent(NewCard).faceDown();
        this.card2.children[0].getComponent(NewCard).faceDown();
        this.card3.children[0].getComponent(NewCard).faceDown();
        this.cardsTmp[0]?.children[0].getComponent(NewCard).faceDown();
        this.cardsTmp[1]?.children[0].getComponent(NewCard).faceDown();
    }

    init(playAudio, isMainPage = true) {
        if (playAudio) {
            this.playGetCardAudio = playAudio;
        }
        isMainPage && this.resetCard(this.card3);
        this.isMainPage = isMainPage;
    }

    resetCards() {
        this.point.node.parent.active = false;
        this.point.string = "0";
        this.resetCard(this.card1);
        this.resetCard(this.card2);
        this.resetCard(this.card3);
        this.resetCard(this.cardsTmp[0]);
        this.resetCard(this.cardsTmp[1]);
        this.card3.active = false;
        this.showHighlightCards(false);
    }

    showHighlightCards(highlight = true) {
        for (let i = 1; i <= 3; i++) {
            const card = this[`card${i}`];
            const baccaratCard = card.getComponent(BaccaratCard);
            highlight ? baccaratCard.setHighlight() : baccaratCard.resetHighlight();
        }
    }

    showCardsWithoutAnimation(cards: any[]) {
        this.resetSomeActionCards();
        this.openCard(0, cards, false);
        this.openCard(1, cards, false);
        if (cards.length > 2 && cards[2]) {
            this.openCard(2, cards, false);
            if (this.otherCard) {
                this.otherCard.active = true;
            }
        } else {
            if (this.otherCard) {
                this.otherCard.active = false;
            }
        }
    }

    showCards(cards: any[], onFinishShowCards: () => void, playerHasCard3 = false): void {
        this.point.string = "0";
        this.resetCard(this.card3);
        let delayTime = 0;
        const hasCard3 = cards.length === 3;
        const handleCard = cc.sequence(
            cc.callFunc(() => {
                this.openCard(0, cards);
            }),
            cc.delayTime(this.openCardSecond), // Waiting for open 1st card
            cc.callFunc(() => {
                this.openCard2(cards);
            }),
            cc.delayTime(this.openSecondCardSecond), // Waiting for open 2nd card
            cc.callFunc(() => {
                delayTime = this.openSecondCardSecond; // Waiting for the other side open 2nd card
                if (hasCard3) {
                    delayTime = this.flyAndOpenCard3(cards, delayTime, playerHasCard3);
                }
                const handleFinishCard = cc.sequence(
                    cc.delayTime(delayTime),
                    cc.callFunc(() => onFinishShowCards && onFinishShowCards())
                );

                handleFinishCard.setTag(this.SHOW_FINISH_CARD);
                this.node.runAction(handleFinishCard);
            })
        );

        this.resetSomeActionCards();
        handleCard.setTag(this.SHOW_CARD);

        this.node.runAction(handleCard);
    }

    protected resetSomeActionCards() {
        this.node.stopActionByTag(this.SHOW_CARD);
        this.node.stopActionByTag(this.SHOW_FINISH_CARD);
        this.card1.stopActionByTag(this.SET_POINT);
        this.card2.stopActionByTag(this.SET_POINT);
        this.card3.stopActionByTag(this.SET_POINT);
    }

    flyFirstCard() {
        this.flyCard(this.card1);
    }

    flySecondCard() {
        this.flyCard(this.card2);
    }

    flyCardTmp1() {
        this.flyCard(this.cardsTmp[0], 0.6);
    }

    flyCardTmp2() {
        this.flyCard(this.cardsTmp[1], 0.6);
    }

    protected setPoint(point: number) {
        this.point.node.active = true;
        this.point.node.parent.active = true;

        const currentPoint = parseInt(this.point.string);
        this.point.node.parent.runAction(cc.sequence(cc.scaleTo(this.setPointSecond, 1.1, 1.1), cc.scaleTo(this.setPointSecond, 1, 1)));

        this.point.string = ((currentPoint + point) % 10).toString();
    }

    private openCard2(cards: any[]) {
        if (this.isBanker) {
            this.node.runAction(
                cc.sequence(
                    cc.delayTime(this.openSecondCardSecond), // Waiting for player open 2nd card
                    cc.callFunc(() => {
                        this.openCard(1, cards);
                    })
                )
            );
        } else {
            this.openCard(1, cards);
        }
    }

    private flyAndOpenCard3(cards: any[], delayTime: number, playerHasCard3: boolean) {
        const card = this.card3;
        let cardTempPosition = cc.Vec3.ZERO;

        const setCard3LikeTmpCard = () => {
            const cardTempIndex = this.cardsTmp.findIndex((tmp) => tmp.opacity !== 0);
            cardTempPosition =
                cardTempIndex === 0 && this.isBanker ? this.positionCardTmp1.position : this.cardsTmp[cardTempIndex].position;
            this.cardsTmp[cardTempIndex].opacity = 0;
            card.active = true;
            card.angle = 0;
            card.scale = this.cardsTmp[cardTempIndex].scale;
            card.getComponent(BaccaratCard).setNumberTag(cardTempIndex === 0 ? "5" : "6");
            card.getComponent(BaccaratCard).numberTag.scale = this.cardsTmp[cardTempIndex].getComponent(BaccaratCard).numberTag.scale;
        };

        if (this.isBanker) {
            if (playerHasCard3) {
                delayTime += this.flyCardSecond + this.openSecondCardSecond; // Waiting for player open 3rd card
            }

            this.node.runAction(
                cc.sequence(
                    cc.delayTime(delayTime),
                    cc.callFunc(() => setCard3LikeTmpCard()),
                    cc.callFunc(() => this.flyCard(card, 1, cardTempPosition, true))
                )
            );
        } else {
            this.node.runAction(
                cc.sequence(
                    cc.delayTime(delayTime),
                    cc.callFunc(() => setCard3LikeTmpCard()),
                    cc.callFunc(() => this.flyCard(card, 1, cardTempPosition, true))
                )
            );
        }

        delayTime += this.flyCardSecond;
        delayTime += 0.2; // Buffer time after the flight

        this.node.runAction(
            cc.sequence(
                cc.delayTime(delayTime),
                cc.callFunc(() => {
                    this.openCard(2, cards);
                })
            )
        );

        delayTime += this.openSecondCardSecond;

        return delayTime;
    }

    flyCard(card: cc.Node, scale = 1, from: cc.Vec3 = this.cardsBox.position, isCard3 = false) {
        const cardPosition = card.position;
        card.position = from;
        card.opacity = 255;
        card?.getComponent(BaccaratCard) && (card.getComponent(BaccaratCard).numberTag.parent.active = true);

        if (isCard3) {
            card.getComponent(BaccaratCard).numberTag.runAction(cc.scaleTo(this.flyCardSecond, 2).easing(cc.easeInOut(2)));
        }
        card.runAction(
            cc.spawn(
                cc.rotateTo(this.flyCardSecond, 0).easing(cc.easeInOut(2)),
                cc.scaleTo(this.flyCardSecond, scale).easing(cc.easeInOut(2)),
                cc.moveTo(this.flyCardSecond, cc.v2(cardPosition.x, cardPosition.y)).easing(cc.easeInOut(2))
            )
        );

        if (AudioManager.getInstance().sfxEnabled) {
            card.runAction(
                cc.sequence(
                    cc.delayTime(0.2),
                    cc.callFunc(() => this.playGetCardAudio())
                )
            );
        }
    }

    resetCard(card: cc.Node) {
        card.children[0].getComponent(NewCard).faceDown();
        card.opacity = 0;
        card.scale = 0.5;
        card.angle = -135;
        card.getComponent(BaccaratCard).numberTag.active = true;
    }

    protected openCard(index: number, cards: any[], isAnimated = true) {
        let delayTime = 0;
        if (index < cards.length) {
            const cardData = cards[index];
            const currentCard = this[`card${index + 1}`] as cc.Node;

            currentCard.active = false;
            if (cardData) {
                currentCard.active = true;
            }
            currentCard?.getComponent(BaccaratCard) && (currentCard.getComponent(BaccaratCard).numberTag.parent.active = false);

            const newCard = currentCard.children[0].getComponent(NewCard);
            newCard.setCardOldStyle({
                rank: cardData.card,
                suit: cardData.type
            });

            newCard.faceUp();
            if (index === 2 && !isAnimated && this.isMainPage) {
                const cardTemp = this.cardsTmp.find((tmp) => tmp.opacity !== 0);
                if (cardTemp) {
                    cardTemp.opacity = 0;
                }
            }
            delayTime = this.handleCardWithAnimated(isAnimated, index, currentCard, delayTime);

            if (this.point) {
                this.handleSetPoint(cardData, delayTime, currentCard);
            }
        }
    }

    private handleCardWithAnimated(isAnimated: boolean, index: number, currentCard: cc.Node, delayTime: number): number {
        if (isAnimated) {
            delayTime = this.calculateDelayTimeWithAnimation(index, currentCard, delayTime);
        } else {
            if (this.isMainPage) {
                currentCard.getComponent(BaccaratCard).numberTag.active = false;
                if (index === 2) {
                    currentCard.opacity = 255;
                    currentCard.scale = 1;
                    currentCard.angle = this.isBanker ? 90 : -90;
                }
            }
        }

        return delayTime;
    }

    private calculateDelayTimeWithAnimation(index: number, currentCard: cc.Node, delayTime: number) {
        if (index === 0) {
            // 1st card
            currentCard.scaleX = 0;
            currentCard.runAction(cc.scaleTo(this.openCardSecond, 1, 1));
            this.card1.getComponent(BaccaratCard).numberTag.active = false;
            delayTime += this.openCardSecond;
        } else {
            this.cardBack.node.active = true;
            const position = cc.v3(currentCard.position.x - currentCard.width / 2, currentCard.position.y - currentCard.height / 2, 0);
            this.cardBack.node.position = position;
            const card = currentCard.getComponent(BaccaratCard);
            card.numberTag.active = false;
            this.numberTagCardBack.string = card.getNumberTag();
            this.setActionCardBack();

            delayTime += this.openSecondCardSecond;
        }

        if (index === 2) {
            this.setActionCardThree(currentCard, delayTime);
        }

        return delayTime;
    }

    private setActionCardBack() {
        this.cardBack.node.runAction(
            cc.sequence(
                cc.moveBy(0.8, cc.v2(10, -10)).easing(cc.easeSineOut()),
                cc.spawn(
                    cc.moveBy(0.8, cc.v2(150, -150)).easing(cc.easeExponentialInOut()),
                    cc.fadeOut(0.8).easing(cc.easeExponentialInOut())
                ),
                cc.callFunc(() => {
                    this.cardBack.node.active = false;
                    this.cardBack.node.opacity = 255;
                })
            )
        );
    }

    setActionCardThree(currentCard: cc.Node, delayTime: number) {
        currentCard.runAction(cc.sequence(cc.delayTime(delayTime), cc.rotateBy(0.5, this.isBanker ? 270 : -270).easing(cc.easeSineOut())));
    }

    private handleSetPoint(data: any, delayTime: number, currentCard: cc.Node) {
        const pointValue: number = data.card + 1;
        const setPoint = cc.sequence(
            cc.delayTime(delayTime),
            cc.callFunc(() => this.setPoint(pointValue >= 10 ? 0 : pointValue))
        );

        currentCard.stopActionByTag(this.SET_POINT);
        setPoint.setTag(this.SET_POINT);
        currentCard.runAction(setPoint);
    }
}
