import { BundleManager } from "bundle-management";

import BaseGameSongs from "../_base/BaseGameSongs";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SlotGameSongs extends BaseGameSongs {
    protected musicDirectory = "/audio/background-music";

    loadAudioClip(song: string): Promise<cc.AudioClip> {
        return BundleManager.getInstance().loadAsset<cc.AudioClip>({
            bundleId: this.gameId.toString(),
            path: `${this.musicDirectory}/${song}`,
            type: cc.AudioClip
        });
    }
}
