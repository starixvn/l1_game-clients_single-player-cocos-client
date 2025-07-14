import MiniRoundHistoryTip from "../../../common/mini-round-history/MiniRoundHistoryTip";
import BitcoinMasterUpDownResultDetail from "./BitcoinMasterUpDownResultDetail";

const { property, ccclass } = cc._decorator;

@ccclass
export default class BitcoinMasterUpDownRoundHistoryTip extends MiniRoundHistoryTip {
    @property(BitcoinMasterUpDownResultDetail)
    resultDetail: BitcoinMasterUpDownResultDetail = null;

    public setData(data: any) {
        this.roundId.string = `#${data.roundId}`;
        this.resultDetail.setData(data.result);
    }
}
