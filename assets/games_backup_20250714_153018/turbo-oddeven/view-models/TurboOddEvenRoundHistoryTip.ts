import BigSmallRoundHistoryTip from "../../bigsmall/view-models/BigSmallRoundHistoryTip";

const { ccclass } = cc._decorator;

@ccclass
export default class TurboOddEvenRoundHistoryTip extends BigSmallRoundHistoryTip {
    protected readonly betTypes = ["even", "odd"];
}
