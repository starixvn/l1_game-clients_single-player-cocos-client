import { lazyInject } from "../../../Application";
import GameUtils from "../../../common/GameUtils";
import LobbyUtils, { BannerType } from "../../../common/LobbyUtils";
import { uiManager } from "../../../managers/GameUIManager";
import BannerController from "./BannerController";
import BannerItem from "./BannerItem";
import LobbyMenuConfig from "./LobbyMenuConfig";
import SkeletonBanner from "./SkeletonBanner";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DynamicAdsBannerController extends BannerController {
    @property(cc.Prefab)
    adsItemPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    adsSpineItemPrefab: cc.Prefab = null;

    bannerAbortController = new AbortController();

    @lazyInject(LobbyMenuConfig)
    private readonly lobbyMenuConfig: LobbyMenuConfig;
    private isFirstLoad = false;

    onDestroy() {
        super.onDestroy();
        this.bannerAbortController = null;
    }

    async setGameAds(games: number[]) {
        let index = 0;
        this.destroyAllBanners();
        this.clearAutoChange();

        try {
            for (const gameId of games) {
                if (uiManager.isPauseLoadingIcons) {
                    return;
                }

                const result = await GameUtils.asyncExecuteAbortSignal(
                    this?.node,
                    this.createAdsItem(gameId),
                    this.bannerAbortController.signal
                );

                if (result) {
                    this.handleShowFirstPage(index);
                    index++;
                }
            }
        } catch (e) {
            cc.warn("Error in setGameAds:", e);
        }
    }

    handleShowFirstPage = (index: number) => {
        if (index === 0) {
            this.showFirstPage();
        }
    };

    private triggerTouch() {
        if (this.node.childrenCount > 0 && !this.isFirstLoad) {
            this.enableTouch();
            this.isFirstLoad = true;
        }
    }

    protected async createAdsSpine(id: number) {
        if (this.adsSpineItemPrefab) {
            const item = cc.instantiate(this.adsSpineItemPrefab);
            if (item) {
                const success = await this.createBannerWithAnimation(id, item);
                success && this.setupButtonAndHandleShowBanner(item, id);
                return success;
            }
        }
        return false;
    }

    protected async createAdsItem(id: number) {
        try {
            const bannerType = LobbyUtils.getBannerTypeByGameId(id);
            if (bannerType === BannerType.Prefab) {
                return await this.createAdsSpine(id);
            } else {
                const bannerSpriteFrame = await GameUtils.asyncExecute(this?.node, LobbyUtils.getStaticBanner(id));
                if (bannerSpriteFrame && this.adsItemPrefab) {
                    const item = cc.instantiate(this.adsItemPrefab);
                    if (item) {
                        this.createBanner(id, bannerSpriteFrame, item);
                        this.setupButtonAndHandleShowBanner(item, id);
                        return true;
                    }
                }
            }
        } catch (e) {
            console.warn("Catch error after await method", e.message);
        }
        return false;
    }

    protected setupButtonAndHandleShowBanner(item: cc.Node, id: number) {
        const button = item.getComponent(cc.Button);
        const event = new cc.Component.EventHandler();
        event.target = this.node;
        event.component = "BannerController";
        event.handler = "openGame";
        event.customEventData = id.toString();
        button.clickEvents.push(event);

        this.triggerTouch();
    }

    destroyAllBanners() {
        this.bannerAbortController.abort();
        this.node.removeAllChildren();
        this.bannerAbortController = new AbortController();
    }

    private createBanner(id: number, spriteFrame: cc.SpriteFrame, item: cc.Node) {
        const sprite = item.getComponent(cc.Sprite);
        this.node?.addChild(item);
        sprite.spriteFrame = spriteFrame;

        const bannerItem = item.getComponent(BannerItem);
        const adsInfo = this.lobbyMenuConfig.getBannerInfo(id);

        if (adsInfo) {
            bannerItem.displayTime = adsInfo.displayTime;
        } else {
            bannerItem.displayTime = 4;
        }
    }

    protected async createBannerWithAnimation(id: number, item: cc.Node) {
        const bannerItem = item.getComponent(BannerItem);
        const adsInfo = this.lobbyMenuConfig.getBannerInfo(id);

        if (adsInfo) {
            bannerItem.displayTime = adsInfo.displayTime;
        } else {
            bannerItem.displayTime = 4;
        }
        const skeletonBannerIcon = item.getComponent(SkeletonBanner);
        const success = await skeletonBannerIcon.loadAnimation(id);
        success && this.node?.addChild(item);
        return success;
    }

    onLoad() {
        // override to delay enableTouch
    }
}
