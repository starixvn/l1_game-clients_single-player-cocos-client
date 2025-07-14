import GameUtils from "../../../../common/GameUtils";
import { appManager } from "../../../../managers/AppManager";
import GameBaseTimeHandler from "../../../_base/handlers/GameBaseTimeHandler";
import BitcoinMaster from "../BitcoinMaster";
import BitCoinMasterAnimatedTime from "../BitCoinMasterAnimatedTime";

export default class BitcoinMasterTimeHandler extends GameBaseTimeHandler {
    protected displayResultTime = 119;
    protected waitResultTimePoint = 60;
    protected balanceDuration = 2;
    protected betTime = 45;
    protected animatedTime: BitCoinMasterAnimatedTime;

    constructor(protected readonly main: BitcoinMaster) {
        super(main);
    }

    get isInRoundTime() {
        return this.main.currentTimeRemaining > 0;
    }

    get isInLockBetTime() {
        return (
            this.main.currentTimeRemaining <= this.main.config.stopBetTime && //
            this.main.currentTimeRemaining >= this.main.config.minBetTime
        );
    }

    get isInBalanceBetTime() {
        return (
            this.main.currentTimeRemaining <= this.waitResultTimePoint &&
            this.main.currentTimeRemaining > this.waitResultTimePoint - this.balanceDuration
        );
    }

    get isDisplayResultTime() {
        return this.main.currentTimeRemaining > this.main.config.betTime;
    }

    protected setCurrentTimeRemaining(data: any) {
        this.main.currentTimeRemaining = data.remainingTime;
    }

    playTime(): void {
        this.gameUpdate();
        super.playTime();
    }

    gameUpdate(): void {
        this.animatedTime = this.main.animatedTime as BitCoinMasterAnimatedTime;
        if (this.main.gameConfigs) {
            this.handleGameUpdate();
        }

        this.main.currentTimeRemaining--;
    }

    handleGameUpdate() {
        this.isInWaitTime ? this.handleWaitTime() : this.handleGameNotWaitTime();
    }

    handleGameNotWaitTime() {
        if (this.isStartingNewGameRound) {
            this.handleStartingNewGameRound();
        }

        this.isInRoundTime ? this.handleInRoundTime() : this.handleInEndTime();
    }

    resetTime(): void {
        this.showMainTime(false);
    }

    handleInRoundTime() {
        super.handleInRoundTime();

        if (this.main.currentTimeRemaining <= this.waitResultTimePoint) {
            if (this.isInBalanceBetTime) {
                if (this.main.balanceBetNoticeContainer.childrenCount === 0) {
                    this.main.showBalanceBetNotice();
                }
            } else {
                this.main.hideBalanceBetNotice();
            }

            this.main.setTotalBetAfterBalance();
            this.handleWaitingCandleResult();
            this.main.hideBetButtons();
        } else {
            this.handleBettingPhase();
        }

        this.isInLockBetTime && this.handleInLockBetTime();
    }

    handleWaitTime() {
        super.handleWaitTime();

        if (appManager.GAME_IS_SHOWED) {
            if (this.main.currentTimeRemaining === this.main.config.fullTime - 1) {
                this.main.showResult(true);
                this.main.showWinningAnimation(this.main.currentDataLogs[0]);
            } else {
                this.main.showResult(false);
            }
        }
        this.main.bettingPrice.bettingPrice.node.opacity = 255;
        this.main.setTotalBetAfterBalance();
        this.main.statusDesc.setNormalDescription(GameUtils.getText("ui.payout"), false);
        const timeConvert = this.main.currentTimeRemaining - this.main.config.betTime;
        this.animatedTime.updateProgress(timeConvert, 2);
        this.animatedTime.setTime(this.formatTime(timeConvert));
        this.main.hideBetButtons();
    }

    handleInEndTime() {
        super.handleInEndTime();
        this.main.setTotalBetAfterBalance();
        this.main.statusDesc.setNormalDescription(GameUtils.getText("ui.payout"), false);
        this.animatedTime.updateProgress(15, 2);
        this.animatedTime.setTime(this.formatTime(15));
        this.main.hideBetButtons();
    }

    private handleWaitingCandleResult() {
        this.main.statusDesc.setNormalDescription(GameUtils.getText("ui.waitResult"), false);
        this.animatedTime.updateProgress(this.main.currentTimeRemaining, 1);
        this.animatedTime.setTime(this.formatTime(this.main.currentTimeRemaining));
        this.main.showProcessingWarning(false);
    }

    private handleBettingPhase() {
        this.main.statusDesc.setNormalDescription(GameUtils.getText("ui.placing_bet"));
        const timeConvert = this.main.currentTimeRemaining - this.waitResultTimePoint;
        this.animatedTime.setTime(this.formatTime(timeConvert));
        this.animatedTime.updateProgress(timeConvert, 0);
    }

    showMainTime(show: boolean) {
        this.main.animatedTime.node.active = true;
    }

    showWaitTime() {
        this.main.timeWaitNode.active = false;
    }

    handleInLockBetTime() {
        this.main.statusDesc.setNormalDescription(GameUtils.getText("ui.no_more_bet"), false);
        this.main.hideBetButtons();
    }
}
