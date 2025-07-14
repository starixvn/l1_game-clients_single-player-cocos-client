import MultiplayPromotionGuide from "../../multiplay/scripts/MultiplayPromotionGuide";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UnbalanceBigSmallGuide extends MultiplayPromotionGuide {
    storageKey = "mega_bigsmall_promotion_guide";
}
