export default class MockedAudioManager {
    public static getInstance(): MockedAudioManager {
        if (!this.instance) {
            this.instance = new MockedAudioManager();
        }

        return this.instance;
    }

    private static instance: MockedAudioManager;

    init() {}

    playClick() {}

    playSFX(clip): number {
        return -1;
    }

    stopSFX(audioId: number) {}

    stopAllSFX() {}

    playMusic(clip, loop: boolean) {}

    addMusicChanged(key: string, observer: (changed: boolean) => void) {}

    removeMusicChanged(key: string) {}

    addSfxChanged(key: string, observer: (changed: boolean) => void) {}

    removeSfxChanged(key: string) {}
}
