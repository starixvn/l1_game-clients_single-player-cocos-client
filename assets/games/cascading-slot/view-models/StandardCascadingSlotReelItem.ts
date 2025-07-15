import GameUtils from "../../../common/GameUtils";
import { uiManager } from "../../../managers/GameUIManager";
import CascadeSlotReelItem from "./CascadeSlotReelItem";
import { MULTIPLIER_SYMBOL, SCATTER_SYMBOL } from "./CascadingSlotUtils";
import StandardCascadingSlotReelSymbol from "./StandardCascadingSlotReelSymbol";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StandardCascadingSlotReelItem extends CascadeSlotReelItem {
    get cache() {
        return uiManager.prefabCache.slotSymbols[this.gameId] || {};
    }

    protected replaceItem(index: number) {
        this.itemPrefabs[1] = uiManager.prefabCache.multiplierPrefab[this.gameId];
        this.content.removeAllChildren();
        if (index < 0) {
            console.error("replaceItem wrong index: " + index);
            return;
        }
        const symbolPrefabIndex = index >= MULTIPLIER_SYMBOL ? 1 : 0;
        const node = cc.instantiate(this.itemPrefabs[symbolPrefabIndex]);
        this.content.addChild(node);
        const reelSymbol = node.getComponent(StandardCascadingSlotReelSymbol);
        reelSymbol.setAminamtion(this.cache[index]);
    }

    async highlightScatterItem() {
        const effectSpine = this.content.getComponentInChildren(sp.Skeleton);
        const anim = "highlight";
        effectSpine.skeletonData = this.cache[SCATTER_SYMBOL];
        effectSpine.setAnimation(0, anim, true);
        const original = effectSpine.findAnimation(anim).duration;
        await GameUtils.delayTime(original);
    }
}
