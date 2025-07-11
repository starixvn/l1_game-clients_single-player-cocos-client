import { io, ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import * as MsgpackParser from "socket.io-msgpack-parser";

import { enableMsgpackParserOnNotification } from "../../configs/Configs";
import { JackpotDataKey, JackpotEvents } from "../../managers/JackpotEvents";
import { RoundTimerEvents } from "../../mini-games-panel/view-models/RoundTimerEvents";
import GameUtils from "../GameUtils";
import { buildUrl, getEnvironment } from "../helpers/UrlHelper";
import { sentryLogger } from "../logger";

console.log("[NotificationService] Loading NotificationService module...");

export default class NotificationService {
    public static getInstance(): NotificationService {
        console.log("[NotificationService] Getting NotificationService instance...");
        if (!this.instance) {
            console.log("[NotificationService] Creating new NotificationService instance");
            this.instance = new NotificationService();
        } else {
            console.log("[NotificationService] Returning existing NotificationService instance");
        }

        return this.instance;
    }

    private static instance: NotificationService;
    private socket: Socket;
    private dataObservers = {};
    private reConnectTimeOut;
    private isForceKickedOut = false;

    constructor() {
        console.log("[NotificationService] NotificationService constructor called");
    }

    async connect() {
        console.log("[NotificationService] Connecting to notification service...");
        if (this.socket || this.isForceKickedOut) {
            console.log("[NotificationService] Already connected or force kicked out, skipping connection");
            return;
        }

        try {
            console.log("[NotificationService] Creating socket connection...");
            await this.createSocket();
            console.log("[NotificationService] Socket created successfully");

            console.log("[NotificationService] Initializing listeners...");
            this.initListeners();
            console.log("[NotificationService] Listeners initialized successfully");
        } catch (error) {
            console.error("[NotificationService] Error during connection:", error);
            sentryLogger.logError(error);
            this.socket && this.socket.disconnect();
            console.log("[NotificationService] Initiating reconnection...");
            this.reconnect();
        }
    }

    async forceConnect() {
        console.log("[NotificationService] Force connecting...");
        this.isForceKickedOut = false;
        await this.connect();
        console.log("[NotificationService] Force connection completed");
    }

    private async createSocket() {
        console.log("[NotificationService] Creating socket...");
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
                console.log("[NotificationService] Enabling msgpack parser");
                socketOptions.parser = MsgpackParser;
            }

            console.log("[NotificationService] Socket options:", socketOptions);
            this.socket = io(buildUrl(), socketOptions);

            this.socket.on("connect", () => {
                console.log("[NotificationService] Socket connected successfully");
                resolve();
            });
            this.socket.on("connect_error", (error) => {
                console.error("[NotificationService] Socket connection error:", error);
                reject(error);
            });
        });
    }

    private initListeners() {
        console.log("[NotificationService] Initializing socket listeners...");

        this.socket.on("disconnect", (reason, detail: any) => {
            console.log("[NotificationService] Socket disconnected, reason:", reason, "detail:", detail);
            if (reason === "ping timeout" || reason === "transport error") {
                const message = detail?.message || detail?.description || "";
                console.error("[NotificationService] Socket disconnect error:", reason, message);
                sentryLogger.log(`socket disconnect - NotificationService - ${reason}:   ${message}`);
            }
            this.socket && this.socket.disconnect();
            console.log("[NotificationService] Initiating reconnection after disconnect...");
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

        console.log("[NotificationService] Setting up message listeners for:", messageList);
        messageList.forEach((message) => {
            this.socket.on(message, (data) => {
                console.log("[NotificationService] Received message:", message, "data:", data);
                this.onData(data, message);
            });
        });
        console.log("[NotificationService] Message listeners setup completed");
    }

    private reconnect() {
        console.log("[NotificationService] Reconnecting...");
        this.socket = null;

        this.reConnectTimeOut && clearTimeout(this.reConnectTimeOut);
        this.reConnectTimeOut = setTimeout(() => {
            console.log("[NotificationService] Executing reconnection timeout...");
            this.connect();
        }, 5000);
        console.log("[NotificationService] Reconnection scheduled in 5 seconds");
    }

    forceKickedOut() {
        console.log("[NotificationService] Force kicked out");
        this.isForceKickedOut = true;
        this.socket && this.socket.disconnect();
        console.log("[NotificationService] Socket disconnected due to force kick out");
    }

    async emitEvent(eventName, data) {
        console.log("[NotificationService] Emitting event:", eventName, "data:", data);
        try {
            if (!this.socket || !this.socket.connected) {
                console.warn("[NotificationService] Socket not ready, waiting for connection...");
                cc.log("notification not ready ---------------------------------");
                await GameUtils.waitUntil(() => this.socket?.connected, 50, 1000);
                console.log("[NotificationService] Socket connection established");
            }

            this.socket.emit(eventName, data);
            console.log("[NotificationService] Event emitted successfully:", eventName);
        } catch (error) {
            console.error("[NotificationService] Error emitting event:", error);
            sentryLogger.logError(error);
        }
    }

    onData(data, dataType: string) {
        console.log("[NotificationService] Processing data for type:", dataType, "data:", data);
        Object.keys(this.dataObservers).forEach((type) => {
            if (type === dataType) {
                console.log("[NotificationService] Found observers for type:", type);
                Object.keys(this.dataObservers[type]).forEach((key) => {
                    const observer = this.dataObservers[type][key];
                    if (observer) {
                        console.log("[NotificationService] Calling observer for key:", key);
                        observer(data);
                    }
                });
            }
        });
    }

    addDataObserver(dataType: string, observerKey: string, observer) {
        console.log("[NotificationService] Adding data observer for type:", dataType, "key:", observerKey);
        if (!this.dataObservers[dataType]) {
            this.dataObservers[dataType] = {};
        }
        this.dataObservers[dataType][observerKey] = observer;
        console.log("[NotificationService] Data observer added successfully");
    }

    removeDataObserver(dataType: string, observerKey: string) {
        console.log("[NotificationService] Removing data observer for type:", dataType, "key:", observerKey);
        if (this.dataObservers[dataType]) {
            delete this.dataObservers[dataType][observerKey];
            console.log("[NotificationService] Data observer removed successfully");
        } else {
            console.warn("[NotificationService] No observers found for type:", dataType);
        }
    }
}

console.log("[NotificationService] NotificationService module loaded successfully");
