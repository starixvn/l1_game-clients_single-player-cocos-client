import AudioManager from "../../../common/audio/AudioManager";
import { StorageManager } from "../../../managers/StorageManager";

const { ccclass } = cc._decorator;

@ccclass
export default class SedieTutorial extends cc.Component {
    storageKey;

    dontShowAgainCallback = (value: boolean) => {
        // toggleCallback
    };

    protected playClick() {
        AudioManager.getInstance().playClick();
    }

    getLocalStorageData() {
        return (
            StorageManager.get(this.storageKey) ?? {
                enabled: true
            }
        );
    }

    setLocalStorageData(data: any) {
        StorageManager.set(this.storageKey, data);
    }
}
