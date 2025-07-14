import BigSmallRoundResult from "./BigSmallRoundResult";
import GameLogControlBase from "../../_base/view-models/GameLogControlBase";
import GameBase from "../../_base/GameBase";
import GameBaseFinishHandler from "../../_base/handlers/GameBaseFinishHandler";
import { IconButtonChart } from "./type";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BigSmallDicesStatistic extends cc.Component {
    @property(cc.Label)
    percentageTop: cc.Label = null;

    @property(cc.Label)
    percentageBottom: cc.Label = null;

    @property(cc.Prefab)
    roundResultPrefab: cc.Prefab = null;

    @property(cc.Node)
    statsScrollView: cc.Node = null;

    @property(GameLogControlBase)
    logView: GameLogControlBase = null;

    @property(cc.Node)
    roundResultContainer: cc.Node = null;

    @property(cc.SpriteFrame)
    diceSpriteFrames: cc.SpriteFrame[] = [];

    @property(cc.SpriteFrame)
    iconSpriteFrames: cc.SpriteFrame[] = [];

    @property(cc.Sprite)
    buttonSprite: cc.Sprite = null;

    protected isShowDiceView = true;

    init(currentDataLogs: any, main: GameBase) {
        const condition = () => {
            const finishHandler = main.finishHandler as GameBaseFinishHandler;
            return (
                main.currentTimeRemaining < main.config.stopBetTime ||
                main.currentTimeRemaining > main.config.fullTime - finishHandler.getResultAnimationTime()
            );
        };

        this.updateData(currentDataLogs);
        this.logView.init(condition);
    }

    get getChoices(): string[] {
        return ["big", "small"];
    }

    get getChoicesDefault(): string {
        return "big";
    }

    updateData(dataLogs: any[]) {
        this.updatePercentages(dataLogs);
        this.updateRoundResult(dataLogs);
        this.renderLogView(dataLogs);

        this.roundResultContainer.getComponent(cc.Layout).updateLayout();
        this.statsScrollView.getComponent(cc.ScrollView).horizontal = this.statsScrollView.width < this.roundResultContainer.width;
        this.roundResultContainer.getComponent(cc.Widget).updateAlignment();
    }

    updatePercentages(dataLogs: any[]) {
        if (dataLogs.length > 0) {
            const length = dataLogs.length;
            const choices = this.getChoices;
            let totalTop = 0,
                totalBottom = 0;

            dataLogs.forEach((log) => {
                const { settlementResult } = log;

                totalTop += settlementResult[choices[0]] ? 1 : 0;
                totalBottom += settlementResult[choices[1]] ? 1 : 0;
            });

            const percentageTop = Math.round((totalTop / length) * 100);
            const percentageBottom = Math.round((totalBottom / length) * 100);

            this.percentageTop.string = `${percentageTop}%`;
            this.percentageBottom.string = `${percentageBottom}%`;
        }
    }

    updateRoundResult(dataLogs: any[]) {
        this.roundResultContainer.destroyAllChildren();

        for (let i = 0; i < dataLogs.length; i++) {
            const dataLog = dataLogs[i];
            const { result } = dataLog;
            const roundResultNode = cc.instantiate(this.roundResultPrefab);
            const roundResultComponent = roundResultNode.getComponent(BigSmallRoundResult);
            roundResultComponent.updateLabels(dataLog);
            roundResultComponent.dice1.spriteFrame = this.diceSpriteFrames[result.dice1 - 1];
            roundResultComponent.dice2.spriteFrame = this.diceSpriteFrames[result.dice2 - 1];
            roundResultComponent.dice3.spriteFrame = this.diceSpriteFrames[result.dice3 - 1];
            roundResultComponent.highlight.node.active = i === 0;
            this.roundResultContainer.addChild(roundResultNode);
        }
    }

    renderLogView(dataLogs: any[]) {
        const statsData = [];
        const choice = this.getChoicesDefault;
        if (dataLogs.length > 0) {
            dataLogs.forEach((log) => {
                const { settlementResult } = log;

                statsData.unshift(settlementResult[choice] ? 0 : 1);
            });
            this.logView.setData(statsData);
        }
    }

    changeDisplayMode() {
        this.isShowDiceView = !this.isShowDiceView;
        this.buttonSprite.spriteFrame = this.isShowDiceView
            ? this.iconSpriteFrames[IconButtonChart.chartDice]
            : this.iconSpriteFrames[IconButtonChart.chartDot];
        this.statsScrollView.active = this.isShowDiceView;
        this.logView.node.active = !this.isShowDiceView;
    }
}
