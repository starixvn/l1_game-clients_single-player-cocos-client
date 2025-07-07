import { lodash } from "../../../../ClientModules";
import GameUtils from "../../../../common/GameUtils";

import { ChipParams } from "../../../../common/bet-chips/view-models/ChipFlyConfig";
import { CardModel } from "../../../../common/new-card/view-models/NewCard";
import { playWinningEffect } from "../../../_base/action/PayChipsAction";
import GameBaseFinishHandler from "../../../_base/handlers/GameBaseFinishHandler";
import BlackJack, { BlackJackActionType } from "../BlackJack";
import BlackJackUtils from "../BlackJackUtils";

export default class BlackJackFinishHandler extends GameBaseFinishHandler {
    constructor(protected readonly main: BlackJack) {
        super(main);
    }

    finishDataCache: any = null;
    drawingCardDelay = 0.5;
    openCardDuration = 1.4;
    tweenFinishNormalCase: cc.Tween;
    tweenDrawMoreCardForDealer: cc.Tween;
    callbackSchedulesAnimChipStack = [];
    chipsStack: cc.Node[] = [];

    handle(data: any): boolean {
        if (data.finish) {
            this.finishDataCache = data.finish;
            this.main.finishRound();
        }
        return true;
    }

    stopAllAnimations() {
        this.tweenFinishNormalCase?.stop();
        this.tweenDrawMoreCardForDealer?.stop();
        this.main.handPlaces?.forEach((place, index) => {
            const chip = this.getChipsHandPlace(index);
            chip?.stopAllActions();
            chip?.children?.length > 0 && chip?.destroyAllChildren();
        });
        this.chipsStack?.forEach((chipStack) => {
            chipStack?.stopAllActions();
            chipStack?.children?.length > 0 && chipStack?.destroyAllChildren();
        });
        this.chipsStack = [];
    }

    removeAllSchedule() {
        this.callbackSchedulesAnimChipStack?.forEach((callbackSchedule) => {
            this.main.unschedule(callbackSchedule);
        });
        this.callbackSchedulesAnimChipStack = [];
    }

    clearCache() {
        this.finishDataCache = null;
    }

    startNewRound() {
        this.main.gameAudios.playStartGameAudio();
        this.main.stopIntervalReminder();
    }

    processFinish() {
        const finish = this.finishDataCache;
        if (!finish) {
            this.showLogNotReceiveData();
            return;
        }
        const totals = BlackJackUtils.getTotal(finish.result, 2);
        const isBlackJack = finish.result.length === 2 && totals[totals.length - 1] === 21;

        if (isBlackJack) {
            this.finishBlackJackCase(finish);
        } else {
            this.finishNormalCase(finish);
        }
    }

    showLogNotReceiveData() {
        console.error("BlackJack data finish did not receive");
    }

    finishBlackJackCase(finish, callbackFinish?: () => void) {
        this.main.dealerHand.cardLayout.updateLayout();
        this.main.dealerHand.showScoreWithOutData(finish.result, 2, true);
        this.showWinningHands();
        this.startNewRound();
    }

    async finishNormalCase(finish, callbackFunction?: () => void) {
        await this.openFaceDownDealerCards(finish);
        this.tweenFinishNormalCase = cc
            .tween(this.main)
            .call(() => {
                this.main.dealerHand.showScoreWithOutData(finish.result, 2);
                this.drawMoreCardForDealer(finish.result, () => {
                    cc.tween(this.main)
                        .delay(1)
                        .call(() => {
                            this.main.dealerHand.cardLayout.updateLayout();
                            this.main.dealerHand.showScoreWithOutData(finish.result, finish.result.length, true);
                            this.showWinningHands();

                            this.startNewRound();
                            callbackFunction?.();
                        })
                        .start();
                });
            })
            .start();
    }

    async openFaceDownDealerCards(finish) {
        this.main.dealerOpenSecondCard(finish.result[1], this.openCardDuration);
        await GameUtils.delayTime(this.openCardDuration);
    }

    drawMoreCardForDealer(cards: CardModel[], complete: () => void) {
        if (cards.length === 2) {
            complete?.();
            return;
        }
        const actions = [];
        const moreCards = cards.slice(2);
        if (moreCards.length > 0) {
            moreCards.forEach((card, index) => {
                actions.push(() => {
                    this.main.drawingCardToDealer(card, false, () => {
                        this.main.dealerHand.showScoreWithOutData(cards, index + 3, false);
                    });
                });
            });
        }
        let count = 0;
        this.tweenDrawMoreCardForDealer = cc
            .tween(this.main)
            .repeat(
                actions.length,
                cc
                    .tween()
                    .call(() => {
                        actions[count]();
                        count++;
                    })
                    .delay(this.drawingCardDelay)
            )
            .call(complete)
            .start();
    }

    showWinningHands() {
        const winningHands = this.finishDataCache.winningHands;
        let totalWin = 0;
        let totalBet = 0;

        this.main.handPlaces.forEach((place, index) => {
            if (place.isActive) {
                const hand = winningHands.find((hand) => hand.id === place.idValue);
                const betAmount = place.getBetAmount();
                totalBet += betAmount;
                if (hand) {
                    totalWin += +hand.betwin;
                    place.cardLayout.updateLayout();
                    place.setResult(hand.betwin);

                    if (+hand.betwin > betAmount) {
                        this.handleHandAction(hand, betAmount, index);
                    }
                } else {
                    const chip = this.getChipsHandPlace(index);
                    this.main.handPlaces[index].showBetValue(false);
                    const destPos = chip.parent.convertToNodeSpaceAR(this.main.dealerChipTray.convertToWorldSpaceAR(cc.v2(0, 0)));
                    chip.runAction(
                        cc.sequence(
                            cc.spawn(cc.jumpTo(0.8, destPos, 250, 1), cc.scaleTo(0.8, 0.5)),
                            cc.delayTime(0.1),
                            cc.fadeOut(0.3),
                            cc.callFunc(() => {
                                chip.destroy();
                            })
                        )
                    );
                }
            }
        });

        totalWin > 0 && this.main.showWinningBet(totalWin);
        if (totalWin > totalBet) {
            playWinningEffect(this.main, this.main.userProfile.node, 5);
        }
        this.main.updateUserBalance();
        this.main.showActionsWithBehavior(BlackJackActionType.END_ROUND);
    }

    getChipsHandPlace(index: number) {
        return this.main.chipContainers[index].children[0];
    }

    convertMillisecondsToSeconds(milliseconds: number) {
        return milliseconds / 1000;
    }

    handleHandAction(hand: any, betAmount: any, index: number) {
        const timeMoving = 600;
        const winAmount = +hand.betwin - betAmount;
        const destNode = this.main.chipContainers[index];
        const chipStack = this.main.createChipStack(winAmount, destNode);
        const startPos = chipStack.parent.convertToNodeSpaceAR(this.main.dealerChipTray.convertToWorldSpaceAR(cc.v2(0, 0)));
        const betAmountChip = GameUtils.getChipQuantity(betAmount, this.main.betChips.chipValues);
        const keys = Object.keys(betAmountChip).sort((a, b) => +b - +a);
        const totalChipCount = keys.reduce((sum, chip) => sum + betAmountChip[chip], 0);
        let delayTime = 0;
        const chipStackChildren = chipStack.children;
        const offset = ChipParams.offset;
        const offsetStack = ChipParams.offsetStack;

        chipStack.position = cc.v3(startPos);

        chipStackChildren.forEach((chip, index) => {
            this.chipsStack.push(chip);
            const currentChipStackPosition = (totalChipCount + index) * (offset + offsetStack);
            const desPost = chip.parent.convertToNodeSpaceAR(destNode.convertToWorldSpaceAR(cc.v2(0, 0)));
            const desPostX = desPost.x + lodash.random(-2, 2);
            const desPostY = desPost.y + currentChipStackPosition;

            chip.scale = 0.5;
            chip.opacity = 0;

            if (index === 0) {
                chip.active = false;
            }

            delayTime = index * 200;
            const callbackSchedule = () => {
                chip.runAction(
                    cc.sequence(
                        cc.spawn(cc.jumpTo(0.6, desPostX, desPostY, 200, 1), cc.scaleTo(0.6, 1), cc.fadeTo(0.1, 255)),
                        cc.delayTime(1)
                    )
                );
            };
            this.callbackSchedulesAnimChipStack.push(callbackSchedule);

            this.main.scheduleOnce(callbackSchedule, this.convertMillisecondsToSeconds(delayTime));
        });

        const callbackScheduleCreateChipStack = () => {
            destNode?.destroyAllChildren();
            this.main.createChipStack(+hand.betwin, destNode);
        };

        this.callbackSchedulesAnimChipStack.push(callbackScheduleCreateChipStack);
        this.main.scheduleOnce(callbackScheduleCreateChipStack, this.convertMillisecondsToSeconds(delayTime + timeMoving));
    }
}
