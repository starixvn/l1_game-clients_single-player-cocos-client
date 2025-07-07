import BigSmallRoundResult from "../../bigsmall/view-models/BigSmallRoundResult";

const { ccclass } = cc._decorator;

@ccclass
export default class TurboOddEveRoundResult extends BigSmallRoundResult {
    getTextFollowChoice({ settlementResult }): string {
        return settlementResult.odd ? "odd" : "even";
    }
}
