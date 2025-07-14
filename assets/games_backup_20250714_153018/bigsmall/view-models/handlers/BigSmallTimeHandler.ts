import AudioManager from "../../../../common/audio/AudioManager";
import { appManager } from "../../../../managers/AppManager";
import GameBaseTimeHandler from "../../../_base/handlers/GameBaseTimeHandler";
import BigSmall, { DishAnimation } from "../BigSmall";

export default class BigSmallTimeHandler extends GameBaseTimeHandler {
    protected shakeTheBowlTime = 52;
    protected displayResultTime = 59;
    protected timeout: any;

    constructor(protected readonly main: BigSmall) {
        super(main);
    }

    get isInWaitTime() {
        return this.main.currentTimeRemaining > this.shakeTheBowlTime;
    }

    get isInBalanceBetTime() {
        return this.main.currentTimeRemaining > this.displayResultTime;
    }

    get isStartingNewGameRound() {
        return this.main.currentTimeRemaining === this.shakeTheBowlTime;
    }

    get isDisplayResultTime() {
        return this.main.currentTimeRemaining === this.displayResultTime;
    }

    gameUpdate(): void {
        if (this.isInBalanceBetTime) {
            this.main.balanceBet(true);
            this.main.currentTimeRemaining--;
        } else {
            this.main.hideBalanceBetNotice();
            this.main.enableHistoryButton();

            if (this.isDisplayResultTime) {
                appManager.GAME_IS_SHOWED && this.main.showResult();
                this.main.currentTimeRemaining--;
            } else {
                super.gameUpdate();
            }
        }
    }

    handleStartingNewGameRound() {
        super.handleStartingNewGameRound();
        this.main.statusHandler.clearStatusData();
        appManager.GAME_IS_SHOWED && this.shakeThePlate();
    }

    handleInRoundTime() {
        this.main.setGameRound(this.main.roundId);
        this.main.resetThePlate();
        this.main.disableResultNode();
        this.main.betItems.forEach((item) => item.resetHighlight());

        if (this.main.currentTimeRemaining <= this.main.config.betTime) {
            this.showRoundTime();
        }

        if (this.main.currentTimeRemaining === this.main.config.betTime) {
            cc.tween(this.main.bgTimer).to(0.3, { opacity: 255 }).start();
        } else if (this.main.currentTimeRemaining <= this.main.config.betTime) {
            this.main.bgTimer.opacity = 255;
        }
    }

    handleWaitTime() {
        super.handleWaitTime();
        this.main.bgTimer.opacity = 0;
        this.main.resultNode.active = true;
        this.main.resultNode.opacity = 255;
        this.showWaitTime();
        this.main.showHideResult(true);
    }

    showWaitTime() {
        this.main.thePlate.opacity = 0;
        this.main.timeWaitNode.active = true;
        this.main.timeWaitLabel.string = this.formatTime(this.main.currentTimeRemaining - this.shakeTheBowlTime - 1);
    }

    shakeThePlate() {
        this.main.shakeThePlateAnimation.playAdditive(DishAnimation.ShakeDish);
        cc.tween(this.main.thePlate)
            .delay(0.2)
            .call(() => {
                this.main.showHideResult(false);
            })
            .delay(1)
            .call(() => {
                AudioManager.getInstance().playSFX(this.main.shakeDishAudio.clip);
            })
            .start();
    }

    handleInLockBetTime() {
        super.handleInLockBetTime();
    }
}
