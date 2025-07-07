import { StorageManager } from "../../managers/StorageManager";
import AnimationUtils from "../utils/AnimationUtils";

export default class AudioManager {
    public static getInstance(): AudioManager {
        if (!this.instance) {
            this.instance = new AudioManager();
        }

        return this.instance;
    }

    private static instance: AudioManager;
    public clickAudio: cc.AudioClip = null;
    readonly soundObservers = { music: {}, sfx: {} };
    private isReady = false;
    private touchStart = false;
    private readonly MusicStorageKey = "SOUND_BACKGROUND";
    private readonly SFXStorageKey = "SOUND_GAME";

    // The AudioContext was not allowed to start.
    // It must be resumed (or created) after a user gesture on the page
    public isUserGesture = false;

    init() {
        this.initDefaultStorage();
        this.initTouchBinded();
    }

    async awaitForReady() {
        if (cc.sys.os === cc.sys.OS_IOS) {
            while (!this.isReady) {
                await AnimationUtils.delayTime(0.5);
            }
        }
    }

    private initTouchBinded() {
        const touchend = "ontouchend" in window ? "touchend" : "mouseup";
        const touchStart = "ontouchstart" in window ? "touchstart" : "mousedown";
        const touchMove = "ontouchmove" in window ? "touchmove" : "mousemove";
        cc.game.canvas.addEventListener(touchStart, () => {
            this.touchStart = true;
            this.isUserGesture = true;
        });
        cc.game.canvas.addEventListener(touchMove, () => {
            this.touchStart = false;
        });
        cc.game.canvas.addEventListener(touchend, () => {
            if (!this.touchStart || this.isReady) {
                return;
            }

            this.touchStart = false;
            this.isReady = true;
            this.isUserGesture = true;
        });
    }

    playClick() {
        if (this.clickAudio) {
            this.playSFX(this.clickAudio);
        }
    }

    playSFX(clip: cc.AudioClip, loop = false): number {
        if (this.sfxEnabled && clip) {
            return cc.audioEngine.playEffect(clip, loop);
        }
        return -1;
    }

    playSFXSource(audio: cc.AudioSource) {
        if (this.sfxEnabled && audio) {
            audio.play();
        }
    }

    stopSFX(audioId: number) {
        cc.audioEngine.stopEffect(audioId);
    }

    stopAllSFX() {
        cc.audioEngine.stopAllEffects();
    }

    playMusic(clip: cc.AudioClip, loop: boolean) {
        if (this.musicEnabled && clip) {
            return cc.audioEngine.playMusic(clip, loop);
        }
        return -1;
    }

    stopMusic() {
        cc.audioEngine.stopMusic();
    }

    initDefaultStorage() {
        this.musicEnabled = StorageManager.get(this.MusicStorageKey) ?? true;
        this.sfxEnabled = StorageManager.get(this.SFXStorageKey) ?? true;
    }

    addMusicChanged(key: string, observer: (changed: boolean) => void) {
        this.soundObservers["music"][key] = observer;
    }

    removeMusicChanged(key: string) {
        delete this.soundObservers["music"][key];
    }

    addSfxChanged(key: string, observer: (changed: boolean) => void) {
        this.soundObservers["sfx"][key] = observer;
    }

    removeSfxChanged(key: string) {
        delete this.soundObservers["sfx"][key];
    }

    private onMusicChanged(value: boolean) {
        const observers = this.soundObservers["music"];
        this.callObservers(observers, value);
    }

    private onSfxChanged(value: boolean) {
        const observers = this.soundObservers["sfx"];
        this.callObservers(observers, value);
    }

    private callObservers(observers: any, value: boolean) {
        Object.keys(observers).forEach((key) => {
            const observer = observers[key];
            observer(value);
        });
    }

    get musicEnabled(): boolean {
        return StorageManager.get(this.MusicStorageKey);
    }

    set musicEnabled(value: boolean) {
        StorageManager.set(this.MusicStorageKey, value);
        this.onMusicChanged(value);
    }

    get sfxEnabled(): boolean {
        return StorageManager.get(this.SFXStorageKey);
    }

    set sfxEnabled(value: boolean) {
        StorageManager.set(this.SFXStorageKey, value);
        this.onSfxChanged(value);
        if (!value) {
            this.stopAllSFX();
        }
    }
}
