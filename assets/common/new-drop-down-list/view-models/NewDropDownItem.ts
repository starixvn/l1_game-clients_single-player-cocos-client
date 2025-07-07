import GameUtils from "../../GameUtils";
import NewDropDownOption from "./NewDropDownOption";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewDropDownItem extends cc.Component {
    @property(cc.Label)
    label: cc.Label = null;

    option: NewDropDownOption;

    onLoad() {
        GameUtils.setFontSizeLabelsInNode(this.node);
    }

    setData(option: NewDropDownOption) {
        this.option = option;
        this.label.string = option.text;
    }
}
