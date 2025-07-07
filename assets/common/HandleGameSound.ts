import AnalyticsManager, { TrackingAction, TrackingEvent } from "../analytics/AnalyticsManager";
import AudioManager from "./audio/AudioManager";

const { ccclass, property } = cc._decorator;

enum AudioType {
    Music = 0,
    SFX
}

@ccclass
export default class HandleGameSound extends cc.Component {
    @property(cc.Sprite)
    soundSprite: cc.Sprite = null;

    @property(cc.SpriteFrame)
    soundOnFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    soundOffFrame: cc.SpriteFrame = null;

    @property({ type: cc.Enum(AudioType) })
    type = AudioType.SFX;

    isFirst = false;

    onLoad() {
        this.node.on("click", this.onClickSoundGame, this);
        this.updateIcon(AudioManager.getInstance()[this.getKey()]);

        if (this.type === AudioType.Music) {
            AudioManager.getInstance().addMusicChanged(`HandleGameSound_${this.uuid}`, (changed: boolean) => {
                this.updateIcon(changed);
            });
        } else {
            AudioManager.getInstance().addSfxChanged(`HandleGameSound_${this.uuid}`, (changed: boolean) => {
                this.updateIcon(changed);
            });
        }
    }

    onDestroy() {
        this.node.off("click", this.onClickSoundGame, this);
    }

    private getKey(): string {
        const dict = ["musicEnabled", "sfxEnabled"];
        return dict[this.type];
    }

    onClickSoundGame() {
        AudioManager.getInstance()[this.getKey()] ? this.toggleSoundOff() : this.toggleSoundOn();
    }

    updateIcon(enable: boolean) {
        if (!this.isValid) {
            return;
        }
        this.soundSprite.spriteFrame = enable ? this.soundOnFrame : this.soundOffFrame;
    }

    toggleSoundOn() {
        const key = this.getKey();
        AudioManager.getInstance()[key] = true;
        AnalyticsManager.Instance.trackEvent(TrackingEvent.Button, {
            location: cc.director.getScene().name,
            action: TrackingAction.ToggleOn,
            object_name: key.toUpperCase()
        });
    }

    toggleSoundOff() {
        const key = this.getKey();
        AudioManager.getInstance()[key] = false;
        AnalyticsManager.Instance.trackEvent(TrackingEvent.Button, {
            location: cc.director.getScene().name,
            action: TrackingAction.ToggleOff,
            object_name: key.toUpperCase()
        });
    }
}
