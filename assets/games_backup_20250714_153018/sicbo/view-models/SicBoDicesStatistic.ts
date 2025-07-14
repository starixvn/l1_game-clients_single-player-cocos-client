import SicBoRoundResult from "./SicBoRoundResult";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SicBoDicesStatistic extends cc.Component {
    @property(cc.Label)
    dice1Percentage: cc.Label = null;

    @property(cc.Label)
    dice2Percentage: cc.Label = null;

    @property(cc.Label)
    dice3Percentage: cc.Label = null;

    @property(cc.Label)
    dice4Percentage: cc.Label = null;

    @property(cc.Label)
    dice5Percentage: cc.Label = null;

    @property(cc.Label)
    dice6Percentage: cc.Label = null;

    @property(cc.Prefab)
    roundResultPrefab: cc.Prefab = null;

    @property(cc.Node)
    statsScrollView: cc.Node = null;

    @property(cc.Node)
    roundResultContainer: cc.Node = null;

    @property(cc.SpriteFrame)
    diceSpriteFrames: cc.SpriteFrame[] = [];

    init(currentDataLogs: any) {
        this.updateData(currentDataLogs);
    }

    updateData(dataLogs: any[]) {
        this.updatePercentages(dataLogs);
        this.updateRoundResult(dataLogs);

        this.roundResultContainer.getComponent(cc.Layout).updateLayout();
        this.statsScrollView.getComponent(cc.ScrollView).horizontal = this.statsScrollView.width < this.roundResultContainer.width;
        this.roundResultContainer.getComponent(cc.Widget).updateAlignment();
    }

    updatePercentages(dataLogs: any[]) {
        if (dataLogs.length > 0) {
            let dice1Total = 0,
                dice2Total = 0,
                dice3Total = 0,
                dice4Total = 0,
                dice5Total = 0;

            dataLogs.forEach((log) => {
                dice1Total += this.countDiceValue(log.result, 1);
                dice2Total += this.countDiceValue(log.result, 2);
                dice3Total += this.countDiceValue(log.result, 3);
                dice4Total += this.countDiceValue(log.result, 4);
                dice5Total += this.countDiceValue(log.result, 5);
            });

            const length = dataLogs.length;

            const dice1Percentage = Math.round((dice1Total / (length * 3)) * 100);
            const dice2Percentage = Math.round((dice2Total / (length * 3)) * 100);
            const dice3Percentage = Math.round((dice3Total / (length * 3)) * 100);
            const dice4Percentage = Math.round((dice4Total / (length * 3)) * 100);
            const dice5Percentage = Math.round((dice5Total / (length * 3)) * 100);
            const dice6Percentage = 100 - (dice1Percentage + dice2Percentage + dice3Percentage + dice4Percentage + dice5Percentage);

            this.dice1Percentage.string = `${dice1Percentage}%`;
            this.dice2Percentage.string = `${dice2Percentage}%`;
            this.dice3Percentage.string = `${dice3Percentage}%`;
            this.dice4Percentage.string = `${dice4Percentage}%`;
            this.dice5Percentage.string = `${dice5Percentage}%`;
            this.dice6Percentage.string = `${dice6Percentage}%`;
        }
    }

    countDiceValue(result: any, value: number) {
        let count = 0;
        if (result.dice1 === value) {
            count++;
        }
        if (result.dice2 === value) {
            count++;
        }
        if (result.dice3 === value) {
            count++;
        }

        return count;
    }

    updateRoundResult(dataLogs: any[]) {
        this.roundResultContainer.destroyAllChildren();

        for (let i = 0; i < dataLogs.length; i++) {
            const dataLog = dataLogs[i];
            const { result } = dataLog;
            const roundResultNode = cc.instantiate(this.roundResultPrefab);
            const roundResultComponent = roundResultNode.getComponent(SicBoRoundResult);
            roundResultComponent.updateLabels(dataLog);
            roundResultComponent.dice1.spriteFrame = this.diceSpriteFrames[result.dice1 - 1];
            roundResultComponent.dice2.spriteFrame = this.diceSpriteFrames[result.dice2 - 1];
            roundResultComponent.dice3.spriteFrame = this.diceSpriteFrames[result.dice3 - 1];
            roundResultComponent.highlight.node.active = i === 0;
            this.roundResultContainer.addChild(roundResultNode);
        }
    }
}
