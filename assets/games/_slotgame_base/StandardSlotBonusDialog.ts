import { BundleManager } from "bundle-management";

import BonusDialog from "./BonusDialog";
import { ClassicSlotSound } from "./ClassicSlotSound";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StandardSlotBonusDialog extends BonusDialog {
    @property({ type: cc.Prefab, visible: false, override: true })
    bonusItem: cc.Prefab = null;

    @property({ type: cc.AudioSource, visible: false, override: true })
    soundBigWin: cc.AudioSource = null;

    @property
    prefixPath = "preload";

    async initBonusItems() {
        await this.loadBonusItemPrefab();
        super.initBonusItems();
    }

    playBonusItemSound() {
        this.playSoundCallback(ClassicSlotSound.BONUS_ITEM);
    }

    async loadBonusItemPrefab() {
        const path = `${this.prefixPath}/prefabs/bonus-item`;
        const devPath = `../games/*/${path}`;
        try {
            const prefab = await BundleManager.getInstance().loadAsset<cc.Prefab>({
                bundleId: this.gameId.toString(),
                path: path,
                pathForDevMode: devPath,
                type: cc.Prefab
            });

            this.bonusItem = prefab;
        } catch (e) {
            console.warn(`Missing prefab for ${path} `, e);
        }
    }
}
