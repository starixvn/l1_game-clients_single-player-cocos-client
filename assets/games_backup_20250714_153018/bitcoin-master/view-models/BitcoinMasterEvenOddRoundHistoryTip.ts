import MiniRoundHistoryTip from "../../../common/mini-round-history/MiniRoundHistoryTip";
import BitcoinMasterEvenOddResultDetail from "./BitcoinMasterEvenOddResultDetail";
import BitcoinMasterUtils from "./BitcoinMasterUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BitcoinMasterEvenOddRoundHistoryTip extends MiniRoundHistoryTip {
    @property(BitcoinMasterEvenOddResultDetail)
    evenOddDetail: BitcoinMasterEvenOddResultDetail = null;

    public setData(data: any) {
        this.roundId.string = `#${data.roundId}`;
        this.evenOddDetail && this.evenOddDetail.setData(data.result.close);
        this.result.string = `${BitcoinMasterUtils.formattingBitcoinValue(data.result.close)} - `;
    }
}
