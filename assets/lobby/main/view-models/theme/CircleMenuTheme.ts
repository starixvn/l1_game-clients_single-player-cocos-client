import GameUtils from "../../../../common/GameUtils";
import { uiManager } from "../../../../managers/GameUIManager";
import CircleMenu from "./../CircleMenu";
import { themeGameIconLoader } from "./GameIconLoader";
import { themeResourceLoader } from "./ResourceLoader";
import SkeletonMiniIcon from "./SkeletonMiniIcon";

const { ccclass } = cc._decorator;

@ccclass
export default class CircleMenuTheme extends CircleMenu {
    override async loadGameIcon(gameId: number, node: cc.Node) {
        if (gameId === 0) {
            return;
        }

        try {
            const skeletonMiniIcon = node?.getComponent(SkeletonMiniIcon);
            const cachedSprite = uiManager.spriteFrameCache.miniPanelIcons[gameId]?.spriteFrame;
            const spriteFrame = cachedSprite || (await themeGameIconLoader?.loadMiniGameIcon(gameId));
            if (spriteFrame) {
                skeletonMiniIcon.iconSprite.spriteFrame = spriteFrame;
                skeletonMiniIcon.hideSkeleton();
                const prefabCounter = await GameUtils.asyncExecute<cc.Prefab>(
                    this?.node,
                    themeResourceLoader?.loadPrefab(`mini-game/counters/${gameId}`)
                );
                prefabCounter && skeletonMiniIcon.containerCounter.addChild(cc.instantiate(prefabCounter));
            }
        } catch (e) {
            console.warn(e);
        }
    }

    override onInitialized() {
        const count = this.content.childrenCount;
        const radius = this.content.width * 0.35;
        const degree = 360 / count;
        this.content.children.forEach((child, index) => {
            const angle = degree * index;
            child.position = cc.v3(radius * Math.sin(cc.misc.degreesToRadians(angle)), radius * Math.cos(cc.misc.degreesToRadians(angle)));
        });
    }
}
