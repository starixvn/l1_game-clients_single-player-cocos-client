import { SystemType } from "../../ISystem";
import GameUtils from "../../common/GameUtils";
import AudioManager from "../../common/audio/AudioManager";
import { uiManager } from "../../managers/GameUIManager";
import { lobbyResourceManager } from "../main/view-models/LobbyResourceManager";
import { themeResourceLoader } from "../main/view-models/theme/ResourceLoader";
import { PromotionTournamentEvents, promotionTournamentHandler } from "./PromotionTournamentHandler";
import configs = require("../../configs/Configs");

const { ccclass } = cc._decorator;

@ccclass
export default class PromotionTournamentIcon extends cc.Component {
    private icon: cc.Node = null;
    private iconPrb: cc.Prefab = null;

    protected onLoad(): void {
        if (this.supportPromotionTournament()) {
            this.icon && (this.icon.active = false);
            promotionTournamentHandler.init();
            promotionTournamentHandler.on(PromotionTournamentEvents.TOGGLE_ICON, this.toggleIcon.bind(this));
        }
    }

    protected onDestroy(): void {
        if (this.supportPromotionTournament()) {
            promotionTournamentHandler.clear();
        }
    }

    private supportPromotionTournament() {
        return configs.systemType === SystemType.SC2;
    }

    async toggleIcon(isActive: boolean) {
        if (isActive && !this.icon) {
            this.createIcon();
        }
        this.icon && (this.icon.active = isActive);
    }

    async createIcon() {
        try {
            const key = "promotionTournamentIcon";
            if (!uiManager.prefabCache.miniPanelIcons[key]) {
                this.iconPrb = await this.loadIcon();
                uiManager.prefabCache.miniPanelIcons[key] = this.iconPrb;
            } else {
                this.iconPrb = uiManager.prefabCache.miniPanelIcons[key];
            }
            this.icon = cc.instantiate(this.iconPrb);
            this.icon.on("click", this.onClick, this);
            this.node?.addChild(this.icon);
        } catch (e) {
            console.warn(e);
        }
    }

    loadIcon() {
        return GameUtils.asyncExecute<cc.Prefab>(
            this.node,
            lobbyResourceManager?.hasCurrencyGroup()
                ? themeResourceLoader?.loadPrefab("promotion-tournament/icon")
                : GameUtils.loadResource("promotion-tournament/views/icon")
        );
    }

    onClick() {
        AudioManager.getInstance().playClick();
        promotionTournamentHandler.emit(PromotionTournamentEvents.OPEN_PROMOTION_TOURNAMENT_BY_ICON);
    }
}
