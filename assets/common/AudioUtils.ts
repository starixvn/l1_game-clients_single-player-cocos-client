import { AudioInfo, TAudioValue } from "./AudioInterface";
import GameUtils from "./GameUtils";
export default class AudioUtils {
    public static readonly getAudioInfo = (audioValue: TAudioValue, key: string): AudioInfo => {
        const bundle = audioValue?.bundle;
        const path = audioValue?.path ? `${audioValue?.path}/${key}` : `shared/sounds/${key}`;
        return { bundle, path };
    };

    public static readonly getAudioClip = async (bundle: string, path: string): Promise<cc.AudioClip | null> => {
        try {
            const loadedClip: cc.AudioClip = bundle
                ? await GameUtils.loadAssetsFromBundle(bundle, path, cc.AudioClip, null)
                : await GameUtils.loadResourceAsset<cc.AudioClip>(path, cc.AudioClip);

            return loadedClip;
        } catch (error) {
            console.log(`Failed to load audio clip from bundle: ${error}`);
            return null;
        }
    };
}
