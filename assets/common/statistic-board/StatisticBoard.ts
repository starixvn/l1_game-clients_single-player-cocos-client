import lodash = require("lodash");

import ExtendedGameLogControl from "../../games/_base/view-models/ExtendedGameLogControl";
import { RoundHistory } from "../../games/_base_new/models/RoundHistory";
import MiniGameBase from "../../games/_base_new/view-models/MiniGameBase";
import { Durations } from "../../games/_new/_base/game-data-management/models/durations";
import GameUtils from "../GameUtils";
import ItemPercentStatistic from "./ItemPercentStatistic";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StatisticBoard extends cc.Component {
    @property(ExtendedGameLogControl)
    logControl: ExtendedGameLogControl = null;

    @property([ItemPercentStatistic])
    itemPercentList: ItemPercentStatistic[] = [];

    @property
    supportChoices = "big,small";

    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    roundHistory: RoundHistory;
    duration: Durations;
    originalChoices: string[];

    onLoad() {
        this.onChangedSupportChoices();
    }

    setSupportChoices(choices: string) {
        this.supportChoices = choices;
        this.onChangedSupportChoices();
    }

    onChangedSupportChoices() {
        this.originalChoices = this.supportChoices.split(",");
        this.itemPercentList.forEach((item, index) => {
            const iconFrame = this.atlas.getSpriteFrame(`dot_${this.originalChoices[index]}`);
            item.init(iconFrame, GameUtils.getBetChoiceString(this.originalChoices[index]));
        });
    }

    init(game: MiniGameBase) {
        this.duration = game.gameData.durations;
        this.roundHistory = game.gameData.roundHistory;

        this.roundHistory.on(RoundHistory.Events.CHANGE, this.updateRoundHistory);
        this.duration.on(Durations.Events.LOCKING_BET, this.showNextItem);

        this.updateRoundHistory(this.roundHistory.roundHistory);
    }

    onDestroy() {
        this.roundHistory?.removeListener(RoundHistory.Events.CHANGE, this.updateRoundHistory);
        this.duration?.removeListener(Durations.Events.LOCKING_BET, this.showNextItem);

        this.roundHistory = null;
        this.duration = null;
    }

    showNextItem = () => {
        this.enableNextItem(true);
    };

    hideNextItem() {
        this.enableNextItem(false);
    }

    enableNextItem(show: boolean) {
        if (this.logControl) {
            this.logControl.nextMark && (this.logControl.nextMark.active = show);
        }
    }

    generateExtra(result: any): any {
        return {};
    }

    updateRoundHistory = (roundHistory) => {
        this.hideNextItem();
        if (roundHistory.length > 0) {
            const originalChoices = this.originalChoices;
            this.calculateWin(originalChoices, roundHistory);

            const data = this.handleDataRound(originalChoices, roundHistory);
            this.updateBeadRoad(data);
            const reverseData = lodash.cloneDeep(data).reverse();
            this.logControl && this.logControl.setExtendedData(reverseData);
        }
    };

    calculateWin(originalChoices: string[], roundHistory: any) {
        const percentage = GameUtils.calculateWinPercentage(originalChoices, roundHistory);
        this.itemPercentList.forEach((item, index) => {
            item.setPercent(percentage[this.originalChoices[index]]);
        });
    }

    handleDataRound(originalChoices: string[], roundHistory: any) {
        return roundHistory.map((history) => {
            const result = {};
            const winChoice = this.originalChoices.find((choice) => history.settlementResult[choice]);
            result["type"] = originalChoices.findIndex((choice) => choice === winChoice);
            result["choice"] = winChoice;
            result["extra"] = this.generateExtra(history.result);
            return result;
        });
    }

    updateBeadRoad(data: any) {}
}
