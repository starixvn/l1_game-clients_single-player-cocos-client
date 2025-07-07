import AudioManager from "../../common/audio/AudioManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LineItem extends cc.Component {
    @property(cc.Sprite)
    icon: cc.Sprite = null;

    @property(cc.Label)
    num: cc.Label = null;

    @property
    isOnlyShowInfo = false;

    @property({
        type: cc.Toggle,
        override: true,
        visible: function (this) {
            return !this.isOnlyShowInfo;
        }
    })
    toggle: cc.Toggle = null;

    @property({
        override: true,
        visible: function (this) {
            return !this.isOnlyShowInfo;
        }
    })
    highlightLabelColor: cc.Color = cc.color(255, 198, 0);

    @property({
        override: true,
        visible: function (this) {
            return !this.isOnlyShowInfo;
        }
    })
    normalLabelColor: cc.Color = cc.color(126, 97, 0);

    selectedIconColor = cc.Color.WHITE;
    unselectedIconColor = cc.Color.GRAY;

    setChecked(checked: boolean) {
        if (this.isOnlyShowInfo) {
            return;
        }

        this.toggle.isChecked = checked;
        this.updateDisplay();
    }

    onStatusChanged() {
        if (this.isOnlyShowInfo) {
            return;
        }

        AudioManager.getInstance().playClick();

        this.updateDisplay();
    }

    setPayLineIconColor(selectedColor: cc.Color, unselectedColor: cc.Color) {
        if (this.isOnlyShowInfo) {
            return;
        }

        this.selectedIconColor = selectedColor;
        this.unselectedIconColor = unselectedColor;
    }

    updateDisplay() {
        if (this.isOnlyShowInfo) {
            return;
        }

        const highlight = this.toggle.isChecked;
        this.icon.node.color = highlight ? this.selectedIconColor : this.unselectedIconColor;
        this.num.node.color = highlight ? this.highlightLabelColor : this.normalLabelColor;
    }
}
