import BigSmallMiniRoundHistoryItem from '../../bigsmall/view-models/BigSmallMiniRoundHistoryItem';

const { ccclass, property } = cc._decorator;

@ccclass
export default class TurboOddEvenMiniRoundHistoryItem extends BigSmallMiniRoundHistoryItem {
    protected readonly betTypes = ["even", "odd"];
}
