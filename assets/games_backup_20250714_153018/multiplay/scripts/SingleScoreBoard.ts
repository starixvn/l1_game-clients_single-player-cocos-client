import { lodash } from "../../../ClientModules";
import AudioManager from "../../../common/audio/AudioManager";
import GameIdSprite from "../../../common/GameIdSprite";
import BeadRoad from "../../_base/view-models/BeadRoad";
import ExtendedGameLogControl from "../../_base/view-models/ExtendedGameLogControl";
import { RoundHistory } from "../../_base_new/models/RoundHistory";
import MiniGameBase from "../../_base_new/view-models/MiniGameBase";
import { Durations } from "../../_new/_base/game-data-management/models/durations";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SingleScoreBoard extends cc.Component {
    @property({ type: cc.Label })
    percentLabels: cc.Label[] = [];

    @property(GameIdSprite)
    gameName: GameIdSprite = null;

    beadRoad: BeadRoad = null;
    logControl: ExtendedGameLogControl = null;
    componentCount = 0;
    gameId: number;

    roundHistory: RoundHistory;
    duration: Durations;

    choices = [];

    openGameCallback = (gameId) => {};

    initBeadRoad(node: cc.Node) {
        this.beadRoad = node.getComponent(BeadRoad);
        this.checkInitialize();
    }

    initDragonTail(node: cc.Node) {
        this.logControl = node.getComponent(ExtendedGameLogControl);
        this.checkInitialize();
    }

    checkInitialize() {
        this.componentCount++;

        const done = this.componentCount === 2;
        if (done) {
            const defaultShowBeadRoad = false;
            this.switchView(defaultShowBeadRoad);
        }
    }

    switchView(showBeadRoad: boolean) {
        this.beadRoad.node.active = showBeadRoad;
        this.logControl.node.active = !showBeadRoad;
    }

    onClickSwithView() {
        AudioManager.getInstance().playClick();
        this.switchView(!this.beadRoad.node.active);
    }

    openGame() {
        AudioManager.getInstance().playClick();
        this.openGameCallback(this.gameId);
    }

    init(game: MiniGameBase) {
        this.gameId = game.gameId;
        this.duration = game.gameData.durations;
        this.roundHistory = game.gameData.roundHistory;
        this.gameName.gameId = this.gameId;

        this.roundHistory.on(RoundHistory.Events.CHANGE, this.updateRoundHistory);
        this.duration.on(Durations.Events.LOCKING_BET, this.showNextItem);

        this.updateRoundHistory(game.gameData.roundHistory.roundHistory);
    }

    onDestroy() {
        this.roundHistory.removeListener(RoundHistory.Events.CHANGE, this.updateRoundHistory);
        this.duration.removeListener(Durations.Events.LOCKING_BET, this.showNextItem);

        this.roundHistory = null;
        this.duration = null;
    }

    showNextItem = () => {
        if (!this.beadRoad.showNext) {
            this.beadRoad.showNext = true;
            this.logControl.nextMark && (this.logControl.nextMark.active = true);
        }
    };

    hideNextItem() {
        this.beadRoad.showNext = false;
        this.logControl.nextMark && (this.logControl.nextMark.active = false);
    }

    updateRoundHistory = (roundHistory) => {
        this.hideNextItem();

        const count = roundHistory.reduce((count: any, history) => {
            this.choices.forEach((choice) => {
                if (history.settlementResult[choice]) {
                    count[choice] = (count[choice] ?? 0) + 1;
                }
            });
            return count;
        }, {});

        const choices = [...this.choices].sort((a, b) => count[a] - count[b]);

        let total = 0;
        choices.forEach((choice, index) => {
            const label = this.percentLabels.find((label) => label.node.name === choice);
            const value = Math.floor((count[choice] * 100) / roundHistory.length);
            label.string = `${value}%`;
            if (index === choices.length - 1) {
                label.string = `${100 - total}%`;
            }

            total += value;
        });

        const data = roundHistory.map((history) => {
            const result = {};
            const winChoice = Object.keys(history.settlementResult).find((choice) => history.settlementResult[choice]);
            result["type"] = this.choices.findIndex((choice) => choice === winChoice);
            const sum = this.generalExtraInfo(history);
            result["extra"] = { sum };
            return result;
        });
        this.beadRoad.setData(data);
        const reverseData = lodash.cloneDeep(data).reverse();
        this.logControl.setExtendedData(reverseData);
    };

    generalExtraInfo(history) {}
}
