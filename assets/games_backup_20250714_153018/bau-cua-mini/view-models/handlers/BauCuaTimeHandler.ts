import AudioManager from "../../../../common/audio/AudioManager";
import { appManager } from "../../../../managers/AppManager";
import GameBaseTimeHandler from "../../../_base/handlers/GameBaseTimeHandler";
import BauCua from "../BauCua";

export default class BauCuaTimeHandler extends GameBaseTimeHandler {
    constructor(protected readonly main: BauCua) {
        super(main);
    }

    get isInWaitTime() {
        return this.main.currentTimeRemaining > this.main.shakeThePlateTime;
    }

    get isStartingNewGameRound() {
        return this.main.currentTimeRemaining === this.main.shakeThePlateTime;
    }

    handleStartingNewGameRound() {
        super.handleStartingNewGameRound();
        if (appManager.GAME_IS_SHOWED) {
            this.main.finishShakeThePlate = false;
            this.main.shakeAnimation.play();
            this.main.showDiceResult(false);
            AudioManager.getInstance().playSFX(this.main.shakeAudio.clip);
            this.main.finishShakeThePlate = true;
        }
    }

    handleInLockBetTime() {
        super.handleAtLockBetTime();
        this.handleInLockBetTimeOptions(this.main);
    }

    handleInRoundTime() {
        this.handleInRoundTimeOptions(this.main);
        this.main.hideAllDices();
        this.main.showOpenPlateEffect(false);
        this.main.thePlate.opacity = 255;

        if (this.main.currentTimeRemaining <= this.main.config.betTime) {
            this.showRoundTime();
        }

        if (this.main.currentTimeRemaining === this.main.config.betTime) {
            cc.tween(this.main.bgOverlay).to(0.3, { opacity: 255 }).start();
        } else if (this.main.currentTimeRemaining <= this.main.config.betTime) {
            this.main.bgOverlay.opacity = 255;
        }
    }

    handleWaitTime() {
        super.handleWaitTime();
        this.main.bgOverlay.opacity = 0;
        this.main.thePlate.opacity = 0;
        this.main.dices.forEach((dice) => {
            dice.node.active = true;
        });
        this.main.highlightWinningBetItems(true);
    }

    showWaitTime() {
        this.showWaitTimeOptions(this.main);
    }
}
