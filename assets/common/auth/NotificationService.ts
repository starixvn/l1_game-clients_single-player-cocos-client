import { io, ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import * as MsgpackParser from "socket.io-msgpack-parser";

import { enableMsgpackParserOnNotification } from "../../configs/Configs";
import { JackpotDataKey, JackpotEvents } from "../../managers/JackpotEvents";
import { RoundTimerEvents } from "../../mini-games-panel/view-models/RoundTimerEvents";
import GameUtils from "../GameUtils";
import { buildUrl, getEnvironment } from "../helpers/UrlHelper";
import { sentryLogger } from "../logger";

export default class NotificationService {
    public static getInstance(): NotificationService {
        if (!this.instance) {
            this.instance = new NotificationService();
        }

        return this.instance;
    }

    private static instance: NotificationService;
    private socket: Socket;
    private dataObservers = {};
    private reConnectTimeOut;
    private isForceKickedOut = false;

    async connect() {
        if (this.socket || this.isForceKickedOut) {
            return;
        }

        try {
            await this.createSocket();
            this.initListeners();
        } catch (error) {
            sentryLogger.logError(error);
            this.socket && this.socket.disconnect();
            this.reconnect();
        }
    }

    async forceConnect() {
        this.isForceKickedOut = false;
        await this.connect();
    }

    private async createSocket() {
        return new Promise<void>((resolve, reject) => {
            const socketOptions: Partial<ManagerOptions & SocketOptions> = {
                forceNew: false,
                transports: ["websocket"],
                upgrade: false,
                path: `/${getEnvironment()}notification/socket.io`,
                auth: {
                    ss: window.authData.ss,
                    username: window.authData.username
                }
            };

            if (enableMsgpackParserOnNotification) {
                socketOptions.parser = MsgpackParser;
            }

            this.socket = io(buildUrl(), socketOptions);
            this.socket.on("connect", () => {
                resolve();
            });
            this.socket.on("connect_error", (error) => {
                reject(error);
            });
        });
    }

    private initListeners() {
        this.socket.on("disconnect", (reason, detail: any) => {
            if (reason === "ping timeout" || reason === "transport error") {
                const message = detail?.message || detail?.description || "";
                sentryLogger.log(`socket disconnect - NotificationService - ${reason}:   ${message}`);
            }
            this.socket && this.socket.disconnect();
            this.reconnect();
        });

        const messageList = [
            "gameNotification",
            "marquee",
            JackpotDataKey.JACKPOT_POOLS,
            JackpotDataKey.JACKPOT_POOLS_ON_GAME,
            JackpotEvents.GET_WINNERS,
            JackpotDataKey.JACKPOT_WINNER,
            JackpotDataKey.JACKPOT_WINNERS,
            "kickedOut",
            "reload",
            "auth",
            "promotions",
            "promotionNotifications",
            RoundTimerEvents.ROUND_TIMER,
            RoundTimerEvents.LATEST_ROUND_TIMER
        ];

        messageList.forEach((message) => {
            this.socket.on(message, (data) => {
                this.onData(data, message);
            });
        });
    }

    private reconnect() {
        this.socket = null;

        this.reConnectTimeOut && clearTimeout(this.reConnectTimeOut);
        this.reConnectTimeOut = setTimeout(() => {
            this.connect();
        }, 5000);
    }

    forceKickedOut() {
        this.isForceKickedOut = true;
        this.socket && this.socket.disconnect();
    }

    async emitEvent(eventName, data) {
        try {
            if (!this.socket || !this.socket.connected) {
                cc.log("notification not ready ---------------------------------");
                await GameUtils.waitUntil(() => this.socket?.connected, 50, 1000);
            }

            this.socket.emit(eventName, data);
        } catch (error) {
            sentryLogger.logError(error);
        }
    }

    onData(data, dataType: string) {
        Object.keys(this.dataObservers).forEach((type) => {
            if (type === dataType) {
                Object.keys(this.dataObservers[type]).forEach((key) => {
                    const observer = this.dataObservers[type][key];
                    observer && observer(data);
                });
            }
        });
    }

    addDataObserver(dataType: string, observerKey: string, observer) {
        if (!this.dataObservers[dataType]) {
            this.dataObservers[dataType] = {};
        }
        this.dataObservers[dataType][observerKey] = observer;
    }

    removeDataObserver(dataType: string, observerKey: string) {
        this.dataObservers[dataType] && delete this.dataObservers[dataType][observerKey];
    }
}
