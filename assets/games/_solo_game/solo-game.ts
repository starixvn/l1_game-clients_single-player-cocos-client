import NewGameData from "../_base_new/models/NewGameData";
import StandAloneTableGameBase from "../_base_new/view-models/StandAloneTableGameBase";
import { SoloBetModel, SoloBetState } from "./solo-bet-model";
import SoloGameData from "./solo-game-data";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SoloGame extends StandAloneTableGameBase {
    get soloBetModel() {
        return this.gameData.betModel as SoloBetModel;
    }

    setGameRound(gameRoundId) {
        const gameRound = this.formatGameRound(gameRoundId);
        this.gameRound.string = gameRound;
        this.gameRound.node.parent.active = gameRoundId > 0;
    }

    createGameData(): NewGameData {
        return new SoloGameData();
    }

    initGameDataEvents() {
        super.initGameDataEvents();
        this.emitterListener(this.gameData.betModel, SoloBetModel.Events.CONFIRM_BET, () => (bet) => this.onConfirmBet(bet));
    }

    onConfirmBet(bet: any) {
        console.log("onConfirmBet", bet);

        const betData = this.createBetData(bet);
        this.sendSocketData("bet", betData);
    }

    protected createBetData(bet: any) {
        throw new Error("Method not implemented.");
    }

    clickConfirmBet() {
        this.soloBetModel.confirmBet();
    }

    clickNewBet() {
        this.soloBetModel.changeState(SoloBetState.READY);
    }

    clickReBet() {
        this.soloBetModel.reBet();
    }

    clickUndoBet() {
        this.soloBetModel.undoBet();
    }

    override showStatus(status: any) {
        const { win, bet } = status;

        if (win) {
            this.showWinningBet(bet);
            this.updateUserBalance();
        }
    }
}
