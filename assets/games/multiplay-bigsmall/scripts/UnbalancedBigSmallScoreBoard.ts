import SingleScoreBoard from "../../multiplay/scripts/SingleScoreBoard";
import MiniGameBase from "../../_base_new/view-models/MiniGameBase";
import { RoundHistory } from "../../_base_new/models/RoundHistory";
import { Durations } from "../../_new/_base/game-data-management/models/durations";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UnbalancedBigSmallScoreBoard extends SingleScoreBoard {
    override choices = ["big", "small"];

    override generalExtraInfo(history) {
        return Object.values(history.result).reduce((prev: number, value: number) => prev + value, 0);
    }

    override init(game: MiniGameBase) {
        this.gameId = game.gameId;
        this.duration = game.gameData.durations;
        this.roundHistory = game.gameData.roundHistory;
        this.gameName.prefix = `game-name-${window.i18n.curLang}-`;
        this.gameName.gameId = this.gameId;

        this.roundHistory.on(RoundHistory.Events.CHANGE, this.updateRoundHistory);
        this.duration.on(Durations.Events.LOCKING_BET, this.showNextItem);

        this.updateRoundHistory(game.gameData.roundHistory.roundHistory);
    }
}
