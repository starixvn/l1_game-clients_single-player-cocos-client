import AudioManager from "../../../../common/audio/AudioManager";
import GameBaseTimeHandler from "../../../_base/handlers/GameBaseTimeHandler";
import Sedie from "../Sedie";

export default class SedieTimeHandler extends GameBaseTimeHandler {
    public get shakeThePlateTime() {
        return this.main.config.betTime + 2;
    }

    constructor(protected readonly main: Sedie) {
        super(main);
    }

    get isInWaitTime() {
        return this.main.currentTimeRemaining > this.shakeThePlateTime;
    }

    get isStartingNewGameRound() {
        return this.main.currentTimeRemaining === this.shakeThePlateTime;
    }

    protected setCurrentTimeRemaining(data: any) {
        this.main.currentTimeRemaining = data.remainingTime;
    }

    handleRemainingTime(data: any) {
        super.handleRemainingTime(data);
        this.gameUpdate();
    }

    handleStartingNewGameRound() {
        super.handleStartingNewGameRound();
        this.shakeThePlate();
        this.main.highlightLastResult();
    }

    handleInLockBetTime() {
        super.handleInLockBetTime();
        this.main.betItems.forEach((item) => item.setHighlight(false));
    }

    handleInRoundTime() {
        this.main.setGameRound(this.main.roundId);

        if (this.main.currentTimeRemaining <= this.main.config.betTime) {
            this.showRoundTime();
            this.main.closePlate(false);
        }

        if (!this.isInLockBetTime) {
            this.main.highlightLastResult();
        }
    }

    showWaitTime() {
        this.main.timeWaitNode.active = true;
        this.main.timeWaitLabel.string = this.formatTime(this.main.currentTimeRemaining - this.shakeThePlateTime - 1);
    }

    shakeThePlate() {
        if (!this.main.node.activeInHierarchy) {
            this.main.closePlate(false);
            return;
        }

        this.main.closePlate(true);
        cc.tween(this.main)
            .delay(0.5)
            .call(() => {
                this.main.showHideResult(false);
                AudioManager.getInstance().playSFX(this.main.shakeThePlateAudio.clip);
                this.main.shakeThePlateAnimation.play();
            })
            .start();
    }
}
