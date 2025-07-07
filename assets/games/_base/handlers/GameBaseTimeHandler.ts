import AudioManager from "../../../common/audio/AudioManager";
import { numberPad } from "../../../common/helpers/NumberHelper";
import { appManager } from "../../../managers/AppManager";
import { GameState } from "../GameState";
import IGameBase from "../IGameBase";
import { IGameBaseTimeHandler } from "./interfaces";

export default class GameBaseTimeHandler implements IGameBaseTimeHandler {
    playTimeInterval: number;

    constructor(protected readonly main: IGameBase) {}

    get isInLockBetTime() {
        return this.main.currentTimeRemaining <= this.main.config.stopBetTime;
    }

    get isInWaitTime() {
        return this.main.currentTimeRemaining > this.main.config.betTime;
    }

    get isStartingNewGameRound() {
        return this.main.currentTimeRemaining === this.main.config.betTime;
    }

    get isInRoundTime() {
        return this.main.currentTimeRemaining >= this.main.config.minBetTime;
    }

    handle(data: any) {
        if (data.remainingTime) {
            if ((data.remainingTime || data.remainingTime >= 0) && !this.main.isStopGame) {
                this.handleRemainingTime(data);
            }
        }
    }

    handleRemainingTime(data: any) {
        this.setCurrentTimeRemaining(data);
        this.playTime();
        this.main.hideUmMessage();
        this.main.gameState = GameState.Started;
    }

    resetTime(): void {
        this.showMainTime(false);
        this.main.currentTimeRemaining = this.main.config.fullTime;
        this.playTime();
    }

    playTime(): void {
        this.playTimeInterval && clearInterval(this.playTimeInterval);

        this.playTimeInterval = setInterval(() => {
            this.gameUpdate();
        }, 1000);
    }

    gameUpdate(): void {
        if (this.isInWaitTime) {
            this.handleWaitTime();
        } else {
            if (this.isStartingNewGameRound) {
                this.handleStartingNewGameRound();
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
                this.handleInEndTime();
            }
        }
        this.main.currentTimeRemaining--;
    }

    handleAtLockBetTime() {}

    stopPlayTime(): void {
        this.playTimeInterval && clearInterval(this.playTimeInterval);
    }

    handleWaitTime() {
        if (this.main.timeWaitNode) {
            this.main.finishShowResult && this.showWaitTime();
        }

        this.showMainTime(false);

        this.main.showProcessingWarning(false);
        this.main.setGameRound(this.main.roundId - 1);
    }

    showWaitTime() {
        this.main.timeWaitNode.active = true;
        this.main.timeWaitLabel.string = this.formatTime(this.main.currentTimeRemaining - this.main.config.betTime - 1);
    }

    showWaitTimeOptions(context: any) {
        this.main.timeWaitNode.active = true;
        this.main.timeWaitLabel.string = this.formatTime(this.main.currentTimeRemaining - context.shakeThePlateTime - 1);
    }

    handleStartingNewGameRound() {
        this.main.clearAllNotices();
        this.main.node.activeInHierarchy && this.main.gameAudios && this.main.gameAudios.playStartGameAudio();
        this.main.resetDataAndUI();

        const mainRoomGame = this.main;

        if (mainRoomGame && mainRoomGame.playerHandler) {
            mainRoomGame.playerHandler.updateTablePlayers();
        }
    }

    handleStartingNewGameRoundOptions(context: any) {
        context.highlightLastResult();

        if (appManager.GAME_IS_SHOWED) {
            context.finishShakeThePlate = false;
            context.shakeAnimation.node.active = true;
            context.shakeAnimation.play();
            cc.tween(context)
                .delay(0.3)
                .call(() => AudioManager.getInstance().playSFX(context.shakeAudio.clip))
                .start();

            context.finishShakeThePlate = true;
        }
    }

    handleInRoundTime() {
        this.showRoundTime();
        this.main.setGameRound(this.main.roundId);
        this.main.updateRebetButtonStatus();
    }

    /**
     * using SicBo && vipFishPrawnCrab
     */
    handleInRoundTimeOptions(context: any) {
        context.setGameRound(context.roundId);

        if (context.currentTimeRemaining <= context.config.betTime) {
            this.showRoundTime();
            if (!context.finishShakeThePlate) {
                context.shakeAnimation.node.active = true;
                const duration = context.shakeAnimation.defaultClip.duration;
                context.shakeAnimation.play("Shake", duration);
                context.finishShakeThePlate = true;
            }
        }
    }

    showRoundTime() {
        if (this.main.timeWaitNode) {
            this.main.timeWaitNode.active = false;
        }
        const time = this.formatTime(this.main.currentTimeRemaining);
        this.main.animatedTime && this.main.animatedTime.setTime(time);
    }

    handleInLockBetTime() {}
    handleInLockBetTimeOptions(context: any) {
        context.betItems.forEach((item: any) => item.resetHighlight());
    }

    handleInEndTime() {
        this.main.setGameRound(this.main.roundId);
        if (this.main.timeWaitNode) {
            this.main.timeWaitNode.active = false;
        }

        this.showMainTime(false);
        clearInterval(this.playTimeInterval);
    }

    showMainTime(show: boolean) {
        if (this.main.animatedTime) {
            this.main.animatedTime.node.active = show;
        }
    }

    protected formatTime(time: number): string {
        return numberPad(time, 2);
    }

    protected setCurrentTimeRemaining(data: any) {
        this.main.currentTimeRemaining = data.remainingTime - 1;
    }
}
