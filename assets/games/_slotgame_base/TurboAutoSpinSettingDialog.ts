import AutoSpinSettingDialog from "./AutoSpinSettingDialog";
import AudioManager from "../../common/audio/AudioManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TurboAutoSpinSettingDialog extends AutoSpinSettingDialog {
    @property(cc.Toggle)
    turboToggle: cc.Toggle = null;

    turboChangedCallback = (value: boolean) => {};

    syncTurboToggle(checked: boolean) {
        this.turboToggle.isChecked = checked;
    }

    onTurboModeChanged() {
        AudioManager.getInstance().playClick();
        this.turboChangedCallback(this.turboToggle.isChecked);
    }
}
