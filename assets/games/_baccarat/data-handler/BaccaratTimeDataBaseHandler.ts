import GameBaseTimeHandler from "../../_base/handlers/GameBaseTimeHandler";
import SocketIOTableGameBase from "../../_base/SocketIOTableGameBase";

export default abstract class BaccaratTimeDataBaseHandler extends GameBaseTimeHandler {
    protected dealCardsTime = 2;

    get isInWaitTime() {
        return this.main.currentTimeRemaining > this.main.config.betTime + this.dealCardsTime;
    }

    get isStartingNewGameRound() {
        return this.main.currentTimeRemaining === this.main.config.betTime + this.dealCardsTime;
    }

    get isInRoundTime() {
        return this.main.currentTimeRemaining >= this.main.config.minBetTime && this.main.currentTimeRemaining <= this.main.config.betTime;
    }

    get isInEndTime() {
        return this.main.currentTimeRemaining < this.main.config.minBetTime;
    }

    get isClearBet() {
        return (
            this.main.currentTimeRemaining >= this.main.config.betTime &&
            this.main.currentTimeRemaining < this.main.config.betTime + this.dealCardsTime
        );
    }

    protected getOwnMain(): any {
        return this.main as SocketIOTableGameBase;
    }

    gameUpdate(): void {
        if (this.isInWaitTime) {
            this.handleWaitTime();
        } else {
            this.handleNotWaitTime();
        }

        this.main.currentTimeRemaining--;
    }

    handleNotWaitTime() {
        if (this.isStartingNewGameRound) {
            this.handleStartingNewGameRound();
        }
        if (this.isClearBet) {
            this.main.resetDataAndUI();
        }

        if (this.isInRoundTime) {
            this.handleInRoundTime();

            if (this.isInLockBetTime) {
                if (this.main.currentTimeRemaining === this.main.config.stopBetTime) {
                    this.handleAtLockBetTime();
                }
                this.handleInLockBetTime();
            }
        } else {
            if (this.isInEndTime) {
                this.handleInEndTime();
            }
        }
    }

    handleStartingNewGameRound() {
        super.handleStartingNewGameRound();
        this.handleFlyCards();
    }

    abstract handleFlyCards();
}
