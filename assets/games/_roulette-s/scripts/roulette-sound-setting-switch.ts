import { StorageManager } from "../../../managers/StorageManager";
import RouletteSlider, { RouletteSliderType } from "./roulette-slider";

const {ccclass, property} = cc._decorator;

@ccclass
export default class RouletteSoundSettingSwitch extends cc.Component {

    @property(cc.Button)
    switchButton: cc.Button = null;

    @property(cc.Sprite)
    spriteOn: cc.Sprite = null;

    @property(cc.Sprite)
    spriteOff: cc.Sprite = null;

    @property(RouletteSlider)
    targetSlider: RouletteSlider = null;

    private readonly LAST_MUSIC_VOLUME_KEY = "LAST_MUSIC_VOLUME";
    private readonly LAST_SFX_VOLUME_KEY = "LAST_SFX_VOLUME";

    onLoad() {
        if (this.switchButton) {
            this.switchButton.node.on('click', this.onSwitchClick, this);
        }
        
        if (this.targetSlider) {
            this.targetSlider.node.on('volume-changed', this.onSliderVolumeChanged, this);
        }
    }

    onSwitchClick() {
        if (!this.targetSlider || !this.switchButton) return;

        cc.tween(this.switchButton.node)
            .to(0.12, { scale: 0.9 }, { easing: 'smooth' })
            .to(0.12, { scale: 1.0 }, { easing: 'smooth' })
            .start();
        
        const currentVolume = this.targetSlider.getVolume();
        
        if (currentVolume > 0) {
            const storageKey = this.getStorageKey();
            if (!storageKey) return;

            StorageManager.set(storageKey, currentVolume);
            this.targetSlider.setVolume(0);
        } else {
            const storageKey = this.getStorageKey();
            if (!storageKey) return;
            
            const lastVolume = StorageManager.get(storageKey) ?? 1.0;
            this.targetSlider.setVolume(lastVolume > 0 ? lastVolume : 1.0);
        }
    }

    onSliderVolumeChanged(volume: number) {
        const isMuted = volume === 0;
        
        if (!isMuted) {
            const storageKey = this.getStorageKey();
            if (!storageKey) return;
            StorageManager.set(storageKey, volume);
        }
        
        this.updateIcon(isMuted);
    }

    private getStorageKey(): string | null {
        if (!this.targetSlider) {
            return null;
        }
        return this.targetSlider.sliderType === RouletteSliderType.MUSIC ? this.LAST_MUSIC_VOLUME_KEY : this.LAST_SFX_VOLUME_KEY;
    }

    private updateIcon(isMuted: boolean) {
        if (this.spriteOn && this.spriteOff) {
            this.spriteOn.node.active = !isMuted;
            this.spriteOff.node.active = isMuted;
        }
    }
}
