import { SystemType } from "../../ISystem";
import GameUtils from "../GameUtils";
import { buildShareResource } from "../helpers/UrlHelper";
import { sentryLogger } from "../logger";
import AudioManager from "./AudioManager";
import NameSongManager from "./NameSongManager";

export type IRemoteSoundConfigs = {
    version: number;
    defaultTheme: string;
    backgroundMusic: {
        version: number;
    };
    themes: string[];
};

export type TAudioConfigs = {
    [key: string]: TAudioValue;
};

export type TAudioValue = {
    bundle?: string;
    path: string;
    type: string;
    isMusicGame?: boolean;
    isLazyLoad?: boolean;
    isRemote?: boolean;
};

export default class MusicPlayer {
    private nameSongManager: NameSongManager;
    public isPlayBgMusic = false;
    public isJoinRoomMusic = false;
    public initialized = false;
    protected bgMusicId: number;
    readonly volumeDefault = 0.7;
    readonly musicChangedKey = "lobby";
    protected intervalVolDecrease: NodeJS.Timeout;
    protected intervalVolIncrease: NodeJS.Timeout;
    protected volume = 0.5;
    readonly stepVolume = 0.05;
    readonly duration = 3.5;
    readonly stepIntervalVolume = (this.duration * 1000) / (this.volume / this.stepVolume);
    private static instanceMusic: MusicPlayer;
    private lastLoadSongTask: { promise: Promise<cc.AudioClip>; cancel: () => void };
    protected remoteSoundConfigs: IRemoteSoundConfigs = {
        version: 1,
        defaultTheme: "original",
        backgroundMusic: {
            version: 1
        },
        themes: []
    };

    protected remoteAudioConfigs: TAudioConfigs = null;
    private readonly defaultListSong = ["SC1/song1", "SC1/song2", "SC1/song3", "SC1/song4", "SC1/song5", "SC1/song6", "SC1/song7"];
    private readonly remoteBgMusicPrefix = "remoteBgMusic";

    public static getInstance(): MusicPlayer {
        if (!this.instanceMusic) {
            this.instanceMusic = new MusicPlayer();
        }

        return this.instanceMusic;
    }

    private async initNameSongManager() {
        if (!this.nameSongManager) {
            await this.getRemoteSoundConfigs();
            await this.getRemoteAudioConfig();
            this.nameSongManager = new NameSongManager({
                [SystemType.SC1]: this.getRemoteSongNames() ?? this.defaultListSong
            });
        }
    }

    protected getRemoteSongNames() {
        const result = [];
        for (const key in this.remoteAudioConfigs) {
            if (this.remoteAudioConfigs[key].isRemote) {
                result.push(`${this.remoteBgMusicPrefix}/${key}`);
            }
        }
        return result;
    }

    private get audioManager() {
        return AudioManager.getInstance();
    }

    stopBackgroundAudio() {
        this.isPlayBgMusic = false;
        this.audioManager.stopMusic();
        this.bgMusicId && cc.audioEngine.stop(this.bgMusicId);
        this.bgMusicId = -1;
    }

    private async getRandomNameSong() {
        await this.initNameSongManager();
        return this.nameSongManager.getSongName();
    }

    private async playBgAudio(play: boolean) {
        this.clearIntervalSetVolume();
        this.isJoinRoomMusic && this.audioManager.removeMusicChanged(this.musicChangedKey);

        if (play && !this.isJoinRoomMusic) {
            const songName = await this.getRandomNameSong();
            this.loadResourceAudio(songName);
            this.isPlayBgMusic = true;
        } else {
            this.stopBackgroundAudio();
        }
    }

    private loadAudio(song: string) {
        let reject;
        const promise = new Promise<cc.AudioClip>((resolve, rejectInPromise) => {
            reject = rejectInPromise;
            cc.resources.load(`music/${song}`, cc.AudioClip, (err, audioClip: cc.AudioClip) => {
                resolve(audioClip);
            });
        });

        return {
            promise,
            cancel: () => {
                reject && reject(new Error(`${sentryLogger.ignoreErrorsPrefix} cancel load audio`));
            }
        };
    }

    private loadRemoteAudio(songId: string) {
        let reject;
        const url = `${this.getRemoteSoundPath()}/${this.remoteSoundConfigs.defaultTheme}/${this.remoteAudioConfigs[songId].path}.mp3?v=${
            this.remoteSoundConfigs.version
        }`;
        const promise = new Promise<cc.AudioClip>((resolve, rejectInPromise) => {
            reject = rejectInPromise;
            cc.assetManager.loadRemote(url, cc.AudioClip, (err, audioClip: cc.AudioClip) => {
                resolve(audioClip);
            });
        });

        return {
            promise,
            cancel: () => {
                reject && reject(new Error(`${sentryLogger.ignoreErrorsPrefix} cancel load audio`));
            }
        };
    }

    private async loadResourceAudio(song: string) {
        try {
            if (this.lastLoadSongTask) {
                this.lastLoadSongTask.cancel();
            }
            this.lastLoadSongTask = this.getAudioClip(song);

            const audioClip = await this.lastLoadSongTask.promise;
            if (this.isPlayBgMusic) {
                await AudioManager.getInstance().awaitForReady();
                if (!this.isPlayBgMusic) {
                    return;
                }
                if (AudioManager.getInstance().musicEnabled) {
                    this.playAudioClip(audioClip);
                }
            }
        } catch (err) {
            cc.warn(err.message);
        }
    }

    protected getAudioClip(song: string) {
        if (song.includes(this.remoteBgMusicPrefix)) {
            return this.loadRemoteAudio(song.replace(`${this.remoteBgMusicPrefix}/`, ""));
        }

        return this.loadAudio(song);
    }

    playAudioClip(audioClip: cc.AudioClip) {
        this.bgMusicId && cc.audioEngine.stop(this.bgMusicId);
        this.bgMusicId = this.audioManager.playMusic(audioClip, false);
        cc.audioEngine.setVolume(this.bgMusicId, this.volumeDefault);
        cc.audioEngine.setFinishCallback(this.bgMusicId, () => {
            this.stopBackgroundAudio();
            this.playBgAudio(true);
        });
    }

    init() {
        this.initialized = true;
        this.isJoinRoomMusic = false;
        if (!this.isPlayBgMusic) {
            this.playBgAudio(this.audioManager.musicEnabled);
        }
        this.audioManager.addMusicChanged(this.musicChangedKey, (enable: boolean) => {
            this.playBgAudio(enable);
        });
    }

    decreaseVolumeAndStopBackgroundMusic() {
        return new Promise<void>((resolve) => {
            this.clearIntervalSetVolume();
            if (this.isPlayBgMusic) {
                this.volume = this.volumeDefault;
                const func = () => this.handleDecreaseVolume(resolve);

                func();
                this.intervalVolDecrease = setInterval(() => {
                    func();
                }, this.stepIntervalVolume);
            } else {
                resolve();
            }
        });
    }

    private handleDecreaseVolume(onComplete: () => void) {
        cc.audioEngine.setVolume(this.bgMusicId, this.volume);
        this.volume -= this.stepVolume;
        if (this.volume <= 0) {
            clearInterval(this.intervalVolDecrease);
            this.stopBackgroundAudio();
            onComplete();
        }
    }

    private clearIntervalSetVolume() {
        this.intervalVolDecrease && clearInterval(this.intervalVolDecrease);
        this.intervalVolIncrease && clearInterval(this.intervalVolIncrease);
    }

    handleIncreaseVolume() {
        this.clearIntervalSetVolume();
        if (this.bgMusicId > -1) {
            this.intervalVolIncrease = setInterval(() => {
                cc.audioEngine.setVolume(this.bgMusicId, this.volume);
                this.volume += this.stepVolume;
                this.volume >= 0.7 && clearInterval(this.intervalVolIncrease);
            }, this.stepIntervalVolume);
        }
    }

    protected async getRemoteSoundConfigs() {
        try {
            const configUrl = `${this.getRemoteSoundPath()}/info.json?v=${Date.now()}`;
            const jsonAsset = await GameUtils.loadRemote<cc.JsonAsset>(configUrl);
            this.remoteSoundConfigs = (jsonAsset?.json as IRemoteSoundConfigs) ?? null;
        } catch (error) {
            cc.log("Get config remote sounds failed!");
        }
    }

    protected async getRemoteAudioConfig() {
        try {
            const configUrl = `${this.getRemoteSoundPath()}/${this.remoteSoundConfigs.defaultTheme}/info.json?v=${Date.now()}`;
            const jsonAsset = await GameUtils.loadRemote<cc.JsonAsset>(configUrl);
            this.remoteAudioConfigs = (jsonAsset?.json as TAudioConfigs) ?? null;
        } catch (error) {
            cc.log("Get remote audio config failed!");
        }
    }

    protected getRemoteSoundPath() {
        return `${buildShareResource()}/sounds/themes`;
    }
}
