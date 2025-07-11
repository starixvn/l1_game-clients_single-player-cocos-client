import { StorageManager } from "../../managers/StorageManager";
import AnimationUtils from "../utils/AnimationUtils";

console.log("[AudioManager] Loading AudioManager module...");

export default class AudioManager {
    public static getInstance(): AudioManager {
        console.log("[AudioManager] Getting AudioManager instance...");
        if (!this.instance) {
            console.log("[AudioManager] Creating new AudioManager instance");
            this.instance = new AudioManager();
        } else {
            console.log("[AudioManager] Returning existing AudioManager instance");
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

    constructor() {
        console.log("[AudioManager] AudioManager constructor called");
    }

    init() {
        console.log("[AudioManager] Initializing AudioManager...");
        this.initDefaultStorage();
        this.initTouchBinded();
        console.log("[AudioManager] AudioManager initialization completed");
    }

    async awaitForReady() {
        console.log("[AudioManager] Awaiting for ready state...");
        if (cc.sys.os === cc.sys.OS_IOS) {
            console.log("[AudioManager] iOS detected, waiting for ready state");
            while (!this.isReady) {
                await AnimationUtils.delayTime(0.5);
            }
            console.log("[AudioManager] Ready state achieved");
        } else {
            console.log("[AudioManager] Non-iOS platform, ready state not required");
        }
    }

    private initTouchBinded() {
        console.log("[AudioManager] Initializing touch bindings...");
        const touchend = "ontouchend" in window ? "touchend" : "mouseup";
        const touchStart = "ontouchstart" in window ? "touchstart" : "mousedown";
        const touchMove = "ontouchmove" in window ? "touchmove" : "mousemove";

        console.log("[AudioManager] Touch events configured:", { touchend, touchStart, touchMove });

        cc.game.canvas.addEventListener(touchStart, () => {
            console.log("[AudioManager] Touch start detected");
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

            console.log("[AudioManager] Touch end detected, setting ready state");
            this.touchStart = false;
            this.isReady = true;
            this.isUserGesture = true;
        });
        console.log("[AudioManager] Touch bindings initialized");
    }

    playClick() {
        console.log("[AudioManager] Playing click sound");
        if (this.clickAudio) {
            this.playSFX(this.clickAudio);
            console.log("[AudioManager] Click sound played successfully");
        } else {
            console.warn("[AudioManager] No click audio available");
        }
    }

    playSFX(clip: cc.AudioClip, loop = false): number {
        console.log("[AudioManager] Playing SFX, loop:", loop, "sfxEnabled:", this.sfxEnabled);
        if (this.sfxEnabled && clip) {
            const audioId = cc.audioEngine.playEffect(clip, loop);
            console.log("[AudioManager] SFX played with audio ID:", audioId);
            return audioId;
        }
        console.log("[AudioManager] SFX not played (disabled or no clip)");
        return -1;
    }

    playSFXSource(audio: cc.AudioSource) {
        console.log("[AudioManager] Playing SFX from audio source, sfxEnabled:", this.sfxEnabled);
        if (this.sfxEnabled && audio) {
            audio.play();
            console.log("[AudioManager] SFX from audio source played successfully");
        } else {
            console.log("[AudioManager] SFX from audio source not played (disabled or no audio)");
        }
    }

    stopSFX(audioId: number) {
        console.log("[AudioManager] Stopping SFX with audio ID:", audioId);
        cc.audioEngine.stopEffect(audioId);
        console.log("[AudioManager] SFX stopped successfully");
    }

    stopAllSFX() {
        console.log("[AudioManager] Stopping all SFX");
        cc.audioEngine.stopAllEffects();
        console.log("[AudioManager] All SFX stopped successfully");
    }

    playMusic(clip: cc.AudioClip, loop: boolean) {
        console.log("[AudioManager] Playing music, loop:", loop, "musicEnabled:", this.musicEnabled);
        if (this.musicEnabled && clip) {
            const audioId = cc.audioEngine.playMusic(clip, loop);
            console.log("[AudioManager] Music played with audio ID:", audioId);
            return audioId;
        }
        console.log("[AudioManager] Music not played (disabled or no clip)");
        return -1;
    }

    stopMusic() {
        console.log("[AudioManager] Stopping music");
        cc.audioEngine.stopMusic();
        console.log("[AudioManager] Music stopped successfully");
    }

    initDefaultStorage() {
        console.log("[AudioManager] Initializing default storage...");
        this.musicEnabled = StorageManager.get(this.MusicStorageKey) ?? true;
        this.sfxEnabled = StorageManager.get(this.SFXStorageKey) ?? true;
        console.log("[AudioManager] Default storage initialized - music:", this.musicEnabled, "sfx:", this.sfxEnabled);
    }

    addMusicChanged(key: string, observer: (changed: boolean) => void) {
        console.log("[AudioManager] Adding music changed observer for key:", key);
        this.soundObservers["music"][key] = observer;
        console.log("[AudioManager] Music changed observer added successfully");
    }

    removeMusicChanged(key: string) {
        console.log("[AudioManager] Removing music changed observer for key:", key);
        delete this.soundObservers["music"][key];
        console.log("[AudioManager] Music changed observer removed successfully");
    }

    addSfxChanged(key: string, observer: (changed: boolean) => void) {
        console.log("[AudioManager] Adding SFX changed observer for key:", key);
        this.soundObservers["sfx"][key] = observer;
        console.log("[AudioManager] SFX changed observer added successfully");
    }

    removeSfxChanged(key: string) {
        console.log("[AudioManager] Removing SFX changed observer for key:", key);
        delete this.soundObservers["sfx"][key];
        console.log("[AudioManager] SFX changed observer removed successfully");
    }

    private onMusicChanged(value: boolean) {
        console.log("[AudioManager] Music setting changed to:", value);
        const observers = this.soundObservers["music"];
        this.callObservers(observers, value);
        console.log("[AudioManager] Music change observers notified");
    }

    private onSfxChanged(value: boolean) {
        console.log("[AudioManager] SFX setting changed to:", value);
        const observers = this.soundObservers["sfx"];
        this.callObservers(observers, value);
        console.log("[AudioManager] SFX change observers notified");
    }

    private callObservers(observers: any, value: boolean) {
        console.log("[AudioManager] Calling observers, count:", Object.keys(observers).length);
        Object.keys(observers).forEach((key) => {
            const observer = observers[key];
            console.log("[AudioManager] Calling observer for key:", key);
            observer(value);
        });
        console.log("[AudioManager] All observers called");
    }

    get musicEnabled(): boolean {
        const enabled = StorageManager.get(this.MusicStorageKey);
        console.log("[AudioManager] Getting music enabled:", enabled);
        return enabled;
    }

    set musicEnabled(value: boolean) {
        console.log("[AudioManager] Setting music enabled to:", value);
        StorageManager.set(this.MusicStorageKey, value);
        this.onMusicChanged(value);
        console.log("[AudioManager] Music enabled setting updated");
    }

    get sfxEnabled(): boolean {
        const enabled = StorageManager.get(this.SFXStorageKey);
        console.log("[AudioManager] Getting SFX enabled:", enabled);
        return enabled;
    }

    set sfxEnabled(value: boolean) {
        console.log("[AudioManager] Setting SFX enabled to:", value);
        StorageManager.set(this.SFXStorageKey, value);
        this.onSfxChanged(value);
        if (!value) {
            console.log("[AudioManager] SFX disabled, stopping all SFX");
            this.stopAllSFX();
        }
        console.log("[AudioManager] SFX enabled setting updated");
    }
}

console.log("[AudioManager] AudioManager module loaded successfully");
