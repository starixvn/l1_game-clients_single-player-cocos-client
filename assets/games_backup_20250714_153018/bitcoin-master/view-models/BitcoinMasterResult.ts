import BitcoinMasterGapAmount from "./BitcoinMasterGapAmount";
import BitcoinMasterUtils from "./BitcoinMasterUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BitcoinMasterResult extends cc.Component {
    @property(BitcoinMasterGapAmount)
    gapAmountComp: BitcoinMasterGapAmount = null;

    @property(cc.Label)
    evenOddResultLabel: cc.Label = null;

    @property(cc.Label)
    closeBitcoinLabel: cc.Label = null;

    @property(cc.Node)
    upIconPos: cc.Node = null;

    @property(cc.Node)
    downIconPos: cc.Node = null;

    @property(cc.Node)
    currentCandleValue: cc.Node = null;

    @property(cc.Node)
    line: cc.Node = null;

    onLoad() {
        this.hideResult();
    }

    hideResult(opacity = 0) {
        this.closeBitcoinLabel.node.opacity = opacity;
        this.gapAmountComp.node.opacity = opacity;
        this.evenOddResultLabel.node.opacity = opacity;
        this.line.opacity = opacity;
    }

    playAnimation(animated = true) {
        if (animated) {
            const duration = 0.8;
            this.hideResult();
            cc.tween(this.node)
                .call(() => {
                    this.line.opacity = 0;
                    BitcoinMasterUtils.moveAnimation(
                        duration,
                        this.closeBitcoinLabel.node,
                        this.closeBitcoinLabel.node.position,
                        BitcoinMasterUtils.convertCurrentBitcoinPosition(this.currentCandleValue, this.closeBitcoinLabel.node)
                    );
                })
                .delay(duration - 0.3)
                .call(() => {
                    cc.tween(this.line).to(0.2, { opacity: 255 }, { easing: "sineOut" }).start();
                })
                .start();

            BitcoinMasterUtils.moveAnimation(
                duration,
                this.gapAmountComp.gapAmount.node,
                this.gapAmountComp.gapAmount.node.position,
                BitcoinMasterUtils.convertCurrentBitcoinPosition(this.currentCandleValue, this.gapAmountComp.gapAmount.node)
            );
            BitcoinMasterUtils.moveAnimation(
                duration,
                this.evenOddResultLabel.node,
                this.evenOddResultLabel.node.position,
                BitcoinMasterUtils.convertCurrentBitcoinPosition(this.currentCandleValue, this.evenOddResultLabel.node)
            );
        } else {
            this.hideResult(255);
        }
    }

    setData(data: any) {
        this.closeBitcoinLabel.string = BitcoinMasterUtils.formattingBitcoinValue(data.close);
        this.gapAmountComp.setData(data);
        this.gapAmountComp.icon.node.position = this.gapAmountComp.isUpResult ? this.upIconPos.position : this.downIconPos.position;

        const evenOddValue = BitcoinMasterUtils.getEvenOddResult(data.close);
        this.evenOddResultLabel.string = evenOddValue;
        const color = cc.Color.WHITE;
        this.evenOddResultLabel.node.color = parseFloat(evenOddValue) % 2 ? color.fromHEX("#f3485f") : color.fromHEX("#bac5ca");
    }
}
