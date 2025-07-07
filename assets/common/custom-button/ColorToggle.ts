const { ccclass, property } = cc._decorator;

@ccclass
export default class ColorToggle extends cc.Component {
    @property(cc.Color)
    checkColor: cc.Color = cc.Color.WHITE;

    @property(cc.Color)
    uncheckColor: cc.Color = cc.Color.WHITE;

    @property(cc.Toggle)
    toggle: cc.Toggle = null;

    private initialized = false;

    onEnable() {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.schedule(this.updateCheckColor.bind(this), 1 / 30, cc.macro.REPEAT_FOREVER);
    }

    updateCheckColor() {
        this.node.color = this.toggle.isChecked ? this.checkColor : this.uncheckColor;
    }
}
