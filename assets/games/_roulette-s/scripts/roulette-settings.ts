import CommonDialog from "../../../common/_base/view-models/CommonDialog";
import RouletteSlider from "./roulette-slider";

const {ccclass, property} = cc._decorator;

@ccclass
export default class RouletteSettings extends cc.Component {

    @property(cc.Node)
    mainFrame: cc.Node = null;

    @property(RouletteSlider)
    soundEffectSlider: RouletteSlider = null;

    @property(RouletteSlider)
    backgroundMusicSlider: RouletteSlider = null;

    onLoad() {
        const commonDialog = this.mainFrame.getComponent(CommonDialog);
        commonDialog.addOnDidHide(() => {
            this.node.destroy();
        });
    }
}
