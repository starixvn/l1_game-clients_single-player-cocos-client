import SingleScoreBoard from "../../multiplay/scripts/SingleScoreBoard";
import { RoundHistory } from "../../_base_new/models/RoundHistory";
import MiniGameBase from "../../_base_new/view-models/MiniGameBase";
import { Durations } from "../../_new/_base/game-data-management/models/durations";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MiniSedieSingleScoreBoard extends SingleScoreBoard {
    override choices = ["even", "odd"];
    override generalExtraInfo(history) {
        let count = 0;
        const list = ["red1", "red2", "red3", "red4"];
        list.forEach((i) => {
            if (history.result[i]) {
                count++;
            }
        });
        return count;
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
