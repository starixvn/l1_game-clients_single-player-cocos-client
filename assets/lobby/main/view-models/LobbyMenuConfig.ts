import { injectable } from "inversify";

import { ICashSystem, ICreditSystem, System } from "../../../System";
import LobbyManager from "./LobbyManager";

const FourGuardiansId = 29;

@injectable()
export default class LobbyMenuConfig extends System implements ICreditSystem, ICashSystem {
    constructor() {
        super();
    }

    smPromotion: boolean;

    get categoryList() {
        return LobbyManager.getInstance().getCategoryList();
    }

    get list() {
        return LobbyManager.getInstance().getAllGameIds();
    }

    get roundTimerGame() {
        return LobbyManager.getInstance().getRoundTimerGame();
    }

    get firstCategoryList() {
        return LobbyManager.getInstance().getGameIdsByCategoryIndex() ?? [];
    }

    get bannerAds() {
        const banners = LobbyManager.getInstance().getBanners();
        return banners?.map((banner) => banner.gameId) ?? [];
    }

    get miniList() {
        return LobbyManager.getInstance().getMiniPanelList();
    }

    getBannerInfo(gameId: number) {
        return LobbyManager.getInstance().getBannerByGameId(gameId);
    }
    customGameIconBySystem = [FourGuardiansId];

    customizeCredit(): void {
        this.smPromotion = true;
    }

    customizeCash(): void {
        this.smPromotion = false;
    }

    isNewGame(gameId: number, category = 0): boolean {
        const gameConfiguration = LobbyManager.getInstance().getGame(gameId, category);
        return gameConfiguration?.newTag;
    }

    isBigSize(gameId: number, category = 0): boolean {
        const gameConfiguration = LobbyManager.getInstance().getGame(gameId, category);

        return gameConfiguration?.bigSize;
    }
}
