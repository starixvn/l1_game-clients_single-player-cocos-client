import FadeAppearanceNode from "../../../common/FadeAppearanceNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FreeSpinView extends FadeAppearanceNode {
    @property(cc.Label)
    freeSpin: cc.Label = null;

    setValue(value: number) {
        this.freeSpin.string = value.toString();
    }
}
