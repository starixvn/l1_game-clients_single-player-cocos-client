import axios from "axios";
import * as sessionManager from "../../common/auth/SessionManager";
import EventEmitterBase from "../../common/emitter/EventEmitterBase";
import { buildPromotionSiteUrl } from "../../common/helpers/UrlHelper";
import { sentryLogger } from "../../common/logger";
import EncryptUtils from "../../common/utils/EncryptUtils";
import { StorageManager } from "../../managers/StorageManager";
import configs = require("../../configs/Configs");

export const FreeSpinsPromotionEvents = {
    OPEN_FREE_SPINS_PROMOTION: "OPEN_FREE_SPINS_PROMOTION"
};

const endpointConstants = {
    bannerPromotion: "banner-promotions"
};

export default class FreeSpinsPromotionHandler extends EventEmitterBase {
    private static instance: FreeSpinsPromotionHandler;
    private promotionInfoFromSso: any = null;
    public isDirectlyOpen = false;
    private readonly storageKey = "free-spins-promotion-dont-show-again";
    public static getInstance(): FreeSpinsPromotionHandler {
        if (!this.instance) {
            this.instance = new FreeSpinsPromotionHandler();
        }

        return this.instance;
    }

    getStorageKey() {
        return this.storageKey;
    }
    onCloseFreeSpinsPromotionPopup() {
        sessionManager.setCheckedFreeSpinsPromotionFirstSso(true);
    }

    getGameId() {
        const offers = this.promotionInfoFromSso?.gameOfferPromotion;
        return offers[0].gameId;
    }

    setPromotionInfoFromSso(promotionInfo: any, isDirectly = false) {
        this.promotionInfoFromSso = promotionInfo;
        this.getFreeSpinsPromotionBanner();
        this.isDirectlyOpen = isDirectly;
    }
    getFreeSpinsPromotionBanner() {
        try {
            const storage = StorageManager.get(this.storageKey);
            if (
                storage?.dontShowAgain ||
                sessionManager.getCheckedFreeSpinsPromotionFirstSso() ||
                configs.systemType.toUpperCase() === "SC1"
            ) {
                return;
            }

            const promotionId = this.promotionInfoFromSso?.promotion?.promotionId;
            if (promotionId) {
                this.emit(FreeSpinsPromotionEvents.OPEN_FREE_SPINS_PROMOTION);
                return;
            }
        } catch (error) {
            sentryLogger.log(`getFreeSpinsPromotionBanner error: ${error.message}`);
        }
    }

    getFreeSpinsPromotionUrl() {
        const promotionId = this.promotionInfoFromSso?.promotion?.promotionId;
        const gameOffers = this.promotionInfoFromSso?.gameOfferPromotion;
        const queryString = this.getQueryString(promotionId, gameOffers);
        const url = `${buildPromotionSiteUrl()}/${endpointConstants.bannerPromotion}?${queryString}`;
        return `${url}`;
    }

    private async getPromotionData(action: string, promotionId?: string) {
        try {
            const queryString = this.getQueryString(promotionId);
            const url = `${buildPromotionSiteUrl()}/${action}?${queryString}`;
            const response = await axios.get(url);

            return response.data;
        } catch (error) {
            sentryLogger.log(`Get promotion tournament failed: ${error.message}`);
            return false;
        }
    }

    private buildParams() {
        const session = sessionManager.getSession();
        return {
            sessionId: EncryptUtils.base64Encode(session?.ss || ""),
            username: session?.username,
            language: session?.language
        };
    }
    private getQueryString(promotionId?: string, gameOffers?: { gameId: number; name: string }[]) {
        const searchParams = new URLSearchParams();
        const params = this.buildParams();
        Object.keys(params).forEach((key) => params[key] !== undefined && searchParams.append(key, params[key]));
        if (promotionId) {
            searchParams.append("promotionId", promotionId);
        }
        if (gameOffers && Array.isArray(gameOffers)) {
            const jsonString = JSON.stringify(gameOffers);
            searchParams.append("game", jsonString);
        }
        return searchParams.toString();
    }
}

export const freeSpinsPromotionHandler = FreeSpinsPromotionHandler.getInstance();
