import { appManager } from "../../../../managers/AppManager";
import GameBaseTimeHandler from "../../../_base/handlers/GameBaseTimeHandler";
import SpecialSeDie from "../SpecialSeDie";

export default class SpecialSeDieTimeHandler extends GameBaseTimeHandler {
    private readonly shakeThePlateTime = 32;
    private readonly displayResultTime = 37;

    constructor(protected readonly main: SpecialSeDie) {
        super(main);
    }

    get isInWaitTime() {
        return this.main.currentTimeRemaining > this.shakeThePlateTime;
    }

    get isInBalanceBetTime() {
        return this.main.currentTimeRemaining > this.displayResultTime;
    }

    get isStartingNewGameRound() {
        return this.main.currentTimeRemaining === this.shakeThePlateTime;
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
                this.main.showWinningAnimation();
                this.main.currentTimeRemaining--;
            } else {
                super.gameUpdate();
            }
        }
    }

    handleStartingNewGameRound() {
        super.handleStartingNewGameRound();
        appManager.GAME_IS_SHOWED && this.shakeThePlate();
        this.main.highlightLastResult();
    }

    handleInRoundTime() {
        this.main.setGameRound(this.main.roundId);
        this.main.resetThePlatePosition();
        this.main.betItems.forEach((item) => item.resetHighlight());

        if (this.main.currentTimeRemaining <= this.main.config.betTime) {
            this.showRoundTime();
        }
    }

    handleWaitTime() {
        super.handleWaitTime();
        this.main.thePlate.opacity = 0;
    }

    showWaitTime() {
        this.main.timeWaitNode.active = true;
        this.main.timeWaitLabel.string = this.formatTime(this.main.currentTimeRemaining - this.shakeThePlateTime - 1);
    }

    shakeThePlate() {
        cc.tween(this.main.thePlate)
            .to(0, { opacity: 255 })
            .to(0.5, { position: cc.v2(0, 0) })
            .call(() => {
                this.main.shakeThePlateAnimation.play();
            })
            .start();
    }

    handleInLockBetTime() {
        super.handleInLockBetTime();
        this.main.betItems.forEach((item) => item.setHighlight(false));
    }
}
