import { appManager } from "../../../managers/AppManager";
import IGameBase from "../IGameBase";
import { IGameBaseStatusHandler } from "./interfaces";

export class GameBaseStatusHandler implements IGameBaseStatusHandler {
    public currentStatusData: any;

    constructor(protected readonly main: IGameBase) {}

    protected timeout: any;

    public enableDelayShowStatus = true;

    handle(data: any) {
        if (data.status) {
            this.updateStatusData(data.status);

            const mainRoomGame = this.main;
            if (mainRoomGame?.userProfile) {
                this.handleStatusForRoomGame(mainRoomGame);

                return;
            }

            if (this.main.usingNewSettlement) {
                this.handleShowStatusWhenDelayEndGame();
            } else {
                this.handleShowStatusOldSettlement();
            }
        }
    }

    private handleStatusForRoomGame(mainRoomGame: IGameBase) {
        if (this.main.usingNewSettlement && this.main.shouldShowWinningEffect()) {
            this.main.showPayoutForLoginPlayer(mainRoomGame);
        }
    }

    private handleShowStatusOldSettlement() {
        if (this.enableDelayShowStatus) {
            // old settlement status data go before "finish" data
            // show status with delay time
            this.status(this.currentStatusData.win, this.currentStatusData.bet);
        }
    }

    protected handleShowStatusWhenDelayEndGame() {
        if (this.main.timeHandler.isInWaitTime) {
            if (this.main.finishShowResult) {
                this.showStatusIfExist();
            }
        }
    }

    showStatusIfExist() {
        if (this.currentStatusData) {
            this.showStatus(this.currentStatusData.win, this.currentStatusData.bet);
            this.clearStatusData();
        }
    }

    updateStatusData(data: any) {
        this.currentStatusData = data;
    }

    clearStatusData() {
        this.updateStatusData(null);
    }

    clearTimeout() {
        this.timeout && clearTimeout(this.timeout);
    }

    status(win: boolean, bet: number, delayTime = 2e3): void {
        if (!appManager.GAME_IS_SHOWED) {
            return;
        }

        this.timeout = setTimeout(() => {
            this.showStatus(win, bet);
        }, delayTime);
    }

    showStatus(win: boolean, bet: number) {
        if (!appManager.GAME_IS_SHOWED) {
            return;
        }
        if (win) {
            this.main.showWinningBet(bet);
            this.main.updateUserBalance();
        }
    }
}
