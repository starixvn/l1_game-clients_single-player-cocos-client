import GameUtils from "../../../common/GameUtils";
import CascadeSlotReel from "./CascadeSlotReel";
import CascadeSlotReelItem from "./CascadeSlotReelItem";
import StandardCascadingSlotReelItem from "./StandardCascadingSlotReelItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StandardCascadingSlotReel extends CascadeSlotReel {
    protected items: StandardCascadingSlotReelItem[] = [];

    async highlightItem(index: number) {
        const item = this.items[index];
        GameUtils.moveToOtherNode(item.node, this.effectContainer);
        await this.effectSpineSymbol(item, "highlight");
    }

    async shakeItems() {
        await Promise.all(this.items.map((item) => this.shakeItem(item)));
    }

    async shakeItem(item) {
        GameUtils.moveToOtherNode(item.node, this.effectContainer);
        await this.effectSpineSymbol(item, "shake");
        GameUtils.moveToOtherNode(item.node, this.node);
    }

    async removeItem(index: number) {
        const item = this.items[index];
        await this.effectSpineSymbol(item, "explode");
        item.node.destroy();
    }

    async effectSpineSymbol(item: CascadeSlotReelItem, animation: string) {
        const effectSpine = item.getComponentInChildren(sp.Skeleton);
        effectSpine.setAnimation(0, animation, false);
        const duration = effectSpine.findAnimation(animation)?.duration || 0;
        if (duration > 0) {
            await GameUtils.delayTime(duration);
        }
    }

    fallInWithOffset(item: CascadeSlotReelItem, duration: number, posY: number, isBottomItem: boolean, onBottomItemEnded?: () => void) {
        const backOffsetY = this.itemSize * 1.8;
        const backDuration = 0.2;

        cc.tween(item.node)
            .to(duration - backDuration, { y: posY + backOffsetY })
            .call(() => {
                if (isBottomItem) {
                    onBottomItemEnded && onBottomItemEnded();
                }
            })
            .to(backDuration, { y: posY }, { easing: "backOut" })
            .start();
    }
}
