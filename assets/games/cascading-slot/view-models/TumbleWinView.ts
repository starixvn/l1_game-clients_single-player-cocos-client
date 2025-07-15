import FadeAppearanceNode from "../../../common/FadeAppearanceNode";
import GameUtils from "../../../common/GameUtils";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TumbleWinView extends FadeAppearanceNode {
    @property(cc.Label)
    tumbleLabel: cc.Label = null;

    @property(cc.Label)
    multiplier: cc.Label = null;

    @property(cc.Layout)
    tumbleLayout: cc.Layout = null;

    @property(cc.Label)
    totalWin: cc.Label = null;

    readonly mulitiplierEffectDuration = 0.2;
    onLoad() {
        this.onHidden = () => {
            this.showTotalWin(false);
            this.resetPositionTumbleLabel();
        };
        this.showView(false, true);
        this.showTotalWin(false);
    }

    clearLabels() {
        this.tumbleLabel.string = "";
        this.totalWin.string = "";
        this.multiplier.string = "";
    }

    setTumbleWinValue(value: number, animated: boolean) {
        this.showView(true);
        if (animated) {
            GameUtils.floatToNumber({ label: this.tumbleLabel, amount: value, duration: 0.5, noZeroSuffix: false });
        } else {
            this.tumbleLabel.string = numberWithCommas(value, 2, false);
        }
    }

    setTotalWinValue(value: number) {
        return new Promise<void>((resolve) => {
            this.totalWin.string = numberWithCommas(value, 2, false);
            this.showTotalWin(true);

            cc.tween(this.totalWin.node)
                .to(0.1, { scale: 1.5 }, { easing: "sineOut" })
                .to(0.3, { scale: 1 }, { easing: "sineIn" })
                .call(() => resolve())
                .start();
        });
    }

    showTotalWin(show: boolean) {
        if (show) {
            this.showNodeAndHideOther(this.totalWin.node, this.tumbleLayout.node);
        } else {
            this.showNodeAndHideOther(this.tumbleLayout.node, this.totalWin.node);
        }
    }

    resetPositionTumbleLabel() {
        this.multiplier.node.active = false;
        this.tumbleLabel.node.x = 0;
        this.tumbleLayout.enabled = false;
    }

    private showNodeAndHideOther(node: cc.Node, otherNode: cc.Node) {
        node.opacity = 0;
        const duration = 0.2;
        cc.tween(node).to(duration, { opacity: 255 }).start();
        cc.tween(otherNode).to(duration, { opacity: 0 }).start();
    }

    shiftRightTumbleWin(value: number) {
        return new Promise<void>((resolve) => {
            if (this.tumbleLayout.enabled) {
                resolve();
                return;
            }
            this.multiplier.string = `x${value}`;
            this.multiplier.node.active = true;
            this.multiplier.node.opacity = 0;
            const width = this.multiplier.node.width;
            cc.tween(this.tumbleLabel.node)
                .to(0.1, { x: -width / 2 })
                .call(() => {
                    resolve();
                })
                .start();
        });
    }

    setMultiplier(value: number) {
        this.multiplier.string = `x${value}`;
        this.multiplier.node.opacity = 255;
        this.tumbleLayout.enabled = true;
        cc.tween(this.multiplier.node)
            .to(0.5 * this.mulitiplierEffectDuration, { scale: 1.2 }, { easing: "sineOut" })
            .to(0.5 * this.mulitiplierEffectDuration, { scale: 1 }, { easing: "sineIn" })
            .start();
    }
}
