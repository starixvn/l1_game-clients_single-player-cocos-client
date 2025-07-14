import { lodash } from "../../../../ClientModules";
import GameUtils from "../../../../common/GameUtils";
import GameTicketDetailBase from "../../../_base/view-models/GameTicketDetailBase";
import KenoNumber from "../../../keno-pro/view-models/KenoNumber";
import MegaKenoHistoryDetailItem from "./MegaKenoHistoryDetailItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MegaKenoHistoryDetail extends GameTicketDetailBase {
    @property(cc.Label)
    roundId: cc.Label = null;

    @property(cc.Label)
    roundLabel: cc.Label = null;

    @property(cc.Label)
    total: cc.Label = null;

    @property(cc.Node)
    settleResult: cc.Node = null;

    @property(cc.Node)
    resultNumbers: cc.Node = null;

    @property(cc.Prefab)
    prefabDetail: cc.Prefab = null;

    @property(cc.Node)
    resultFrame: cc.Node = null;

    private result: number[] = [];
    private resultLabels: cc.Label[] = [];
    private kenoNumbers: KenoNumber[] = [];
    isShowTitleBetDetail = false;

    onLoad() {
        this.kenoNumbers = this.resultNumbers.children.map((child) => child.getComponent(KenoNumber));
        this.resultLabels = this.settleResult.children.map((child) => child.getComponent(cc.Label));
    }

    public setData(result: number[], settlementResult: any) {
        this.result = result;
        this.settlementResult = settlementResult;
    }

    instantiateDetailItem(prefabDetail: cc.Prefab) {
        if (prefabDetail) {
            const node = cc.instantiate(this.prefabDetail);
            return node.getComponent(MegaKenoHistoryDetailItem);
        }
        return null;
    }

    public show(animated = false, duration = 0, onComplete: () => void = () => {}) {
        this.node.active = true;
        this.resultLabels.forEach((label) => (label.node.active = false));
        if (animated) {
            this.total.string = "0";
            this.kenoNumbers.forEach((keno) => keno.show(false));
            this.showSettleResultAnimation(duration, onComplete);
        } else {
            let total = 0;
            for (let i = 0; i < this.result.length; i++) {
                total += this.result[i];
                this.kenoNumbers[i].setNumber(this.result[i], false);
                this.kenoNumbers[i].show(true);
            }
            this.total.string = total.toString();
            this.showSettleResult(this.settlementResult);
        }
        this.updateHeightContentFrame();
    }

    updateHeightContentFrame() {
        const PADDING_BOTTOM_FRAME = 25;
        this.resultNumbers.getComponent(cc.Layout).updateLayout();
        this.resultFrame.getComponent(cc.Layout).updateLayout();
        this.betDetailFrame.updateSizeFrame(this.mainFrame.width, this.resultFrame.height + PADDING_BOTTOM_FRAME);
    }

    private showSettleResultAnimation(duration: number, onComplete: () => void = () => {}) {
        let shuffle = [];
        for (let index = 0; index < this.result.length; index++) {
            shuffle.push(index);
        }
        shuffle = lodash.shuffle(shuffle);

        let i = 0;

        const sequence = cc
            .tween()
            .call(() => {
                const index = shuffle[i];
                this.kenoNumbers[index].setNumber(this.result[index], true);
                let total = 0;
                for (let j = 0; j <= i; j++) {
                    total += this.result[shuffle[j]];
                }
                this.showSettleResult(this.getSettleResult(total));
                this.total.string = total.toString();
                i++;
            })
            .delay(duration / this.result.length)
            .start();

        cc.tween(this.node)
            .repeat(this.result.length, sequence)
            .call(() => {
                cc.tween(this.total.node).to(0.1, { scale: 1.2 }).to(0.1, { scale: 1 }).start();
                this.resultLabels.forEach((label) => {
                    cc.tween(label.node).to(0.1, { scale: 1.2 }).to(0.1, { scale: 1 }).start();
                });
                this.showSettleResult(this.settlementResult);
                onComplete();
            })
            .start();
    }

    private getSettleResult(total: number) {
        const settle: any = {};
        if (total > 810) {
            settle.big = true;
        } else {
            settle.small = true;
        }

        if (total % 2 === 1) {
            settle.odd = true;
        } else {
            settle.even = true;
        }

        if (total < 696) {
            settle.gold = true;
        } else if (total < 764) {
            settle.wood = true;
        } else if (total < 856) {
            settle.water = true;
        } else if (total < 1411) {
            settle.fire = true;
        } else {
            settle.earth = true;
        }
        return settle;
    }

    private showSettleResult(settlementResult: any) {
        let index = 0;
        Object.keys(settlementResult).forEach((key) => {
            if (settlementResult[key]) {
                const label = this.resultLabels[index];
                label.node.active = true;
                label.string = GameUtils.getBetChoiceString(key).toUpperCase();
                index++;
            }
        });
    }
}
