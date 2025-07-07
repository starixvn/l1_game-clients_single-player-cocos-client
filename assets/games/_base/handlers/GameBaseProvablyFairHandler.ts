import _ = require("lodash");
import GameUtils from "../../../common/GameUtils";
import IGameBase from "../IGameBase";
import DataHandler from "./DataHandler";

export default class GameBaseProvablyFairHandler implements DataHandler {
    constructor(protected readonly main: IGameBase) {}

    handle(data: any) {
        if (data.resultHash && Object.keys(data.resultHash).length && data.resultHash?.hashValue) {
            this.main.provablyFairComponent?.handleReceiveServerSeed(data.resultHash);
        }

        if (data.clientSeed) {
            this.main.provablyFairComponent?.updateClientSeed(data?.clientSeed);
        }
        if (data.provablyFair || data.roundPFResult) {
            this.main.handleProvablyFairVerifyData(data.provablyFair || data.roundPFResult);
        }

        if (data.pf && Object.keys(data.pf).length) {
            this.main.provablyFairComponent?.handleServerSeed(data.pf.serverSeedHash);
        }

        if (data.ownBets) {
            this.handleOwnBets(data);
        }

        if (data.spb) {
            this.main.provablyFairComponent?.handleResetNewRound();
        }

        if (data.roundPFResult) {
            this.main.provablyFairComponent?.handleServerSeed(data.roundPFResult.serverSeedHash);
        }
    }

    handleOwnBets(data) {
        if (!_.isEmpty(data.ownBets)) {
            this.main.provablyFairComponent?.setClientSeedUIState(false);
        } else {
            this.main.provablyFairComponent?.handleResetNewRound();
        }
        if (data.roundId && this.main.provablyFairComponent?.isShowPFSettings) {
            this.main.sendSocketData("getRoundPF", {
                roundId: GameUtils.getTruthyRoundId(this.main, data)
            });
        }
    }
}
