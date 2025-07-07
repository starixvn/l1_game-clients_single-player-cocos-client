import GameBaseTimeHandler from "../../../_base/handlers/GameBaseTimeHandler";
import SicBo from "../SicBo";

export default class SicBoTimeHandler extends GameBaseTimeHandler {
    constructor(protected readonly main: SicBo) {
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
        this.handleStartingNewGameRoundOptions(this.main);
    }

    handleInLockBetTime() {
        super.handleInLockBetTime();
        this.handleInLockBetTimeOptions(this.main);
    }

    handleInRoundTime() {
        this.handleInRoundTimeOptions(this.main);
    }

    showWaitTime() {
        this.showWaitTimeOptions(this.main);
    }
}
