import { Socket } from "socket.io-client";

import logger from "../../../common/logger";
import Connection from "./Connection";

const sentryLogger = logger();

export const events = {
    connect: "connect",
    signedIn: "signedIn",
    signIn: "signin",
    reconnect: "reconnect",
    connectFailed: "connect_failed",
    connectError: "connect_error",
    disconnect: "disconnect",
    bet: "bet",
    getHistory: "getHistory",
    getOldHistory: "getOldHistory",
    inGame: "inGame",
    recheckIn: "recheckin",
    message: "message",
    forceDisconnect: "forceDisconnect",
    getGameConfigs: "getGameConfigs",
    getStatistics: "getStatistics",
    getTicketDetail: "getTicketDetail"
};

export interface SocketIOConnectionOptions {
    onConnectFailed(game: string): void;
    gameName: string;
    socketUri: string;
    proxyRoute: string;
}

export default class SocketIOConnection implements Connection {
    private socket: Socket;
    private gameName: string;
    private onConnectFailed: Function;

    setSocket(socket: Socket, gameName: string) {
        this.socket = socket;
        this.gameName = gameName;
        this.onConnectFailed = () => ({});

        this.registerEvents();
    }

    close() {
        this.socket && this.socket.disconnect();
    }

    on(eventName: string, eventHandler: Function) {
        this.socket && this.socket.on(eventName, eventHandler);
    }

    once(eventName: string, eventHandler: Function) {
        this.socket && this.socket.once(eventName, eventHandler);
    }

    removeListener(eventName: string, handler?: Function) {
        this.socket.removeListener(eventName, handler);
    }

    emit(eventName: string, ...args: any[]) {
        if (args.length) {
            this.socket.emit(eventName, ...args);
        } else {
            this.socket.emit(eventName);
        }
    }

    public get connected(): boolean {
        return this.socket.connected;
    }

    private registerEvents() {
        this.on(events.connectFailed, () => {
            sentryLogger.logError(this.buildLog(events.connectFailed));
            this.socket.disconnect();
            this.onConnectFailed(this.gameName);
        });

        this.on(events.connectError, (error: Error) => {
            sentryLogger.logError(error);
            this.socket.disconnect();
            this.onConnectFailed(this.gameName);
        });
    }

    private buildLog(event: string, message?: string) {
        return JSON.stringify({
            event,
            message,
            game: this.gameName
        });
    }
}
