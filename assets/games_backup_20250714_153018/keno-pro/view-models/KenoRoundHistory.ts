import GameBase from "../../_base/GameBase";
import GameBaseFinishHandler from "../../_base/handlers/GameBaseFinishHandler";
import GameLogControlBase from "../../_base/view-models/GameLogControlBase";
import Keno from "./Keno";

const { ccclass, property } = cc._decorator;
interface StatisticData {
    data: number[];
    statistic: number[];
}

enum HistoryOption {
    BigSmall = 0,
    EvenOdd,
    FiveElements
}

@ccclass
export default class KenoRoundHistory extends cc.Component {
    @property({ type: cc.Label })
    statisticLabels: cc.Label[] = [];

    @property(GameLogControlBase)
    sharedLogControl: GameLogControlBase = null;

    @property({ type: cc.Node })
    bigSmallItem: cc.Node[] = [];

    @property({ type: cc.Node })
    evenOddItem: cc.Node[] = [];

    @property({ type: cc.Node })
    fiveElementsItem: cc.Node[] = [];

    @property({ type: cc.Node })
    waterMarks: cc.Node[] = [];

    @property
    toggleStatistics = false;

    @property({
        type: cc.Node,
        visible: function (this: KenoRoundHistory) {
            return this.toggleStatistics;
        }
    })
    statisticsNodes: cc.Node[] = [];

    private main: GameBase;
    private statisticData: StatisticData[] = [];
    private currentOption = 0;

    private readonly indexDictionary = {
        big: 0,
        small: 1,
        even: 0,
        odd: 1,
        gold: 0,
        wood: 1,
        water: 2,
        fire: 3,
        earth: 4
    };

    private readonly dataIndexDictionary = {
        big: 0,
        small: 0,
        even: 1,
        odd: 1,
        gold: 2,
        wood: 2,
        water: 2,
        fire: 2,
        earth: 2
    };

    onLoad() {
        this.node.active = false;
    }

    public init(main: GameBase) {
        this.main = main;
        const condition = () => {
            const finishHandler = main.finishHandler as GameBaseFinishHandler;
            return (
                main.currentTimeRemaining < main.config.stopBetTime ||
                main.currentTimeRemaining > main.config.fullTime - finishHandler.getResultAnimationTime()
            );
        };
        this.sharedLogControl.init(condition);
    }

    public onPressPrevious() {
        this.currentOption--;
        if (this.currentOption < 0) {
            this.currentOption = 2;
        }
        this.updateDisplay();
    }

    public onPressNext() {
        this.currentOption++;
        if (this.currentOption > 2) {
            this.currentOption = 0;
        }
        this.updateDisplay();
    }

    private updateDisplay() {
        this.waterMarks.forEach((waterMark, index) => {
            waterMark.active = index === this.currentOption;
        });
        switch (this.currentOption) {
            case 0:
                this.showBigSmall();
                break;
            case 1:
                this.showEvenOdd();
                break;
            case 2:
                this.showFiveElements();
                break;
        }
        this.updateStatisticsToggle();
    }

    private updateStatisticsToggle() {
        if (!this.toggleStatistics) {
            return;
        }

        this.statisticsNodes.forEach((child, index) => {
            this.statisticsNodes[index].active = index === this.currentOption;
        });
    }

    public setData(data: any) {
        this.node.active = true;

        const results: string[][] = data.map((d) => {
            const settlementResult = d.settlementResult;
            return Keno.getResults(settlementResult);
        });

        this.statisticData = [
            {
                data: [],
                statistic: [0, 0]
            },
            {
                data: [],
                statistic: [0, 0]
            },
            {
                data: [],
                statistic: [0, 0, 0, 0, 0]
            }
        ];

        [...results].reverse().forEach((result) => {
            result.forEach((e) => {
                const statistic = this.statisticData[this.dataIndexDictionary[e]];
                statistic.data.push(this.indexDictionary[e]);
                statistic.statistic[this.indexDictionary[e]]++;
            });
        });

        this.updateStatistics();
        this.updateDisplay();
    }

    private showBigSmall() {
        this.sharedLogControl.items = this.bigSmallItem;
        const statisticData = this.statisticData[HistoryOption.BigSmall];
        this.updataLogControl(statisticData);
    }

    private showEvenOdd() {
        this.sharedLogControl.items = this.evenOddItem;
        const statisticData = this.statisticData[HistoryOption.EvenOdd];
        this.updataLogControl(statisticData);
    }

    private showFiveElements() {
        this.sharedLogControl.items = this.fiveElementsItem;
        const statisticData = this.statisticData[HistoryOption.FiveElements];
        this.updataLogControl(statisticData);
    }

    private updataLogControl(statisticData: any) {
        const data = statisticData.data;
        this.sharedLogControl.setData(data);
    }

    private updateStatistics() {
        const statisticBigSmall = this.statisticData[HistoryOption.BigSmall];
        const big = statisticBigSmall.statistic[0];
        const small = statisticBigSmall.statistic[1];
        const bigValue = Math.round((big * 100) / (big + small));
        this.statisticLabels[0].string = `${bigValue}%`;
        this.statisticLabels[1].string = `${100 - bigValue}%`;

        const statisticEvenOdd = this.statisticData[HistoryOption.EvenOdd];
        const even = statisticEvenOdd.statistic[0];
        const odd = statisticEvenOdd.statistic[1];
        const evenValue = Math.round((even * 100) / (even + odd));
        this.statisticLabels[2].string = `${evenValue}%`;
        this.statisticLabels[3].string = `${100 - evenValue}%`;

        const statisticFiveElements = this.statisticData[HistoryOption.FiveElements];
        const gold = statisticFiveElements.statistic[0];
        const wood = statisticFiveElements.statistic[1];
        const water = statisticFiveElements.statistic[2];
        const fire = statisticFiveElements.statistic[3];
        const earth = statisticFiveElements.statistic[4];
        const total = gold + wood + water + fire + earth;

        const goldValue = Math.round((gold * 100) / total);
        const woodValue = Math.round((wood * 100) / total);
        const earthValue = Math.round((earth * 100) / total);
        const fireValue = Math.round((fire * 100) / total);
        const waterValue = 100 - (goldValue + woodValue + earthValue + fireValue);
        this.statisticLabels[4].string = `${goldValue}%`;
        this.statisticLabels[5].string = `${woodValue}%`;
        this.statisticLabels[6].string = `${waterValue}%`;
        this.statisticLabels[7].string = `${fireValue}%`;
        this.statisticLabels[8].string = `${earthValue}%`;
    }
}
