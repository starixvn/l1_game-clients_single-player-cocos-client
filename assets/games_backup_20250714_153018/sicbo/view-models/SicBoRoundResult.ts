import NoticeUtil from "../../../common/utils/NoticeUtil";
import { SicBoBetType } from "./SicBoCommon";
import RoundResultBase from "../../../common/round-result/RoundResultBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class SicBoRoundResult extends RoundResultBase {
    updateLabels(data: any) {
        const { settlementResult, result } = data;

        this.total.spriteFrame = this.atlas.getSpriteFrame(`stats_${result.dice1 + result.dice2 + result.dice3}`);

        const suffix = NoticeUtil.getSuffixSpriteName();
        if (settlementResult[SicBoBetType.anyTriple]) {
            this.result.spriteFrame = this.atlas.getSpriteFrame(`stats_B${suffix}`);
        } else {
            if (settlementResult[SicBoBetType.big]) {
                this.result.spriteFrame = this.atlas.getSpriteFrame(`stats_T${suffix}`);
            } else {
                this.result.spriteFrame = this.atlas.getSpriteFrame(`stats_X${suffix}`);
            }
        }
    }
}
