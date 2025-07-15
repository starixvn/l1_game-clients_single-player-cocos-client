import GameUtils from "../../../common/GameUtils";
import { uiManager } from "../../../managers/GameUIManager";
import MultiplierItem from "./MultiplierItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StandardMultiplierItem extends MultiplierItem {
    @property({ type: cc.Sprite, visible: false, override: true })
    center: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: false, override: true })
    centerGlow: cc.Sprite = null;

    @property({ type: cc.SpriteAtlas, visible: false, override: true })
    atlas: cc.SpriteAtlas = null;

    gameId: number;
    private spine: sp.Skeleton;

    get cache() {
        return uiManager.prefabCache.slotSymbols[this.gameId] || {};
    }

    onLoad() {
        this.spine = this.node.getComponent(sp.Skeleton);
    }

    async playAnimationGlow() {
        try {
            const anim = "highlight";
            this.spine.setAnimation(0, anim, true);
            const duration = this.spine.findAnimation(anim)?.duration || 0;
            GameUtils.updateSpineDuration(this.spine, anim, duration);
            if (duration > 0) {
                await GameUtils.delayTime(duration);
            }
            this.hideMultiplier();
        } catch (e) {
            console.warn("Catch error after await method", e.message);
        }
    }

    protected hideMultiplier() {
        this.value.node.active = false;
        this.spine.setAnimation(0, "idle", true);
    }

    updateColor(value: number) {
        const level = [10, 11, 12, 13];
        let i = 0;
        const range = [5, 10, 15];
        for (; i < range.length; i++) {
            if (value <= range[i]) {
                break;
            }
        }
        const anim = "idle";
        this.spine.skeletonData = this.cache[level[i]];
        this.spine.setAnimation(0, anim, true);
    }
}
