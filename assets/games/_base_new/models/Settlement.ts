import EventEmitterBase from "../../../common/emitter/EventEmitterBase";

export class Settlement extends EventEmitterBase {
    static Events = {
        SHOW_STATUS: "Settlement:SHOW_STATUS",
        SHOW_RESULT: "Settlement:SHOW_RESULT",
        END_SHOW_RESULT: "Settlement:END_SHOW_RESULT",
        FORCE_TIMEOUT: "Settlement: FORCE_TIMEOUT",

        RECEIVED_OTHERS_STATUS: "Settlement:RECEIVED_OTHERS_STATUS",
        RECEIVED_LOGIN_PLAYER_STATUS: "Settlement:RECEIVED_LOGIN_PLAYER_STATUS"
    };
    settlement: any;
    status: any;
    isWaitingSettlement: boolean;
    isShowingSettlement: boolean;
    winningPlayers: any;

    showResult(settlement: any) {
        this.isWaitingSettlement = false;
        this.isShowingSettlement = true;
        this.settlement = settlement;
        this.emit(Settlement.Events.SHOW_RESULT, this.settlement);
    }

    finishShowResult(settlement: any, animated: boolean) {
        this.isShowingSettlement = false;
        const data = { settlement: settlement || this.settlement, animated };
        this.emit(Settlement.Events.END_SHOW_RESULT, data);
    }

    showStatus() {
        this.status && this.emit(Settlement.Events.SHOW_STATUS, this.status);
    }

    forceTimeOut() {
        this.emit(Settlement.Events.FORCE_TIMEOUT, this);
    }

    receiveStatus(status: any) {
        this.status = status;
        this.emit(Settlement.Events.RECEIVED_LOGIN_PLAYER_STATUS, this.status);
    }

    receiveWinners(winningPlayers: any) {
        if (!winningPlayers) {
            return;
        }
        this.winningPlayers = winningPlayers;
        this.emit(Settlement.Events.RECEIVED_OTHERS_STATUS, this.winningPlayers);
    }

    clearWinnersData() {
        this.winningPlayers = null;
    }

    clearStatus() {
        this.status = null;
    }

    clearSettlement() {
        this.settlement = null;
    }
}
