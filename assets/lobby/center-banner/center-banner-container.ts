import { lazyInject } from "../../Application";
import GameUtils from "../../common/GameUtils";
import { userManager } from "../../common/user/UserManager";
import { appManager } from "../../managers/AppManager";
import { uiManager } from "../../managers/GameUIManager";
import { InternalEvents } from "../../managers/InternalEvents";
import { StorageManager } from "../../managers/StorageManager";
import LobbyMenuConfig from "../main/view-models/LobbyMenuConfig";
import CenterBanner from "./center-banner";
import LobbyDialogManager from "../../managers/LobbyDialogManager";
const { ccclass, property } = cc._decorator;

@ccclass
export default class CenterBannerContainer extends cc.Component {
    @property(cc.Prefab)
    bannerPrefab: cc.Prefab = null;

    @lazyInject(LobbyMenuConfig)
    private readonly lobbyMenuConfig: LobbyMenuConfig;

    private readonly storageKey = "center-banner-dont-show-again";
    onLoad() {
        if (appManager.hasShowedCenterBanner) {
            return;
        }
        uiManager.emitterListener(
            InternalEvents.CENTER_BANNER_SHOW,
            () => LobbyDialogManager.getInstance().addDialog(this.initCenterBanner.bind(this), "CenterBanner"),
            this
        );
    }

    onDestroy(): void {
        uiManager.removeListenersWithTarget(this);
    }

    async initCenterBanner() {
        if (appManager.hasShowedCenterBanner) {
            return;
        }

        try {
            const filterList = this.getFilteredBannerIds();
            for (const gameId of filterList) {
                const success = await this.loadAndShowBanner(gameId);
                if (success) {
                    break;
                }
            }
        } catch (error) {}
    }

    private getFilteredBannerIds(): number[] {
        const offerBannerIds = this.lobbyMenuConfig.bannerAds.filter((id) => userManager.offerGames.includes(id));
        const list = offerBannerIds.slice(0, 1); // only first banner
        const dontShowAgainStorage = StorageManager.get(this.storageKey);
        return list.filter((id) => !dontShowAgainStorage || !dontShowAgainStorage[id]);
    }

    private async loadAndShowBanner(gameId: number): Promise<boolean> {
        try {
            const path = `center-banners/${gameId}`;
            const versionsPath = `${path}/versions.json`;
            const data = await GameUtils.loadRemoteFromSharedResource<any>(versionsPath, true);

            if (data) {
                return await this.loadBannerImage(data, gameId, path);
            }
        } catch (e) {
            // Handle errors if needed
        }

        return false;
    }

    private async loadBannerImage(data: any, gameId: number, path: string): Promise<boolean> {
        const languages = [window.i18n.curLang, "en", "vi"];
        for (const lang of languages) {
            const fileName = `${lang}.webp`;
            if (data.json[fileName]) {
                const imageAsset = await GameUtils.loadRemoteFromSharedResource<cc.Texture2D>(`${path}/${fileName}`, true);
                if (imageAsset) {
                    const spriteFrame = new cc.SpriteFrame();
                    spriteFrame.setTexture(imageAsset);
                    this.showBanner(gameId, spriteFrame);
                    return true;
                }
            }
        }
        return false;
    }

    showBanner(gameId: number, spriteFrame: cc.SpriteFrame) {
        const node = cc.instantiate(this.bannerPrefab);
        this.node.addChild(node);

        const banner = node.getComponent(CenterBanner);
        banner.init(gameId, spriteFrame, this.storageKey);

        appManager.hasShowedCenterBanner = true;
    }
}
