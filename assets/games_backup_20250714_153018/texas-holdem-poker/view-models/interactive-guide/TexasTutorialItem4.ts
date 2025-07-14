import { CardAnimation } from "../../../../common/new-card/view-models/NewCard";
import TutorialItem from "../../../../common/tutorial/TutorialItem";
import HoldemPokerCard from "../../../holdem-poker/components/cards/view-models/HoldemPokerCard";
import SwapCards from "../../../_casino/SwapCards";

import TexasTutorialMain from "./TexasTutorialMain";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TexasTutorialItem4 extends TutorialItem {
    @property(cc.Node)
    swapNode: cc.Node = null;

    @property(cc.Node)
    infoNode: cc.Node = null;

    @property(cc.Node)
    playerResult: cc.Node = null;

    @property(cc.Node)
    cardPlayer1: cc.Node = null;

    @property(cc.Node)
    cardPlayer2: cc.Node = null;

    swapCardComponent: SwapCards;
    actionSwapCard: cc.Tween;
    buttonSwapMainNode: cc.Node;
    buttonHoldMainNode: cc.Node;
    buttonCallMainNode: cc.Node;
    buttonFoldMainNode: cc.Node;
    waitingSwapTimeout: any;

    onLoad() {
        this.cloneNodeAndComponent();
    }

    onHidden() {
        this.resetActions();
        this.waitingSwapTimeout && clearTimeout(this.waitingSwapTimeout);
    }

    resetActions() {
        this.node.stopAllActions();
        this.cardPlayer1.stopAllActions();
        this.cardPlayer2.stopAllActions();
        this.swapCardComponent.reset();

        this.infoNode.stopAllActions();
        this.infoNode.opacity = 0;

        this.buttonSwapMainNode.stopAllActions();
        this.buttonHoldMainNode.stopAllActions();
        this.buttonCallMainNode.stopAllActions();
        this.buttonFoldMainNode.stopAllActions();
        this.setStatusSwapAndHoldButton(true);
        this.handleFaceDownCard();
        this.showCardsOnMainGuide(true);
    }

    async show() {
        super.show();
        const durationOpenCard = 0.6;
        const delayDuration = 1000;

        this.showCardsOnMainGuide(false);
        this.handleFaceDownCard();
        this.infoNode.opacity = 0;
        this.setStatusSwapAndHoldButton(true);
        await this.waitingShowAnimSwap(delayDuration);
        this.setOpacitySwapHoldButton();
        await this.swapCardComponent.swapCards();
        this.handleOpenCard(durationOpenCard);
        this.handleShowTextInfo(durationOpenCard, () => {
            this.setStatusSwapAndHoldButton(false);
            this.setOpacityCallCancelButton();
            cc.tween(this.infoNode).to(0.2, { opacity: 255 }).start();
        });
    }

    waitingShowAnimSwap(time: number) {
        return new Promise((resolve) => (this.waitingSwapTimeout = setTimeout(resolve, time)));
    }

    cloneNodeAndComponent() {
        const parent = this.getParentNode();
        const tutorialMain = parent.getComponent(TexasTutorialMain);
        this.buttonCallMainNode = tutorialMain.callButton;
        this.buttonFoldMainNode = tutorialMain.foldButton;
        this.buttonHoldMainNode = tutorialMain.holdButton;
        this.buttonSwapMainNode = tutorialMain.swapButton;
        this.swapCardComponent = this.swapNode.getComponent(SwapCards);
    }

    setStatusSwapAndHoldButton(showSwapHold: boolean) {
        this.buttonSwapMainNode.opacity = showSwapHold ? 255 : 0;
        this.buttonSwapMainNode.active = showSwapHold;
        this.buttonHoldMainNode.opacity = showSwapHold ? 255 : 0;
        this.buttonHoldMainNode.active = showSwapHold;
        this.buttonCallMainNode.opacity = !showSwapHold ? 255 : 0;
        this.buttonCallMainNode.active = !showSwapHold;
        this.buttonFoldMainNode.opacity = !showSwapHold ? 255 : 0;
        this.buttonFoldMainNode.active = !showSwapHold;
        this.playerResult.active = !showSwapHold;
    }

    setOpacitySwapHoldButton() {
        this.actionSwapCard = cc
            .tween(this.node)
            .delay(0.1)
            .call(() => {
                cc.tween(this.buttonSwapMainNode).to(0.1, { opacity: 0 }).start();
                cc.tween(this.buttonHoldMainNode).to(0.1, { opacity: 0 }).start();
            })
            .start();
    }

    setOpacityCallCancelButton() {
        cc.tween(this.node)
            .delay(0.1)
            .call(() => {
                cc.tween(this.buttonCallMainNode).to(0.1, { opacity: 255 }).start();
                cc.tween(this.buttonFoldMainNode).to(0.1, { opacity: 255 }).start();
            })
            .start();
    }

    movePositionCard(node: cc.Node, rotationX: number, selectedPosY: number) {
        return cc
            .tween(node)
            .parallel(
                cc.tween(node).by(0.1, { x: 0 }),
                cc.tween(node).to(
                    0.2,
                    {
                        rotationX: rotationX,
                        y: selectedPosY,
                        z: 40,
                        scaleY: 1
                    },
                    { easing: "sineIn" }
                )
            )
            .start();
    }

    showCardsOnMainGuide(show: boolean) {
        const parent = this.getParentNode();
        const tutorialMain = parent.getComponent(TexasTutorialMain);
        tutorialMain.playerCards[0].node.active = show;
        tutorialMain.playerCards[1].node.active = show;
        tutorialMain.dealerCards[0].node.active = show;
        tutorialMain.dealerCards[1].node.active = show;
    }

    handleOpenCard(durationOpenCard: number) {
        const playerCards = [
            { rank: "J", suit: 3 },
            { rank: "10", suit: 1 }
        ];
        const componentCardPlayer1 = this.cardPlayer1.getComponent(HoldemPokerCard);
        const componentCardPlayer2 = this.cardPlayer2.getComponent(HoldemPokerCard);

        cc.tween(this.cardPlayer1)
            .call(() => {
                componentCardPlayer1.setCard(playerCards[0]);
                componentCardPlayer1.playAnimation(CardAnimation.DealerOpenCard, durationOpenCard);
            })
            .delay(durationOpenCard)
            .start();

        cc.tween(this.cardPlayer2)
            .call(() => {
                componentCardPlayer2.setCard(playerCards[1]);
                componentCardPlayer2.playAnimation(CardAnimation.DealerOpenCard, durationOpenCard);
            })
            .delay(durationOpenCard)
            .start();
    }

    handleShowTextInfo(durationOpenCard: number, callBack: () => void) {
        cc.tween(this.node)
            .call(() => {
                this.movePositionCard(this.cardPlayer1, 20, -15);
                this.movePositionCard(this.cardPlayer2, 20, -15);
            })
            .delay(durationOpenCard)
            .call(() => {
                callBack();
            })
            .start();
    }

    handleFaceDownCard() {
        const componentCardPlayer1 = this.cardPlayer1.getComponent(HoldemPokerCard);
        const componentCardPlayer2 = this.cardPlayer2.getComponent(HoldemPokerCard);
        componentCardPlayer1.stopAnimation();
        componentCardPlayer1.resetCardNode();
        componentCardPlayer1.setFaceUp(false);

        componentCardPlayer2.stopAnimation();
        componentCardPlayer2.resetCardNode();
        componentCardPlayer2.setFaceUp(false);
    }
}
