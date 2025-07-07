import IGameBase from "../IGameBase";
import { showWinningEffectForPlayers } from "../action/PayChipsAction";
import DataHandler from "./DataHandler";

export default class GameBaseWinnersHandler implements DataHandler {
    constructor(protected readonly main: IGameBase) {}

    handle(data: any) {
        if (data.winners) {
            this.main.winnersData = data.winners.winningPlayers;
            if (this.main.shouldShowWinningEffect()) {
                showWinningEffectForPlayers(this.main, this.main.winnersData);
                this.main.winnersData = null;
            }
        }
    }
}
