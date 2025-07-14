import GameBaseTimeHandler from "../../../_base/handlers/GameBaseTimeHandler";
import Lottery from "../Lottery";

export default class LotteryTimeHandler extends GameBaseTimeHandler {
    constructor(protected readonly main: Lottery) {
        super(main);
    }

    handleInEndTime() {
        super.handleInEndTime();
        this.resetAnimatedTime();
        this.main.stoppingBetNotice.active = false;
        this.main.bettingNotice.active = false;
    }

    handleInLockBetTime() {
        super.handleInLockBetTime();
        this.main.stoppingBetNotice.active = true;
        this.main.bettingNotice.active = false;
    }

    handleInRoundTime() {
        super.handleInRoundTime();
        this.main.stoppingBetNotice.active = false;
        this.main.bettingNotice.active = true;
    }

    handleStartingNewGameRound() {
        super.handleStartingNewGameRound();
        this.main.ownBets = {};
        this.main.updateDisplayOwnBets();
        this.main.clearHighlight();
    }

    handleWaitTime() {
        super.handleWaitTime();
        this.resetAnimatedTime();
        this.main.stoppingBetNotice.active = false;
        this.main.bettingNotice.active = false;
    }

    resetAnimatedTime() {
        if (this.main.animatedTime) {
            this.main.animatedTime.node.active = true;
            this.main.animatedTime.setTime("00");
        }
    }

    resetTime(): void {
        super.resetTime();
        this.resetAnimatedTime();
    }
}
