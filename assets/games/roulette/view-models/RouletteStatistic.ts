import * as _ from "lodash";

import CommonDialog from "../../../common/_base/view-models/CommonDialog";
import AudioManager from "../../../common/audio/AudioManager";
import RouletteStatisticItem from "./RouletteStatisticItem";
import RouletteUtils from "./RouletteUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RouletteStatistic extends cc.Component {
    @property(cc.Node)
    mainFrame: cc.Node = null;

    @property(cc.Node)
    wheel: cc.Node = null;

    @property(cc.Node)
    numberStatistic: cc.Node = null;

    @property(cc.SpriteFrame)
    blackNumberSprite: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    redNumberSprite: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    zeroNumberSprite: cc.SpriteFrame = null;

    @property(cc.Node)
    hotNumberNodes: cc.Node = null;

    @property(cc.Node)
    coldNumberNodes: cc.Node = null;

    @property(cc.Node)
    statisticPercentNodes: cc.Node = null;

    @property(cc.Label)
    zeroPercent: cc.Label = null;

    @property(cc.Label)
    dozen1Percent: cc.Label = null;

    @property(cc.Label)
    dozen2Percent: cc.Label = null;

    @property(cc.Label)
    dozen3Percent: cc.Label = null;

    @property(cc.Node)
    background: cc.Node = null;

    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.SpriteFrame)
    numberRedBg: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    numberBlackBg: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    numberZeroBg: cc.SpriteFrame = null;

    wheelDegree = 360;
    numberAngle: number = this.wheelDegree / 37;
    numbersOnWheel: number[] = [
        26, 0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12,
        35, 3
    ];
    result: any = null;
    resultStats = [];
    toggleRuning: boolean = null;

    onLoad() {
        const commonDialog = this.mainFrame.getComponent(CommonDialog);
        commonDialog.addOnDidHide(() => {
            this.node.destroy();
        });

        this.toggleRuning = true;
    }

    public generateStatistic(data: any) {
        this.result = data;
        this.createResultStatistic();
        this.createWheel();
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
    }

    createWheel() {
        if (this.result.length === 0) {
            return;
        }
        const largestTimes = _.maxBy(this.resultStats, "times").times;
        const offfetCenter = 0.19;
        this.numbersOnWheel.forEach((number, index) => {
            const itemAngle = index === 0 ? 0 : index * this.numberAngle + 0.1;
            const numberNode = cc.instantiate(this.numberStatistic);
            const spriteComponent = numberNode.getComponent(cc.Sprite);

            numberNode.active = true;
            numberNode.angle = -itemAngle;
            numberNode.name = number.toString();

            const foundNumber = _.find(this.resultStats, ["number", number]);
            let numberTimes = 1;
            if (foundNumber) {
                numberTimes = foundNumber.times;
            }

            spriteComponent.fillRange = (numberTimes / largestTimes) * (1 - offfetCenter);

            if (number === 0) {
                spriteComponent.spriteFrame = this.zeroNumberSprite;
            } else {
                spriteComponent.spriteFrame = RouletteUtils.isRed(number) ? this.redNumberSprite : this.blackNumberSprite;
            }

            this.wheel.addChild(numberNode);
        });
    }

    handleStatsPercent() {
        if (this.result.length === 0) {
            return;
        }
        this.findHotColdNumbers();
        this.calculateBasicStatic();
        this.calculateDozensStatic();
    }

    findHotColdNumbers() {
        this.resultStats.sort((a, b) => {
            return a.times - b.times;
        });

        const coldNumbers = _.slice(this.resultStats, 0, 4);
        const hotNumbers = _.slice(this.resultStats, this.resultStats.length - 4, this.resultStats.length);

        this.updateHotColdNumbers(this.hotNumberNodes, hotNumbers);
        this.updateHotColdNumbers(this.coldNumberNodes, coldNumbers);
    }

    updateHotColdNumbers(numberNodes: cc.Node, list) {
        numberNodes.children.forEach((node, index) => {
            const number = list[index].number;
            node.getChildByName("number").getComponent(cc.Label).string = number;
            node.getChildByName("times").getComponent(cc.Label).string = list[index].times;

            const spriteComponent = node.getChildByName("bg_number").getComponent(cc.Sprite);
            if (list[index].number === 0) {
                spriteComponent.spriteFrame = this.numberZeroBg;
            } else {
                spriteComponent.spriteFrame = RouletteUtils.isRed(number) ? this.numberRedBg : this.numberBlackBg;
            }
        });
    }

    private calculateBasicStatic() {
        let redCount = 0;
        let blackCount = 0;
        let oddCount = 0;
        let evenCount = 0;
        let bigCount = 0;
        let smallCount = 0;
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

                if (RouletteUtils.isBig(number)) {
                    bigCount += 1;
                } else {
                    smallCount += 1;
                }
            }
        });

        const zeroPercent = _.round((zeroCount / this.result.length) * 100);

        const red = _.round((redCount / this.result.length) * 100);
        const black = 100 - (red + zeroPercent);

        const odd = _.round((oddCount / this.result.length) * 100);
        const even = 100 - (odd + zeroPercent);

        const big = _.round((bigCount / this.result.length) * 100);
        const small = 100 - (big + zeroPercent);

        this.statisticPercentNodes &&
            this.statisticPercentNodes.children.forEach((item, index) => {
                const itemComponent = item.getComponent(RouletteStatisticItem);

                if (index === 0) {
                    itemComponent.setData(red, black);
                    itemComponent.updateProgressBar(redCount, blackCount);
                }

                if (index === 1) {
                    itemComponent.setData(even, odd);
                    itemComponent.updateProgressBar(evenCount, oddCount);
                }

                if (index === 2) {
                    itemComponent.setData(small, big);
                    itemComponent.updateProgressBar(smallCount, bigCount);
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
        this.zeroPercent.string = `${zeroPercent}%`;

        const dozen1 = _.round((dozen1Count / this.result.length) * 100);
        const dozen2 = _.round((dozen2Count / this.result.length) * 100);
        const dozen3 = 100 - (zeroPercent + dozen1 + dozen2);
        this.dozen1Percent.string = `${dozen1}%`;
        this.dozen2Percent.string = `${dozen2}%`;
        this.dozen3Percent.string = `${dozen3}%`;
    }

    hideStatisticContent() {
        AudioManager.getInstance().playClick();

        this.content.runAction(
            cc.sequence(
                cc.scaleTo(0.3, 0).easing(cc.easeSineInOut()),
                cc.callFunc(() => {
                    this.background.runAction(cc.fadeOut(0.1));
                    this.node.destroy();
                })
            )
        );
    }
}
