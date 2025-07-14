import ExtraDataHistoryItem from "../../_base/view-models/ExtraDataHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MiniSedieExtraHistoryItem extends ExtraDataHistoryItem {
    choiceSpriteName = {
        0: "chip_trang",
        1: "chip_do"
    };

    prefixSpriteName = "mini_sedie_num_";
}
