import AudioManager from "../../audio/AudioManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonAudio extends cc.Component {
    @property(cc.AudioClip)
    audioClick: cc.AudioClip = null;

    onLoad() {
        AudioManager.getInstance().clickAudio = this.audioClick;
    }
}
