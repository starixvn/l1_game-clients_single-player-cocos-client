import NotificationService from "../../common/auth/NotificationService";
import EventEmitterBase from "../../common/emitter/EventEmitterBase";
import { userManager } from "../../common/user/UserManager";

export const PromotionNotificationsEvent = {
    NEW_PROMOTION: "NEW_PROMOTION",
    OPEN_ANNOUNCEMENT: "OPEN_ANNOUNCEMENT"
};

export class PromotionNotification {
    displayKind: number;
    enabled: boolean;
    gameId: number;
    gameName: string;
    _id: string;
    isActive: boolean;
    messages: any;
    promotionId: string;
    time: string;
    title: any;
    endTime: string;
    startTime: string;
}

export default class PromotionNotificationsHandler extends EventEmitterBase {
    private static instance: PromotionNotificationsHandler;

    private readonly dataKey = "promotionNotifications";

    private _reloadAnnouncementPopup = false;

    private _joinGameId: number;

    private _promotionNotifications: PromotionNotification[];

    public static getInstance(): PromotionNotificationsHandler {
        if (!this.instance) {
            this.instance = new PromotionNotificationsHandler();
        }
        return this.instance;
    }

    get reloadAnnouncementPopup() {
        return this._reloadAnnouncementPopup;
    }

    get promotionNotifications() {
        return this._promotionNotifications;
    }

    get joinGameId() {
        return this._joinGameId;
    }

    setJoinGameId(gameId: number) {
        this._joinGameId = gameId;
    }

    addDataObserver() {
        NotificationService.getInstance().addDataObserver(this.dataKey, this.dataKey, this.receivedData.bind(this));
    }

    removeDataObserver() {
        NotificationService.getInstance().removeDataObserver(this.dataKey, this.dataKey);
    }

    receivedData(data: PromotionNotification[]) {
        const offerGames = userManager.offerGamesIncludeSubGames;
        const newPromotionNotification = data.filter((promotionNotification) => offerGames.includes(promotionNotification.gameId));
        if (JSON.stringify(this._promotionNotifications) === JSON.stringify(newPromotionNotification)) {
            this._reloadAnnouncementPopup = false;
        } else {
            this._reloadAnnouncementPopup = true;
        }
        this._promotionNotifications = newPromotionNotification;
        this.emit(PromotionNotificationsEvent.NEW_PROMOTION, this._promotionNotifications);
    }
}
