import { lazyInject } from "../../../Application";
import GameUtils from "../../../common/GameUtils";
import { userManager } from "../../../common/user/UserManager";
import LobbyMenuConfig from "../../../lobby/main/view-models/LobbyMenuConfig";
import { uiManager } from "../../../managers/GameUIManager";
import { InternalEvents } from "../../../managers/InternalEvents";
import { jackpotManager } from "../../../managers/JackpotManager";
import BannerController from "./BannerController";
import DynamicAdsBannerController from "./DynamicAdsBannerController";
import JackpotNavigation from "./JackpotNavigation";

const { ccclass } = cc._decorator;

@ccclass
export default class Banner extends cc.Component {
    @lazyInject(LobbyMenuConfig)
    private readonly lobbyMenuConfig: LobbyMenuConfig;

    protected adsBannerController: DynamicAdsBannerController = null;

    protected jackpotBannerContainer: cc.Node = null;
    protected jackpotNavigationContainer: cc.Node = null;
    protected adsToggle: cc.Toggle = null;
    protected jackpotToggle: cc.Toggle = null;

    showJackpotBanner = false;
    bannerPrefabNode: cc.Node = null;
    jackpotContainer: cc.Node = null;

    onLoad() {
        uiManager.emitterListener(InternalEvents.RECEIVED_RAW_JACKPOT_POOLS, (data) => this.handleJackpot(data), this);
    }

    onDestroy() {
        uiManager.removeListenersWithTarget(this);
    }

    protected getPrefabBannerContainer() {
        return GameUtils.loadResource("lobby/banner/bannerContainer");
    }

    protected getPathJackpotContainer() {
        return GameUtils.loadResource("lobby/banner/jackpotController");
    }

    protected getPathJackpotNavigation() {
        return GameUtils.loadResource("lobby/banner/jackpotNavigation");
    }

    protected async init() {
        try {
            const prefab = await this.getPrefabBannerContainer();
            const bannerPrefabNode = cc.instantiate(prefab);
            this.bannerPrefabNode = bannerPrefabNode;
            this.node?.addChild(bannerPrefabNode);
            const adsBannerContainerNode = bannerPrefabNode.getChildByName("adsBannerController");
            this.adsBannerController = adsBannerContainerNode.getComponent(DynamicAdsBannerController);
            this.adsBannerController.menuLoop = !this.showJackpotBanner;
            !userManager.disableJackpotGames && jackpotManager.requestAllJackpotPools();
        } catch (error) {
            cc.log("An error occurred during init banner:", error);
        }
    }

    async handleJackpot(data) {
        if (!this.node?.isValid || userManager.disableJackpotGames) {
            return;
        }
        this.showJackpotBanner = !userManager.disableJackpotGames && !!Object.keys(data).length;
        this.adsBannerController.menuLoop = !this.showJackpotBanner;
        this.adsBannerController.onEndingRound = (rightDirection) => {
            if (this.showJackpotBanner && this.adsToggle && this.jackpotToggle) {
                this.adsToggle.isChecked = false;
                this.jackpotToggle.isChecked = true;
                this.switchBanner(true, false, rightDirection);
            }
        };

        if (this.showJackpotBanner) {
            await this.handleJackpotBanner();
        } else {
            this.jackpotNavigationContainer?.childrenCount > 0 && (this.jackpotNavigationContainer.active = this.showJackpotBanner);
            this.jackpotBannerContainer && this.switchBanner(false, true);
        }
    }

    async loadBanner(needLoadAllBanners: boolean) {
        try {
            if (!this.adsBannerController) {
                await this.init();
            }

            const filterList: number[] = this.getGameIdOfferBanner(needLoadAllBanners);
            this.adsBannerController.setGameAds(filterList);
        } catch (e) {
            console.warn("Catch error after await method", e.message);
        }
    }

    private async handleJackpotBanner() {
        this.jackpotContainer = this.bannerPrefabNode.getChildByName("jackpotController");
        this.jackpotNavigationContainer = this.bannerPrefabNode.getChildByName("jackpotNavigationController");
        if (this.jackpotContainer?.childrenCount > 0 || this.jackpotNavigationContainer?.childrenCount > 0) {
            return;
        }
        await this.setJackpotContainer();
        await this.setJackpotNavigation();
    }

    protected async setJackpotContainer() {
        try {
            const prefab = await this.getPathJackpotContainer();
            const jackpotBannerNode = cc.instantiate(prefab);
            this.jackpotContainer?.addChild(jackpotBannerNode);
            const jackpotNode = this.jackpotContainer?.children[0];
            this.jackpotBannerContainer = jackpotNode;
            jackpotBannerNode.active = false;

            jackpotNode.getComponent(BannerController).onEndingRound = (rightDirection) => {
                this.jackpotToggle.isChecked = false;
                this.adsToggle.isChecked = true;

                this.switchBanner(false, false, rightDirection);
            };
        } catch (error) {
            cc.log("An error occurred during setJackpotContainer:", error);
        }
    }

    protected async setJackpotNavigation() {
        try {
            const prefab = await this.getPathJackpotNavigation();
            const gameNode = cc.instantiate(prefab);
            this.jackpotNavigationContainer?.addChild(gameNode);

            const navigationComponent = this.jackpotNavigationContainer?.children[0]?.getComponent(JackpotNavigation);
            navigationComponent.onInit(this);
            this.jackpotToggle = navigationComponent.jackpotToggle;
            this.adsToggle = navigationComponent.adsToggle;
            navigationComponent.node.active = true;
        } catch (error) {
            cc.log("An error occurred during setJackpotNavigation:", error);
        }
    }

    private getGameIdOfferBanner(isLoadAllBanners: boolean) {
        const filterList: number[] = [];
        const gameAds = isLoadAllBanners ? this.lobbyMenuConfig.bannerAds : this.lobbyMenuConfig.bannerAds.slice(0, 1);
        gameAds.forEach((id: number) => {
            if (userManager.offerGames.includes(id)) {
                filterList.push(id);
            }
        });

        if (this.lobbyMenuConfig.smPromotion) {
            // Add SM promotion banner at page 2
            filterList.splice(1, 0, 0);
        }

        return filterList;
    }

    switchBanner(showJackpot: boolean, reset = false, rightDirection = true) {
        cc.tween(this.node)
            .delay(0.1)
            .call(() => {
                if (!this.node.isValid) {
                    return;
                }
                this.adsBannerController.node.active = !showJackpot;
                this.jackpotBannerContainer.active = showJackpot;

                const newContainer = !showJackpot ? this.adsBannerController : this.jackpotBannerContainer;
                const newController = newContainer.getComponent(BannerController);

                if (rightDirection || reset) {
                    newController.showFirstPage();
                } else {
                    newController.showLastPage();
                }
            })
            .start();
    }
}
