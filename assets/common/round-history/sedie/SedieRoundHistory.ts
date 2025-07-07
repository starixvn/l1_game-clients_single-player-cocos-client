import GameBase from "../../../games/_base/GameBase";
import GameBaseFinishHandler from "../../../games/_base/handlers/GameBaseFinishHandler";
import GameLogControlBase from "../../../games/_base/view-models/GameLogControlBase";
import SedieRoundHistoryItem from "./SedieRoundHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SedieRoundHistory extends cc.Component {
    @property(GameLogControlBase)
    logControl: GameLogControlBase = null;

    @property(cc.Label)
    even: cc.Label = null;

    @property(cc.Label)
    odd: cc.Label = null;

    @property(cc.Label)
    red3: cc.Label = null;

    @property(cc.Label)
    red4: cc.Label = null;

    @property(cc.Label)
    white3: cc.Label = null;

    @property(cc.Label)
    white4: cc.Label = null;

    protected suffix = "%";

    public setData(redData: any) {
        this.updateHistory(redData);
    }

    public init(main: GameBase) {
        const condition = () => {
            const finishHandler = main.finishHandler as GameBaseFinishHandler;
            return (
                main.currentTimeRemaining < main.config.stopBetTime ||
                main.currentTimeRemaining > main.config.fullTime - finishHandler.getResultAnimationTime()
            );
        };
        this.logControl.init(condition);
    }

    private updateHistory(redData: any) {
        const data = [...redData];
        this.updateStatistic(data);
        if (this.logControl) {
            this.setRoundHistoryItemData(data);
        }
    }

    private setRoundHistoryItemData(data: any) {
        data.reverse();
        const logData = data.map((d) => (d % 2 === 0 ? 0 : 1));
        this.logControl.setData(logData);
        const items = this.logControl.content.getComponentsInChildren(SedieRoundHistoryItem);
        items.forEach((item, i) => item.setValue(data[i]));
    }

    private updateStatistic(redData: number[]) {
        const total = redData.length;

        if (total === 0) {
            this.updateStatisticLabels({
                oddValue: 0,
                evenValue: 0,
                red2Value: 0,
                red3Value: 0,
                red4Value: 0,
                white3Value: 0,
                white4Value: 0,
                total: 0
            });
            return;
        }

        let oddCount = 0,
            red3Count = 0,
            red4Count = 0,
            white3Count = 0,
            white4Count = 0;
        redData.forEach((i) => {
            switch (i) {
                case 0:
                    white4Count++;
                    break;
                case 1:
                    white3Count++;
                    oddCount++;
                    break;
                case 3:
                    red3Count++;
                    oddCount++;
                    break;
                case 4:
                    red4Count++;
                    break;
            }
        });

        const oddValue = Math.round((oddCount * 100) / total);
        const evenValue = 100 - oddValue;
        const red3Value = Math.round((red3Count * 100) / total);
        const red4Value = Math.round((red4Count * 100) / total);
        const white3Value = oddValue - red3Value;
        const white4Value = Math.round((white4Count * 100) / total);
        const red2Value = evenValue - red4Value - white4Value;
        this.updateStatisticLabels({ oddValue, evenValue, red2Value, red3Value, red4Value, white3Value, white4Value, total });
    }

    protected updateStatisticLabels({ oddValue, evenValue, red2Value, red3Value, red4Value, white3Value, white4Value, total }) {
        this.odd.string = `${oddValue}${this.suffix}`;
        this.even.string = `${evenValue}${this.suffix}`;
        this.red3.string = `${red3Value}${this.suffix}`;
        this.red4.string = `${red4Value}${this.suffix}`;
        this.white3.string = `${white3Value}${this.suffix}`;
        this.white4.string = `${white4Value}${this.suffix}`;
    }
}
