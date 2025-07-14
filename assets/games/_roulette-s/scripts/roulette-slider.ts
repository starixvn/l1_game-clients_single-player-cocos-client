import AudioManager from "../../../common/audio/AudioManager";
import { StorageManager } from "../../../managers/StorageManager";

const {ccclass, property} = cc._decorator;

const SliderType = {
    MUSIC: "MUSIC",
    SFX: "SFX"
} as const;

type SliderType = typeof SliderType[keyof typeof SliderType];

enum SliderTypeEnum {
    SFX = 0,
    MUSIC = 1
}

@ccclass
export default class RouletteSlider extends cc.Component {

    @property(cc.Sprite)
    background: cc.Sprite = null;

    @property(cc.Sprite)
    currentProgress: cc.Sprite = null;

    @property(cc.Button)
    dragButton: cc.Button = null;

    @property({
        type: cc.Enum(SliderTypeEnum),
        displayName: "Slider Type"
    })
    sliderTypeEnum: SliderTypeEnum = SliderTypeEnum.SFX;

    @property({
        displayName: "Default Volume",
        tooltip: "Default volume level (0.0 = 0%, 1.0 = 100%)",
        range: [0, 1, 0.1]
    })
    defaultVolume: number = 1.0;

    private readonly MUSIC_VOLUME_KEY = "MUSIC_VOLUME";
    private readonly SFX_VOLUME_KEY = "SFX_VOLUME";

    private isDragging = false;
    private maxProgressWidth: number;
    private currentVolume = 1.0;
    private dragStartX = 0;
    private initialHandleX = 0;

    private get sliderType(): string {
        return this.sliderTypeEnum === SliderTypeEnum.MUSIC ? SliderType.MUSIC : SliderType.SFX;
    }

    onLoad() {
        this.initializeSlider();
        this.bindDragEvents();
    }

    private initializeSlider() {
        this.maxProgressWidth = this.background?.node.width > 0 ? this.background.node.width : 250;
        this.currentVolume = this.getCurrentVolume();
        this.updateProgressBar(this.currentVolume, false);
        this.updateHandlePosition(this.currentVolume, false);
        this.setAudioVolume(this.currentVolume);
    }

    private bindDragEvents() {
        if (this.dragButton) {
            this.dragButton.node.on(cc.Node.EventType.TOUCH_START, this.onDragStart, this);
            this.dragButton.node.on(cc.Node.EventType.TOUCH_MOVE, this.onDragMove, this);
            this.dragButton.node.on(cc.Node.EventType.TOUCH_END, this.onDragEnd, this);
            this.dragButton.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onDragEnd, this);
        }

        if (this.background) {
            this.background.node.on(cc.Node.EventType.TOUCH_START, this.onBackgroundClick, this);
        }
    }

    private onDragStart(event: cc.Event.EventTouch) {
        this.isDragging = true;
        
        const touchPos = event.getLocation();
        const localPos = this.background.node.convertToNodeSpaceAR(touchPos);
        this.dragStartX = localPos.x;
        this.initialHandleX = this.dragButton.node.x;
        
        // Stop animations to prevent conflicts during drag
        cc.Tween.stopAllByTarget(this.currentProgress.node);
        cc.Tween.stopAllByTarget(this.dragButton.node);
    }

    private onDragMove(event: cc.Event.EventTouch) {
        if (!this.isDragging) return;

        const touchPos = event.getLocation();
        const localPos = this.background.node.convertToNodeSpaceAR(touchPos);
        const deltaX = localPos.x - this.dragStartX;
        const newHandleX = this.initialHandleX + deltaX;
        const volume = Math.max(0, Math.min(1, newHandleX / this.maxProgressWidth));

        this.updateVolumeInstantly(volume);
    }

    private onDragEnd(event: cc.Event.EventTouch) {
        this.isDragging = false;
        this.saveVolume(this.currentVolume);
        
        // Provide audio feedback for SFX slider
        if (this.sliderType === SliderType.SFX && this.currentVolume > 0) {
            AudioManager.getInstance().playClick();
        }
    }

    private onBackgroundClick(event: cc.Event.EventTouch) {
        if (this.isDragging) return;
        
        const touchPos = event.getLocation();
        const localPos = this.background.node.convertToNodeSpaceAR(touchPos);
        const volume = Math.max(0, Math.min(1, localPos.x / this.maxProgressWidth));

        this.setVolume(volume);
    }

    private updateVolumeInstantly(volume: number) {
        this.currentVolume = volume;
        this.updateProgressBar(volume, false);
        this.updateHandlePosition(volume, false);
        this.setAudioVolume(volume);
    }

    private updateProgressBar(volume: number, animate: boolean = true) {
        if (!this.currentProgress) return;

        const targetWidth = this.maxProgressWidth * volume;
        
        if (animate && !this.isDragging) {
            cc.tween(this.currentProgress.node)
                .to(0.15, { width: targetWidth }, { easing: 'quadOut' })
                .start();
        } else {
            this.currentProgress.node.width = targetWidth;
        }
    }

    private updateHandlePosition(volume: number, animate: boolean = true) {
        if (!this.dragButton) return;

        const targetX = volume * this.maxProgressWidth;
        
        if (animate && !this.isDragging) {
            cc.tween(this.dragButton.node)
                .to(0.15, { x: targetX }, { easing: 'quadOut' })
                .start();
        } else {
            this.dragButton.node.x = targetX;
        }
    }

    private setAudioVolume(volume: number) {
        if (this.sliderType === SliderType.MUSIC) {
            cc.audioEngine.setMusicVolume(volume);
        } else {
            cc.audioEngine.setEffectsVolume(volume);
        }
    }

    private saveVolume(volume: number) {
        const key = this.sliderType === SliderType.MUSIC ? this.MUSIC_VOLUME_KEY : this.SFX_VOLUME_KEY;
        StorageManager.set(key, volume);
    }

    private getCurrentVolume(): number {
        const key = this.sliderType === SliderType.MUSIC ? this.MUSIC_VOLUME_KEY : this.SFX_VOLUME_KEY;
        return StorageManager.get(key) ?? this.defaultVolume;
    }

    public setVolume(volume: number) {
        volume = Math.max(0, Math.min(1, volume));
        this.currentVolume = volume;
        
        this.updateProgressBar(volume, true);
        this.updateHandlePosition(volume, true);
        this.setAudioVolume(volume);
        this.saveVolume(volume);
        
        if (this.sliderType === SliderType.SFX && volume > 0) {
            AudioManager.getInstance().playClick();
        }
    }

    public getVolume(): number {
        return this.currentVolume;
    }

    public setMaxProgressWidth(width: number) {
        this.maxProgressWidth = width;
        this.updateProgressBar(this.currentVolume, false);
        this.updateHandlePosition(this.currentVolume, false);
    }
}
