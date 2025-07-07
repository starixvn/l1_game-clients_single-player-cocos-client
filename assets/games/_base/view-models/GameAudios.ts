import AudioManager from "../../../common/audio/AudioManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameAudios extends cc.Component {
    @property(cc.AudioSource)
    startGame: cc.AudioSource = null;

    @property(cc.AudioSource)
    endGame: cc.AudioSource = null;

    @property(cc.AudioSource)
    clockTick: cc.AudioSource = null;

    @property(cc.AudioSource)
    showResult: cc.AudioSource = null;

    playStartGameAudio() {
        AudioManager.getInstance().playSFX(this.startGame.clip);
    }

    playEndGameAudio() {
        AudioManager.getInstance().playSFX(this.endGame.clip);
    }

    playClockTickAudio() {
        AudioManager.getInstance().playSFX(this.clockTick.clip);
    }

    playShowResultAudio() {
        AudioManager.getInstance().playSFX(this.showResult.clip);
    }

    stopAllAudio() {
        // handle
    }

    initConfigsAudios(gameAudioConfig: cc.JsonAsset) {}
    playSFXAudio(id) {}
}
