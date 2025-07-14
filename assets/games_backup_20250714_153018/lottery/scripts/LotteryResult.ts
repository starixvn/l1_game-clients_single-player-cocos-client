import CommonDialog from "../../../common/_base/view-models/CommonDialog";
import LotteryHelper from "./LotteryHelper";
import LotteryResultNumber from "./LotteryResultNumber";
import SplitLabel from "./SplitLabel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LotteryResult extends cc.Component {
    @property(CommonDialog)
    dialog: CommonDialog = null;

    @property({ type: LotteryResultNumber })
    resultNumbers: LotteryResultNumber[] = [];

    @property(cc.Node)
    sampleSplitLabel: cc.Node = null;

    @property(cc.Node)
    sampleHighlight: cc.Node = null;

    @property(cc.Animation)
    animation: cc.Animation = null;

    @property(cc.Label)
    roundId: cc.Label = null;

    onLoad() {
        if (this.dialog) {
            this.dialog.addOnDidHide(() => {
                this.node.destroy();
            });
        }
        this.resultNumbers.forEach((resultNumber) => {
            resultNumber.sampleSplitLabel = this.sampleSplitLabel;
            resultNumber.sampleHighlight = this.sampleHighlight;
            if (this.animation) {
                const animation = resultNumber.addComponent(cc.Animation);
                animation.addClip(this.animation.defaultClip);
            }
        });
    }

    setPrizeLabel(label: cc.Label, value: string, split: boolean) {
        const splitLabel = label.node.children[0].getComponent(SplitLabel);
        if (!split) {
            label.string = value;
        } else {
            const values = [value.slice(0, value.length - 2), value.slice(-2)];
            splitLabel.setString(values);
            splitLabel.labels[1].node.color = cc.Color.GREEN;

            splitLabel.cloneLabelInfo(label);
        }
    }

    setRoundId(roundId: number) {
        if (this.roundId) {
            this.roundId.string = `#${roundId}`;
        }
    }

    setData(data: any, animated: boolean, ownBets: any): Promise<void> {
        const { result } = data;
        const list = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "special"];
        let i = 0;

        const winChoices = LotteryHelper.getWinChoices(data, ownBets);
        const locations = LotteryHelper.getPrizeLocations(data, winChoices);

        if (!animated) {
            list.forEach((key) => {
                result[key].forEach((value) => {
                    const info = locations[i];
                    if (!info) {
                        this.resultNumbers[i].setValue(value);
                    } else {
                        this.resultNumbers[i].setSplitValues(info.text, info.highlight, cc.Color.GREEN, animated);
                    }
                    i++;
                });
            });
            return Promise.resolve();
        } else {
            return new Promise((resolve, reject) => {
                i = 0;
                const delayTime = 0.14;

                const values = [];
                list.forEach((key) => {
                    result[key].forEach((value) => values.push(value));
                });
                cc.tween(this.node)
                    .repeat(
                        27,
                        cc
                            .tween()
                            .call(() => {
                                this.resultNumbers[i].setValue(values[i]);
                                this.resultNumbers[i].getComponent(cc.Animation).play("number_appear");
                                i++;
                            })
                            .delay(delayTime)
                    )
                    .delay(0.2)
                    .call(() => {
                        if (Object.keys(winChoices).length === 0) {
                            this.createSpecialEffect();
                        }

                        Object.keys(locations).forEach((key) => {
                            const info = locations[key];
                            const num = this.resultNumbers[key];
                            num.setSplitValues(info.text, info.highlight, cc.Color.GREEN, animated);
                            cc.tween(num.node)
                                .delay(0.4) //delay for SplitLabel highlight text done
                                .call(() => {
                                    this.resultNumbers[key].setHighlight();
                                })
                                .start();
                        });
                        resolve();
                    })
                    .start();
            });
        }
    }

    createSpecialEffect() {
        const special = this.resultNumbers[this.resultNumbers.length - 1].label.node;
        cc.tween(special)
            .repeat(10, cc.tween().to(0.15, { scale: 1.08 }).to(0.15, { scale: 1 }))
            .start();
    }

    close() {
        this.dialog.closeDialog(false);
    }
}
