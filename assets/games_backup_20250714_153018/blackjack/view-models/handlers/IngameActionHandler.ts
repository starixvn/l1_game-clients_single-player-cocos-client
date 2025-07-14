import ChipStack from "../../../../common/chip-stack/views/ChipStack";
import DataHandler from "../../../_base/handlers/DataHandler";
import BlackJack, { BlackJackActionType } from "../BlackJack";

export default class IngameActionHandler implements DataHandler {
    constructor(private readonly main: BlackJack) {}

    handle(data: any) {
        if (data.hit) {
            this.processHitAction(data.hit);
            this.main.showProcessingWarning(false);
        }

        if (data.stand) {
            this.processStandAction(data.stand);
            this.main.showProcessingWarning(false);
        }

        if (data.double) {
            this.processDoubleAction(data.double);
        }

        if (data.split) {
            this.processSplitAction(data.split);
            this.main.updateAvailableActions();
        }
    }

    processSplitAction(split: any) {
        const hands = split.hands;
        const firstHand = hands[0];
        const secondHand = hands[1];

        const firstPlace = this.main.handPlaces[firstHand.pos - 1];
        const secondPlace = this.main.handPlaces[firstHand.pos + 2];
        firstPlace.setData(firstHand);
        secondPlace.setData(secondHand);

        secondPlace.syncBetValue();
        this.placeChipsForSplitHand(firstHand.pos + 2, firstHand.bet);
        this.main.lockBet();

        cc.tween(this.main)
            .call(() => {
                this.main.disabledInRoundAction(true);
                this.moveCardForSplitting(firstHand.pos, 0.3);
                firstPlace.updateDisplayScore(false);
                secondPlace.updateDisplayScore(false);
            })
            .delay(0.5)
            .call(() =>
                this.main.drawingCardToPlayer(firstHand.cards[1], firstHand.pos - 1, false, () => {
                    firstPlace.updateDisplayScore(true);
                })
            )
            .delay(0.5)
            .call(() => {
                this.main.drawingCardToPlayer(secondHand.cards[1], secondHand.pos - 1, false, () => {
                    secondPlace.updateDisplayScore(true);
                });
            })
            .delay(this.main.configDuration.delaySwitchHand)
            .call(() => {
                firstPlace.selected = !firstHand.isStand;
                this.main.switchToNextHand();
                this.main.unlockBet();
            })
            .start();
    }

    calculatePosition(originalPosition: cc.Vec3, offsetX = 0, offsetY = 0, offsetZ = 0) {
        return cc.v3(originalPosition.x + offsetX, originalPosition.y + offsetY, originalPosition.z + offsetZ);
    }

    moveCardForSplitting(handPos: number, duration: number) {
        const pos = handPos - 1;
        const destPos = pos + 3;
        const cardNodes = this.main.handPlaces[pos].getCards();
        const secondCard = cardNodes[1];

        const cardLayout = this.main.handPlaces[destPos].cardLayout;
        const nextPosition = cardLayout.getFinalPosition();

        const moveXPosition = this.calculatePosition(secondCard.position, 100);

        const rotationX = 0;
        const scaleY = 1;

        cc.tween(secondCard)
            .to(duration, { position: moveXPosition }, { easing: "easeOut" })

            .call(() => {
                const nextPositionConverted = cardLayout.content.convertToNodeSpaceAR(secondCard.convertToWorldSpaceAR(cc.v3(0, 0)));
                secondCard.removeFromParent();
                this.main.handPlaces[destPos].addCard(secondCard);
                secondCard.position = nextPositionConverted;

                cc.tween(secondCard)
                    .to(duration, { position: nextPosition, rotationX: rotationX, scaleY: scaleY }, { easing: "easeOut" })
                    .start();
            })

            .start();
    }

    processStandAction(data: any) {
        const pos = data.pos - 1;
        const place = this.main.handPlaces[pos];
        place.setData(data);
        place.selected = false;
        this.main.disabledInRoundAction(true);
        place.updateDisplayScore(true);

        cc.tween(this.main)
            .delay(this.main.configDuration.delaySwitchHand)
            .call(() => this.main.switchToNextHand())
            .start();
    }

    processDoubleAction(data: any) {
        this.processHitAction(data);
        this.placeChipsForDoubleHand(data.pos - 1, data.bet);
    }

    processHitAction(data: any) {
        const card = data.newCard;
        const pos = data.pos - 1;
        const place = this.main.handPlaces[pos];
        place.setData(data);
        place.syncBetValue();

        this.main.showActionsWithBehavior(BlackJackActionType.IN_ROUND);
        const isStand = data.isStand;
        this.main.updateAvailableActions();
        this.main.drawingCardToPlayer(
            card,
            pos,
            false,
            isStand
                ? () => {
                      place.updateDisplayScore(true);
                      place.selected = false;

                      cc.tween(this.main)
                          .delay(this.main.configDuration.delaySwitchHand)
                          .call(() => this.main.switchToNextHand())
                          .start();
                  }
                : () => {
                      place.updateDisplayScore(true);
                  }
        );
    }

    placeChipsForSplitHand(index: number, amount: number) {
        this.main.playSingleChipsSound();
        const destNode = this.main.chipContainers[index];
        destNode.destroyAllChildren();
        const chipStack = this.main.createChipStack(amount, destNode);
        chipStack.zIndex = -1;
        const worldPositon = destNode.parent.convertToWorldSpaceAR(cc.v2(0, -300));
        const localPosition = destNode.convertToNodeSpaceAR(worldPositon);
        chipStack.position = cc.v3(localPosition);
        chipStack.runAction(cc.jumpTo(0.5, 0, 0, 250, 1));
        this.main.updateTotalBetLabel();
    }

    placeChipsForDoubleHand(index: number, amount: number) {
        this.main.playSingleChipsSound();
        const destNode = this.main.chipContainers[index];
        const chipStack = this.main.createChipStack(amount / 2, destNode);
        chipStack.zIndex = -1;

        const worldPositon = destNode.parent.convertToWorldSpaceAR(cc.v2(0, -300));
        const localPosition = destNode.convertToNodeSpaceAR(worldPositon);
        chipStack.position = cc.v3(localPosition);

        let destPosition = cc.v2(0, 0);
        if (destNode.childrenCount > 0) {
            const stack = destNode.children[0].getComponent(ChipStack);
            if (stack) {
                destPosition = cc.v2(0, stack.getCurrentHeight());
            }
        }

        chipStack.runAction(
            cc.sequence(
                cc.jumpTo(0.5, destPosition, 250, 1),
                cc.callFunc(() => {
                    destNode.destroyAllChildren();
                    const chipStack = this.main.createChipStack(amount, destNode);
                    chipStack.zIndex = -1;
                    this.main.handPlaces[index].updateDisplayBetValue(amount);
                    this.main.updateTotalBetLabel();
                })
            )
        );
    }
}
