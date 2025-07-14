import GameUtils from "../../../common/GameUtils";
import { MULTIPLIER_SYMBOL, SCATTER_SYMBOL } from "./CascadingSlotUtils";
import MultiplierItem from "./MultiplierItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CascadeSlotReelItem extends cc.Component {
    @property(cc.Prefab)
    itemPrefabs: cc.Prefab[] = [];

    @property(cc.Node)
    content: cc.Node = null;

    public index = -1;
    public gameId: number;

    setItem(index: number) {
        this.replaceItem(index);
        this.index = index;
    }

    get isScatterSymbol(): boolean {
        return this.index === SCATTER_SYMBOL;
    }

    async highlightScatterItem() {
        const animation = this.content.getComponentInChildren(cc.Animation);
        animation.play("scatter");
        const duration = animation.currentClip.duration;
        await GameUtils.delayTime(duration);
    }

    updateMultiplierItem(multiplier: number[]) {
        if (this.index >= MULTIPLIER_SYMBOL && multiplier.length > 0) {
            const m = multiplier.shift();
            const multiplierItem = this.content.children[0].getComponent(MultiplierItem);
            multiplierItem.gameId = this.gameId;
            multiplierItem?.setValue(m);
        }
    }

    protected replaceItem(index: number) {
        this.content.removeAllChildren();
        if (index < 0 || index >= this.itemPrefabs.length) {
            console.error("replaceItem wrong index: " + index);
            return;
        }
        const node = cc.instantiate(this.itemPrefabs[index]);
        this.content.addChild(node);
    }
}
