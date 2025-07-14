import GameUtils from "../../../../common/GameUtils";
import { showMessageForExpiredToken } from "../../../../common/auth/AuthManager";
import { isSessionTimeoutError } from "../../../../common/helpers/ErrorCodeHelper";
import { numberWithCommas } from "../../../../common/helpers/NumberHelper";
import NewCard, { CardAnimation, CardModel } from "../../../../common/new-card/view-models/NewCard";
import NoticeUtil from "../../../../common/utils/NoticeUtil";
import DataHandler from "../../../_base/handlers/DataHandler";
import BlackJack, { BlackJackActionType } from "../BlackJack";

export type DrawCardAction = () => void;

export default class DealHandler implements DataHandler {
    constructor(protected readonly main: BlackJack) {}

    handle(data: any) {
        if (data.deal) {
            this.processDealSuccess(data.deal);
            this.main.startRoundActionVisibility(false);
            this.main.showProcessingWarning(false);
            this.main.slidingDownBetChip(true);
            this.main.setGameRoundStatus(BlackJackActionType.IN_ROUND);
        }

        if (data.blackjackNotice) {
            this.processFailedDealHands(data.blackjackNotice);
        }
    }

    processDealSuccess(data: any) {
        const hands = data.hands.sort((a, b) => +a.pos - +b.pos);
        this.main.lastHandBets = data.hands.map((hand) => {
            return {
                pos: hand.pos,
                bet: hand.bet
            };
        });
        const dealerCards = data.dealer;

        const actions = [];
        this.drawFirstPlayerCard(hands, actions, data?.dealer?.length > 0 || false);
        this.main.updateTotalBetLabel();
        this.drawFirstDealerCard(dealerCards, actions);
        this.drawSecondPlayerCard(hands, actions, data?.dealer?.length > 0 || false);
        this.drawSecondDealerCard(dealerCards, actions);

        let count = 0;
        cc.tween(this.main)
            .repeat(
                actions.length,
                cc
                    .tween()
                    .call(() => {
                        actions[count]();
                        count++;
                    })
                    .delay(this.main.configDuration.drawingCardDelay)
            )
            .call(() => {
                this.playAnimationDealerCheck(dealerCards, dealerCards.length > 1);
            })
            .start();

        this.main.handPlaces.forEach((place) => {
            place.highlightPlace(false);
            place.enablePlaceChip(false);
            place.showClearBetButton(false);
        });
    }

    drawFirstPlayerCard(hands, actions: DrawCardAction[], isBlackjack = false) {
        hands.forEach((hand) => {
            const card = hand.cards[0];
            const pos = hand.pos - 1;

            const place = this.main.handPlaces[pos];
            place.setData(hand);

            actions.push(() => this.main.drawingCardToPlayer(card, pos, true, () => place.updateDisplayScore(false, isBlackjack)));

            if (hand.bet !== place.getBetAmount()) {
                place.showBetText(false);
                place.syncBetValue();
                this.main.chipContainers[pos].destroyAllChildren();
                this.main.createChipStack(hand.bet, this.main.chipContainers[pos]);
            }
        });
    }

    drawSecondPlayerCard(hands, actions: DrawCardAction[], isBlackjack = false) {
        hands.forEach((hand) => {
            const card = hand.cards[1];
            const pos = hand.pos - 1;
            const place = this.main.handPlaces[pos];
            actions.push(() => this.main.drawingCardToPlayer(card, pos, false, () => place.updateDisplayScore(true, isBlackjack)));
        });
    }

    drawFirstDealerCard(dealerCards: CardModel[], actions: DrawCardAction[]) {
        const firstDealerCard = dealerCards[0];
        actions.push(() => {
            this.main.drawingCardToDealer(firstDealerCard, false);
        });
    }

    drawSecondDealerCard(dealerCards: CardModel[], actions: DrawCardAction[]) {
        const isBlackJack = dealerCards.length > 1;
        isBlackJack
            ? this.drawSecondDealerCardWithBlackJack(dealerCards, actions)
            : this.drawSecondDealerCardWithNormalCase(dealerCards, actions);
    }

    drawSecondDealerCardWithBlackJack(dealerCards: CardModel[], actions: DrawCardAction[]) {
        actions.push(() => {
            this.main.drawingCardToDealer(dealerCards[1], true, () => {
                this.main.dealerHand.showScoreWithOutData(dealerCards, 1);
                this.main.dealerHand.cardLayout.updateLayout();
            });
        });
    }

    drawSecondDealerCardWithNormalCase(dealerCards: CardModel[], actions: DrawCardAction[]) {
        actions.push(() => {
            this.main.drawingCardToDealer(null, true, () => this.main.dealerHand.showScoreWithOutData(dealerCards, 1));
        });
    }

    playAnimationDealerCheck(dealerCards: CardModel[], isBlackJack: boolean) {
        const checkList = ["A", "J", "Q", "K", "10"];
        let delaytime = 1;
        if (checkList.includes(dealerCards[0].rank)) {
            const secondCard = this.main.dealerHand.cardLayout.content.children[1].getComponent(NewCard);
            const checkDuration = 1.5;
            secondCard.playAnimation(
                isBlackJack ? CardAnimation.DealerCheckBlackJackSuccess : CardAnimation.DealerCheckBlackJackFail,
                checkDuration
            );
            delaytime += checkDuration;
        }

        this.main.disabledInRoundAction(true);

        cc.tween(this.main)
            .delay(delaytime)
            .call(() => {
                if (isBlackJack) {
                    this.main.dealerHand.cardLayout.updateLayout();
                    this.main.dealerHand.showScoreWithOutData(dealerCards, 2);
                    this.main.switchToDealer();
                } else {
                    this.main.startRound();
                }
            })
            .start();
    }

    processFailedDealHands(data: any) {
        if (data.errorApiHands) {
            this.showNoticesErrors(data.errorApiHands);
        }
        if (data.kickedOutHands) {
            data.kickedOutHands.forEach((error) => {
                const transferredData = {
                    kickedOut: error
                };
                this.main.currentMiniPanel.onGeneralData(transferredData);
            });
        }

        if (data.invalidBetAmountHands) {
            const errorCode = data.invalidBetAmountHands.errorCode;
            const { minBet, maxBet, gameRoundId } = data.invalidBetAmountHands;
            const opt = {
                gameName: GameUtils.getGameNameString(this.main.gameId),
                minBet: numberWithCommas(minBet || this.main.getMinBet()),
                maxBet: numberWithCommas(maxBet || this.main.getMaxBet()),
                gameRoundId,
                errorCode
            };
            const message = NoticeUtil.getLocalizedErrorMessage(errorCode, opt);
            this.main.showMiniWarning(message);
            const positions = data.invalidBetAmountHands.pos;
            this.clearChipsAndShowErrorNotice(positions);
        }
    }

    async showNoticesErrors(data: any) {
        for (const error of data) {
            const errorCode = error.errorCode.toString();
            if (isSessionTimeoutError(errorCode)) {
                showMessageForExpiredToken(errorCode);
                return;
            }
            const notice = await this.main.currentMiniPanel.showErrorNotice(error);
            if (notice) {
                notice.handleClose = () => {
                    const positions = error.pos;
                    this.clearChipsAndShowErrorNotice(positions);
                };
            }
        }
    }

    clearChipsAndShowErrorNotice(positions: number[]) {
        positions.forEach((position) => {
            const place = this.main.handPlaces[position - 1];
            place.showErrorNotice();

            this.main.showActionsWithBehavior(BlackJackActionType.ERROR);
            const chipContainer = this.main.chipContainers[position - 1];
            const chips = chipContainer.children[0];
            const placeNoticeDuration = 1.8;
            if (chips) {
                const destPosition = chipContainer.convertToNodeSpaceAR(chipContainer.parent.convertToWorldSpaceAR(cc.v2(0, -300)));
                chips.runAction(
                    cc.sequence(
                        cc.jumpTo(0.7, destPosition, 250, 1),
                        cc.delayTime(placeNoticeDuration),
                        cc.callFunc(() => {
                            place.onClearBetClick(false);
                        })
                    )
                );
            } else {
                place.scheduleOnce(() => {
                    place.onClearBetClick(false);
                }, placeNoticeDuration);
            }
        });

        this.main.lockBet();
        cc.tween(this.main)
            .delay(2.5)
            .call(() => {
                this.main.unlockBet();
            })
            .start();
    }
}
