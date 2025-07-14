import GameBase from "../../_base/GameBase";
import TexasConfigsModel from "../event-models/texas-configs-model";
import TexasMinMax from "../view-models/texas-min-max";
import TexasOddsTable from "../view-models/texas-odds-table";

export const updateMinMax = (minMaxTable: TexasMinMax) => (mainGame: GameBase) => {
    minMaxTable.Min = mainGame.getMinBet();
    minMaxTable.Max = mainGame.getMaxBet();
};

export const updateLeftRightOddsTable = (oddsTable: TexasOddsTable) => (configs: TexasConfigsModel) => {
    for (const [key, value] of Object.entries(configs.odds)) {
        const oddOption = oddsTable.oddOptions.find((e) => e.key === key);
        if (oddOption) {
            oddOption.OddValue = value;
        }
    }
};
