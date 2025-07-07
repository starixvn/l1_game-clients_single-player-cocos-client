const { ccclass, property } = cc._decorator;

@ccclass
export default class LotteryExtraResult extends cc.Component {
    @property({ type: cc.Label })
    numberLabels: cc.Label[] = [];

    onLoad() {
        this.numberLabels.forEach((label) => {
            label.string = "";
        });
    }

    setData(data: string[]) {
        this.numberLabels.forEach((label, index) => {
            label.string = data[index];
        });
    }
}
