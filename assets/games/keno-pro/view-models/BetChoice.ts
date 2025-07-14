const { ccclass, property } = cc._decorator;

@ccclass
export default class BetChoice extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    setValue(text: string) {
        this.label.string = text;
    }
}
