import GameBaseLogsHandler from "../../../_base/handlers/GameBaseLogsHandler";
import Roulette from "../Roulette";

export default class RouletteLogsHandler extends GameBaseLogsHandler {
    constructor(protected readonly main: Roulette) {
        super(main);
    }

    buildLogs(dataLogs) {
        this.main.updateMiniRoundResult(this.main.currentTimeRemaining > this.main.config.betTime);
        const lastResult = dataLogs[0].result;
        this.main.rouletteMain.wheel.setResult(lastResult);
    }
}
