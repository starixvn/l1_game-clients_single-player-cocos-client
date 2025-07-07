import AudioManager from "../../common/audio/AudioManager";
import { CascadingSlotGameSound } from "../cascading-slot/view-models/CascadingSlotGameSound";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SlotGameSound extends cc.Component {
    soundSources = {};

    onLoad() {
        this.node.children.forEach((node) => {
            this.soundSources[node.name] = node.getComponent(cc.AudioSource);
        });
    }

    playSound(type: CascadingSlotGameSound) {
        this.soundSources[type] && AudioManager.getInstance().playSFXSource(this.soundSources[type]);
    }

    stopSound(type: CascadingSlotGameSound) {
        this.soundSources[type].stop();
    }
}
