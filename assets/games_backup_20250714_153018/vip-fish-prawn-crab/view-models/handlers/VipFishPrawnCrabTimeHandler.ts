import GameBaseTimeHandler from "../../../_base/handlers/GameBaseTimeHandler";
import VipFishPrawnCrab from "../VipFishPrawnCrab";

export default class VipFishPrawnCrabTimeHandler extends GameBaseTimeHandler {
    constructor(protected readonly main: VipFishPrawnCrab) {
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
        super.handleAtLockBetTime();
        this.handleInLockBetTimeOptions(this.main);
    }

    handleInRoundTime() {
        this.handleInRoundTimeOptions(this.main);
    }

    showWaitTime() {
        this.showWaitTimeOptions(this.main);
    }
}
