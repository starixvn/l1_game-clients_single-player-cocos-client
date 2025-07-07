import * as _ from "lodash";
import CommonDialog from "../../../common/_base/view-models/CommonDialog";
import RouletteStatisticItem from "../../roulette/view-models/RouletteStatisticItem";
import RouletteUtils from "../../roulette/view-models/RouletteUtils";
import RouletteStatisticsTopNumbers from "./roulette-statistics-top-numbers";
const { ccclass, property } = cc._decorator;

@ccclass
export default class RouletteStatistics extends cc.Component {
    @property(cc.Node)
    mainFrame: cc.Node = null;

    @property(RouletteStatisticsTopNumbers)
    hotNumbers: RouletteStatisticsTopNumbers = null;

    @property(RouletteStatisticsTopNumbers)
    coldNumbers: RouletteStatisticsTopNumbers = null;

    @property([cc.Label])
    percentageLabels: cc.Label[] = [];

    result: any = null;
    resultStats = [];

    onLoad() {
        const commonDialog = this.mainFrame.getComponent(CommonDialog);
        commonDialog.addOnDidHide(() => {
            this.node.destroy();
        });
    }

    public generateStatistic(data: any) {
        if (data.length === 0) {
            return;
        }
        this.result = data;
        this.createResultStatistic();
        this.handleStatsPercent();
    }

    createResultStatistic() {
        for (let i = 0; i < 37; i++) {
            this.resultStats.push({
                number: i,
                times: 0
            });
        }
        this.result.forEach((number) => {
            this.resultStats[number].times++;
        });

        this.resultStats.sort((a, b) => {
            return a.times - b.times;
        });
    }

    handleStatsPercent() {
        this.updateHotColdNumbers();
        this.calculateBasicStatic();
        this.calculateDozensStatic();
    }

    updateHotColdNumbers() {
        const coldNumbers = _.slice(this.resultStats, 0, 4);
        const hotNumbers = _.slice(this.resultStats, this.resultStats.length - 4, this.resultStats.length);

        this.hotNumbers.setData(hotNumbers);
        this.coldNumbers.setData(coldNumbers);
    }

    private calculateBasicStatic() {
        let redCount = 0;
        let blackCount = 0;
        let oddCount = 0;
        let evenCount = 0;
        let zeroCount = 0;

        this.result.forEach((number) => {
            if (number === 0) {
                zeroCount += 1;
            } else {
                if (RouletteUtils.isRed(number)) {
                    redCount += 1;
                } else {
                    blackCount += 1;
                }

                if (RouletteUtils.isOdd(number)) {
                    oddCount += 1;
                } else {
                    evenCount += 1;
                }
            }
        });

        const zeroPercent = _.round((zeroCount / this.result.length) * 100);

        const red = _.round((redCount / this.result.length) * 100);
        const black = 100 - (red + zeroPercent);

        const odd = _.round((oddCount / this.result.length) * 100);
        const even = 100 - (odd + zeroPercent);

        const statisticPercentNodes = this.getComponentsInChildren(RouletteStatisticItem);
        statisticPercentNodes.forEach((item, index) => {
            if (index === 0) {
                item.setData(red, black);
                item.updateProgressBar(redCount, blackCount);
            }

            if (index === 1) {
                item.setData(even, odd);
                item.updateProgressBar(evenCount, oddCount);
            }
        });
    }

    private calculateDozensStatic() {
        let dozen1Count = 0;
        let dozen2Count = 0;
        let zeroCount = 0;
        this.result.forEach((number) => {
            if (number === 0) {
                zeroCount += 1;
            } else {
                if (number < 13) {
                    dozen1Count += 1;
                } else if (number < 25) {
                    dozen2Count += 1;
                }
            }
        });

        const zeroPercent = _.round((zeroCount / this.result.length) * 100);
        this.percentageLabels[0].string = `${zeroPercent}%`;

        const dozen1 = _.round((dozen1Count / this.result.length) * 100);
        const dozen2 = _.round((dozen2Count / this.result.length) * 100);
        const dozen3 = 100 - (zeroPercent + dozen1 + dozen2);
        this.percentageLabels[1].string = `${dozen1}%`;
        this.percentageLabels[2].string = `${dozen2}%`;
        this.percentageLabels[3].string = `${dozen3}%`;
    }
}
