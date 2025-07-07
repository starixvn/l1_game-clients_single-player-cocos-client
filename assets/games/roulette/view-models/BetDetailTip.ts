import { numberWithCommas } from "../../../common/helpers/NumberHelper";

const { ccclass, property } = cc._decorator;
@ccclass
export default class BetDetailTip extends cc.Component {
    @property(cc.Label)
    bet: cc.Label = null;

    show(value: number) {
        this.bet.string = numberWithCommas(value);
        this.node.active = true;
        this.node.stopAllActions();
        cc.tween(this.node).to(0.1, { opacity: 255 }).start();
    }

    hide() {
        this.node.stopAllActions();
        cc.tween(this.node)
            .to(0.1, { opacity: 0 })
            .call(() => (this.node.active = false))
            .start();
    }
}
