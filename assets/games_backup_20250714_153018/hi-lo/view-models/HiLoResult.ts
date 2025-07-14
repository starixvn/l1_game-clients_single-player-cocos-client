import AudioManager from "../../../common/audio/AudioManager";
import GameUtils from "../../../common/GameUtils";
import { getRandomCard } from "../../../common/helpers/CardHelper";
import { CardModel } from "../../../common/new-card/view-models/NewCard";
import HiLoCard from "../components/view-models/HiLoCard";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HiLoResult extends cc.Component {
    @property(cc.Prefab)
    cardPrefab: cc.Prefab = null;

    @property(cc.Node)
    cardReel: cc.Node = null;

    @property({ type: cc.AudioClip })
    spinAudioClip: cc.AudioClip = null;

    @property({ type: cc.AudioClip })
    spinStopAudioClip: cc.AudioClip = null;

    private readonly cardCount = 16;
    private readonly cardHeight = 213;
    private spinAudioId: number;
    cardList: HiLoCard[] = [];
    cardModels: CardModel[] = [];
    topCard: HiLoCard;
    bottomCard: HiLoCard;
    spinAnimation: cc.Tween;

    onLoad() {
        this.initCardModels();
        this.createReel();
    }

    initCardModels() {
        for (let i = 0; i < this.cardCount; i++) {
            this.cardModels.push(getRandomCard());
        }
    }

    createReel() {
        this.cardReel.destroyAllChildren();
        for (const card of this.cardModels) {
            const cardNode = GameUtils.createNodeFromPrefab(this.cardPrefab);
            this.cardReel.addChild(cardNode);
            const cardComp = cardNode.getComponent(HiLoCard);
            this.setCard(cardComp, card);
            this.cardList.push(cardComp);
        }
        this.cardReel.getComponent(cc.Layout).updateLayout();
        this.topCard = this.cardList[this.cardList.length - 1];
        this.bottomCard = this.cardList[0];
    }

    updateResult(result: CardModel[]) {
        if (result.length === 0) {
            return;
        }
        this.setCard(this.topCard, result[result.length - 1]);
        this.topCard.faceUp();
    }

    setCard(cardComponent: HiLoCard, data: CardModel) {
        cardComponent.setCard(data);
    }

    faceDownCards() {
        this.cardList.forEach((card) => {
            card.faceDown();
        });
    }

    private playSpinAudio() {
        this.spinAudioId = AudioManager.getInstance().playSFX(this.spinAudioClip);
    }

    private playSpinStopAudio() {
        AudioManager.getInstance().playSFX(this.spinStopAudioClip);
    }

    private stopSpinAudio() {
        AudioManager.getInstance().stopSFX(this.spinAudioId);
    }

    spin(spinDuration: number, animated: boolean): Promise<void> {
        return new Promise((resolve) => {
            this.openCardsAndSetRandomCardValue();
            const offset = this.cardReel.height - this.cardHeight;
            if (animated) {
                this.cardReel.position = cc.v3(0, 0, 0);
                this.cardReel.stopAllActions();
                this.playSpinAudio();
                this.spinAnimation = cc
                    .tween(this.cardReel)
                    .to(spinDuration, { position: cc.v3(0, -offset, 0) }, { easing: "sineInOut" })
                    .call(() => {
                        this.stopSpinAudio();
                        this.playSpinStopAudio();
                        this.syncBottomCard();
                        resolve();
                    })
                    .start();
            } else {
                this.cardReel.position = cc.v3(0, -offset, 0);
                this.syncBottomCard();
                resolve();
            }
        });
    }

    openCardsAndSetRandomCardValue() {
        this.cardList.forEach((card) => {
            if (card !== this.bottomCard) {
                card.faceUp();
            }

            if (card !== this.topCard && card !== this.bottomCard) {
                this.setCard(card, getRandomCard());
            }
        });
    }

    syncBottomCard() {
        this.setCard(this.bottomCard, this.topCard.card);
        this.bottomCard.faceUp();
    }

    stopSpinCardAnimation() {
        if (this.spinAnimation) {
            this.spinAnimation.stop();
            this.cardReel.position = cc.v3(0, 0, 0);
        }
    }
}
