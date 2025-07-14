const { ccclass, property } = cc._decorator;

@ccclass
export default class LabelItem extends cc.Component {
    @property(cc.Label)
    label: cc.Label = null;

    setValue(value: string) {
        this.label.string = value;
    }
}
