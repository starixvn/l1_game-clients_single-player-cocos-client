import MiniRoundHistoryItem from "../../../common/mini-round-history/MiniRoundHistoryItem";
import { BMBetType } from "./BitcoinMasterCommon";
import BitcoinMasterUtils from "./BitcoinMasterUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BitcoinMasterEvenOddMiniRoundHistoryItem extends MiniRoundHistoryItem {
    @property(cc.Sprite)
    icon: cc.Sprite = null;

    @property(cc.SpriteAtlas)
    bitcoinAtlas: cc.SpriteAtlas = null;

    public setData(data: any) {
        this.data = data;
        const result = data.settlementResult[BMBetType.Even] ? BMBetType.Even : BMBetType.Odd;
        const number = BitcoinMasterUtils.getEvenOddResult(data.result.close);
        this.icon.spriteFrame = this.bitcoinAtlas.getSpriteFrame(`statistic-dot-${result}_${number}`);
    }
}
