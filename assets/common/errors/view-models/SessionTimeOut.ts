import AudioManager from "../../audio/AudioManager";

const { ccclass } = cc._decorator;

@ccclass
export default class SessionTimeOut extends cc.Component {
    onLoad() {
        AudioManager.getInstance().stopMusic();
    }
}
