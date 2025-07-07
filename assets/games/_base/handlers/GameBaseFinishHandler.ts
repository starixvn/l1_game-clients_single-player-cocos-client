import { updateOtherPlayerBalance } from "../action/OtherPlayerAction";
import { payChips } from "../action/PayChipsAction";
import IGameBase from "../IGameBase";
import DataHandler from "./DataHandler";

export default class GameBaseFinishHandler implements DataHandler {
    readonly payChipFlyTime = 1.2;
    get WinningAnimationDuration() {
        return 3;
    }

    constructor(protected readonly main: IGameBase, protected readonly playResultAnimationTime: number = 0) {}

    handle(data: any) {
        if (data.finish) {
            this.clearDataBeforeHandleFinish();
            this.main.node.activeInHierarchy && this.main.gameAudios.playEndGameAudio();
            this.setNewGameRound(data);
            const mainRoomGame = this.main;
            if (mainRoomGame && mainRoomGame.playerHandler) {
                updateOtherPlayerBalance(data.finish.winningPlayers, mainRoomGame);
            }
            this.handleFinishData(data.finish, () => {
                payChips(
                    this.main,
                    data.finish.settlementResult,
                    data.finish.winningPlayers,
                    this.payChipFlyTime,
                    this.WinningAnimationDuration
                );
                this.main.finishShowResult = true;
            });
        }
    }

    protected clearDataBeforeHandleFinish() {
        this.main.finishShowResult = false;
        this.main.isDonePayingChip = false;
        this.main.winnersData = null;
        if (this.main.usingNewSettlement) {
            this.main.statusHandler?.clearStatusData();
        }
    }

    protected setNewGameRound(data: any) {
        this.main.timeHandler.resetTime();
        this.main.roundId = data.finish.roundId + 1;
    }

    public getResultAnimationTime() {
        return this.playResultAnimationTime;
    }

    handleFinishData(dataFinish, onFinishHanlingData: () => void = null) {
        // handleFinishData
    }

    protected updateMD5ResultHash() {
        const md5Handler = this.main.md5Handler;
        if (md5Handler?.resultHash) {
            this.main.md5Component?.updateMD5Data(md5Handler.resultHash);
        }
    }
}
