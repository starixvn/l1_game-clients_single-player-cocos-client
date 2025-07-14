import { LotteryChoiceItem } from "./LotteryChoiceItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LotteryNumberItem extends LotteryChoiceItem {
    @property
    paddingEnabled = true;

    @property(cc.Label)
    coldLabel: cc.Label = null;

    @property(cc.Label)
    hotLabel: cc.Label = null;

    protected isCold = false;

    setNumber(value: number) {
        this.label.string = this.paddingEnabled ? `${value}`.padStart(2, "0") : `${value}`;
        this.node.name = this.label.string;
    }

    setStats(number: number) {
        if (this.isCold) {
            this.coldLabel.string = number.toString();
        } else {
            this.hotLabel.string = number.toString();
        }
    }

    hideStatistics() {
        this.coldLabel.node.active = false;
        this.hotLabel.node.active = false;
    }

    setState(isCold = true) {
        this.isCold = isCold;
        this.coldLabel.node.active = isCold;
        this.hotLabel.node.active = !isCold;
    }
}
