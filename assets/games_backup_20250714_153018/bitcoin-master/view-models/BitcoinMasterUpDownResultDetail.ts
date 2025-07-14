import BitcoinMasterGapAmount from "./BitcoinMasterGapAmount";
import BitcoinMasterUtils from "./BitcoinMasterUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BitcoinMasterUpDownResultDetail extends cc.Component {
    @property(cc.Label)
    result: cc.Label = null;

    @property(BitcoinMasterGapAmount)
    gapAmountComp: BitcoinMasterGapAmount = null;

    public setData(data: any) {
        this.result.string = BitcoinMasterUtils.formattingBitcoinValue(data.close);
        this.gapAmountComp.setData(data);
    }
}
