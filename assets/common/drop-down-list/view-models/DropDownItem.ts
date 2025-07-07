import DropDownOption from "./DropDownOption";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DropDownItem extends cc.Component {
    @property(cc.Label)
    label: cc.Label = null;

    option: DropDownOption;

    setData(option: DropDownOption) {
        this.option = option;
        this.label.string = option.text;
    }
}
