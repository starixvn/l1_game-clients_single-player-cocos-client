import CustomDisplayToggle from "../../../common/custom-button/CustomDisplayToggle";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BetLevelItem extends CustomDisplayToggle {
    @property(cc.Label)
    lblValue: cc.Label = null;

    private index = 0;

    onClickListener = {
        onStakeToggleChanged: (event, param) => {}
    };

    onStakeToggleChanged(event: cc.Event) {
        this.onClickListener.onStakeToggleChanged(event, this.index);
    }

    setData(value: string, index: number) {
        this.lblValue.string = value;
        this.index = index;
    }
}
